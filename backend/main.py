from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="intelliport_db",
            user="admin",
            password="Heyrose05", 
            port="5432"
        )
        return conn
    except Exception as e:
        print(f"❌ Database Connection Error: {e}")
        return None

# --- Models ---
class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# --- API: สมัครสมาชิก ---
@app.post("/register")
async def register(user: UserRegister):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="ไม่สามารถเชื่อมต่อฐานข้อมูลได้")
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);")
        cursor.execute(
            "INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, %s)",
            (user.username, user.email, user.password, "user")
        )
        conn.commit()
        cursor.close()
        return {"message": "Registered successfully"}
    except psycopg2.IntegrityError:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail="ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว")
    finally:
        if conn: conn.close()

# --- API: เข้าสู่ระบบ (เพิ่มใหม่) ---
@app.post("/login")
async def login(user: UserLogin):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="เชื่อมต่อฐานข้อมูลไม่ได้")
    try:
        # ใช้ RealDictCursor เพื่อให้ดึงข้อมูลออกมาเป็น Dictionary ได้ง่าย
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "SELECT id, username, email, role FROM users WHERE email = %s AND password = %s",
            (user.email, user.password)
        )
        account = cursor.fetchone()
        
        if account:
            print(f"✅ User {account['username']} logged in!")
            return {
                "message": "Login successful",
                "user": account  # ส่งข้อมูล user กลับไปให้ Frontend เก็บไว้
            }
        else:
            raise HTTPException(status_code=401, detail="อีเมลหรือรหัสผ่านไม่ถูกต้อง")
    finally:
        if conn: conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)