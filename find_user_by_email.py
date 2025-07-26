import psycopg2
import os

# Get database URL from environment variable
DATABASE_URL = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")

if not DATABASE_URL:
    raise Exception("DATABASE_URL or POSTGRES_URL environment variable not set.")

def find_user_by_email(email):
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute('SELECT * FROM users WHERE email = %s', (email,))
        row = cur.fetchone()
        if row:
            print('User record:', row)
        else:
            print('User not found.')
        cur.close()
        conn.close()
    except Exception as e:
        print('Error querying user:', e)

if __name__ == "__main__":
    find_user_by_email('developer@lotteryanalytics.app')
