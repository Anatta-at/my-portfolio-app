-- 1. ลบตาราง users เก่าทิ้งไปเลย ไม่ใช้แล้ว!
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS portfolio_history CASCADE;

-- 2. สร้างตารางเก็บประวัติพอร์ตแบบ Standalone (อิงตาม Clerk ID อย่างเดียว)
CREATE TABLE portfolio_history (
    id SERIAL PRIMARY KEY,
    
    -- รหัสจาก Clerk (เช่น user_2pX...) เอาไว้บอกว่าพอร์ตนี้เป็นของใคร
    clerk_id VARCHAR(255) NOT NULL, 
    
    -- ข้อมูลตั้งต้นที่ผู้ใช้กรอก
    target_beta NUMERIC(5, 2),
    budget NUMERIC(15, 2),
    duration_years INT,
    
    -- ผลลัพธ์จากสมองกล AI (เก็บเป็น JSON)
    recommended_portfolio JSONB NOT NULL, 
    expected_return NUMERIC(8, 4),
    portfolio_volatility NUMERIC(8, 4),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. สร้าง Index เพื่อให้ตอนหน้าเว็บค้นหาประวัติพอร์ตของตัวเองทำได้เร็วปรู๊ดปร๊าด
CREATE INDEX idx_portfolio_clerk_id ON portfolio_history(clerk_id);