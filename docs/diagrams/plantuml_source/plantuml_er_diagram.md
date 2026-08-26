# Entity-Relationship Diagram (ERD)

เอกสารแสดงโครงสร้างฐานข้อมูล (Database Schema) ของระบบจัดพอร์ตการลงทุนอัจฉริยะ (Intelliportfolio) เขียนในรูปแบบ Crow's Foot Notation ตามมาตรฐาน UML และ Relational Database Design ฉบับสอดคล้องกับ Data Dictionary และโครงสร้างฐานข้อมูลจริง 100%

---

## โครงสร้าง ER Diagram (Crow's Foot Notation)

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor white
skinparam classBackgroundColor white

' ตั้งค่าสไตล์ของ ER Diagram ให้เป็น Crow's Foot
hide circle
skinparam linetype ortho
skinparam monochrome true
skinparam shadowing false
skinparam nodesep 60
skinparam ranksep 60

' นิยาม Entities และตาราง
entity "users" as users {
  * clerk_id : VARCHAR(255) <<PK>>
  --
  email : VARCHAR(255) <<UNIQUE>>
  full_name : VARCHAR(255)
  role : VARCHAR(20)
  created_at : DATETIME
  last_login_at : DATETIME
}

entity "assets" as assets {
  * ticker : VARCHAR(10) <<PK>>
  --
  market_cap : BIGINT
  is_active : BOOLEAN
  created_at : DATETIME
  updated_at : DATETIME
}

entity "portfolios" as portfolios {
  * id : INT <<PK>>
  --
  clerk_id : VARCHAR(255) <<FK>>
  target_beta : NUMERIC(5,2)
  budget : NUMERIC(15,2)
  target_amount : NUMERIC(15,2)
  duration_years : INT
  expected_return : NUMERIC(8,4)
  portfolio_volatility : NUMERIC(8,4)
  success_probability : NUMERIC(5,4)
  created_at : DATETIME
}

entity "portfolio_assets" as portfolio_assets {
  * id : INT <<PK>>
  --
  portfolio_id : INT <<FK>>
  ticker : VARCHAR(50) <<FK>>
  weight : NUMERIC(5,4)
  beta : NUMERIC(5,4)
  created_at : DATETIME
}

entity "stock_views" as stock_views {
  * id : INT <<PK>>
  --
  portfolio_id : INT <<FK>>
  ticker : VARCHAR(20) <<FK>>
  expected_return : NUMERIC(8,4)
  variance : NUMERIC(8,4)
  updated_at : DATETIME
}

' นิยามความสัมพันธ์ (Relationships) แบบ Crow's Foot

' ผู้ใช้ 1 คน สามารถสร้างได้หลายพอร์ต (1 to Many)
users ||--o{ portfolios : "creates"

' พอร์ต 1 พอร์ต ประกอบด้วยสัดส่วนสินทรัพย์หลายตัว (1 to Many)
portfolios ||--|{ portfolio_assets : "contains"

' พอร์ต 1 พอร์ต มีมุมมองการลงทุนได้หลายตัวสำหรับ Black-Litterman (1 to Many)
portfolios ||--o{ stock_views : "has views"

' สินทรัพย์อ้างอิงไปยังสัดส่วนการลงทุน (1 to Many)
assets ||--o{ portfolio_assets : "referenced in"

' สินทรัพย์อ้างอิงไปยังมุมมองการลงทุน (1 to Many)
assets ||--o{ stock_views : "referenced in"

@enduml
```

---

## คำอธิบายตารางและฟิลด์ที่สำคัญ

1. **users (ผู้ใช้งานและผู้ดูแลระบบ)**
   - `clerk_id`: รหัสอ้างอิงประจำตัวผู้ใช้งานจาก Clerk Authentication ทำหน้าที่เป็น Primary Key
   - `role`: ระดับสิทธิ์ของผู้ใช้งาน เช่น 'user', 'admin'

2. **assets (หลักทรัพย์ในกลุ่ม SET50)**
   - `ticker`: สัญลักษณ์ย่อของหุ้น (PK)
   - `is_active`: สถานะการเปิด/ปิดให้เลือกลงทุน

3. **portfolios (พอร์ตการลงทุนที่ AI สร้างขึ้น)**
   - `clerk_id`: Foreign Key เชื่อมไปยังตาราง `users`
   - `target_beta`, `expected_return`, `portfolio_volatility`, `success_probability`: ค่าสถิติและผลการคำนวณจาก Black-Litterman และ Genetic Algorithm

4. **portfolio_assets (สัดส่วนหุ้นในแต่ละพอร์ต)**
   - `portfolio_id`: Foreign Key เชื่อมไปยังตาราง `portfolios`
   - `weight`: สัดส่วนการกระจายน้ำหนักการลงทุน
   - `beta`: ค่าความเสี่ยงของหุ้นแต่ละตัว ณ เวลาที่จัดพอร์ต

5. **stock_views (มุมมองการลงทุน Black-Litterman)**
   - `portfolio_id`: Foreign Key เชื่อมไปยังตาราง `portfolios`
   - `expected_return` & `variance`: อัตราผลตอบแทนคาดหวังและความไม่แน่นอนของมุมมองผู้ลงทุน
