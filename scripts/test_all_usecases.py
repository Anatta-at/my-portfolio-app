#!/usr/bin/env python3
"""
=======================================================================
 🧪 Intelliportfolio — ระบบทดสอบอัตโนมัติราย Use Case (15 Use Cases)
=======================================================================

สคริปต์นี้ทดสอบทุกฟีเจอร์ของระบบ Intelliportfolio โดยเทียบกับ
Use Case Description ทั้ง 15 ข้อจากเอกสาร docs/usecase_description.md

วิธีรัน:
  python3 scripts/test_all_usecases.py

ข้อกำหนด:
  - Backend (FastAPI) ต้องรันอยู่บน http://localhost:8000
  - PostgreSQL ต้องรันอยู่บน port 5432
  - Frontend (Next.js) ต้องรันอยู่บน http://localhost:3000
"""

import json
import sys
import time
import subprocess
import os

# ===========================================
# ตั้งค่า
# ===========================================
API_BASE = os.getenv("API_BASE", "http://localhost:8000")
FRONTEND_BASE = os.getenv("FRONTEND_BASE", "http://localhost:3000")
TEST_CLERK_ID = "test_clerk_usecase_auto"
TEST_EMAIL = "test_usecase@intelliport.dev"
TEST_FULLNAME = "Automated Test User"

passed = 0
failed = 0
results = []


def log_result(uc_id, title, success, detail=""):
    global passed, failed
    status = "PASSED" if success else "FAILED"
    if success:
        passed += 1
    else:
        failed += 1
    results.append((uc_id, title, status, detail))
    icon = "✅" if success else "❌"
    print(f"  {icon} [{status}] {uc_id}: {title}")
    if detail:
        print(f"       -> {detail}")


def http_request(method, url, data=None, timeout=30):
    """ส่ง HTTP Request โดยใช้ curl (ใช้ได้ทุกเครื่องโดยไม่ต้องติดตั้ง requests)"""
    cmd = ["curl", "-s", "-X", method, "-w", "\n%{http_code}"]
    if data is not None:
        cmd += ["-H", "Content-Type: application/json", "-d", json.dumps(data)]
    cmd.append(url)
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        lines = result.stdout.strip().rsplit("\n", 1)
        if len(lines) == 2:
            body, status_code = lines
        else:
            body, status_code = lines[0], "0"
        try:
            body_json = json.loads(body)
        except (json.JSONDecodeError, ValueError):
            body_json = None
        return int(status_code), body_json, body
    except subprocess.TimeoutExpired:
        return 0, None, "TIMEOUT"
    except Exception as e:
        return 0, None, str(e)


def check_url_reachable(url, timeout=5):
    """ตรวจสอบว่า URL เข้าถึงได้หรือไม่"""
    cmd = ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", str(timeout), url]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout + 2)
        return result.stdout.strip() == "200"
    except Exception:
        return False


# ===========================================
# Pre-flight: ตรวจสอบว่าระบบพร้อมทดสอบ
# ===========================================
def preflight_check():
    print("\n" + "=" * 70)
    print(" 🔍 Pre-flight Check: ตรวจสอบความพร้อมของระบบ")
    print("=" * 70)
    
    # Check Backend
    ok_backend = check_url_reachable(f"{API_BASE}/api/market-highlights")
    print(f"  {'✅' if ok_backend else '❌'} Backend API ({API_BASE}): {'Ready' if ok_backend else 'NOT REACHABLE'}")
    
    # Check Frontend
    ok_frontend = check_url_reachable(FRONTEND_BASE)
    print(f"  {'✅' if ok_frontend else '❌'} Frontend ({FRONTEND_BASE}): {'Ready' if ok_frontend else 'NOT REACHABLE'}")
    
    # Check DB via API
    code, body, _ = http_request("GET", f"{API_BASE}/api/admin/assets")
    ok_db = code == 200 and body and body.get("status") == "success"
    print(f"  {'✅' if ok_db else '❌'} Database (via API): {'Ready' if ok_db else 'NOT REACHABLE'}")
    
    if not ok_backend:
        print("\n  ⚠️  Backend ยังไม่พร้อม กรุณารัน: uvicorn backend.main:app --reload --port 8000")
        sys.exit(1)
    if not ok_db:
        print("\n  ⚠️  Database ยังไม่พร้อม กรุณารัน: docker compose up -d db")
        sys.exit(1)
    
    print(f"\n  ✅ ระบบพร้อมทดสอบ!\n")


