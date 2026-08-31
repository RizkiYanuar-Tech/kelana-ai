import os
import glob
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('database_url')
MIGRATION_DIR = os.path.join(os.path.dirname(__file__), 'migrations')

def get_connection():
    return psycopg2.connect(DATABASE_URL)

def ensure_migrations_table(conn):
    "create the schema_migrations tracking table if it doesnt exist"
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(255) PRIMARY KEY,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT now()        
            );
    """)
    conn.commit()


def applied_version(conn) -> set:
    "Return the set of already-applied migration version."
    with conn.cursor() as cur:
        cur.execute("SELECT version FROM schema_migrations;")
        return (row[0] for row in cur.fetchall())

def run_migrations():
    conn = get_connection()
    try:
        ensure_migrations_table(conn)
        done = applied_version(conn)

        # Collect and sort SQL files by Filename
        pattern = os.path.join(MIGRATION_DIR, "*.sql")
        files = sorted(glob.glob(pattern))

        if not files:
            print("No Migration files found in", MIGRATION_DIR)
            return

        pending = [f for f in files if os.path.basename(f) not in done]

        if not pending:
            print("All migrations already applies")
            return

        for filepath in pending:
            version = os.path.basename(filepath)
            print(f"Applying {version}...", end="")

            with open(filepath, 'r') as fh:
                sql = fh.read()

            with conn.cursor() as cur:
                cur.execute(sql)
                cur.execute(
                    "INSERT INTO schema_migrations (version) VALUES (%s);",
                    (version, )
                )
            conn.commit()
            print("done.")

        print(f"\n{len(pending)} migration(s) applied successfully")

    except Exception as exc:
        conn.rollback()
        print(f"\nMigration failed: {exc}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    run_migrations()
