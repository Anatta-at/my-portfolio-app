# Sequence Diagrams (PlantUML) สำหรับ draw.io (15 Use Cases Baseline)

ใช้ Code ด้านล่างนี้สำหรับ Import เข้า **draw.io** (ผ่าน Extras → Edit Diagram) ได้เลย
**อ้างอิงตรงตาม Use Case Diagram ต้นแบบ ทั้ง 15 Use Cases**

---

## 1. การสมัครสมาชิก (Register)
```plantuml
@startuml
hide footbox
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor transparent
skinparam ParticipantMinHeight 60
skinparam ParticipantMinWidth 160
skinparam ParticipantBackgroundColor white
skinparam ParticipantBorderColor black
skinparam ParticipantBorderThickness 1.0
skinparam ParticipantFontSize 16
skinparam LifeLineBackgroundColor white
skinparam LifeLineBorderColor black
skinparam LifeLineBorderThickness 1.0
skinparam ArrowColor black
skinparam ArrowFontSize 16
skinparam sequenceMessageAlign center

participant ": User" as User
participant "หน้าสมัครสมาชิก : Website" as Frontend
participant "backend : API" as Backend
participant "database : DB" as DB

|||
activate User
User -> Frontend: 1: เข้าสู่หน้าสมัครสมาชิก
activate Frontend
User -> Frontend: 2: กรอกข้อมูลส่วนตัวและรหัสผ่าน
User -> Frontend: 3: กดยืนยันการสมัครสมาชิก
Frontend -> Backend: 4: ส่งข้อมูลการสมัคร (POST /register)
activate Backend
Backend -> Backend: 4.1: ตรวจสอบความถูกต้องของข้อมูล
Backend -> DB: 4.2: บันทึกข้อมูลผู้ใช้งานใหม่ลง DB
activate DB
DB --> Backend: 4.2.1: บันทึกสำเร็จ
deactivate DB
Backend --> Frontend: 4.3: ส่งสถานะสำเร็จ (201 Created)
deactivate Backend
Frontend --> User: 5: แสดงข้อความสมัครสำเร็จและพาไปหน้า Login
deactivate Frontend
deactivate User
|||
@enduml
```

---

## 2. การแก้ไขข้อมูลส่วนตัว (Edit Personal Profile)
```plantuml
@startuml
hide footbox
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor transparent
skinparam ParticipantMinHeight 60
skinparam ParticipantMinWidth 160
skinparam ParticipantBackgroundColor white
skinparam ParticipantBorderColor black
skinparam ParticipantBorderThickness 1.0
skinparam ParticipantFontSize 16
skinparam LifeLineBackgroundColor white
skinparam LifeLineBorderColor black
skinparam LifeLineBorderThickness 1.0
skinparam ArrowColor black
skinparam ArrowFontSize 16
skinparam sequenceMessageAlign center

participant ": User" as User
participant "หน้าแก้ไขข้อมูล : Website" as Frontend
participant "backend : API" as Backend
participant "database : DB" as DB

|||
activate User
User -> Frontend: 1: เข้าสู่หน้าแก้ไขข้อมูลส่วนตัว
activate Frontend
Frontend -> Backend: 1.1: ร้องขอข้อมูลโปรไฟล์ปัจจุบัน (GET /profile)
activate Backend
Backend -> DB: 1.1.1: ดึงข้อมูลส่วนตัวของผู้ใช้จาก DB
activate DB
DB --> Backend: 1.1.1.1: คืนค่าข้อมูลโปรไฟล์
deactivate DB
Backend --> Frontend: 1.1.2: ส่งข้อมูลโปรไฟล์กลับไป
deactivate Backend
Frontend --> User: 2: แสดงข้อมูลปัจจุบันบนแบบฟอร์ม
User -> Frontend: 3: แก้ไขข้อมูลส่วนตัวและกดยืนยัน
Frontend -> Backend: 4: ส่งข้อมูลที่แก้ไข (PUT /profile)
activate Backend
Backend -> DB: 4.1: อัปเดตข้อมูลส่วนตัวใน DB
activate DB
DB --> Backend: 4.1.1: อัปเดตสำเร็จ
deactivate DB
Backend --> Frontend: 4.2: ส่งสถานะอัปเดตสำเร็จ
deactivate Backend
Frontend --> User: 5: แสดงผลข้อมูลโปรไฟล์ล่าสุด
deactivate Frontend
deactivate User
|||
@enduml
```

