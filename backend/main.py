from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2

app = FastAPI(title="IntelliPort API")

# 1. ตั้งค่า CORS (ให้หน้าเว็บพอร์ต 3000 คุยกับ API ได้)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. ข้อมูลการเชื่อมต่อฐานข้อมูล PostgreSQL
DB_HOST = "projects-db-1"
DB_NAME = "intelliport_db"
DB_USER = "admin"
DB_PASS = "Heyrose05"

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        return conn
    except Exception as e:
        print("Database connection error:", e)
        return None

# 3. สร้างรูปแบบข้อมูล (Schemas)
class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# 4. API สำหรับ สมัครสมาชิก (Register)
@app.post("/api/register")
def register_user(user: UserRegister):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="ไม่สามารถเชื่อมต่อฐานข้อมูลได้")
    
    cursor = conn.cursor()
    try:
        # เช็คว่ามีชื่อผู้ใช้หรืออีเมลนี้แล้วหรือยัง
        cursor.execute("SELECT * FROM users WHERE username = %s OR email = %s", (user.username, user.email))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="ชื่อผู้ใช้งานหรืออีเมลนี้ถูกใช้ไปแล้ว")
        
        # บันทึกลงฐานข้อมูล
        cursor.execute(
            "INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, 'user')",
            (user.username, user.email, user.password)
        )
        conn.commit()
        return {"message": "สมัครสมาชิกสำเร็จ!"}
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# 5. API สำหรับ เข้าสู่ระบบ (Login) - อัปเกรดให้เช็คจากฐานข้อมูลจริง
@app.post("/api/login")  # เปลี่ยน path ให้มี /api นำหน้าเพื่อความเป็นระเบียบ
def login_user(data: LoginRequest):
    print(f"ได้รับข้อมูลการ Login: {data.email}") 
    
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="ไม่สามารถเชื่อมต่อฐานข้อมูลได้")
        
    cursor = conn.cursor()
    try:
        # เช็คอีเมลและรหัสผ่านจากตาราง users
        cursor.execute("SELECT id, username, email, role FROM users WHERE email = %s AND password = %s", (data.email, data.password))
        user_record = cursor.fetchone()
        
        # ถ้าเจอข้อมูล (แปลว่ารหัสถูก)
        if user_record:
            return {
                "status": "success",
                "message": "เข้าสู่ระบบสำเร็จ",
                "token": "fake-jwt-token-xyz", # อนาคตเราสามารถเปลี่ยนเป็น JWT จริงๆ ได้
                "user": {
                    "id": user_record[0],
                    "username": user_record[1],
                    "email": user_record[2],
                    "role": user_record[3]
                }
            }
        else:
            # ถ้าไม่เจอข้อมูล (รหัสผิด หรือไม่มีอีเมลนี้)
            raise HTTPException(status_code=401, detail="อีเมลหรือรหัสผ่านไม่ถูกต้อง")
            
    finally:
        cursor.close()
        conn.close()

@app.get("/")
def read_root():
    return {"message": "IntelliPort API พร้อมทำงานแล้ว!"}