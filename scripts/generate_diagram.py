import urllib.request
import ssl
import sys

def generate_png():
    with open('docs/plantuml_class_diagram.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    start = content.find('@startuml')
    end = content.find('@enduml') + 7
    if start == -1 or end == -1:
        print("Could not find @startuml block")
        return
        
    uml_text = content[start:end]
    
    url = "https://kroki.io/plantuml/png"
    req = urllib.request.Request(url, data=uml_text.encode('utf-8'), method='POST')
    req.add_header('Content-Type', 'text/plain')
    
    # Disable SSL verification
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            with open('docs/class_diagram.png', 'wb') as out_file:
                out_file.write(response.read())
        print("Successfully generated docs/class_diagram.png")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generate_png()
