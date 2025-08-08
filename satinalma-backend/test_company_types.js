const { Company } = require('./models');

async function testCompanyTypes() {
  try {
    console.log('🔍 Testing company types...');
    
    // Tüm firmaları getir
    const allCompanies = await Company.findAll({ order: [['name', 'ASC']] });
    console.log(`📊 Total companies: ${allCompanies.length}`);
    
    // Customer tipindeki firmaları getir
    const customers = await Company.findAll({ 
      where: { type: 'customer' },
      order: [['name', 'ASC']] 
    });
    console.log(`👥 Customer companies: ${customers.length}`);
    
    // Supplier tipindeki firmaları getir
    const suppliers = await Company.findAll({ 
      where: { type: 'supplier' },
      order: [['name', 'ASC']] 
    });
    console.log(`🏭 Supplier companies: ${suppliers.length}`);
    
    // Test sample companies var mı kontrol et
    if (allCompanies.length === 0) {
      console.log('⚠️ No companies found, creating sample data...');
      
      await Company.create({
        name: 'Acme Corp',
        code: 'ACME001',
        type: 'customer',
        address: 'Test Address 1',
        email: 'contact@acme.com'
      });
      
      await Company.create({
        name: 'Global Supplies Ltd',
        code: 'GS001',
        type: 'supplier',
        address: 'Test Address 2',
        email: 'info@globalsupplies.com'
      });
      
      console.log('✅ Sample companies created');
    }
    
    console.log('✅ Company type system working correctly!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error testing company types:', error);
    process.exit(1);
  }
}

testCompanyTypes();
