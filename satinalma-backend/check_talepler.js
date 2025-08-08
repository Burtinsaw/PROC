const { Talep } = require('./models');

async function checkTalepler() {
  try {
    const talepler = await Talep.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']]
    });
    
    console.log('📊 Veritabanındaki talep sayısı:', await Talep.count());
    console.log('📋 İlk 5 talep:');
    talepler.forEach(talep => {
      console.log(`- ID: ${talep.id}, No: ${talep.talepNo}, Başlık: ${talep.talepBasligi}, Durum: ${talep.durum}`);
    });
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
  
  process.exit(0);
}

checkTalepler();
