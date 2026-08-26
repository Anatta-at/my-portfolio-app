# PlantUML Activity Diagrams (15 Use Cases Baseline)

เอกสารนี้รวบรวม **Activity Diagrams (Swimlanes)** สำหรับทั้ง 15 Use Cases ของระบบ **"ระบบการจัดการพอร์ตการลงทุนอัจฉริยะ โดยใช้อัลกอริทึมเชิงพันธุกรรม"** 
ยึดโครงสร้างสอดคล้องกับ **Use Case Diagram (15 Use Cases)** 100% และปฏิบัติตามมาตรฐาน UML (ไม่มี Swimlane `database : DB` โดยรวมกระบวนการจัดการข้อมูลไว้ใน `backend : API`)

---

## 1. การสมัครสมาชิก (Register)
```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor white
skinparam ranksep 50

skinparam SwimlaneBorderColor black
skinparam SwimlaneBorderThickness 1.5
skinparam SwimlaneBackgroundColor white
skinparam SwimlaneTitleBackgroundColor white
skinparam SwimlaneTitleFontColor black
skinparam SwimlaneTitleFontSize 16
skinparam SwimlaneTitleFontName Arial

skinparam ActivityBackgroundColor white
skinparam ActivityBorderColor black
skinparam ActivityBorderThickness 1.5
skinparam ArrowThickness 0.7

|User\n\n|
start
:เข้าสู่หน้าสมัครสมาชิก (/register);
:เลือกวิธีสมัครสมาชิก;
if (ช่องทางการสมัคร?) then (สมัครผ่านบัญชี Google)
  :เลือกดำเนินการต่อด้วย Google;
  |ระบบล็อกอิน : Clerk\n\n|
  :ตรวจสอบความถูกต้องและเชื่อมต่อบัญชี Google;
else (สมัครด้วย Email & Password)
  repeat
    |User\n\n|
    :กรอกอีเมลและตั้งรหัสผ่านตามเงื่อนไข;
    |ระบบล็อกอิน : Clerk\n\n|
    :ตรวจสอบความปลอดภัยและรูปแบบข้อมูล;
  backward:แสดงข้อความแจ้งเตือนข้อผิดพลาด และให้กรอกข้อมูลใหม่;
  repeat while (ข้อมูลการสมัครถูกต้อง?) is (ไม่ถูกต้อง) not (ถูกต้อง)
endif

|ระบบล็อกอิน : Clerk\n\n|
:ส่งรหัส OTP ยืนยันไปยังอีเมล (Email Verification Code);
|หน้าเว็บ : Website\n\n|
:แสดงหน้าต่างให้กรอกรหัส OTP;
repeat
  |User\n\n|
  :กรอกรหัส OTP ที่ได้รับทางอีเมล;
  |ระบบล็อกอิน : Clerk\n\n|
  :ตรวจสอบความถูกต้องของรหัส OTP;
backward:แจ้งเตือนรหัส OTP ไม่ถูกต้อง และให้กรอกใหม่;
repeat while (รหัส OTP ถูกต้อง?) is (ไม่ถูกต้อง) not (ถูกต้อง)

|ระบบล็อกอิน : Clerk\n\n|
:สร้างบัญชีและบันทึกข้อมูลผู้ใช้งานใหม่;
:ส่งสถานะการสมัครสมาชิกสำเร็จ;
|หน้าเว็บ : Website\n\n|
:นำทางผู้ใช้ไปยังหน้าหลักของระบบ;
|User\n\n|
stop
@enduml
```

---

