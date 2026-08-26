# PlantUML Class Diagram

Class Diagram ของระบบจัดพอร์ตการลงทุนอัจฉริยะ (Intelliportfolio Management System) อ้างอิงตามขอบข่ายโครงงาน (1.4) และ Use Case Description จัดเรียงสไตล์มินิมอล (Minimalist UML) ตามหลักสากล

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
    -role: String
    -last_login_at: DateTime
    -created_at: DateTime
    +register(email: String): bool
    +login(): bool
    +logout(): void
    +manage_account(): void
    +delete_account(): bool
}

class User {
    -theme_preference: String = "light"
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
    -portfolio_id: int
    -user_id: int
    -name: String = "My Portfolio"
    -portfolio_type: String
    -target_beta: float
    -budget: float
    -target_amount: float
    -duration_years: int
    -max_weight_per_asset: float
    -locked_tickers: list
    -expected_return: float
    -volatility: float
    -success_prob: float
    -created_at: DateTime
    +create_custom_portfolio(): int
    +create_preset_portfolio(): int
    +edit_portfolio_settings(): bool
    +calculate_duration(principal: float, goal: float, annual_return: float): float
    +calculate_required_principal(duration: float, goal: float, annual_return: float): float
}



class Dashboard {
    -portfolio_id: int
    +render_allocation_chart(): void
    +render_backtest_comparison_chart(): void
    +export_pdf_summary(): File
}

class PortfolioAsset {
    -id: int
    -weight: float
}

class AssetSET50 {
    -ticker: String
    -market_cap: long
    -is_active: bool = true
    -created_at: DateTime
    -updated_at: DateTime
    +get_active_assets(): list
    +get_market_caps(tickers: list): Series
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
Admin "1" --> "*" AssetSET50 : manages

' User -> Portfolio -> Dashboard
User "1" -down- "*" Portfolio : creates / views history
Portfolio "1" -right- "1" Dashboard : displays on

' Portfolio -> Assets
Portfolio "1" *-- "*" PortfolioAsset : contains
PortfolioAsset "*" -right-> "1" AssetSET50 : references

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
| Admin → AssetSET50 | เส้นตรงลูกศรเปิด | Directed Association: แอดมินมีสิทธิ์จัดการข้อมูลหลักทรัพย์ SET50 |
| User — Portfolio | เส้นตรงธรรมดา (1 ต่อ *) | Association: ผู้ใช้สามารถสร้างและดึงประวัติพอร์ตของตนเองได้หลายพอร์ต |
| Portfolio — Dashboard | เส้นตรงธรรมดา (1 ต่อ 1) | Association: พอร์ตโฟลิโอแสดงผลบน Dashboard (และดาวน์โหลด PDF ที่นี่) |
| Portfolio ◆— PortfolioAsset | ข้าวหลามตัดทึบติดขอบด้านล่าง Portfolio (1 ต่อ *) | Composition: ถ้าลบพอร์ต สินทรัพย์จะถูกลบด้วย |
| PortfolioAsset → AssetSET50 | ลูกศรเปิดชี้ไปทางขวาหา AssetSET50 (* ต่อ 1) | Directed Association: อ้างอิงข้อมูลหุ้น |
| Portfolio ⇢ Engine | เส้นประลูกศรเปิดชี้ลง | Dependency: พอร์ตโฟลิโอมีการเรียกใช้งานคลาส Engine เพื่อประมวลผล |
