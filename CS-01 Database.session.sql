-- 1. สร้างตารางเก็บข้อมูลผู้ใช้งาน
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, 
    role VARCHAR(20) DEFAULT 'user'
);

-- 2. สร้างบัญชีทดสอบ (ข้ามหากอีเมลซ้ำ)
INSERT INTO users (username, email, password, role)
VALUES 
    ('admin_cs01', 'admin@intelliport.com', 'admin123', 'admin'),
    ('test_user', 'user@gmail.com', '123456', 'user')
ON CONFLICT (email) DO NOTHING;

-- 3. รีเซ็ตลำดับ ID (Sequence) ให้รันต่อจากค่าที่มากที่สุด
-- (ทำเพื่อให้เวลาสมัครสมาชิกใหม่ผ่านหน้าเว็บแล้ว ID ไม่ไปชนกับของเก่า)
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 4. เรียกดูข้อมูลทั้งหมดเพื่อตรวจสอบ
SELECT * FROM users;