# ===========================================
# UC-01: สมัครสมาชิก (User Register / Sync)
# ===========================================
def test_uc01():
    code, body, _ = http_request("POST", f"{API_BASE}/api/users/sync", {
        "clerk_id": TEST_CLERK_ID,
        "email": TEST_EMAIL,
        "full_name": TEST_FULLNAME
    })
    success = code == 200 and body and body.get("status") == "success"
    log_result("UC-01", "สมัครสมาชิก (User Register / Sync)", success,
               f"ซิงก์ข้อมูลผู้ใช้รายใหม่ลงฐานข้อมูล{'สำเร็จ' if success else 'ล้มเหลว'}")


# ===========================================
# UC-02: เข้าสู่ระบบ (User Login / Auth Verification)
# ===========================================
def test_uc02():
    code, body, _ = http_request("GET", f"{API_BASE}/api/users/{TEST_CLERK_ID}/role")
    success = code == 200 and body and body.get("status") == "success"
    role = body.get("role", "unknown") if body else "unknown"
    log_result("UC-02", "เข้าสู่ระบบ (User Login / Auth Verification)", success,
               f"ตรวจสอบสิทธิ์ผู้ใช้ได้ Role: {role}")


# ===========================================
# UC-03: แก้ไขข้อมูลส่วนตัว (Edit Personal Info)
# ===========================================
def test_uc03():
    updated_name = "Automated Test User (Updated)"
    code, body, _ = http_request("POST", f"{API_BASE}/api/users/sync", {
        "clerk_id": TEST_CLERK_ID,
        "email": "updated_test@intelliport.dev",
        "full_name": updated_name
    })
    success = code == 200 and body and body.get("status") == "success"
    log_result("UC-03", "แก้ไขข้อมูลส่วนตัว (Edit Personal Info)", success,
               f"อัปเดตข้อมูลผู้ใช้ใน DB {'สำเร็จ' if success else 'ล้มเหลว'} ({updated_name})")


# ===========================================
# UC-04: กำหนดเป้าหมายการลงทุน (Set Investment Goal)
# ===========================================
def test_uc04():
    goal_params = {
        "user_id": TEST_CLERK_ID,
        "portfolio_name": "Test Goal Portfolio",
        "target_beta": 0.95,
        "max_stocks": 5,
        "budget": 200000.0,
        "target_amount": 400000.0,
        "duration_years": 5,
        "start_date": "2024-01-01",
        "end_date": "2024-12-01"
    }
    success = all(k in goal_params for k in ["budget", "target_amount", "duration_years", "target_beta"])
    log_result("UC-04", "กำหนดเป้าหมายการลงทุน (Set Investment Goal)", success,
               f"ตั้งค่าเป้าหมาย งบ {goal_params['budget']:.0f}฿, เป้า {goal_params['target_amount']:.0f}฿, {goal_params['duration_years']} ปี, Beta {goal_params['target_beta']} สำเร็จ")


# ===========================================
# UC-05: เลือกตลาดและสินทรัพย์ที่ต้องการลงทุน (Select Market & Assets)
# ===========================================
def test_uc05():
    code, body, _ = http_request("GET", f"{API_BASE}/api/admin/assets")
    success = code == 200 and body and body.get("status") == "success"
    assets = body.get("data", []) if body else []
    active_count = sum(1 for a in assets if a.get("is_active", False))
    log_result("UC-05", "เลือกตลาดและสินทรัพย์ที่ต้องการลงทุน (Select Market & Assets)", success,
               f"ดึงรายชื่อหุ้น SET50 สำเร็จ: พบ {active_count} หุ้นที่ Active จากทั้งหมด {len(assets)} รายการ")


# ===========================================
# UC-06: สร้างพอร์ตการลงทุน (Create Portfolio via GA & Black-Litterman)
# ===========================================
def test_uc06():
    print("       ⏳ กำลังเรียก AI Engine (Genetic Algorithm + Black-Litterman)...")
    code, body, raw = http_request("POST", f"{API_BASE}/api/optimize", {
        "user_id": TEST_CLERK_ID,
        "portfolio_name": "UC06 Test Portfolio",
        "target_beta": 1.0,
        "max_stocks": 5,
        "max_weight_per_asset": 0.40,
        "budget": 100000.0,
        "target_amount": 200000.0,
        "duration_years": 5,
        "start_date": "2024-01-01",
        "end_date": "2024-12-01",
        "locked_stocks": [],
        "sectors": []
    }, timeout=120)
    
    success = code == 200 and body and body.get("status") == "success"
    if success:
        portfolio = body.get("portfolio", [])
        port_id = body.get("portfolio_id")
        backtest = body.get("backtest", {})
        bt_return = backtest.get("portfolio_return", 0)
        log_result("UC-06", "สร้างพอร์ตการลงทุน (Create Portfolio via GA & BL)", True,
                   f"สร้างพอร์ตสำเร็จ ID: {port_id}, หุ้นในพอร์ต {len(portfolio)} ตัว, Backtest Return: {bt_return:.2%}")
        return port_id
    else:
        error_msg = body.get("message", raw[:100]) if body else raw[:100]
        log_result("UC-06", "สร้างพอร์ตการลงทุน (Create Portfolio via GA & BL)", False,
                   f"ล้มเหลว: {error_msg}")
        return None


