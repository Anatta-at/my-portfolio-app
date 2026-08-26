import urllib.request
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

plantuml_code = """
@startuml
skinparam defaultFontName "Sarabun"
node Users [
<b>Table 01: Users</b>
Description: เก็บข้อมูลผู้ใช้งาน
====
|= Field Name |= Description |= Data Type |= Data Size |= Key |
| user_id | หมายเลขประจำตัวผู้ใช้ระบบ | INT | 11 | PK |
]
@enduml
"""
import base64, zlib
compressed = zlib.compress(plantuml_code.encode('utf-8'))
encoded = base64.urlsafe_b64encode(compressed).decode('utf-8')
url = f"https://kroki.io/plantuml/png"
req = urllib.request.Request(
    url, 
    data=plantuml_code.encode('utf-8'), 
    headers={'Content-Type': 'text/plain', 'User-Agent': 'Mozilla/5.0'}
)
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        with open("test_table.png", "wb") as f:
            f.write(response.read())
        print("Done")
except Exception as e:
    print("Error:", e)