## 2. การแก้ไขข้อมูลส่วนตัว (Edit Personal Profile)
```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor white
skinparam ranksep 50

skinparam SwimlaneBorderColor black
skinparam SwimlaneBorderThickness 1.5
skinparam SwimlaneBackgroundColor white
skinparam SwimlaneTitleBackgroundColor white
skinparam SwimlaneTitleFontColor black
skinparam SwimlaneTitleFontSize 16
skinparam SwimlaneTitleFontName Arial

skinparam ActivityBackgroundColor white
skinparam ActivityBorderColor black
skinparam ActivityBorderThickness 1.5
skinparam ArrowThickness 0.7

|User\n\n|
start
:เข้าสู่หน้าจัดการข้อมูลส่วนตัว;
|หน้าแก้ไขข้อมูล : Website\n\n|
:แสดงข้อมูลโปรไฟล์ปัจจุบัน;
|User\n\n|
:เลือกประเภทรายการที่ต้องการแก้ไข;
if (ประเภทรายการ?) then (เปลี่ยนชื่อ หรือ รูปโปรไฟล์)
  :แก้ไขชื่อ หรือ อัปโหลดรูปโปรไฟล์ใหม่;
  |หน้าแก้ไขข้อมูล : Website\n\n|
  :ส่งข้อมูลอัปเดตไปยังระบบ (PUT /profile);
else (เปลี่ยนรหัสผ่าน)
  repeat
    |User\n\n|
    :กรอกรหัสผ่านใหม่;
    |หน้าแก้ไขข้อมูล : Website\n\n|
    :ตรวจสอบรูปแบบ (ขั้นต่ำ 8 ตัวอักษร);
  backward:แสดงข้อความแจ้งเตือนให้กรอกรหัสผ่านใหม่;
  repeat while (รหัสผ่านครบ 8 ตัวอักษร?) is (ไม่ถูกต้อง) not (ถูกต้อง)
  :ส่งข้อมูลเปลี่ยนรหัสผ่าน (PUT /profile/password);
endif
|backend : API\n\n|
:ตรวจสอบและบันทึกข้อมูลลงฐานข้อมูล;
:ส่งสถานะบันทึกสำเร็จ;
|หน้าแก้ไขข้อมูล : Website\n\n|
:แสดงผลข้อมูลโปรไฟล์ล่าสุด;
|User\n\n|
stop
@enduml
```

---

## 3. การกำหนดเป้าหมายการลงทุน (Set Investment Goals)
```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor white
skinparam ranksep 50

skinparam SwimlaneBorderColor black
skinparam SwimlaneBorderThickness 1.5
skinparam SwimlaneBackgroundColor white
skinparam SwimlaneTitleBackgroundColor white
skinparam SwimlaneTitleFontColor black
skinparam SwimlaneTitleFontSize 16
skinparam SwimlaneTitleFontName Arial

skinparam ActivityBackgroundColor white
skinparam ActivityBorderColor black
skinparam ActivityBorderThickness 1.5
skinparam ArrowThickness 0.7

|User\n\n|
start
:เข้าสู่หน้า "วางแผนลงทุน" (/plan);
|หน้าเว็บ : Website\n\n|
:แสดงตัวเลือกรูปแบบการจัดพอร์ต;
|User\n\n|
:เลือกว่าจะจัดพอร์ตแบบไหน\n(เช่น "พอร์ตสำเร็จรูป" หรือ "จัดพอร์ตด้วย AI กำหนดเอง");
|หน้าเว็บ : Website\n\n|
:แสดงแบบฟอร์มการตั้งเป้าหมายที่สอดคล้องกับแท็บที่เลือก;
|User\n\n|
stop
@enduml
```

---

## 4. การเลือกตลาดและสินทรัพย์ที่ต้องการ (Select Markets & Assets)
```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor white
skinparam ranksep 50

skinparam SwimlaneBorderColor black
skinparam SwimlaneBorderThickness 1.5
skinparam SwimlaneBackgroundColor white
skinparam SwimlaneTitleBackgroundColor white
skinparam SwimlaneTitleFontColor black
skinparam SwimlaneTitleFontSize 16
skinparam SwimlaneTitleFontName Arial

skinparam ActivityBackgroundColor white
skinparam ActivityBorderColor black
skinparam ActivityBorderThickness 1.5
skinparam ArrowThickness 0.7

|User\n\n|
start
:เลื่อนมาที่ส่วน "ตั้งค่าขั้นสูง" ในหน้าจัดพอร์ตด้วย AI;
|หน้าเว็บ : Website\n\n|
:แสดงส่วนตั้งค่าขั้นสูง (สัดส่วนสูงสุด, หมวดหมู่, ล็อกหุ้น);
|User\n\n|
:ปรับแต่งเงื่อนไขสินทรัพย์และสัดส่วนตามต้องการ;
|หน้าเว็บ : Website\n\n|
:อัปเดตเงื่อนไขสินทรัพย์ลงในสถานะของฟอร์ม (Frontend State);
|User\n\n|
stop
@enduml
```

