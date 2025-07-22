import os
import re
from dotenv import dotenv_values
import psycopg2
from psycopg2 import OperationalError

TXT_OUTPUT = "database-schema.txt"
SQL_OUTPUT = "database-schema.sql"

def get_postgres_credentials():
    env_paths = [
        os.path.join("frontend", ".env.development.local"),
        os.path.join("frontend", ".env.local"),
    ]
    env = {}
    for path in env_paths:
        if os.path.exists(path):
            env.update(dotenv_values(path))
    url = env.get("POSTGRES_URL")
    if not url:
        raise RuntimeError("POSTGRES_URL not found in env files.")
    m = re.match(r"^postgres://([^:]+):([^@]+)@([^:/]+):(\d+)/([^?]+)", url)
    if not m:
        raise RuntimeError("Could not parse POSTGRES_URL in env: %s" % url)
    user, password, host, orig_port, dbname = m.groups()
    port = 5432  # Force non-pooling, needed for DDL support
    return {
        "host": host,
        "port": port,
        "user": user,
        "password": password,
        "dbname": dbname,
        "sslmode": "require"
    }

def fetch_schema(connection):
    schema = {}
    with connection.cursor() as cur:
        # Fetch all public tables
        cur.execute("""
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename;
        """)
        tables = [row[0] for row in cur.fetchall()]
        for table in tables:
            schema[table] = {}

            # Columns
            cur.execute("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = %s
                ORDER BY ordinal_position;
            """, (table,))
            schema[table]['columns'] = cur.fetchall()

            # Primary Keys
            cur.execute("""
                SELECT a.attname
                FROM   pg_index i
                JOIN   pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
                WHERE  i.indrelid = %s::regclass AND i.indisprimary;
            """, (table,))
            schema[table]['primary_keys'] = [row[0] for row in cur.fetchall()]

            # Foreign Keys
            cur.execute("""
                SELECT
                  kcu.column_name,
                  ccu.table_name AS ref_table,
                  ccu.column_name AS ref_column
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY'
                  AND tc.table_name = %s
                  AND tc.table_schema = 'public';
            """, (table,))
            schema[table]['foreign_keys'] = cur.fetchall()

            # Indexes
            cur.execute("""
                SELECT indexname, indexdef
                FROM pg_indexes
                WHERE schemaname = 'public' AND tablename = %s
            """, (table,))
            schema[table]['indexes'] = cur.fetchall()

            # Triggers (all triggers on this table, not just users)
            cur.execute("""
                SELECT tg.tgname, 
                       tg.tgenabled, 
                       pg_get_triggerdef(tg.oid),
                       p.proname,
                       l.lanname,
                       pg_get_functiondef(tg.tgfoid)
                FROM pg_trigger tg
                JOIN pg_proc p ON tg.tgfoid = p.oid
                JOIN pg_language l ON p.prolang = l.oid
                WHERE tg.tgrelid = %s::regclass AND NOT tg.tgisinternal;
            """, (table,))
            schema[table]['triggers'] = cur.fetchall()
    return schema

def write_schema_txt(schema, filepath):
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("# Database Schema Overview\n\n")
        for table, details in schema.items():
            f.write(f"## Table: {table}\n\n")
            f.write("### Columns\n")
            f.write("| Column Name | Data Type | Nullable | Default |\n")
            f.write("|-------------|-----------|----------|---------|\n")
            for col in details['columns']:
                colname, datatype, nullable, default = col
                f.write(f"| {colname} | {datatype} | {nullable} | {default or ''} |\n")
            f.write("\n### Primary Keys\n")
            pk = ', '.join(details['primary_keys']) if details['primary_keys'] else 'None'
            f.write(f"{pk}\n\n")
            f.write("### Foreign Keys\n")
            if details['foreign_keys']:
                for fk in details['foreign_keys']:
                    col, reftable, refcol = fk
                    f.write(f"- `{col}` references `{reftable}`(`{refcol}`)\n")
            else:
                f.write("None\n")
            f.write("\n### Indexes\n")
            if details['indexes']:
                for idx in details['indexes']:
                    f.write(f"- {idx[0]}: {idx[1]}\n")
            else:
                f.write("None\n")
            # TRIGGERS
            if details.get('triggers'):
                f.write("\n### Triggers\n")
                if details['triggers']:
                    for trig in details['triggers']:
                        trig_name, enabled, defn, funcname, lang, funcdef = trig
                        f.write(f"- **{trig_name}** ({'enabled' if enabled=='O' else 'disabled'})\n")
                        f.write(f"  - Definition: `{defn.strip()}`\n")
                        f.write(f"  - Function: `{funcname}` [{lang}]\n")
                        funcdef_lines = funcdef.strip().split("\n")
                        f.write("  - Function Code:\n\n")
                        f.write("      " + "\n      ".join(funcdef_lines) + "\n")
                else:
                    f.write("None\n")
            else:
                f.write("\n### Triggers\nNone\n")
            f.write('\n---\n\n')
    print(f"Database schema (Markdown): {filepath}")

def write_schema_sql(schema, filepath):
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("-- Database Schema DDL Export\n\n")
        for table, details in schema.items():
            f.write(f"-- Table: {table}\n")
            f.write(f"CREATE TABLE {table} (\n")
            lines = []
            for col in details['columns']:
                colname, datatype, nullable, default = col
                line = f"  {colname} {datatype}"
                if nullable == "NO":
                    line += " NOT NULL"
                if default:
                    line += f" DEFAULT {default}"
                lines.append(line)
            if details['primary_keys']:
                lines.append(f"  PRIMARY KEY ({', '.join(details['primary_keys'])})")
            f.write(",\n".join(lines))
            f.write("\n);\n")

            # Foreign keys
            if details['foreign_keys']:
                for fk in details['foreign_keys']:
                    col, reftable, refcol = fk
                    f.write(f"ALTER TABLE {table} ADD FOREIGN KEY ({col}) REFERENCES {reftable}({refcol});\n")

            # Indexes
            if details['indexes']:
                for idx in details['indexes']:
                    if idx[1].startswith('CREATE INDEX') or idx[1].startswith('CREATE UNIQUE INDEX'):
                        f.write(f"{idx[1]};\n")

            # Triggers: SQL CREATE TRIGGER and function
            if details.get('triggers'):
                for trig in details['triggers']:
                    trig_name, enabled, defn, funcname, lang, funcdef = trig
                    f.write(f"\n-- Trigger: {trig_name} on {table}\n")
                    f.write(f"{defn.strip()};\n")
                    f.write(f"-- Function for Trigger: {funcname}\n")
                    f.write(f"{funcdef.strip()}\n")
            f.write("\n")
    print(f"Database schema (SQL DDL): {filepath}")

def main():
    params = get_postgres_credentials()
    print(f"Connecting to PostgreSQL at {params['host']}:{params['port']} as {params['user']}...")
    try:
        conn = psycopg2.connect(**params)
    except OperationalError as e:
        print(f"Database connection failed: {e}")
        return

    try:
        schema = fetch_schema(conn)
        write_schema_txt(schema, TXT_OUTPUT)
        write_schema_sql(schema, SQL_OUTPUT)
        print(f"Done. Outputs:\n  - {TXT_OUTPUT}\n  - {SQL_OUTPUT}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
