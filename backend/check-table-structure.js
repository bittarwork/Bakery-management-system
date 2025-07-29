import { initializeModels } from './models/index.js';
import sequelize from './config/database.js';

async function checkTableStructure() {
  try {
    console.log('🔍 Checking order_items table structure...');
    
    // Initialize models
    await initializeModels();
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check table structure
    const [results] = await sequelize.query("DESCRIBE order_items");
    console.log('📋 order_items table structure:');
    results.forEach(row => {
      console.log(`  - ${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${row.Key ? `(${row.Key})` : ''}`);
    });
    
    // Check if product_unit column exists
    const hasProductUnit = results.some(row => row.Field === 'product_unit');
    console.log(`\n🔍 product_unit column exists: ${hasProductUnit ? 'YES' : 'NO'}`);
    
    if (!hasProductUnit) {
      console.log('⚠️  product_unit column is missing! This is causing the 500 error.');
      console.log('💡 Solution: Add the missing column to the database.');
    }
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
  } finally {
    await sequelize.close();
  }
}

checkTableStructure();