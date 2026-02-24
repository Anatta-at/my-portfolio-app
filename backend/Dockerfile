FROM python:3.9

WORKDIR /app

# 1. ก๊อปปี้ไฟล์ requirements มาติดตั้งก่อน (เพื่อให้ build เร็วขึ้นในครั้งต่อไป)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2. ก๊อปปี้โค้ดทั้งหมด (รวมถึง main.py) เข้าไปใน Docker
COPY . .

# 3. คำสั่งสั่งรัน FastAPI (สำคัญมาก! ของเดิมคุณไม่มีบรรทัดนี้)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]