# PlantUML Data Dictionary

เอกสารนี้ใช้สำหรับสร้างภาพ Data Dictionary ในรูปแบบตารางกราฟิก

```plantuml
@startuml
skinparam defaultFontName "Sarabun"
skinparam monochrome true
skinparam shadowing false
skinparam nodesep 40
skinparam ranksep 40
skinparam nodeBackgroundColor white

title พจนานุกรมข้อมูล (Data Dictionary)

node Users [
**Table code name: 01**
**Table name: Users**
Description: เก็บข้อมูลผู้ใช้งานและผู้ดูแลระบบ
Primary Key: user_id
อายุการใช้งาน: ตลอดการใช้งาน
====
|= Field Name |= Description |= Data Type |= Data Size |= Key |
| user_id | หมายเลขประจำตัวผู้ใช้ระบบ | INT | 11 | PK |
| clerk_id | รหัสอ้างอิงยืนยันตัวตนจาก Clerk Auth | VARCHAR | 255 | UNIQUE |
| email | อีเมลของผู้ใช้งาน | VARCHAR | 255 | UNIQUE |
| role | ระดับสิทธิ์ของผู้ใช้งาน (เช่น USER, ADMIN) | VARCHAR | 50 | |
| theme_preference| การตั้งค่าธีมหน้าจอ (เช่น light, dark) | VARCHAR | 50 | |
| last_login_at | วันเวลาที่เข้าสู่ระบบครั้งล่าสุด | DATETIME | - | |
| created_at | วันเวลาที่สมัครสมาชิกหรือสร้างบัญชี | DATETIME | - | |
]

node AssetSET50 [
**Table code name: 02**
**Table name: AssetSET50**
Description: เก็บข้อมูลหลักทรัพย์ในกลุ่มดัชนี SET50
Primary Key: ticker
อายุการใช้งาน: ตลอดการใช้งาน
====
|= Field Name |= Description |= Data Type |= Data Size |= Key |
| ticker | สัญลักษณ์ย่อของหุ้น (เช่น PTT, AOT) | VARCHAR | 10 | PK |
| market_cap | มูลค่าตามราคาตลาดของหลักทรัพย์ | BIGINT | - | |
| is_active | สถานะว่ายังอยู่ในดัชนี SET50 หรือไม่ (True/False) | BOOLEAN | - | |
| created_at | วันเวลาที่เพิ่มข้อมูลหุ้นเข้าระบบ | DATETIME | - | |
| updated_at | วันเวลาที่มีการแก้ไขข้อมูลหุ้นล่าสุด | DATETIME | - | |
]

node Portfolio [
**Table code name: 03**
**Table name: Portfolio**
Description: เก็บข้อมูลพอร์ตการลงทุนและการตั้งค่าพอร์ตของผู้ใช้
Primary Key: portfolio_id
Foreign Key: user_id
อายุการใช้งาน: จนกว่าผู้ใช้จะลบพอร์ตทิ้ง
====
|= Field Name |= Description |= Data Type |= Data Size |= Key |
| portfolio_id | หมายเลขประจำตัวพอร์ตการลงทุน | INT | 11 | PK |
| user_id | หมายเลขผู้ใช้งานผู้เป็นเจ้าของพอร์ต | INT | 11 | FK |
| portfolio_type| ประเภทของการจัดพอร์ต (เช่น CUSTOM_ALL) | VARCHAR | 100 | |
| name | ชื่อเรียกพอร์ตการลงทุน | VARCHAR | 255 | |
| target_beta | ค่าสัมประสิทธิ์ความเสี่ยง (Beta) เป้าหมาย | FLOAT | - | |
| budget | งบประมาณหรือเงินลงทุนตั้งต้น | FLOAT | - | |
| target_amount | จำนวนเงินเป้าหมายที่ต้องการให้ถึง | FLOAT | - | |
| duration_years| ระยะเวลาเป้าหมายในการลงทุน (ปี) | INT | 11 | |
| max_weight_per_asset | น้ำหนักสูงสุดที่ยอมให้ลงทุนในหุ้น 1 ตัว | FLOAT | - | |
| locked_tickers| หุ้นที่บังคับให้ต้องมีในพอร์ต (Array JSON) | JSON | Text | |
| expected_return| อัตราผลตอบแทนคาดหวังรวมของพอร์ต | FLOAT | - | |
| volatility | ความผันผวนความเสี่ยงรวมของพอร์ต | FLOAT | - | |
| success_prob | ความน่าจะเป็นที่จะบรรลุเป้าหมายการลงทุน | FLOAT | - | |
| created_at | วันเวลาที่บันทึกข้อมูลพอร์ตการลงทุน | DATETIME | - | |
]

node PortfolioAsset [
**Table code name: 04**
**Table name: PortfolioAsset**
Description: เก็บสัดส่วนการลงทุนของแต่ละสินทรัพย์ภายในพอร์ต
Primary Key: id
Foreign Key: portfolio_id, ticker
อายุการใช้งาน: จนกว่าผู้ใช้จะลบพอร์ตทิ้ง
====
|= Field Name |= Description |= Data Type |= Data Size |= Key |
| id | หมายเลข Running ID ของรายการ | INT | 11 | PK |
| portfolio_id | หมายเลขพอร์ตการลงทุนที่อ้างอิง | INT | 11 | FK |
| ticker | สัญลักษณ์หุ้นที่จัดอยู่ในพอร์ต | VARCHAR | 10 | FK |
| weight | สัดส่วนเปอร์เซ็นต์น้ำหนักการลงทุนในหุ้นตัวนี้ | FLOAT | - | |
]

Users -[hidden]down- AssetSET50
AssetSET50 -[hidden]down- Portfolio
Portfolio -[hidden]down- PortfolioAsset

@enduml
```
