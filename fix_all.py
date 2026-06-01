import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Pattern to match the Vercel database connection
    pattern = r'os\.getenv\("DATABASE_URL",\s*f"postgresql://admin:Heyrose05@\{os\.getenv\(\'DATABASE_HOST\',\s*\'localhost\'\)\}:5432/intelliport_db"\)'
    
    # Replacement string
    replacement = 'dbname="intelliport_db", user="admin", password="Heyrose05", host=db_host, port="5432"'

    new_content = re.sub(pattern, replacement, content)

    with open(filepath, 'w') as f:
        f.write(new_content)
    print(f"Fixed {filepath}")

fix_file('backend/main.py')
fix_file('backend/engine/data_fetcher.py')
fix_file('backend/engine/manual_views.py')