---

## 5. การสร้างพอร์ตการลงทุน (Create Investment Portfolio)
```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor white
skinparam ranksep 50

skinparam SwimlaneBorderColor black
skinparam SwimlaneBorderThickness 1.5
skinparam SwimlaneBackgroundColor white
skinparam SwimlaneTitleBackgroundColor white
skinparam SwimlaneTitleFontColor black
skinparam SwimlaneTitleFontSize 16
skinparam SwimlaneTitleFontName Arial

skinparam ActivityBackgroundColor white
skinparam ActivityBorderColor black
skinparam ActivityBorderThickness 1.5
skinparam ArrowThickness 0.7

|User\n\n|
start
:กรอกเงื่อนไขในการสร้าง (เงินลงทุน, เป้าหมาย, ระยะเวลา, จำนวนหุ้น);
:กดปุ่ม "กำหนดเองทั้งหมด" (สร้างพอร์ต);
|หน้าเว็บ : Website\n\n|
:แสดง Loading และรวบรวมข้อมูลเป้าหมายและสินทรัพย์;
:ส่งข้อมูลพารามิเตอร์ทั้งหมดไปยัง API (POST /api/optimize);
|backend : API\n\n|
:ตรวจสอบข้อมูล และดึงข้อมูลประวัติราคาหุ้น SET50 จากฐานข้อมูล;
:ส่งพารามิเตอร์ให้โมเดลประมวลผล;
|engine : Model\n\n|
:ประมวลผล Genetic Algorithm และ Black-Litterman;
|backend : API\n\n|
:สร้างโครงสร้างพอร์ตการลงทุนและบันทึกลงฐานข้อมูล;
:ส่งผลลัพธ์พอร์ตการลงทุนกลับไป;
|หน้าเว็บ : Website\n\n|
:เปลี่ยนหน้าไปยัง "หน้ารายละเอียดพอร์ต" (/dashboard/[id]);
:แสดงกราฟ Asset Allocation และ Historical Backtest;
|User\n\n|
stop
@enduml
```

---

## 6. การสร้างพอร์ตแนะนำอัตโนมัติ (Create Automatic Recommended Portfolio)
```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor white
skinparam ranksep 50

skinparam SwimlaneBorderColor black
skinparam SwimlaneBorderThickness 1.5
skinparam SwimlaneBackgroundColor white
skinparam SwimlaneTitleBackgroundColor white
skinparam SwimlaneTitleFontColor black
skinparam SwimlaneTitleFontSize 16
skinparam SwimlaneTitleFontName Arial

skinparam ActivityBackgroundColor white
skinparam ActivityBorderColor black
skinparam ActivityBorderThickness 1.5
skinparam ArrowThickness 0.7

|User\n\n|
start
:เข้าสู่หน้า "วางแผนลงทุน" (/plan);
:เลือกแท็บ "พอร์ตสำเร็จรูป (แนะนำ)";
:เลือกรูปแบบ (เช่น พอร์ตความมั่นคง, พอร์ตสมดุล, พอร์ตเติบโตสูง);
:ระบุ "เงินลงทุน" และ "ระยะเวลา";
:กดปุ่ม "สร้างแผนการลงทุน";
|หน้าเว็บ : Website\n\n|
:แสดง Loading และส่งข้อมูลพอร์ตไปยัง API;
|backend : API\n\n|
:จัดสรรสัดส่วนหุ้นตามรูปแบบมาตรฐาน;
:ร้องขอบันทึกข้อมูล;\n|portfolios : portfolios\n\n|\n:บันทึกพอร์ตใหม่ลงตาราง;\n|backend : API\n\n|\n:รับสถานะการบันทึกสำเร็จ;
:ส่งผลลัพธ์กลับไป;
|หน้าเว็บ : Website\n\n|
:เปลี่ยนหน้าไปยัง "หน้ารายละเอียดพอร์ต" (/dashboard/[id]);
:แสดงกราฟ Asset Allocation และ Historical Backtest;
|User\n\n|
stop
@enduml
```

---