---

## 3. การกำหนดเป้าหมายการลงทุน (Set Investment Goals)
```plantuml
@startuml
hide footbox
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor transparent
skinparam ParticipantMinHeight 60
skinparam ParticipantMinWidth 160
skinparam ParticipantBackgroundColor white
skinparam ParticipantBorderColor black
skinparam ParticipantBorderThickness 1.0
skinparam ParticipantFontSize 16
skinparam LifeLineBackgroundColor white
skinparam LifeLineBorderColor black
skinparam LifeLineBorderThickness 1.0
skinparam ArrowColor black
skinparam ArrowFontSize 16
skinparam sequenceMessageAlign center

participant ": User" as User
participant "หน้าเป้าหมายการลงทุน : Website" as Frontend
participant "backend : API" as Backend
participant "database : DB" as DB

|||
activate User
User -> Frontend: 1: เข้าสู่หน้ากำหนดเป้าหมายการลงทุน
activate Frontend
Frontend --> User: 1.1: แสดงตัวเลือกเป้าหมายและระดับความเสี่ยง
User -> Frontend: 2: ระบุจำนวนเงินเป้าหมาย ระยะเวลา และความเสี่ยง
User -> Frontend: 3: กดยืนยันการตั้งเป้าหมาย
Frontend -> Backend: 4: ส่งข้อมูลเป้าหมายการลงทุน (POST /goals)
activate Backend
Backend -> DB: 4.1: บันทึกข้อมูลเป้าหมายการลงทุนลง DB
activate DB
DB --> Backend: 4.1.1: บันทึกสำเร็จ
deactivate DB
Backend --> Frontend: 4.2: ส่งสถานะบันทึกสำเร็จ
deactivate Backend
Frontend --> User: 5: แสดงเป้าหมายการลงทุนปัจจุบันบนหน้าจอ
deactivate Frontend
deactivate User
|||
@enduml
```

---

## 4. การเลือกตลาดและสินทรัพย์ที่ต้องการ (Select Markets & Assets)
```plantuml
@startuml
hide footbox
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor transparent
skinparam ParticipantMinHeight 60
skinparam ParticipantMinWidth 160
skinparam ParticipantBackgroundColor white
skinparam ParticipantBorderColor black
skinparam ParticipantBorderThickness 1.0
skinparam ParticipantFontSize 16
skinparam LifeLineBackgroundColor white
skinparam LifeLineBorderColor black
skinparam LifeLineBorderThickness 1.0
skinparam ArrowColor black
skinparam ArrowFontSize 16
skinparam sequenceMessageAlign center

participant ": User" as User
participant "หน้าเลือกสินทรัพย์ : Website" as Frontend
participant "backend : API" as Backend
participant "database : DB" as DB

|||
activate User
User -> Frontend: 1: เข้าสู่หน้าเลือกตลาดและสินทรัพย์
activate Frontend
Frontend -> Backend: 1.1: ร้องขอรายการตลาดและสินทรัพย์ SET50 (GET /assets)
activate Backend
Backend -> DB: 1.1.1: ดึงรายการสินทรัพย์ SET50 จาก DB
activate DB
DB --> Backend: 1.1.1.1: คืนค่ารายการสินทรัพย์
deactivate DB
Backend --> Frontend: 1.1.2: ส่งรายการสินทรัพย์กลับมา
deactivate Backend
Frontend --> User: 2: แสดงรายการหุ้นและสินทรัพย์ SET50
User -> Frontend: 3: เลือกหุ้นและกำหนดเงื่อนไขยกเว้นสินทรัพย์
User -> Frontend: 4: กดบันทึกการเลือกสินทรัพย์
Frontend -> Backend: 5: ส่งข้อมูลสินทรัพย์ที่เลือก (POST /assets/selection)
activate Backend
Backend -> DB: 5.1: บันทึกสินทรัพย์คัดสรรของผู้ใช้งานลง DB
activate DB
DB --> Backend: 5.1.1: บันทึกสำเร็จ
deactivate DB
Backend --> Frontend: 5.2: ส่งสถานะตอบรับสำเร็จ
deactivate Backend
Frontend --> User: 6: แสดงรายการสินทรัพย์ที่เลือกสำเร็จ
deactivate Frontend
deactivate User
|||
@enduml
```