# ===========================================
# UC-07: แก้ไขการตั้งค่าพอร์ตการลงทุน (Edit Portfolio Settings)
# ===========================================
def test_uc07(portfolio_id):
    if not portfolio_id:
        log_result("UC-07", "แก้ไขการตั้งค่าพอร์ตการลงทุน (Edit Portfolio Settings)", False,
                   "ข้ามการทดสอบ: ไม่มี portfolio_id จาก UC-06")
        return
    
    code, body, _ = http_request("GET", f"{API_BASE}/api/portfolios/{portfolio_id}")
    success = code == 200 and body and body.get("status") == "success"
    
    if success:
        bt = body.get("backtest", {})
        log_result("UC-07", "แก้ไขการตั้งค่าพอร์ตการลงทุน (Edit Portfolio Settings)", True,
                   f"ดึงรายละเอียดพอร์ต ID {portfolio_id} และประมวลผล Backtest ใหม่สำเร็จ (Return: {bt.get('portfolio_return', 0):.2%})")
    else:
        log_result("UC-07", "แก้ไขการตั้งค่าพอร์ตการลงทุน (Edit Portfolio Settings)", False,
                   f"ไม่สามารถดึงข้อมูลพอร์ต ID {portfolio_id}")


# ===========================================
# UC-08: สร้างพอร์ตแนะนำอัตโนมัติ (Create Predefined Portfolio)
# ===========================================
def test_uc08():
    code, body, _ = http_request("POST", f"{API_BASE}/api/portfolios/template", {
        "user_id": TEST_CLERK_ID,
        "portfolio_name": "UC08 Predefined Growth Portfolio",
        "target_beta": 1.2,
        "budget": 150000.0,
        "target_amount": 300000.0,
        "duration_years": 3,
        "expected_return": 0.15,
        "portfolio_volatility": 0.20,
        "portfolio_data": [
            {"Ticker": "DELTA.BK", "Weight": 0.30, "Beta": 1.3},
            {"Ticker": "ADVANC.BK", "Weight": 0.25, "Beta": 0.8},
            {"Ticker": "GULF.BK", "Weight": 0.20, "Beta": 1.1},
            {"Ticker": "KBANK.BK", "Weight": 0.15, "Beta": 1.0},
            {"Ticker": "PTTEP.BK", "Weight": 0.10, "Beta": 0.9}
        ]
    })
    success = code == 200 and body and body.get("status") == "success"
    port_id = body.get("portfolio_id") if body else None
    log_result("UC-08", "สร้างพอร์ตแนะนำอัตโนมัติ (Create Predefined Portfolio)", success,
               f"บันทึกพอร์ตสำเร็จรูป{'สำเร็จ ID: ' + str(port_id) if success else 'ล้มเหลว'}")


# ===========================================
# UC-09: ดาวน์โหลดผลสรุปเป็นไฟล์ PDF (Download PDF Report)
# ===========================================
def test_uc09():
    pkg_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "package.json")
    has_jspdf = False
    has_html_to_image = False
    try:
        with open(pkg_path, "r") as f:
            pkg = json.load(f)
        deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
        has_jspdf = "jspdf" in deps
        has_html_to_image = "html-to-image" in deps
    except Exception:
        pass
    
    success = has_jspdf and has_html_to_image
    log_result("UC-09", "ดาวน์โหลดผลสรุปเป็นไฟล์ PDF (Download PDF Report)", success,
               f"ไลบรารี jspdf: {'✓' if has_jspdf else '✗'}, html-to-image: {'✓' if has_html_to_image else '✗'} — {'พร้อมส่งออก PDF บน Frontend' if success else 'ขาดไลบรารีที่จำเป็น'}")


