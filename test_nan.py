import os
import psycopg2
from backend.main import get_portfolio_details

os.environ["DATABASE_HOST"] = "localhost"
try:
    res = get_portfolio_details(12)
    print("SUCCESS!")
    print(res)
except Exception as e:
    print("FAILED!")
    import traceback
    traceback.print_exc()
