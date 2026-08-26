# PlantUML Sequence Diagrams (15 Use Cases Baseline)

เอกสารนี้รวบรวม **Sequence Diagrams** สำหรับทั้ง 15 Use Cases ของระบบ **"ระบบการจัดการพอร์ตการลงทุนอัจฉริยะ โดยใช้อัลกอริทึมเชิงพันธุกรรม"** 
ยึดโครงสร้างสอดคล้องกับ **Use Case Diagram (15 Use Cases)** 100%

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

participant "user : User" as User
participant "frontend : Website" as Frontend
participant "auth : Clerk" as Clerk

|||
activate User
User -> Frontend: 1: เข้าสู่หน้าสมัครสมาชิก (/register)
activate Frontend

alt วิธีที่ 1: สมัครผ่านบัญชี Google
    User -> Frontend: 2a: เลือกดำเนินการต่อด้วย Google
    Frontend -> Clerk: 3a: ส่งคำขอสมัครผ่านบัญชี Google
    activate Clerk
    Clerk -> Clerk: 3a.1: ตรวจสอบและเชื่อมต่อบัญชี Google
    deactivate Clerk

else วิธีที่ 2: สมัครด้วย Email & Password
    loop ข้อมูลไม่ถูกต้องตามรูปแบบที่กำหนด
        User -> Frontend: 2b: กรอกอีเมลและรหัสผ่าน
        Frontend -> Clerk: 3b: ส่งข้อมูลสมัครสมาชิก
        activate Clerk
        Clerk -> Clerk: 3b.1: ตรวจสอบรูปแบบและ Turnstile CAPTCHA
        Clerk --> Frontend: 3b.2: ส่งสถานะแจ้งเตือนข้อผิดพลาด
        deactivate Clerk
        Frontend --> User: 4b: แจ้งเตือนข้อผิดพลาด และให้กรอกข้อมูลใหม่
    end

    User -> Frontend: 2c: กรอกข้อมูลถูกต้องครบถ้วน
    Frontend -> Clerk: 3c: ส่งข้อมูลสมัครสมาชิก
    activate Clerk
    Clerk -> Clerk: 3c.1: ตรวจสอบข้อมูลถูกต้อง
    deactivate Clerk
end

Clerk -> Clerk: 4: ส่งรหัส OTP ยืนยันไปยังอีเมล
activate Clerk
Clerk --> Frontend: 4.1: แสดงหน้าต่างกรอกรหัส OTP
deactivate Clerk
Frontend --> User: 5: แสดงแบบฟอร์มยืนยันรหัส OTP

loop รหัส OTP ไม่ถูกต้อง
    User -> Frontend: 6a: กรอกรหัส OTP
    Frontend -> Clerk: 6a.1: ส่งรหัส OTP ไปตรวจสอบ
    activate Clerk
    Clerk -> Clerk: 6a.2: ตรวจสอบรหัส OTP
    Clerk --> Frontend: 6a.3: ส่งสถานะแจ้งเตือน OTP ไม่ถูกต้อง
    deactivate Clerk
    Frontend --> User: 6a.4: แสดงข้อความแจ้งเตือน และให้กรอก OTP ใหม่
end

User -> Frontend: 6b: กรอกรหัส OTP ถูกต้อง
Frontend -> Clerk: 6b.1: ส่งรหัส OTP ไปตรวจสอบ
activate Clerk
Clerk -> Clerk: 6b.2: สร้างบัญชีและบันทึกผู้ใช้ใหม่
Clerk --> Frontend: 6b.3: ส่งสถานะการสมัครสมาชิกสำเร็จ
deactivate Clerk
Frontend --> User: 7: นำทางไปยังหน้าหลักของระบบ

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

participant "user : User" as User
participant "frontend : Website" as Frontend
participant "backend : API" as Backend
participant "users : users" as DB

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

