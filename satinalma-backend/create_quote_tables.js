const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Quotes tablosu
const createQuotesTable = `
CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quoteNumber VARCHAR(255) NOT NULL UNIQUE,
  rfqId INTEGER NOT NULL,
  supplierId INTEGER NOT NULL,
  supplierQuoteNumber VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft',
  totalAmount DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'TRY',
  validUntil DATETIME,
  paymentTerms TEXT,
  deliveryTerms TEXT,
  deliveryTime VARCHAR(255),
  warranty VARCHAR(255),
  notes TEXT,
  incoterms VARCHAR(255),
  priceScore INTEGER,
  qualityScore INTEGER,
  deliveryScore INTEGER,
  serviceScore INTEGER,
  overallScore INTEGER,
  evaluationNotes TEXT,
  receivedDate DATETIME,
  receivedById INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rfqId) REFERENCES rfqs(id) ON DELETE CASCADE,
  FOREIGN KEY (supplierId) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (receivedById) REFERENCES Users(id) ON DELETE SET NULL
)`;

// Quote Items tablosu
const createQuoteItemsTable = `
CREATE TABLE IF NOT EXISTS quote_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quoteId INTEGER NOT NULL,
  rfqItemId INTEGER NOT NULL,
  productName VARCHAR(255) NOT NULL,
  productDescription TEXT,
  brand VARCHAR(255),
  model VARCHAR(255),
  articleNumber VARCHAR(255),
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(255) NOT NULL,
  unitPrice DECIMAL(15,2) NOT NULL,
  totalPrice DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TRY',
  deliveryTime VARCHAR(255),
  warranty VARCHAR(255),
  technicalSpecification TEXT,
  countryOfOrigin VARCHAR(255),
  isAlternative BOOLEAN DEFAULT 0,
  alternativeReason TEXT,
  technicalCompliance VARCHAR(50) DEFAULT 'pending',
  complianceNotes TEXT,
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quoteId) REFERENCES quotes(id) ON DELETE CASCADE,
  FOREIGN KEY (rfqItemId) REFERENCES rfq_items(id) ON DELETE CASCADE
)`;

db.serialize(() => {
  // Quotes tablosunu oluştur
  db.run(createQuotesTable, (err) => {
    if (err) {
      console.error('❌ Quotes tablosu oluşturma hatası:', err.message);
    } else {
      console.log('✅ Quotes tablosu oluşturuldu');
    }
  });

  // Quote Items tablosunu oluştur
  db.run(createQuoteItemsTable, (err) => {
    if (err) {
      console.error('❌ Quote Items tablosu oluşturma hatası:', err.message);
    } else {
      console.log('✅ Quote Items tablosu oluşturuldu');
    }
  });

  // İndeksler
  db.run('CREATE INDEX IF NOT EXISTS idx_quotes_rfqId ON quotes(rfqId)', (err) => {
    if (err) console.error('❌ quotes rfqId index hatası:', err.message);
    else console.log('✅ quotes rfqId index oluşturuldu');
  });

  db.run('CREATE INDEX IF NOT EXISTS idx_quotes_supplierId ON quotes(supplierId)', (err) => {
    if (err) console.error('❌ quotes supplierId index hatası:', err.message);
    else console.log('✅ quotes supplierId index oluşturuldu');
  });

  db.run('CREATE INDEX IF NOT EXISTS idx_quote_items_quoteId ON quote_items(quoteId)', (err) => {
    if (err) console.error('❌ quote_items quoteId index hatası:', err.message);
    else console.log('✅ quote_items quoteId index oluşturuldu');
  });

  db.run('CREATE INDEX IF NOT EXISTS idx_quote_items_rfqItemId ON quote_items(rfqItemId)', (err) => {
    if (err) console.error('❌ quote_items rfqItemId index hatası:', err.message);
    else console.log('✅ quote_items rfqItemId index oluşturuldu');
  });

  // Migration kaydını ekle
  db.run(`INSERT OR IGNORE INTO SequelizeMeta (name) VALUES ('20250803000000-create-quote-tables.js')`, (err) => {
    if (err) {
      console.error('❌ Migration kaydı hatası:', err.message);
    } else {
      console.log('✅ Migration kaydı eklendi');
    }
  });

  // Tabloları kontrol et
  db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, rows) => {
    if (err) {
      console.error('❌ Tablo listesi hatası:', err.message);
    } else {
      console.log('\n📋 Mevcut tablolar:');
      rows.forEach(row => console.log('  - ' + row.name));
    }
    
    console.log('\n🎉 Quote tabloları başarıyla oluşturuldu!');
    db.close();
  });
});
