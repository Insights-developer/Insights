import psycopg2

conn = psycopg2.connect(
    host="aws-0-us-east-1.pooler.supabase.com",
    port=5432,
    user="postgres.sjluumboshqxhmnroqxg",  # not just 'postgres'
    password="GBxSzM6RIcnEouU9",
    dbname="postgres",
    sslmode="require"
)
print("Connected successfully")
conn.close()
