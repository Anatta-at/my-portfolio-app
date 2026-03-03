-- 1. สร้างตารางเก็บข้อมูลผู้ใช้งาน (เพิ่มคอลัมน์ role)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- เพิ่มส่วนนี้เพื่อให้ INSERT ข้อ 2 ไม่พัง
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. สร้างบัญชีทดสอบ
INSERT INTO users (username, email, password, role)
VALUES 
    ('admin_cs01', 'admin@intelliport.com', 'admin123', 'admin'),
    ('test_user', 'user@gmail.com', '123456', 'user')
ON CONFLICT (email) DO NOTHING;

-- 3. รีเซ็ตลำดับ ID ให้ถูกต้อง
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));

-- 4. ตรวจสอบข้อมูล
SELECT * FROM users;