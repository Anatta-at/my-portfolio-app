# พจนานุกรมข้อมูล (Data Dictionary)

รายละเอียดแฟ้มข้อมูลที่ใช้ในระบบ (Intelliportfolio Management System) ฉบับอัปเดตล่าสุด โครงสร้างฐานข้อมูลถูกออกแบบใหม่เพื่อรองรับระบบ Authentication (Clerk) และโมเดล Black-Litterman อย่างเต็มรูปแบบ

---

## 1. Table: users
**Description:** เก็บข้อมูลผู้ใช้งานและผู้ดูแลระบบ โดยอ้างอิงรหัสจากระบบยืนยันตัวตน Clerk
**Primary Key:** clerk_id
**Foreign Key:** -

**ตาราง Data Dictionary : users**

| Field Name | Description | Data Type | Data Size | Key |
| :--- | :--- | :--- | :--- | :--- |
| clerk_id | รหัสอ้างอิงยืนยันตัวตนจาก Clerk Auth | VARCHAR | 255 | PK |
| email | อีเมลของผู้ใช้งาน | VARCHAR | 255 | |
| full_name | ชื่อ-นามสกุลของผู้ใช้งาน | VARCHAR | 255 | |
| role | ระดับสิทธิ์ของผู้ใช้งาน (เช่น 'user', 'admin') | VARCHAR | 20 | |
| created_at | วันเวลาที่สมัครสมาชิกหรือสร้างบัญชี | TIMESTAMP | - | |
| last_login_at | วันเวลาที่เข้าสู่ระบบครั้งล่าสุด | TIMESTAMP | - | |

---

## 2. Table: portfolios
**Description:** เก็บข้อมูลพอร์ตการลงทุนหลักที่ AI (Genetic Algorithm & Black-Litterman) สร้างขึ้นให้ผู้ใช้
**Primary Key:** id
**Foreign Key:** clerk_id (อ้างอิงตาราง users)

**ตาราง Data Dictionary : portfolios**

| Field Name | Description | Data Type | Data Size | Key |
| :--- | :--- | :--- | :--- | :--- |
| id | หมายเลขประจำตัวพอร์ตการลงทุน | SERIAL (INT) | - | PK |
| clerk_id | รหัสผู้ใช้งานผู้เป็นเจ้าของพอร์ต | VARCHAR | 255 | FK |
| target_beta | ค่าสัมประสิทธิ์ความเสี่ยง (Beta) เป้าหมาย | NUMERIC | (5, 2) | |
| budget | งบประมาณหรือเงินลงทุนตั้งต้น | NUMERIC | (15, 2)| |
| target_amount | จำนวนเงินเป้าหมายที่ต้องการให้ถึง | NUMERIC | (15, 2)| |
| duration_years | ระยะเวลาเป้าหมายในการลงทุน (ปี) | INT | - | |
| expected_return | อัตราผลตอบแทนคาดหวังรวมของพอร์ต | NUMERIC | (8, 4) | |
| portfolio_volatility| ความผันผวนความเสี่ยงรวมของพอร์ต | NUMERIC | (8, 4) | |
| success_probability | ความน่าจะเป็นที่จะบรรลุเป้าหมายการลงทุน | NUMERIC | (5, 4) | |
| created_at | วันเวลาที่บันทึกข้อมูลพอร์ตการลงทุน | TIMESTAMP | - | |

---

## 3. Table: portfolio_assets
**Description:** เก็บสัดส่วนการลงทุนของสินทรัพย์ (หุ้นรายตัว) ที่แตกออกมาจากแต่ละพอร์ตโฟลิโอ (1st Normal Form)
**Primary Key:** id
**Foreign Key:** portfolio_id (อ้างอิงตาราง portfolios)

**ตาราง Data Dictionary : portfolio_assets**

| Field Name | Description | Data Type | Data Size | Key |
| :--- | :--- | :--- | :--- | :--- |
| id | หมายเลข Running ID ของรายการ | SERIAL (INT) | - | PK |
| portfolio_id | หมายเลขพอร์ตการลงทุนที่อ้างอิง | INT | - | FK |
| ticker | สัญลักษณ์หุ้นที่จัดอยู่ในพอร์ต | VARCHAR | 50 | |
| weight | สัดส่วนเปอร์เซ็นต์น้ำหนักการลงทุน | NUMERIC | (5, 4) | |
| beta | ค่าความเสี่ยง (Beta) ของหุ้นตัวนี้ | NUMERIC | (5, 4) | |
| created_at | วันเวลาที่เพิ่มข้อมูลเข้าพอร์ต | TIMESTAMP | - | |

---

## 4. Table: stock_views
**Description:** เก็บข้อมูลมุมมองการลงทุนรายตัว (Views) ของผู้ใช้สำหรับการประมวลผลโมเดล Black-Litterman
**Primary Key:** id
**Foreign Key:** portfolio_id (อ้างอิงตาราง portfolios)

**ตาราง Data Dictionary : stock_views**

| Field Name | Description | Data Type | Data Size | Key |
| :--- | :--- | :--- | :--- | :--- |
| id | หมายเลข Running ID ของรายการ | SERIAL (INT) | - | PK |
| portfolio_id | หมายเลขพอร์ตการลงทุนที่อ้างอิง | INT | - | FK |
| ticker | สัญลักษณ์หุ้นที่ระบุมุมมอง | VARCHAR | 20 | |
| expected_return | อัตราผลตอบแทนที่คาดหวัง (View) | NUMERIC | (8, 4) | |
| variance | ค่าความแปรปรวนของมุมมอง | NUMERIC | (8, 4) | |
| updated_at | วันเวลาที่ปรับปรุงมุมมองล่าสุด | TIMESTAMP | - | |