alt กรณีที่ 1: แก้ไขชื่อ หรือ รูปโปรไฟล์
    User -> Frontend: 3a: แก้ไขชื่อ หรือ อัปโหลดรูปภาพใหม่
    User -> Frontend: 4a: กดยืนยันการเปลี่ยนแปลง
    Frontend -> Backend: 5a: ส่งข้อมูลอัปเดต (PUT /profile)
    activate Backend
    Backend -> DB: 5a.1: บันทึกข้อมูลส่วนตัวใหม่ลง DB
    activate DB
    DB --> Backend: 5a.1.1: อัปเดตสำเร็จ
    deactivate DB
    Backend --> Frontend: 5a.2: ส่งสถานะตอบรับสำเร็จ
    deactivate Backend
    Frontend --> User: 6a: แสดงผลข้อมูลโปรไฟล์ล่าสุด

else กรณีที่ 2: เปลี่ยนรหัสผ่าน
    loop รหัสผ่านไม่ถูกต้อง (< 8 ตัวอักษร)
        User -> Frontend: 3b: กรอกรหัสผ่านใหม่
        Frontend --> User: 3b.1: แจ้งเตือนรูปแบบไม่ถูกต้อง (ขั้นต่ำ 8 ตัว) ให้กรอกใหม่
    end
    User -> Frontend: 4b: กรอกรหัสผ่านถูกต้อง (>= 8 ตัว) และกดยืนยัน
    Frontend -> Backend: 5b: ส่งข้อมูลเปลี่ยนรหัสผ่าน (PUT /profile/password)
    activate Backend
    Backend -> DB: 5b.1: บันทึกรหัสผ่านใหม่ลง DB
    activate DB
    DB --> Backend: 5b.1.1: อัปเดตสำเร็จ
    deactivate DB
    Backend --> Frontend: 5b.2: ส่งสถานะตอบรับสำเร็จ
    deactivate Backend
    Frontend --> User: 6b: แจ้งเตือนเปลี่ยนรหัสผ่านสำเร็จ
end
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

participant "user : User" as User
participant "frontend : Website" as Frontend

|||
activate User
User -> Frontend: 1: เข้าสู่หน้า "วางแผนลงทุน" (/plan)
activate Frontend
Frontend --> User: 2: แสดงตัวเลือกรูปแบบการจัดพอร์ต (Preset / Custom AI)
User -> Frontend: 3: เลือกว่าจะจัดพอร์ตแบบไหน
Frontend --> User: 4: แสดงแบบฟอร์มเป้าหมายตามแท็บที่เลือก
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

participant "user : User" as User
participant "frontend : Website" as Frontend

|||
activate User
User -> Frontend: 1: เลื่อนมาที่ส่วน "ตั้งค่าขั้นสูง"
activate Frontend
Frontend --> User: 2: แสดงตัวเลือก (สัดส่วนสูงสุด, หมวดหมู่, ล็อกหุ้นสูงสุด 5 ตัว)
User -> Frontend: 3: ปรับแต่งสัดส่วน หรือ เลือกล็อกหุ้น/หมวดหมู่ (ไม่บังคับ)
Frontend -> Frontend: 4: อัปเดตเงื่อนไขสินทรัพย์ลงใน Frontend State
Frontend --> User: 5: แสดงสถานะการตั้งค่าล่าสุด
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

participant "user : User" as User
participant "frontend : Website" as Frontend
participant "backend : API" as Backend
participant "engine : Model" as Model
participant "portfolios : portfolios" as DB

|||
activate User
User -> Frontend: 1: กรอกเงื่อนไขในการสร้าง (เงินลงทุน, เป้าหมาย, ระยะเวลา, จำนวนหุ้น)
activate Frontend
User -> Frontend: 2: กดปุ่ม "กำหนดเองทั้งหมด" (สร้างพอร์ต)
Frontend -> Frontend: 3: แสดง Loading
Frontend -> Backend: 4: ส่งข้อมูลฟอร์มไปยัง API (POST /api/optimize)
activate Backend
Backend -> DB: 4.1: ดึงข้อมูลประวัติราคาหุ้น SET50 จาก DB
activate DB
DB --> Backend: 4.1.1: คืนค่าข้อมูลสถิติหุ้น
deactivate DB
Backend -> Model: 4.2: ส่งพารามิเตอร์ให้โมเดลประมวลผล
activate Model
Model -> Model: 4.2.1: ประมวลผล Black-Litterman และ GA
Model --> Backend: 4.2.2: ส่งผลลัพธ์พอร์ตการลงทุน
deactivate Model
Backend -> DB: 4.3: บันทึกโครงสร้างพอร์ตการลงทุนลง DB
activate DB
DB --> Backend: 4.3.1: ยืนยันการบันทึก
deactivate DB
Backend --> Frontend: 4.4: ส่งผลลัพธ์พอร์ตการลงทุนกลับไป
deactivate Backend
Frontend -> Frontend: 5: เปลี่ยนหน้าไปยัง "หน้ารายละเอียดพอร์ต" (/dashboard/[id])
Frontend --> User: 6: แสดงกราฟ Asset Allocation และ Historical Backtest
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