## 7. การแก้ไขตั้งค่าพอร์ตการลงทุน (Edit Portfolio Settings)
```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor white
skinparam ranksep 50

skinparam SwimlaneBorderColor black
skinparam SwimlaneBorderThickness 1.5
skinparam SwimlaneBackgroundColor white
skinparam SwimlaneTitleBackgroundColor white
skinparam SwimlaneTitleFontColor black
skinparam SwimlaneTitleFontSize 16
skinparam SwimlaneTitleFontName Arial

skinparam ActivityBackgroundColor white
skinparam ActivityBorderColor black
skinparam ActivityBorderThickness 1.5
skinparam ArrowThickness 0.7

|User\n\n|
start
:เลือกคำสั่งแก้ไขการตั้งค่าในหน้าพอร์ต;
:ปรับเปลี่ยนตัวแปร (เช่น ระดับความเสี่ยง) และกดยืนยัน;
|หน้าปรับปรุงพอร์ต : Website\n\n|
:ส่งข้อมูลตั้งค่าใหม่ (PUT /portfolio/{id});
|backend : API\n\n|
:ตรวจสอบพารามิเตอร์ใหม่;
:ส่งพารามิเตอร์ให้โมเดลประมวลผล;
|engine : Model\n\n|
:คำนวณหาสัดส่วนพอร์ตใหม่ด้วยข้อมูลอัปเดต;
:ส่งผลลัพธ์พอร์ตใหม่;
|backend : API\n\n|
:ร้องขออัปเดตข้อมูลพอร์ต;\n|portfolios : portfolios\n\n|\n:บันทึกพอร์ตที่แก้ไขแล้วลงตาราง;\n|backend : API\n\n|\n:รับสถานะการบันทึกสำเร็จ;
:ส่งข้อมูลพอร์ตฉบับอัปเดตกลับไป;
|หน้าปรับปรุงพอร์ต : Website\n\n|
:แสดงผลการวิเคราะห์พอร์ตใหม่;
|User\n\n|
stop
@enduml
```

---

## 8. การดาวน์โหลดผลสรุปเป็นไฟล์ PDF (Download Summary Results as PDF)
```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor white
skinparam ranksep 50

skinparam SwimlaneBorderColor black
skinparam SwimlaneBorderThickness 1.5
skinparam SwimlaneBackgroundColor white
skinparam SwimlaneTitleBackgroundColor white
skinparam SwimlaneTitleFontColor black
skinparam SwimlaneTitleFontSize 16
skinparam SwimlaneTitleFontName Arial

skinparam ActivityBackgroundColor white
skinparam ActivityBorderColor black
skinparam ActivityBorderThickness 1.5
skinparam ArrowThickness 0.7

|User\n\n|
start
:กดปุ่มดาวน์โหลดรายงาน PDF ของพอร์ตปัจจุบัน;
|หน้าสรุปผลพอร์ต : Website\n\n|
:ร้องขอสร้างไฟล์ PDF (GET /portfolio/{id}/export-pdf);
|backend : API\n\n|
:ร้องขอข้อมูลโครงสร้างพอร์ต;\n|portfolios : portfolios\n\n|\n:ส่งข้อมูลพอร์ตและผลวิเคราะห์กลับ;\n|backend : API\n\n|\n:ประมวลผลข้อมูลและสร้างไฟล์เอกสาร PDF;
:ส่งไฟล์ PDF กลับมา;
|หน้าสรุปผลพอร์ต : Website\n\n|
:แสดงหน้าต่างและเริ่มการดาวน์โหลดไฟล์;
|User\n\n|
:ดาวน์โหลดไฟล์ PDF ลงสู่อุปกรณ์;
stop
@enduml
```

---

