# PlantUML Class Diagram

Class Diagram ของระบบจัดพอร์ตการลงทุนอัจฉริยะ (Intelliportfolio Management System) อ้างอิงตามขอบข่ายโครงงาน (1.4) และ Use Case Description จัดเรียงสไตล์มินิมอล (Minimalist UML) ตามหลักสากล และสอดคล้องกับ Data Dictionary ล่าสุด 100%

---

## โครงสร้างคลาส (PlantUML)

```plantuml
@startuml
' === สไตล์เรียบง่าย (Minimalist Textbook UML) ===
hide circle
skinparam classAttributeIconSize 0
skinparam monochrome true
skinparam shadowing false
skinparam classFontStyle bold
skinparam classFontSize 14
skinparam classAttributeFontSize 12
skinparam linetype ortho
skinparam nodesep 50
skinparam ranksep 50

title Intelliportfolio Pro - Complete Class Diagram

' ==========================================
' CLASSES
' ==========================================

class Member {
    -clerk_id: String
    -email: String
    -full_name: String
    -role: String
    -created_at: DateTime
    -last_login_at: DateTime
    +register(email: String): bool
    +login(): bool
    +logout(): void
}

class User {
    +edit_profile(): bool
    +toggle_theme(): void
    +get_portfolio_history(): list
}

class Admin {
    +manage_user_accounts(): void
    +manage_set50_assets(): void
    +check_usage_summary(): list
}

class Portfolio {
    -id: int
    -clerk_id: String
    -target_beta: float
    -budget: float
    -target_amount: float
    -duration_years: int
    -expected_return: float
    -portfolio_volatility: float
    -success_probability: float
    -created_at: DateTime
    +create_custom_portfolio(): int
    +create_preset_portfolio(): int
    +edit_portfolio_settings(): bool
}

class Dashboard {
    -portfolio_id: int
    +render_allocation_chart(): void
    +render_backtest_comparison_chart(): void
    +export_pdf_summary(): File
}

class PortfolioAsset {
    -id: int
    -portfolio_id: int
    -ticker: String
    -weight: float
    -beta: float
    -created_at: DateTime
}

class StockView {
    -id: int
    -portfolio_id: int
    -ticker: String
    -expected_return: float
    -variance: float
    -updated_at: DateTime
}

class Asset {
    -ticker: String
    -market_cap: long
    -is_active: bool = true
    -created_at: DateTime
    -updated_at: DateTime
    +get_active_assets(): list
    +add_asset(): bool
    +update_asset(): bool
    +delete_asset(): bool
}

class BacktestEngine {
    +run_backtest(weights_dict: dict, start_date: Date, end_date: Date): DataFrame
    +get_benchmark_data(benchmark: String = "SET50"): DataFrame
}

class OptimizationEngine {
    -rf: float
    +run_optimization(tickers: list, bl_returns: list, cov_matrix: DataFrame, market_caps: Series): tuple
    -calculate_posterior(market_caps: Series, cov_matrix: DataFrame, views_data: dict): tuple
}

' ==========================================
' RELATIONSHIPS
' ==========================================

' Member Inheritance
User -up-|> Member
Admin -up-|> Member
Admin "1" --> "*" Asset : manages

' User -> Portfolio -> Dashboard
User "1" -down- "*" Portfolio : creates / views history
Portfolio "1" -right- "1" Dashboard : displays on

' Portfolio -> Sub-entities
Portfolio "1" *-- "*" PortfolioAsset : contains
Portfolio "1" *-- "*" StockView : defines views
PortfolioAsset "*" -right-> "1" Asset : references
StockView "*" --> "1" Asset : references

' Portfolio -> Engines (ดิ่งลงล่าง)
Portfolio ..> BacktestEngine : runs
Portfolio ..> OptimizationEngine : optimizes

' จัดกลุ่มให้อยู่ในระนาบเดียวกันเพื่อความสวยงาม
together {
    class BacktestEngine
    class OptimizationEngine
}

@enduml
```

---

## คำอธิบายสัญลักษณ์ความสัมพันธ์

| ความสัมพันธ์ | สัญลักษณ์ | ความหมาย |
| :--- | :--- | :--- |
| User/Admin △→ Member | ลูกศรสามเหลี่ยมโปร่งชี้ขึ้นหา Member (Superclass) | Generalization: User และ Admin สืบทอดคุณสมบัติการเข้าระบบจากคลาส Member |
| Admin → Asset | เส้นตรงลูกศรเปิด | Directed Association: แอดมินมีสิทธิ์จัดการข้อมูลหลักทรัพย์ SET50 |
| User — Portfolio | เส้นตรงธรรมดา (1 ต่อ *) | Association: ผู้ใช้สามารถสร้างและดึงประวัติพอร์ตของตนเองได้หลายพอร์ต |
| Portfolio — Dashboard | เส้นตรงธรรมดา (1 ต่อ 1) | Association: พอร์ตโฟลิโอแสดงผลบน Dashboard (และดาวน์โหลด PDF ที่นี่) |
| Portfolio ◆— PortfolioAsset | ข้าวหลามตัดทึบติดขอบด้านล่าง Portfolio (1 ต่อ *) | Composition: ถ้าลบพอร์ต ข้อมูลสัดส่วนสินทรัพย์จะถูกลบตามไปด้วย |
| Portfolio ◆— StockView | ข้าวหลามตัดทึบติดขอบด้านล่าง Portfolio (1 ต่อ *) | Composition: ถ้าลบพอร์ต ข้อมูลมุมมอง Black-Litterman จะถูกลบตามไปด้วย |
| PortfolioAsset / StockView → Asset | ลูกศรเปิดชี้หา Asset (* ต่อ 1) | Directed Association: อ้างอิงข้อมูลหุ้นรายตัว |
| Portfolio ⇢ Engine | เส้นประลูกศรเปิดชี้ลง | Dependency: พอร์ตโฟลิโอมีการเรียกใช้งานคลาส Engine เพื่อประมวลผลคำนวณสถิติและหาน้ำหนักที่เหมาะสม |
