import sqlite3
conn = sqlite3.connect('../database.sqlite')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print('Tablolar:', tables)
conn.close()
