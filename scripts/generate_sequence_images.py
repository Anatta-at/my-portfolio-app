import re
import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

with open('docs/plantuml_sequence_diagrams.md', 'r', encoding='utf-8') as f:
    content = f.read()

diagrams = re.findall(r'@startuml\n(.*?)\n@enduml', content, re.DOTALL)

for i, diagram in enumerate(diagrams):
    uml_text = f"@startuml\n{diagram}\n@enduml"
    url = 'https://kroki.io/plantuml/png'
    req = urllib.request.Request(
        url, 
        data=uml_text.encode('utf-8'), 
        headers={'Content-Type': 'text/plain', 'User-Agent': 'Mozilla/5.0'}
    )
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            with open(f'docs/sequence_diagram_{i+1}.png', 'wb') as out_file:
                out_file.write(response.read())
            print(f"Generated sequence_diagram_{i+1}.png")
    except Exception as e:
        print(f"Error generating diagram {i+1}: {e}")
