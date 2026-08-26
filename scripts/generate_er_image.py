import re
import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

with open('docs/plantuml_er_diagram.md', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'```plantuml\n(.*?)\n```', content, re.DOTALL)

if match:
    uml_text = f"@startuml\n{match.group(1)}\n@enduml"
    # Kroki URL
    url = 'https://kroki.io/plantuml/png'
    req = urllib.request.Request(
        url, 
        data=uml_text.encode('utf-8'), 
        headers={'Content-Type': 'text/plain', 'User-Agent': 'Mozilla/5.0'}
    )
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            with open('docs/er_diagram.png', 'wb') as out_file:
                out_file.write(response.read())
            print("Generated docs/er_diagram.png via Kroki")
    except Exception as e:
        print(f"Error generating ER diagram: {e}")
else:
    print("No PlantUML code found in file.")
