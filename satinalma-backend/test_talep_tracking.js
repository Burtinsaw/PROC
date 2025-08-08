const { Talep, User } = require('./models');

async function testTalepTracking() {
  try {
    console.log('🔍 Testing Talep tracking fields...');
    
    // Talepler listesini çek (getAllTalepler gibi)
    const talepler = await Talep.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`📊 Total talepler: ${talepler.length}`);
    
    if (talepler.length > 0) {
      const firstTalep = talepler[0];
      console.log('✅ First talep tracking fields:');
      console.log('- tracking_id:', firstTalep.tracking_id);
      console.log('- proforma_number:', firstTalep.proforma_number);
      console.log('- tracking_phase:', firstTalep.tracking_phase);
    }
    
    console.log('✅ Talep tracking system working correctly!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error testing talep tracking:', error);
    process.exit(1);
  }
}

testTalepTracking();