---

## 5. การสร้างพอร์ตการลงทุน (Create Investment Portfolio)
```plantuml
@startuml
hide footbox
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor transparent
skinparam ParticipantMinHeight 60
skinparam ParticipantMinWidth 160
skinparam ParticipantBackgroundColor white
skinparam ParticipantBorderColor black
skinparam ParticipantBorderThickness 1.0
skinparam ParticipantFontSize 16
skinparam LifeLineBackgroundColor white
skinparam LifeLineBorderColor black
skinparam LifeLineBorderThickness 1.0
skinparam ArrowColor black
skinparam ArrowFontSize 16
skinparam sequenceMessageAlign center

participant ": User" as User
participant "หน้าสร้างพอร์ต : Website" as Frontend
participant "backend : API" as Backend
participant "engine : Model" as Model
participant "database : DB" as DB

|||
activate User
User -> Frontend: 1: เข้าสู่หน้าสร้างพอร์ตการลงทุน
activate Frontend
User -> Frontend: 2: เลือกเงื่อนไขคำนวณพอร์ต (เงินลงทุน/เวลา/ความเสี่ยง)
User -> Frontend: 3: กด "ประมวลผลและสร้างพอร์ต"
Frontend -> Backend: 4: ส่งพารามิเตอร์การจัดพอร์ต (POST /portfolio/create)
activate Backend
Backend -> DB: 4.1: ดึงประวัติราคาและสถิติหุ้น SET50
activate DB
DB --> Backend: 4.1.1: คืนค่าข้อมูลสถิติหุ้น
deactivate DB
Backend -> Model: 4.2: ส่งพารามิเตอร์ให้โมเดลประมวลผล
activate Model
Model -> Model: 4.2.1: ประมวลผล Black-Litterman และ GA
Model --> Backend: 4.2.2: ส่งผลลัพธ์สัดส่วนพอร์ตและผลตอบแทนคาดหวัง
deactivate Model
Backend -> DB: 4.3: บันทึกโครงสร้างพอร์ตการลงทุนลง DB
activate DB
DB --> Backend: 4.3.1: ยืนยันการบันทึก
deactivate DB
Backend --> Frontend: 4.4: ส่งข้อมูลพอร์ตการลงทุนกลับมา
deactivate Backend
Frontend --> User: 5: แสดงผลลัพธ์พอร์ตการลงทุนบนหน้าจอ
deactivate Frontend
deactivate User
|||
@enduml
```

---

## 6. การสร้างพอร์ตแนะนำอัตโนมัติ (Create Automatic Recommended Portfolio)
```plantuml
@startuml
hide footbox
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor transparent
skinparam ParticipantMinHeight 60
skinparam ParticipantMinWidth 160
skinparam ParticipantBackgroundColor white
skinparam ParticipantBorderColor black
skinparam ParticipantBorderThickness 1.0
skinparam ParticipantFontSize 16
skinparam LifeLineBackgroundColor white
skinparam LifeLineBorderColor black
skinparam LifeLineBorderThickness 1.0
skinparam ArrowColor black
skinparam ArrowFontSize 16
skinparam sequenceMessageAlign center

participant ": User" as User
participant "หน้าพอร์ตแนะนำ : Website" as Frontend
participant "backend : API" as Backend
participant "database : DB" as DB

|||
activate User
User -> Frontend: 1: เข้าสู่หน้าพอร์ตแนะนำอัตโนมัติ
activate Frontend
Frontend -> Backend: 1.1: ร้องขอรูปแบบพอร์ตแนะนำมาตรฐาน (GET /portfolio/recommended)
activate Backend
Backend -> DB: 1.1.1: ดึงข้อมูลสัดส่วนพอร์ตมาตรฐานจาก DB
activate DB
DB --> Backend: 1.1.1.1: คืนค่าข้อมูลพอร์ตมาตรฐาน
deactivate DB
Backend --> Frontend: 1.1.2: ส่งรายละเอียดพอร์ตแนะนำ
deactivate Backend
Frontend --> User: 2: แสดงรูปแบบพอร์ตแนะนำ (ความมั่นคง/สมดุล/เติบโตสูง)
User -> Frontend: 3: เลือกรูปแบบพอร์ตแนะนำและระบุเงินลงทุน
User -> Frontend: 4: กดยืนยันสร้างพอร์ตแนะนำ
Frontend -> Backend: 5: ส่งข้อมูลพอร์ตและเงินลงทุน (POST /portfolio/recommended/apply)
activate Backend
Backend -> Backend: 5.1: คำนวณมูลค่าหุ้นตามสัดส่วนมาตรฐาน
Backend -> DB: 5.2: บันทึกพอร์ตแนะนำใหม่ลง DB
activate DB
DB --> Backend: 5.2.1: บันทึกสำเร็จ
deactivate DB
Backend --> Frontend: 5.3: ส่งข้อมูลพอร์ตสำเร็จกลับมา
deactivate Backend
Frontend --> User: 6: แสดงผลลัพธ์พอร์ตแนะนำอัตโนมัติบนหน้าจอ
deactivate Frontend
deactivate User
|||
@enduml
```