participant "user : User" as User
participant "frontend : Website" as Frontend
participant "backend : API" as Backend
participant "portfolios : portfolios" as DB

|||
activate User
User -> Frontend: 1: เข้าสู่หน้า "วางแผนลงทุน" (/plan)
activate Frontend
User -> Frontend: 2: เลือกแท็บ "พอร์ตสำเร็จรูป (แนะนำ)"
User -> Frontend: 3: เลือกรูปแบบ (เช่น ความมั่นคง, สมดุล, เติบโตสูง)
User -> Frontend: 4: ระบุ "เงินลงทุน" และ "ระยะเวลา"
User -> Frontend: 5: กดปุ่ม "สร้างแผนการลงทุน"
Frontend -> Frontend: 6: แสดง Loading
Frontend -> Backend: 7: ส่งข้อมูลพอร์ตไปยัง API (POST /api/portfolio/preset)
activate Backend
Backend -> Backend: 7.1: จัดสรรสัดส่วนหุ้นตามรูปแบบมาตรฐาน
Backend -> DB: 7.2: บันทึกพอร์ตใหม่ลง DB
activate DB
DB --> Backend: 7.2.1: บันทึกสำเร็จ
deactivate DB
Backend --> Frontend: 7.3: ส่งผลลัพธ์กลับไป
deactivate Backend
Frontend -> Frontend: 8: เปลี่ยนหน้าไปยัง "หน้ารายละเอียดพอร์ต" (/dashboard/[id])
Frontend --> User: 9: แสดงกราฟ Asset Allocation และ Historical Backtest
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

participant "user : User" as User
participant "frontend : Website" as Frontend
participant "backend : API" as Backend
participant "engine : Model" as Model
participant "portfolios : portfolios" as DB

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

participant "user : User" as User
participant "frontend : Website" as Frontend
participant "backend : API" as Backend
participant "portfolios : portfolios" as DB

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

participant "user : User" as User
participant "frontend : Website" as Frontend
participant "backend : API" as Backend
participant "portfolios : portfolios" as DB

|||
activate User
User -> Frontend: 1: กดเมนู "แดชบอร์ด" (/dashboard)
activate Frontend
Frontend -> Backend: 1.1: ร้องขอประวัติพอร์ตทั้งหมดของผู้ใช้
activate Backend
Backend -> DB: 1.1.1: ค้นหาข้อมูลพอร์ตในอดีตของผู้ใช้จาก DB
activate DB
DB --> Backend: 1.1.1.1: คืนค่ารายการประวัติ
deactivate DB
Backend --> Frontend: 1.1.2: ส่งรายการประวัติกลับไป
deactivate Backend
Frontend --> User: 2: แสดงส่วน "ประวัติพอร์ตการลงทุนของคุณ" (ตารางพอร์ต)
User -> Frontend: 3: คลิกรายการพอร์ตเพื่อดูรายละเอียด
Frontend -> Frontend: 4: พาไปยังหน้ารายละเอียดพอร์ต (/dashboard/[id])
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

participant "user : User" as User
participant "frontend : Website" as Frontend

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

participant "actor : User" as User
participant "frontend : Website" as Frontend
participant "auth : Clerk" as Clerk
participant "backend : API" as Backend
participant "users : users" as DB

|||
activate User
User -> Frontend: 1: เข้าสู่หน้าเข้าสู่ระบบ (/login)
activate Frontend

