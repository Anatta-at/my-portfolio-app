import os
import re

directory = 'app'
pattern = re.compile(r'[\'\"\`]http://localhost:8000(.*?)[\'\"\`]')

def replacement(match):
    path = match.group(1)
    return f"`${{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}}{path}`"

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            new_content = pattern.sub(replacement, content)
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