---

## 7. การแก้ไขตั้งค่าพอร์ตการลงทุน (Edit Portfolio Settings)
```plantuml
@startuml
hide footbox
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor transparent
skinparam ParticipantMinHeight 60
skinparam ParticipantMinWidth 160
skinparam ParticipantBackgroundColor white
skinparam ParticipantBorderColor black
skinparam ParticipantBorderThickness 1.0
skinparam ParticipantFontSize 16
skinparam LifeLineBackgroundColor white
skinparam LifeLineBorderColor black
skinparam LifeLineBorderThickness 1.0
skinparam ArrowColor black
skinparam ArrowFontSize 16
skinparam sequenceMessageAlign center

participant ": User" as User
participant "หน้าปรับปรุงพอร์ต : Website" as Frontend
participant "backend : API" as Backend
participant "engine : Model" as Model
participant "database : DB" as DB

|||
activate User
User -> Frontend: 1: เลือกคำสั่งแก้ไขการตั้งค่าในหน้าพอร์ต
activate Frontend
User -> Frontend: 2: ปรับเปลี่ยนตัวแปร (เช่น ระดับความเสี่ยง) และกดยืนยัน
Frontend -> Backend: 3: ส่งข้อมูลตั้งค่าใหม่ (PUT /portfolio/{id})
activate Backend
Backend -> Model: 3.1: ส่งพารามิเตอร์ให้โมเดลประมวลผลใหม่
activate Model
Model -> Model: 3.1.1: คำนวณหาสัดส่วนพอร์ตใหม่
Model --> Backend: 3.1.2: ส่งผลลัพธ์พอร์ตใหม่
deactivate Model
Backend -> DB: 3.2: อัปเดตพอร์ตที่แก้ไขแล้วลง DB
activate DB
DB --> Backend: 3.2.1: อัปเดตสำเร็จ
deactivate DB
Backend --> Frontend: 3.3: ส่งข้อมูลพอร์ตฉบับอัปเดตกลับไป
deactivate Backend
Frontend --> User: 4: แสดงผลการวิเคราะห์พอร์ตใหม่
deactivate Frontend
deactivate User
|||
@enduml
```

---

## 8. การดาวน์โหลดผลสรุปเป็นไฟล์ PDF (Download Summary Results as PDF)
```plantuml
@startuml
hide footbox
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor transparent
skinparam ParticipantMinHeight 60
skinparam ParticipantMinWidth 160
skinparam ParticipantBackgroundColor white
skinparam ParticipantBorderColor black
skinparam ParticipantBorderThickness 1.0
skinparam ParticipantFontSize 16
skinparam LifeLineBackgroundColor white
skinparam LifeLineBorderColor black
skinparam LifeLineBorderThickness 1.0
skinparam ArrowColor black
skinparam ArrowFontSize 16
skinparam sequenceMessageAlign center

participant ": User" as User
participant "หน้าสรุปผลพอร์ต : Website" as Frontend
participant "backend : API" as Backend
participant "database : DB" as DB

|||
activate User
User -> Frontend: 1: กดปุ่มดาวน์โหลดรายงาน PDF ของพอร์ตปัจจุบัน
activate Frontend
Frontend -> Backend: 1.1: ร้องขอสร้างไฟล์ PDF (GET /portfolio/{id}/export-pdf)
activate Backend
Backend -> DB: 1.1.1: ดึงข้อมูลโครงสร้างพอร์ตและผลวิเคราะห์จาก DB
activate DB
DB --> Backend: 1.1.1.1: คืนค่าข้อมูลพอร์ต
deactivate DB
Backend -> Backend: 1.1.2: ประมวลผลและสร้างไฟล์เอกสาร PDF
Backend --> Frontend: 1.1.3: ส่งไฟล์ PDF (Download Stream) กลับมา
deactivate Backend
Frontend --> User: 2: แสดงหน้าต่างดาวน์โหลดและบันทึกไฟล์ลงอุปกรณ์
deactivate Frontend
deactivate User
|||
@enduml
```

