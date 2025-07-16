import mysql from 'mysql2/promise';

// Check production database schema
const checkProductionDB = async () => {
    let connection;
    try {
        console.log('🔄 Connecting to production database...');

        // Production database connection
        connection = await mysql.createConnection({
            host: 'shinkansen.proxy.rlwy.net',
            user: 'root',
            password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
            database: 'railway',
            port: 24785
        });

        console.log('✅ Connected to production database');

        // Check order_items table structure
        console.log('\n📋 Checking order_items table structure...');
        const [columns] = await connection.execute('DESCRIBE order_items');

        console.log('order_items table columns:');
        console.log('==========================');

        let hasReturnReason = false;
        columns.forEach((column) => {
            console.log(`- ${column.Field} (${column.Type})`);
            if (column.Field === 'return_reason') {
                hasReturnReason = true;
            }
        });

        console.log('\n==========================');
        console.log(`return_reason column exists: ${hasReturnReason}`);

        if (!hasReturnReason) {
            console.log('\n⚠️  return_reason column is missing from production database!');
            console.log('🔄 Adding return_reason column...');

            // Add the column
            await connection.execute(`
                ALTER TABLE order_items 
                ADD COLUMN return_reason VARCHAR(255) NULL 
                COMMENT 'سبب الإرجاع'
            `);

            console.log('✅ Successfully added return_reason column to production database');
        } else {
            console.log('\n✅ return_reason column already exists in production database');
        }

        // Test the orders query
        console.log('\n🧪 Testing orders query...');
        const [testOrders] = await connection.execute(`
            SELECT 
                o.id,
                o.order_number,
                o.store_id,
                o.status,
                oi.id as item_id,
                oi.product_id,
                oi.quantity,
                oi.return_reason
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LIMIT 5
        `);

        console.log(`✅ Orders query successful! Found ${testOrders.length} records`);

        if (testOrders.length > 0) {
            console.log('\n📋 Sample data:');
            testOrders.slice(0, 3).forEach((row, index) => {
                console.log(`${index + 1}. Order ${row.order_number}: Item ${row.item_id}, Return Reason: ${row.return_reason || 'null'}`);
            });
        }

        console.log('\n🎉 Production database is now ready!');
        console.log('🚀 The orders API should work correctly now.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
};

// Run the check
checkProductionDB(); 