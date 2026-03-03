from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI()

# ✅ ต้องมี CORS เพื่อให้ Next.js คุยกับ FastAPI ได้
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ฟังก์ชันเชื่อมต่อ Database
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host="127.0.0.1",
            database="intelliport_db",
            user="admin",
            password="Heyrose05",
            port="5432"
        )
        return conn
    except Exception as e:
        print(f"❌ DB Error: {e}")
        return None

# โครงสร้างข้อมูลที่รับจากหน้า Register/Login
class RegisterData(BaseModel):
    username: str
    email: str
    password: str

class LoginData(BaseModel):
    email: str
    password: str

# --- API สมัครสมาชิก ---
@app.post("/register")
async def register(user: RegisterData):
    print(f"🚀 [BACKEND RECEIVED]: {user}")
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="เชื่อมต่อฐานข้อมูลล้มเหลว")
    try:
        cur = conn.cursor()
        # เช็คอีเมลซ้ำ
        cur.execute("SELECT email FROM users WHERE email = %s", (user.email,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="อีเมลนี้ถูกใช้งานแล้ว")
        
        # บันทึกข้อมูล
        cur.execute(
            "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
            (user.username, user.email, user.password)
        )
        conn.commit()
        return {"message": "สมัครสมาชิกสำเร็จ"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# --- API เข้าสู่ระบบ ---
@app.post("/login")
async def login(user: LoginData):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="เชื่อมต่อฐานข้อมูลล้มเหลว")
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        "SELECT * FROM users WHERE email = %s AND password = %s",
        (user.email, user.password)
    )
    result = cur.fetchone()
    conn.close()

    if result:
        return {"status": "success", "message": "เข้าสู่ระบบสำเร็จ", "user": {"username": result['username'], "email": result['email']}}
    else:
        raise HTTPException(status_code=401, detail="อีเมลหรือรหัสผ่านไม่ถูกต้อง")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)