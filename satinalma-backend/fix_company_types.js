const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Company type alanını güncelleniyor...');

db.serialize(() => {
  // Önce mevcut verileri kontrol et
  db.all("SELECT id, name, type FROM Companies LIMIT 5", (err, rows) => {
    if (err) {
      console.error('❌ Veri okuma hatası:', err);
      return;
    }
    console.log('📊 Mevcut company verileri:');
    rows.forEach(row => {
      console.log(`  ${row.id}: ${row.name} (${row.type})`);
    });
  });

  // Yeni tablo oluştur
  db.run(`
    CREATE TABLE IF NOT EXISTS Companies_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL UNIQUE,
      code VARCHAR(255) NOT NULL UNIQUE,
      address VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(255),
      tax_office VARCHAR(255),
      tax_number VARCHAR(255),
      type TEXT CHECK(type IN (
        'customer', 'supplier', 'carrier', 'main', 'broker', 
        'importer', 'exporter', 'distributor', 'logistics_partner'
      )) NOT NULL DEFAULT 'customer',
      inn VARCHAR(255),
      kpp VARCHAR(255),
      ogrn VARCHAR(255),
      vat VARCHAR(255),
      uscc VARCHAR(255),
      logo_url VARCHAR(500),
      business_model VARCHAR(255),
      broker_commission DECIMAL(5,2),
      is_trusted_broker BOOLEAN DEFAULT 0,
      broker_rating DECIMAL(3,2),
      partnership_start_date DATETIME,
      partnership_end_date DATETIME,
      commission_structure TEXT,
      performance_metrics TEXT,
      risk_assessment TEXT,
      compliance_status VARCHAR(255),
      contract_terms TEXT,
      payment_terms VARCHAR(255),
      credit_limit DECIMAL(15,2),
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('❌ Yeni tablo oluşturma hatası:', err);
      return;
    }
    console.log('✅ Yeni tablo oluşturuldu');

    // Mevcut verileri kopyala
    db.run(`
      INSERT INTO Companies_new 
      SELECT 
        id, name, code, address, email, phone, tax_office, tax_number,
        CASE 
          WHEN type = 'logistics' THEN 'carrier'
          WHEN type = 'headquarters' THEN 'main'
          ELSE type 
        END as type,
        inn, kpp, ogrn, vat, uscc, logo_url, business_model,
        broker_commission, is_trusted_broker, broker_rating,
        partnership_start_date, partnership_end_date, commission_structure,
        performance_metrics, risk_assessment, compliance_status,
        contract_terms, payment_terms, credit_limit,
        createdAt, updatedAt
      FROM Companies
    `, (err) => {
      if (err) {
        console.error('❌ Veri kopyalama hatası:', err);
        return;
      }
      console.log('✅ Veriler kopyalandı');

      // Eski tabloyu sil ve yenisini adlandır
      db.run("DROP TABLE Companies", (err) => {
        if (err) {
          console.error('❌ Eski tablo silme hatası:', err);
          return;
        }
        
        db.run("ALTER TABLE Companies_new RENAME TO Companies", (err) => {
          if (err) {
            console.error('❌ Tablo adlandırma hatası:', err);
            return;
          }
          
          console.log('✅ İşlem tamamlandı!');
          
          // Kontrol et
          db.all("SELECT id, name, type FROM Companies LIMIT 5", (err, rows) => {
            if (err) {
              console.error('❌ Kontrol hatası:', err);
            } else {
              console.log('📊 Güncellenmiş company verileri:');
              rows.forEach(row => {
                console.log(`  ${row.id}: ${row.name} (${row.type})`);
              });
            }
            db.close();
          });
        });
      });
    });
  });
});
