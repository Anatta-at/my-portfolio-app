import os
import re

filepath = 'backend/main.py'
with open(filepath, 'r') as f:
    content = f.read()

# Regular expression to match: conn = psycopg2.connect( ... )
# It matches from 'conn = psycopg2.connect(' until the first ')'
pattern = re.compile(r'conn = psycopg2\.connect\([^)]*\)', re.DOTALL)

replacement = """conn = psycopg2.connect(
            os.getenv("DATABASE_URL", f"postgresql://admin:Heyrose05@{os.getenv('DATABASE_HOST', 'localhost')}:5432/intelliport_db")
        )"""

new_content = pattern.sub(replacement, content)

with open(filepath, 'w') as f:
    f.write(new_content)
    
print("Updated backend/main.py")