## 9. การดูประวัติผลการวิเคราะห์ (View Analysis History)
```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor white
skinparam ranksep 50

skinparam SwimlaneBorderColor black
skinparam SwimlaneBorderThickness 1.5
skinparam SwimlaneBackgroundColor white
skinparam SwimlaneTitleBackgroundColor white
skinparam SwimlaneTitleFontColor black
skinparam SwimlaneTitleFontSize 16
skinparam SwimlaneTitleFontName Arial

skinparam ActivityBackgroundColor white
skinparam ActivityBorderColor black
skinparam ActivityBorderThickness 1.5
skinparam ArrowThickness 0.7

|User\n\n|
start
:กดเมนู "แดชบอร์ด" (/dashboard);
|หน้าเว็บ : Website\n\n|
:ร้องขอประวัติพอร์ตทั้งหมดของผู้ใช้;
|backend : API\n\n|
:ร้องขอประวัติพอร์ตทั้งหมดของผู้ใช้;\n|portfolios : portfolios\n\n|\n:ค้นหาและส่งคืนรายการประวัติ;\n|backend : API\n\n|\n:จัดรูปแบบข้อมูลประวัติ;
:ส่งรายการประวัติกลับไป;
|หน้าเว็บ : Website\n\n|
:แสดงส่วน "ประวัติพอร์ตการลงทุนของคุณ";
:แสดงตาราง (ชื่อพอร์ต, วันที่สร้าง, ระดับความเสี่ยง, เงินลงทุน);
|User\n\n|
:คลิกรายการพอร์ตเพื่อดูรายละเอียด;
|หน้าเว็บ : Website\n\n|
:พาไปยังหน้ารายละเอียดพอร์ต (/dashboard/[id]);
|User\n\n|
stop
@enduml
```

---

## 10. การปรับธีมสว่างและมืด (Toggle Light/Dark Theme)
```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor white
skinparam ranksep 50

skinparam SwimlaneBorderColor black
skinparam SwimlaneBorderThickness 1.5
skinparam SwimlaneBackgroundColor white
skinparam SwimlaneTitleBackgroundColor white
skinparam SwimlaneTitleFontColor black
skinparam SwimlaneTitleFontSize 16
skinparam SwimlaneTitleFontName Arial

skinparam ActivityBackgroundColor white
skinparam ActivityBorderColor black
skinparam ActivityBorderThickness 1.5
skinparam ArrowThickness 0.7

|User\n\n|
start
:กดปุ่มสลับธีม (Light/Dark);
|หน้าเว็บ : Website\n\n|
:บันทึกสถานะธีมใน Local Storage;
:ปรับชุดสี CSS บนหน้าต่างทำงาน;
:แสดงผลหน้าจอด้วยธีมใหม่ทันที;
|User\n\n|
stop
@enduml
```

---

## 11. การเข้าสู่ระบบ (Log in)
```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor white
skinparam ranksep 50

skinparam SwimlaneBorderColor black
skinparam SwimlaneBorderThickness 1.5
skinparam SwimlaneBackgroundColor white
skinparam SwimlaneTitleBackgroundColor white
skinparam SwimlaneTitleFontColor black
skinparam SwimlaneTitleFontSize 16
skinparam SwimlaneTitleFontName Arial

skinparam ActivityBackgroundColor white
skinparam ActivityBorderColor black
skinparam ActivityBorderThickness 1.5
skinparam ArrowThickness 0.7

|User / Admin\n\n|
start
:เข้าสู่หน้าเข้าสู่ระบบ (/login);
if (ประเภทการเข้าใช้งาน?) then (ผู้ใช้งานทั่วไป)
  :เลือกวิธีเข้าสู่ระบบ (Google หรือ Email/Password);
  if (ช่องทาง?) then (เข้าสู่ระบบด้วย Google)
    :เลือกดำเนินการต่อด้วย Google;
    |ระบบล็อกอิน : Clerk\n\n|
    :ตรวจสอบความถูกต้องและเชื่อมต่อบัญชี Google;
  else (เข้าสู่ระบบด้วย Email & Password)
    repeat
      |User / Admin\n\n|
      :กรอกอีเมลและรหัสผ่าน;
      |ระบบล็อกอิน : Clerk\n\n|
      :ตรวจสอบความถูกต้องของอีเมลและรหัสผ่าน;
    backward:แสดงข้อความแจ้งเตือน และให้กรอกข้อมูลใหม่;
    repeat while (ข้อมูลถูกต้อง?) is (ไม่ถูกต้อง) not (ถูกต้อง)
  endif
  |ระบบล็อกอิน : Clerk\n\n|
  :สร้าง Session Token สำหรับผู้ใช้งานทั่วไป;
  |หน้าเว็บ : Website\n\n|
  :นำทางไปยังหน้าแดชบอร์ดพอร์ตการลงทุน (/dashboard);

else (ผู้ดูแลระบบ)
  |User / Admin\n\n|
  :กดปุ่ม/ลิงก์ "[สำหรับผู้ดูแลระบบ]";
  |หน้าเว็บ : Website\n\n|
  :แสดงแบบฟอร์มเข้าสู่ระบบของผู้ดูแลระบบ;
  repeat
    |User / Admin\n\n|
    :กรอกบัญชีผู้ดูแลระบบ (ID/Email) และรหัสผ่าน;
    |backend : API\n\n|
    :ตรวจสอบข้อมูลบัญชีและสิทธิ์ Admin;\n|users : users\n\n|\n:ยืนยันข้อมูลบัญชีและสิทธิ์ Admin;\n|backend : API\n\n|\n:รับผลการตรวจสอบ;
  backward:แสดงข้อความแจ้งเตือน และให้กรอกข้อมูลใหม่;
  repeat while (บัญชีและรหัสผ่านถูกต้อง?) is (ไม่ถูกต้อง) not (ถูกต้อง)
  :สร้าง Session Token สำหรับผู้ดูแลระบบ;
  |หน้าเว็บ : Website\n\n|
  :นำทางไปยังหน้าจัดการระบบสำหรับแอดมิน (/admin);
endif

|User / Admin\n\n|
stop
@enduml
```

