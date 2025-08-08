import sqlite3

conn = sqlite3.connect('database.sqlite')
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE companies ADD COLUMN tax_office VARCHAR(255);")
    print('tax_office alanı eklendi.')
except Exception as e:
    print('tax_office zaten var veya hata:', e)

try:
    cursor.execute("ALTER TABLE companies ADD COLUMN tax_number VARCHAR(255);")
    print('tax_number alanı eklendi.')
except Exception as e:
    print('tax_number zaten var veya hata:', e)

conn.commit()
conn.close()