---

## 9. การดูประวัติผลการวิเคราะห์ (View Analysis History)
```plantuml
@startuml
hide footbox
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor transparent
skinparam ParticipantMinHeight 60
skinparam ParticipantMinWidth 160
skinparam ParticipantBackgroundColor white
skinparam ParticipantBorderColor black
skinparam ParticipantBorderThickness 1.0
skinparam ParticipantFontSize 16
skinparam LifeLineBackgroundColor white
skinparam LifeLineBorderColor black
skinparam LifeLineBorderThickness 1.0
skinparam ArrowColor black
skinparam ArrowFontSize 16
skinparam sequenceMessageAlign center

participant ": User" as User
participant "หน้าประวัติพอร์ต : Website" as Frontend
participant "backend : API" as Backend
participant "database : DB" as DB

|||
activate User
User -> Frontend: 1: เลือกเมนูประวัติผลการวิเคราะห์
activate Frontend
Frontend -> Backend: 1.1: ร้องขอประวัติพอร์ตทั้งหมดของผู้ใช้ (GET /portfolio/history)
activate Backend
Backend -> DB: 1.1.1: ค้นหาข้อมูลพอร์ตในอดีตของผู้ใช้จาก DB
activate DB
DB --> Backend: 1.1.1.1: คืนค่ารายการประวัติ
deactivate DB
Backend --> Frontend: 1.1.2: ส่งรายการประวัติกลับไป
deactivate Backend
Frontend --> User: 2: แสดงรายการประวัติพอร์ตเรียงตามเวลา
deactivate Frontend
deactivate User
|||
@enduml
```

---

## 10. การปรับธีมสว่างและมืด (Toggle Light/Dark Theme)
```plantuml
@startuml
hide footbox
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor transparent
skinparam ParticipantMinHeight 60
skinparam ParticipantMinWidth 160
skinparam ParticipantBackgroundColor white
skinparam ParticipantBorderColor black
skinparam ParticipantBorderThickness 1.0
skinparam ParticipantFontSize 16
skinparam LifeLineBackgroundColor white
skinparam LifeLineBorderColor black
skinparam LifeLineBorderThickness 1.0
skinparam ArrowColor black
skinparam ArrowFontSize 16
skinparam sequenceMessageAlign center

participant ": User" as User
participant "หน้าเว็บ : Website" as Frontend

|||
activate User
User -> Frontend: 1: กดปุ่มสลับธีม (Light/Dark)
activate Frontend
Frontend -> Frontend: 1.1: บันทึกสถานะธีมใน Local Storage
Frontend -> Frontend: 1.2: ปรับชุดสี CSS บนหน้าต่างทำงาน
Frontend --> User: 2: แสดงผลหน้าจอด้วยธีมใหม่ทันที
deactivate Frontend
deactivate User
|||
@enduml
```

---

## 11. การเข้าสู่ระบบ (Log in)
```plantuml
@startuml
hide footbox
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor transparent
skinparam ParticipantMinHeight 60
skinparam ParticipantMinWidth 160
skinparam ParticipantBackgroundColor white
skinparam ParticipantBorderColor black
skinparam ParticipantBorderThickness 1.0
skinparam ParticipantFontSize 16
skinparam LifeLineBackgroundColor white
skinparam LifeLineBorderColor black
skinparam LifeLineBorderThickness 1.0
skinparam ArrowColor black
skinparam ArrowFontSize 16
skinparam sequenceMessageAlign center

participant ": User / Admin" as User
participant "หน้าเข้าสู่ระบบ : Website" as Frontend
participant "backend : API" as Backend
participant "database : DB" as DB

|||
activate User
User -> Frontend: 1: เข้าสู่หน้า Login
activate Frontend
User -> Frontend: 2: กรอกอีเมลและรหัสผ่าน
Frontend -> Backend: 3: ส่งข้อมูล Login (POST /login)
activate Backend
Backend -> DB: 3.1: ค้นหาผู้ใช้งานและตรวจสอบรหัสผ่านใน DB
activate DB
DB --> Backend: 3.1.1: คืนค่าข้อมูลและสิทธิ์ผู้ใช้งาน
deactivate DB
Backend -> Backend: 3.2: สร้าง Token สำหรับการเข้าถึง (JWT)
Backend --> Frontend: 3.3: ส่ง Token และข้อมูลสิทธิ์กลับมา
deactivate Backend
Frontend -> Frontend: 4: บันทึก Token ในระบบ
Frontend --> User: 5: นำทางไปยังหน้า Dashboard ตามสิทธิ์
deactivate Frontend
deactivate User
|||
@enduml
```

