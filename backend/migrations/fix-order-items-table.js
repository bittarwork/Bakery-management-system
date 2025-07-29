import sequelize from '../config/database.js';

async function fixOrderItemsTable() {
  try {
    console.log('🔧 Fixing order_items table structure...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check current table structure
    const [columns] = await sequelize.query("SHOW COLUMNS FROM order_items");
    const existingColumns = columns.map(col => col.Field);
    console.log('📋 Existing columns:', existingColumns);
    
    // Add missing columns
    const migrations = [
      {
        name: 'unit_price_eur',
        sql: "ALTER TABLE order_items ADD COLUMN unit_price_eur DECIMAL(10,2) NOT NULL DEFAULT 0.00"
      },
      {
        name: 'unit_price_syp',
        sql: "ALTER TABLE order_items ADD COLUMN unit_price_syp DECIMAL(15,2) NOT NULL DEFAULT 0.00"
      },
      {
        name: 'total_price_eur',
        sql: "ALTER TABLE order_items ADD COLUMN total_price_eur DECIMAL(10,2) NOT NULL DEFAULT 0.00"
      }
    ];
    
    for (const migration of migrations) {
      try {
        if (existingColumns.includes(migration.name)) {
          console.log(`⚠️  Column ${migration.name} already exists, skipping...`);
          continue;
        }
        
        console.log(`🔄 Adding column: ${migration.name}`);
        await sequelize.query(migration.sql);
        console.log(`✅ Column ${migration.name} added successfully`);
      } catch (error) {
        console.error(`❌ Failed to add column ${migration.name}:`, error.message);
      }
    }
    
    console.log('🎉 All migrations completed!');
    
  } catch (error) {
    console.error('❌ Error fixing table structure:', error);
  } finally {
    await sequelize.close();
  }
}

fixOrderItemsTable(); 