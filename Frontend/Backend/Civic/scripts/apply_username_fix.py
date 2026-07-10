import psycopg2
import sys

DB = {
    'host': 'localhost',
    'port': 5432,
    'dbname': 'civic_db',
    'user': 'postgres',
    'password': 'civic@system'
}

SQL_STEPS = [
    "ALTER TABLE accounts_customuser ADD COLUMN IF NOT EXISTS username varchar(150);",
    "UPDATE accounts_customuser SET username = split_part(email, '@', 1) WHERE username IS NULL;",
    "WITH dups AS (SELECT username FROM accounts_customuser GROUP BY username HAVING count(*) > 1) \
     UPDATE accounts_customuser a SET username = a.username || '_' || a.id FROM dups WHERE a.username = dups.username;",
    "CREATE UNIQUE INDEX IF NOT EXISTS accounts_customuser_username_key ON accounts_customuser (username);"
]

try:
    conn = psycopg2.connect(host=DB['host'], port=DB['port'], dbname=DB['dbname'], user=DB['user'], password=DB['password'])
    conn.autocommit = True
    cur = conn.cursor()
    for sql in SQL_STEPS:
        print('Executing:', sql)
        cur.execute(sql)
    cur.close()
    conn.close()
    print('Done: username column added/updated and index created.')
except Exception as e:
    print('Error running SQL:', e)
    sys.exit(1)