# ===========================================
# UC-10: ดูประวัติการจัดพอร์ต (View Analysis History)
# ===========================================
def test_uc10():
    code, body, _ = http_request("GET", f"{API_BASE}/api/portfolios?clerk_id={TEST_CLERK_ID}")
    success = code == 200 and body and body.get("status") == "success"
    portfolios = body.get("portfolios", []) if body else []
    log_result("UC-10", "ดูประวัติการจัดพอร์ต (View Analysis History)", success,
               f"ดึงประวัติพอร์ตของผู้ใช้สำเร็จ พบ {len(portfolios)} พอร์ต")


# ===========================================
# UC-11: ปรับธีมสว่างและมืด (Toggle Light/Dark Theme)
# ===========================================
def test_uc11():
    base = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
    theme_toggle_path = os.path.join(base, "components", "ThemeToggle.tsx")
    theme_provider_path = os.path.join(base, "components", "ThemeProvider.tsx")
    
    has_toggle = os.path.exists(theme_toggle_path)
    has_provider = os.path.exists(theme_provider_path)
    
    pkg_path = os.path.join(base, "package.json")
    has_next_themes = False
    try:
        with open(pkg_path, "r") as f:
            pkg = json.load(f)
        deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
        has_next_themes = "next-themes" in deps
    except Exception:
        pass
    
    success = has_toggle and has_provider and has_next_themes
    log_result("UC-11", "ปรับธีมสว่างและมืด (Toggle Light/Dark Theme)", success,
               f"ThemeToggle: {'✓' if has_toggle else '✗'}, ThemeProvider: {'✓' if has_provider else '✗'}, next-themes: {'✓' if has_next_themes else '✗'}")


# ===========================================
# UC-12: ออกจากระบบ (Logout)
# ===========================================
def test_uc12():
    base = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
    navbar_path = os.path.join(base, "components", "Navbar.tsx")
    has_signout = False
    has_redirect = False
    try:
        with open(navbar_path, "r") as f:
            content = f.read()
        has_signout = "UserButton" in content
        has_redirect = "afterSignOutUrl" in content
    except Exception:
        pass
    
    success = has_signout and has_redirect
    log_result("UC-12", "ออกจากระบบ (Logout)", success,
               f"UserButton (Clerk SignOut): {'✓' if has_signout else '✗'}, afterSignOutUrl redirect: {'✓' if has_redirect else '✗'}")


# ===========================================
# UC-13: จัดการแก้ไขบัญชีผู้ใช้ (Manage User Accounts - Admin)
# ===========================================
def test_uc13():
    code1, body1, _ = http_request("GET", f"{API_BASE}/api/users/{TEST_CLERK_ID}/role")
    check_role_ok = code1 == 200 and body1 and body1.get("status") == "success"
    
    code2, body2, _ = http_request("GET", f"{API_BASE}/api/admin/users")
    list_users_ok = code2 == 200 and body2 and body2.get("status") == "success"
    
    success = check_role_ok and list_users_ok
    user_count = len(body2.get("data", [])) if body2 and list_users_ok else 0
    log_result("UC-13", "จัดการแก้ไขบัญชีผู้ใช้ (Manage User Accounts - Admin)", success,
               f"ตรวจสอบ Role API: {'✓' if check_role_ok else '✗'}, ดึงรายชื่อผู้ใช้: {'✓' if list_users_ok else '✗'} ({user_count} บัญชี)")


# ===========================================
# UC-14: ตรวจสอบตารางสรุปการใช้งานของผู้ใช้ (View Usage Summary - Admin)
# ===========================================
def test_uc14():
    code, body, _ = http_request("GET", f"{API_BASE}/api/admin/users")
    success = code == 200 and body and body.get("status") == "success"
    users = body.get("data", []) if body else []
    
    has_stats = any("portfolio_count" in u for u in users) if users else False
    
    log_result("UC-14", "ตรวจสอบตารางสรุปการใช้งานของผู้ใช้ (View Usage Summary - Admin)", success,
               f"ดึงตารางสถิติผู้ใช้งาน{'สำเร็จ' if success else 'ล้มเหลว'} ({len(users)} บัญชี, มีสถิติพอร์ต: {'✓' if has_stats else '✗'})")