---

## 12. การออกจากระบบ (Log out)
```plantuml
@startuml
hide footbox
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor transparent
skinparam ParticipantMinHeight 60
skinparam ParticipantMinWidth 160
skinparam ParticipantBackgroundColor white
skinparam ParticipantBorderColor black
skinparam ParticipantBorderThickness 1.0
skinparam ParticipantFontSize 16
skinparam LifeLineBackgroundColor white
skinparam LifeLineBorderColor black
skinparam LifeLineBorderThickness 1.0
skinparam ArrowColor black
skinparam ArrowFontSize 16
skinparam sequenceMessageAlign center

participant ": User / Admin" as User
participant "หน้าเว็บ : Website" as Frontend

|||
activate User
User -> Frontend: 1: กดปุ่มออกจากระบบ
activate Frontend
Frontend -> Frontend: 1.1: ลบ Token ออกจาก Local Storage
Frontend -> Frontend: 1.2: เปลี่ยนเส้นทาง (Redirect) ไปหน้าหลัก
Frontend --> User: 2: แสดงหน้าหลักของเว็บไซต์ (สถานะยังไม่ Login)
deactivate Frontend
deactivate User
|||
@enduml
```

---

## 13. การจัดการแก้ไขข้อมูลบัญชีผู้ใช้ (Manage User Accounts - Admin)
```plantuml
@startuml
hide footbox
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor transparent
skinparam ParticipantMinHeight 60
skinparam ParticipantMinWidth 160
skinparam ParticipantBackgroundColor white
skinparam ParticipantBorderColor black
skinparam ParticipantBorderThickness 1.0
skinparam ParticipantFontSize 16
skinparam LifeLineBackgroundColor white
skinparam LifeLineBorderColor black
skinparam LifeLineBorderThickness 1.0
skinparam ArrowColor black
skinparam ArrowFontSize 16
skinparam sequenceMessageAlign center

participant ": Admin" as Admin
participant "หน้าจอแอดมิน : Website" as Frontend
participant "backend : API" as Backend
participant "database : DB" as DB

|||
activate Admin
Admin -> Frontend: 1: เข้าสู่เมนูจัดการบัญชีผู้ใช้งาน
activate Frontend
Frontend -> Backend: 1.1: ร้องขอรายการผู้ใช้ทั้งหมด (GET /admin/users)
activate Backend
Backend -> DB: 1.1.1: ดึงข้อมูลบัญชีผู้ใช้งานทั้งหมดจาก DB
activate DB
DB --> Backend: 1.1.1.1: คืนค่าข้อมูลผู้ใช้
deactivate DB
Backend --> Frontend: 1.1.2: ส่งข้อมูลผู้ใช้งานกลับไป
deactivate Backend
Frontend --> Admin: 2: แสดงรายการผู้ใช้งานทั้งหมด
Admin -> Frontend: 3: เลือกบัญชีและทำการแก้ไขข้อมูล/สิทธิ์
Frontend -> Backend: 4: ส่งข้อมูลอัปเดตบัญชี (PUT /admin/users/{id})
activate Backend
Backend -> DB: 4.1: บันทึกการเปลี่ยนแปลงลง DB
activate DB
DB --> Backend: 4.1.1: บันทึกสำเร็จ
deactivate DB
Backend --> Frontend: 4.2: แจ้งผลอัปเดตสำเร็จ
deactivate Backend
Frontend --> Admin: 5: แสดงผลข้อมูลที่อัปเดตแล้ว
deactivate Frontend
deactivate Admin
|||
@enduml
```