---

## 12. การออกจากระบบ (Log out)
```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor white
skinparam ranksep 50

skinparam SwimlaneBorderColor black
skinparam SwimlaneBorderThickness 1.5
skinparam SwimlaneBackgroundColor white
skinparam SwimlaneTitleBackgroundColor white
skinparam SwimlaneTitleFontColor black
skinparam SwimlaneTitleFontSize 16
skinparam SwimlaneTitleFontName Arial

skinparam ActivityBackgroundColor white
skinparam ActivityBorderColor black
skinparam ActivityBorderThickness 1.5
skinparam ArrowThickness 0.7

|User / Admin\n\n|
start
:กดปุ่มออกจากระบบ;
|หน้าเว็บ : Website\n\n|
:ลบ Token ออกจากหน่วยความจำ/Local Storage;
:เปลี่ยนเส้นทาง (Redirect) ไปหน้าหลัก;
:แสดงหน้าหลักของเว็บไซต์ (สถานะยังไม่ Login);
|User / Admin\n\n|
stop
@enduml
```

---

## 13. การจัดการแก้ไขข้อมูลบัญชีผู้ใช้ (Manage User Accounts - Admin)
```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor white
skinparam ranksep 50

skinparam SwimlaneBorderColor black
skinparam SwimlaneBorderThickness 1.5
skinparam SwimlaneBackgroundColor white
skinparam SwimlaneTitleBackgroundColor white
skinparam SwimlaneTitleFontColor black
skinparam SwimlaneTitleFontSize 16
skinparam SwimlaneTitleFontName Arial

skinparam ActivityBackgroundColor white
skinparam ActivityBorderColor black
skinparam ActivityBorderThickness 1.5
skinparam ArrowThickness 0.7

|Admin\n\n|
start
:เข้าสู่เมนูจัดการบัญชีผู้ใช้งาน;
|หน้าจอแอดมิน : Website\n\n|
:ร้องขอรายการผู้ใช้ทั้งหมด (GET /admin/users);
|backend : API\n\n|
:ร้องขอรายการผู้ใช้งานทั้งหมด;\n|users : users\n\n|\n:ส่งข้อมูลบัญชีผู้ใช้งานทั้งหมดกลับ;\n|backend : API\n\n|\n:เตรียมข้อมูลสำหรับแสดงผล;
:ส่งข้อมูลผู้ใช้งานกลับไป;
|หน้าจอแอดมิน : Website\n\n|
:แสดงรายการผู้ใช้งานทั้งหมด;
|Admin\n\n|
:เลือกบัญชีและทำการแก้ไขข้อมูลหรือสิทธิ์;
|หน้าจอแอดมิน : Website\n\n|
:ส่งข้อมูลอัปเดตบัญชี (PUT /admin/users/{id});
|backend : API\n\n|
:ส่งข้อมูลบัญชีที่แก้ไข;\n|users : users\n\n|\n:บันทึกการเปลี่ยนแปลงบัญชีลงตาราง;\n|backend : API\n\n|\n:รับสถานะการบันทึกสำเร็จ;
:ส่งสถานะตอบรับสำเร็จ;
|หน้าจอแอดมิน : Website\n\n|
:แสดงผลข้อมูลบัญชีที่อัปเดตแล้วล่าสุด;
|Admin\n\n|
stop
@enduml
```