alt กรณีที่ 1: ผู้ใช้งานทั่วไป (User ทั่วไป)
    alt 1.1: เข้าสู่ระบบด้วย Google
        User -> Frontend: 2a: เลือกเข้าสู่ระบบด้วยบัญชี Google
        Frontend -> Clerk: 3a: ส่งคำขอเข้าสู่ระบบผ่าน Google
        activate Clerk
        Clerk -> Clerk: 3a.1: ตรวจสอบและเชื่อมต่อบัญชี Google
        Clerk -> Clerk: 3a.2: สร้าง Session Token (JWT)
        Clerk --> Frontend: 3a.3: คืนค่าสถานะสำเร็จพร้อม Token
        deactivate Clerk
    else 1.2: เข้าสู่ระบบด้วย Email & Password
        loop อีเมลหรือรหัสผ่านไม่ถูกต้อง
            User -> Frontend: 2b: กรอกอีเมลและรหัสผ่าน
            Frontend -> Clerk: 3b: ส่งข้อมูล Login
            activate Clerk
            Clerk -> Clerk: 3b.1: ตรวจสอบความถูกต้อง
            Clerk --> Frontend: 3b.2: ส่งสถานะแจ้งเตือนข้อผิดพลาด
            deactivate Clerk
            Frontend --> User: 4b: แสดงข้อความแจ้งเตือน และให้กรอกข้อมูลใหม่
        end
        User -> Frontend: 2c: กรอกอีเมลและรหัสผ่านถูกต้อง
        Frontend -> Clerk: 3c: ส่งข้อมูล Login
        activate Clerk
        Clerk -> Clerk: 3c.1: ตรวจสอบความถูกต้อง
        Clerk -> Clerk: 3c.2: สร้าง Session Token (JWT)
        Clerk --> Frontend: 3c.3: คืนค่าสถานะสำเร็จพร้อม Token
        deactivate Clerk
    end
    Frontend --> User: 5a: นำทางไปยังหน้าแดชบอร์ด (/dashboard)

else กรณีที่ 2: ผู้ดูแลระบบ (Admin)
    User -> Frontend: 2d: กดปุ่ม/ลิงก์ "[สำหรับผู้ดูแลระบบ]"
    Frontend --> User: 3d: แสดงแบบฟอร์มเข้าสู่ระบบของแอดมิน
    loop ข้อมูลบัญชีผู้ดูแลระบบไม่ถูกต้อง
        User -> Frontend: 4d: กรอก ID/Email และรหัสผ่านผู้ดูแลระบบ
        Frontend -> Backend: 5d: ส่งข้อมูลเข้าสู่ระบบของแอดมิน (POST /admin/login)
        activate Backend
        Backend -> DB: 5d.1: ตรวจสอบบัญชีและสิทธิ์ Admin
        activate DB
        DB --> Backend: 5d.1.1: ข้อมูลไม่ถูกต้อง / ไม่มีสิทธิ์
        deactivate DB
        Backend --> Frontend: 5d.2: แจ้งเตือนข้อผิดพลาด
        deactivate Backend
        Frontend --> User: 6d: แสดงข้อความแจ้งเตือน และให้กรอกข้อมูลใหม่
    end
    User -> Frontend: 4e: กรอกข้อมูลแอดมินถูกต้องครบถ้วน
    Frontend -> Backend: 5e: ส่งข้อมูลเข้าสู่ระบบของแอดมิน (POST /admin/login)
    activate Backend
    Backend -> DB: 5e.1: ตรวจสอบบัญชีและสิทธิ์ Admin
    activate DB
    DB --> Backend: 5e.1.1: ยืนยันสิทธิ์ถูกต้อง
    deactivate DB
    Backend -> Backend: 5e.2: สร้าง Admin Session Token (JWT)
    Backend --> Frontend: 5e.3: ส่งสถานะสำเร็จพร้อม Token
    deactivate Backend
    Frontend --> User: 7d: นำทางไปยังหน้าจัดการระบบสำหรับแอดมิน (/admin)
end

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

participant "actor : User" as User
participant "frontend : Website" as Frontend

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

participant "admin : Admin" as Admin
participant "frontend : Website" as Frontend
participant "backend : API" as Backend
participant "users : users" as DB

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

participant "admin : Admin" as Admin
participant "frontend : Website" as Frontend
participant "backend : API" as Backend
participant "portfolios : portfolios" as DB

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

participant "admin : Admin" as Admin
participant "frontend : Website" as Frontend
participant "backend : API" as Backend
participant "assets : assets" as DB

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