---

## 14. การตรวจสอบตารางสรุปผลการใช้งานของผู้ใช้ทั้งหมด (Check User Usage Summary Table - Admin)
```plantuml
@startuml
hide footbox
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor transparent
skinparam ParticipantMinHeight 60
skinparam ParticipantMinWidth 160
skinparam ParticipantBackgroundColor white
skinparam ParticipantBorderColor black
skinparam ParticipantBorderThickness 1.0
skinparam ParticipantFontSize 16
skinparam LifeLineBackgroundColor white
skinparam LifeLineBorderColor black
skinparam LifeLineBorderThickness 1.0
skinparam ArrowColor black
skinparam ArrowFontSize 16
skinparam sequenceMessageAlign center

participant ": Admin" as Admin
participant "หน้าจอแอดมิน : Website" as Frontend
participant "backend : API" as Backend
participant "database : DB" as DB

|||
activate Admin
Admin -> Frontend: 1: เข้าสู่หน้าสรุปการใช้งาน
activate Frontend
Frontend -> Backend: 1.1: ร้องขอข้อมูลสถิติภาพรวม (GET /admin/usage-summary)
activate Backend
Backend -> DB: 1.1.1: ดึงข้อมูลสถิติการจัดพอร์ตและประวัติการใช้งานจาก DB
activate DB
DB --> Backend: 1.1.1.1: คืนค่าข้อมูลสถิติ
deactivate DB
Backend -> Backend: 1.1.2: คำนวณและจัดกลุ่มข้อมูลสถิติเชิงลึก
Backend --> Frontend: 1.1.3: ส่งข้อมูลสถิติกลับไป
deactivate Backend
Frontend --> Admin: 2: แสดงผลรวมสถิติ ตารางการใช้งาน และแผนภูมิสรุป
deactivate Frontend
deactivate Admin
|||
@enduml
```

---

## 15. การจัดการสินทรัพย์ SET50 (Manage SET50 Assets - Admin)
```plantuml
@startuml
hide footbox
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor transparent
skinparam ParticipantMinHeight 60
skinparam ParticipantMinWidth 160
skinparam ParticipantBackgroundColor white
skinparam ParticipantBorderColor black
skinparam ParticipantBorderThickness 1.0
skinparam ParticipantFontSize 16
skinparam LifeLineBackgroundColor white
skinparam LifeLineBorderColor black
skinparam LifeLineBorderThickness 1.0
skinparam ArrowColor black
skinparam ArrowFontSize 16
skinparam sequenceMessageAlign center

participant ": Admin" as Admin
participant "หน้าจอแอดมิน : Website" as Frontend
participant "backend : API" as Backend
participant "database : DB" as DB

|||
activate Admin
Admin -> Frontend: 1: เข้าสู่เมนูจัดการสินทรัพย์ SET50
activate Frontend
Frontend -> Backend: 1.1: ร้องขอรายการสินทรัพย์ SET50 (GET /admin/assets)
activate Backend
Backend -> DB: 1.1.1: ดึงข้อมูลสินทรัพย์ SET50 จาก DB
activate DB
DB --> Backend: 1.1.1.1: คืนค่าข้อมูลสินทรัพย์
deactivate DB
Backend --> Frontend: 1.1.2: ส่งรายการสินทรัพย์กลับมา
deactivate Backend
Frontend --> Admin: 2: แสดงรายการสินทรัพย์ SET50
Admin -> Frontend: 3: ดำเนินการเพิ่ม ลบ หรือแก้ไขข้อมูลหลักทรัพย์
Frontend -> Backend: 4: ส่งข้อมูลสินทรัพย์ที่ปรับปรุงใหม่ (POST/PUT/DELETE /admin/assets)
activate Backend
Backend -> DB: 4.1: อัปเดตข้อมูลสินทรัพย์ใน DB
activate DB
DB --> Backend: 4.1.1: อัปเดตสำเร็จ
deactivate DB
Backend --> Frontend: 4.2: แจ้งผลอัปเดตสำเร็จ
deactivate Backend
Frontend --> Admin: 5: แสดงรายการสินทรัพย์ SET50 ล่าสุด
deactivate Frontend
deactivate Admin
|||
@enduml
```
