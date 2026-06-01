import os
import re

directories = ['backend/engine', 'backend']

# Pattern that matches the exact hardcoded connect block
pattern = re.compile(
    r'psycopg2\.connect\(\s*dbname="intelliport_db",\s*user="admin",\s*password="Heyrose05",\s*host=db_host(?:_env)?,\s*port="5432"\s*\)'
)

# Some files might just use host=db_host
pattern2 = re.compile(
    r'psycopg2\.connect\(\s*dbname="intelliport_db",\s*user="admin",\s*password="Heyrose05",\s*host=.*?(?:,\s*port="5432")?\s*\)'
)

replacement = """psycopg2.connect(
            os.getenv("DATABASE_URL", f"postgresql://admin:Heyrose05@{os.getenv('DATABASE_HOST', 'localhost')}:5432/intelliport_db")
        )"""

def refactor_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = pattern2.sub(replacement, content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('backend'):
    for file in files:
        if file.endswith('.py'):
            refactor_file(os.path.join(root, file))