---

## 14. การตรวจสอบตารางสรุปผลการใช้งานของผู้ใช้ทั้งหมด (Check User Usage Summary Table - Admin)
```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor white
skinparam ranksep 50

skinparam SwimlaneBorderColor black
skinparam SwimlaneBorderThickness 1.5
skinparam SwimlaneBackgroundColor white
skinparam SwimlaneTitleBackgroundColor white
skinparam SwimlaneTitleFontColor black
skinparam SwimlaneTitleFontSize 16
skinparam SwimlaneTitleFontName Arial

skinparam ActivityBackgroundColor white
skinparam ActivityBorderColor black
skinparam ActivityBorderThickness 1.5
skinparam ArrowThickness 0.7

|Admin\n\n|
start
:เข้าสู่หน้าสรุปการใช้งาน;
|หน้าจอแอดมิน : Website\n\n|
:ร้องขอข้อมูลสถิติภาพรวม (GET /admin/usage-summary);
|backend : API\n\n|
:ร้องขอข้อมูลพอร์ตทั้งหมด;\n|portfolios : portfolios\n\n|\n:ส่งข้อมูลพอร์ตทั้งหมดของผู้ใช้ระบบกลับ;\n|backend : API\n\n|\n:รวมข้อมูลที่ได้;
:คำนวณและจัดกลุ่มข้อมูลสถิติเชิงลึก;
:ส่งข้อมูลสถิติกลับไป;
|หน้าจอแอดมิน : Website\n\n|
:แสดงผลรวมจำนวนครั้งการจัดพอร์ตทั้งหมด;
:แสดงตารางรายละเอียดการจัดพอร์ทของ User แต่ละคน;
:แสดงแผนภูมิสัดส่วนพอร์ตแต่ละแบบที่ถูกจัด;
|Admin\n\n|
stop
@enduml
```

---

## 15. การจัดการสินทรัพย์ SET50 (Manage SET50 Assets - Admin)
```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundcolor white
skinparam ranksep 50

skinparam SwimlaneBorderColor black
skinparam SwimlaneBorderThickness 1.5
skinparam SwimlaneBackgroundColor white
skinparam SwimlaneTitleBackgroundColor white
skinparam SwimlaneTitleFontColor black
skinparam SwimlaneTitleFontSize 16
skinparam SwimlaneTitleFontName Arial

skinparam ActivityBackgroundColor white
skinparam ActivityBorderColor black
skinparam ActivityBorderThickness 1.5
skinparam ArrowThickness 0.7

|Admin\n\n|
start
:เข้าสู่เมนูจัดการสินทรัพย์ SET50;
|หน้าจอแอดมิน : Website\n\n|
:ร้องขอรายการสินทรัพย์ SET50 (GET /admin/assets);
|backend : API\n\n|
:ร้องขอรายการสินทรัพย์ SET50;\n|assets : assets\n\n|\n:ส่งข้อมูลสินทรัพย์กลับ;\n|backend : API\n\n|\n:เตรียมรายการสินทรัพย์;
:ส่งรายการสินทรัพย์กลับมา;
|หน้าจอแอดมิน : Website\n\n|
:แสดงรายการสินทรัพย์ SET50;
|Admin\n\n|
:ดำเนินการเพิ่ม ลบ หรือแก้ไขข้อมูลหลักทรัพย์;
|หน้าจอแอดมิน : Website\n\n|
:ส่งข้อมูลสินทรัพย์ที่ปรับปรุงใหม่ (POST/PUT/DELETE /admin/assets);
|backend : API\n\n|
:ร้องขออัปเดตข้อมูล;\n|assets : assets\n\n|\n:อัปเดตข้อมูลสินทรัพย์ลงตาราง;\n|backend : API\n\n|\n:รับสถานะการอัปเดตสำเร็จ;
:ส่งสถานะตอบรับสำเร็จ;
|หน้าจอแอดมิน : Website\n\n|
:แสดงรายการสินทรัพย์ SET50 ล่าสุด;
|Admin\n\n|
stop
@enduml
```
