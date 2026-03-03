-- ลบตารางเก่าทิ้งก่อนเพื่อสร้างใหม่ให้ถูกต้อง (ข้อมูลเดิมจะหาย โปรดสำรองหากจำเป็น)
DROP TABLE IF EXISTS users CASCADE;

-- 1. สร้างตารางเก็บข้อมูลผู้ใช้งานใหม่
CREATE TABLE users (
    -- ใช้ clerk_id เป็น Primary Key แทนเลขรันอัตโนมัติ (SERIAL)
    clerk_id VARCHAR(255) PRIMARY KEY, 
    username VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    
    -- ข้อมูลตามขอบเขตโครงงาน 8.2.3 (เป้าหมายและการตั้งค่า)
    investment_goal VARCHAR(255), -- เป้าหมายการลงทุน
    budget NUMERIC(15, 2) DEFAULT 0, -- งบประมาณการลงทุน
    risk_level VARCHAR(50),        -- ระดับความเสี่ยงที่ยอมรับได้
    
    role VARCHAR(20) DEFAULT 'user', -- กำหนดสิทธิ์
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตัวอย่างการเพิ่มข้อมูล (จำลอง clerk_id ที่ได้จากระบบ Clerk)
INSERT INTO users (clerk_id, username, email, role, risk_level)
VALUES 
    ('user_2pX...', 'admin_cs01', 'admin@intelliport.com', 'admin', 'High'),
    ('user_5qY...', 'test_user', 'user@gmail.com', 'user', 'Medium')
ON CONFLICT (clerk_id) DO NOTHING;

-- 3. ตรวจสอบข้อมูล
SELECT * FROM users;