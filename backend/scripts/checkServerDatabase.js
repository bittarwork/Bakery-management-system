import mysql from 'mysql2/promise';

async function checkServerDatabase() {
    let serverConnection;
    try {
        console.log('Connecting to Railway database...');

        // Railway database connection
        serverConnection = await mysql.createConnection({
            host: 'shinkansen.proxy.rlwy.net',
            user: 'root',
            password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
            database: 'railway',
            port: 24785
        });

        // Check if orders table exists
        const [tables] = await serverConnection.execute("SHOW TABLES LIKE 'orders'");
        console.log('Orders table exists:', tables.length > 0);

        if (tables.length > 0) {
            // Check orders table structure
            const [columns] = await serverConnection.execute("DESCRIBE orders");
            console.log('\nOrders table structure:');
            columns.forEach(col => {
                console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? col.Key : ''}`);
            });

            // Check if orders exist
            const [orders] = await serverConnection.execute("SELECT COUNT(*) as count FROM orders");
            console.log(`\nTotal orders in database: ${orders[0].count}`);

            if (orders[0].count > 0) {
                // Show sample orders
                const [sampleOrders] = await serverConnection.execute("SELECT id, order_number, store_name, final_amount_eur, currency FROM orders LIMIT 5");
                console.log('\nSample orders:');
                sampleOrders.forEach(order => {
                    console.log(`- ${order.order_number}: ${order.store_name} - ${order.final_amount_eur} ${order.currency}`);
                });
            }
        }

        // Check if order_items table exists
        const [itemsTables] = await serverConnection.execute("SHOW TABLES LIKE 'order_items'");
        console.log('\nOrder_items table exists:', itemsTables.length > 0);

        if (itemsTables.length > 0) {
            const [itemsCount] = await serverConnection.execute("SELECT COUNT(*) as count FROM order_items");
            console.log(`Total order items in database: ${itemsCount[0].count}`);
        }

        // Show all tables
        const [allTables] = await serverConnection.execute("SHOW TABLES");
        console.log('\nAll tables in database:');
        allTables.forEach(table => {
            console.log(`- ${Object.values(table)[0]}`);
        });

    } catch (error) {
        console.error('Error checking server database:', error.message);
    } finally {
        if (serverConnection) {
            await serverConnection.end();
        }
    }
}

checkServerDatabase(); 