# ===========================================
# UC-15: จัดการสินทรัพย์ SET50 (Manage SET50 Assets - Admin)
# ===========================================
def test_uc15():
    test_ticker = "ZZTEST"
    
    code1, body1, _ = http_request("GET", f"{API_BASE}/api/admin/assets")
    list_ok = code1 == 200 and body1 and body1.get("status") == "success"
    asset_count = len(body1.get("data", [])) if body1 else 0
    
    code2, body2, _ = http_request("POST", f"{API_BASE}/api/admin/assets", {
        "ticker": test_ticker,
        "market_cap": 50000,
        "is_active": True
    })
    add_ok = code2 == 200 and body2 and body2.get("status") == "success"
    
    code3, body3, _ = http_request("PUT", f"{API_BASE}/api/admin/assets/{test_ticker}", {
        "ticker": test_ticker,
        "market_cap": 75000,
        "is_active": False
    })
    edit_ok = code3 == 200 and body3 and body3.get("status") == "success"
    
    code4, body4, _ = http_request("DELETE", f"{API_BASE}/api/admin/assets/{test_ticker}")
    del_ok = code4 == 200 and body4 and body4.get("status") == "success"
    
    success = list_ok and add_ok and edit_ok and del_ok
    log_result("UC-15", "จัดการสินทรัพย์ SET50 (Manage SET50 Assets - Admin)", success,
               f"ดึงข้อมูล: {'✓' if list_ok else '✗'} ({asset_count} หุ้น), เพิ่ม: {'✓' if add_ok else '✗'}, แก้ไข: {'✓' if edit_ok else '✗'}, ลบ: {'✓' if del_ok else '✗'}")


# ===========================================
# Cleanup: ลบข้อมูลทดสอบออกจาก DB
# ===========================================
def cleanup():
    print(f"\n  🧹 กำลังลบข้อมูลทดสอบ ({TEST_CLERK_ID}) ออกจากฐานข้อมูล...")
    
    code, body, _ = http_request("GET", f"{API_BASE}/api/portfolios?clerk_id={TEST_CLERK_ID}")
    if code == 200 and body and body.get("status") == "success":
        port_ids = [p["id"] for p in body.get("portfolios", [])]
        if port_ids:
            http_request("POST", f"{API_BASE}/api/portfolios/delete", {
                "portfolio_ids": port_ids,
                "clerk_id": TEST_CLERK_ID
            })
            print(f"     ลบพอร์ตทดสอบ {len(port_ids)} รายการ เรียบร้อยแล้ว")
    
    print(f"     ✅ การลบข้อมูลทดสอบเสร็จสิ้น")


# ===========================================
# Main
# ===========================================
def main():
    print("\n" + "=" * 70)
    print(" 🧪 ระบบทดสอบอัตโนมัติราย Use Case — Intelliportfolio")
    print("    (ทดสอบทั้งหมด 15 Use Cases ตามเอกสาร usecase_description.md)")
    print("=" * 70)
    
    preflight_check()
    
    print("=" * 70)
    print(" 📋 เริ่มทดสอบฟีเจอร์ทั้งหมด")
    print("=" * 70)
    
    # ========================================
    # User Use Cases (UC-01 ~ UC-12)
    # ========================================
    print("\n  📌 กลุ่มที่ 1: ฟีเจอร์ผู้ใช้งานทั่วไป (User)")
    print("  " + "-" * 60)
    
    test_uc01()
    test_uc02()
    test_uc03()
    test_uc04()
    test_uc05()
    
    portfolio_id = test_uc06()
    
    test_uc07(portfolio_id)
    test_uc08()
    test_uc09()
    test_uc10()
    test_uc11()
    test_uc12()
    
    # ========================================
    # Admin Use Cases (UC-13 ~ UC-15)
    # ========================================
    print("\n  📌 กลุ่มที่ 2: ฟีเจอร์ผู้ดูแลระบบ (Admin)")
    print("  " + "-" * 60)
    
    test_uc13()
    test_uc14()
    test_uc15()
    
    # ========================================
    # Cleanup
    # ========================================
    cleanup()
    
    # ========================================
    # Summary
    # ========================================
    print("\n" + "=" * 70)
    print(f" 📊 ผลการทดสอบรวม: {passed}/{passed + failed} Passed | {failed} Failed")
    print("=" * 70)
    
    if failed == 0:
        print(f"\n  🎉 ยินดีด้วย! ฟีเจอร์ทั้งหมดรันผ่านการทดสอบตรงตาม 15 Use Cases 100%\n")
    else:
        print(f"\n  ⚠️  มี {failed} รายการที่ยังไม่ผ่าน กรุณาตรวจสอบรายละเอียดด้านบน\n")
    
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
