import mysql from 'mysql2/promise';

async function checkOrderItemsColumns() {
    let serverConnection;
    try {
        console.log('Connecting to Railway database...');

        serverConnection = await mysql.createConnection({
            host: 'shinkansen.proxy.rlwy.net',
            user: 'root',
            password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
            database: 'railway',
            port: 24785
        });

        // Check order_items table structure
        const [columns] = await serverConnection.execute("DESCRIBE order_items");
        console.log('Order_items table columns:');
        columns.forEach(col => {
            console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
        });

        // Check if the problematic columns exist
        const columnNames = columns.map(col => col.Field);
        console.log('\nChecking for required columns:');
        console.log(`- discount_amount_eur: ${columnNames.includes('discount_amount_eur') ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`- discount_amount_syp: ${columnNames.includes('discount_amount_syp') ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`- final_price_eur: ${columnNames.includes('final_price_eur') ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`- final_price_syp: ${columnNames.includes('final_price_syp') ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`- discount_amount: ${columnNames.includes('discount_amount') ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`- final_price: ${columnNames.includes('final_price') ? '✅ EXISTS' : '❌ MISSING'}`);

        // Show sample data
        console.log('\nSample order_items data:');
        const [items] = await serverConnection.execute("SELECT * FROM order_items LIMIT 3");
        items.forEach((item, index) => {
            console.log(`\nItem ${index + 1}:`);
            console.log(`  Order ID: ${item.order_id}`);
            console.log(`  Product: ${item.product_name}`);
            console.log(`  Quantity: ${item.quantity}`);
            console.log(`  Unit Price EUR: ${item.unit_price_eur}`);
            console.log(`  Total Price EUR: ${item.total_price_eur}`);
            console.log(`  Discount Amount: ${item.discount_amount || 'N/A'}`);
            console.log(`  Final Price: ${item.final_price || 'N/A'}`);
        });

    } catch (error) {
        console.error('Error checking order_items columns:', error.message);
    } finally {
        if (serverConnection) {
            await serverConnection.end();
        }
    }
}

checkOrderItemsColumns(); 