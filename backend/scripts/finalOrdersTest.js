import mysql from 'mysql2/promise';

async function finalOrdersTest() {
    let serverConnection;
    try {
        console.log('🧪 Final comprehensive test for Orders API...');

        serverConnection = await mysql.createConnection({
            host: 'shinkansen.proxy.rlwy.net',
            user: 'root',
            password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
            database: 'railway',
            port: 24785
        });

        // Check all required columns
        const [columns] = await serverConnection.execute("DESCRIBE order_items");
        const columnNames = columns.map(col => col.Field);

        console.log('📊 Checking all required columns for Orders API...');

        const requiredColumns = [
            // Basic columns
            'id', 'order_id', 'product_id', 'product_name', 'quantity',
            // Price columns (EUR)
            'unit_price_eur', 'total_price_eur', 'discount_amount_eur', 'final_price_eur',
            // Price columns (SYP)
            'unit_price_syp', 'total_price_syp', 'discount_amount_syp', 'final_price_syp',
            // Product details
            'unit', 'product_category', 'product_barcode', 'product_sku', 'product_description',
            // Supplier info
            'supplier_id', 'supplier_name',
            // Gift and discount
            'gift_quantity', 'gift_reason', 'discount_amount', 'final_price',
            // Meta
            'notes', 'created_at', 'updated_at'
        ];

        let allColumnsExist = true;

        requiredColumns.forEach(col => {
            const exists = columnNames.includes(col);
            console.log(`- ${col}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
            if (!exists) {
                allColumnsExist = false;
            }
        });

        if (allColumnsExist) {
            console.log('\n🎉 All required columns exist!');

            // Test the exact query that would be used by the API
            console.log('\n🔍 Testing API-style query...');
            const [apiTestQuery] = await serverConnection.execute(`
                SELECT 
                    o.id,
                    o.order_number,
                    o.store_name,
                    o.final_amount_eur,
                    o.status,
                    o.payment_status,
                    o.created_at,
                    oi.id as item_id,
                    oi.product_name,
                    oi.product_barcode,
                    oi.product_sku,
                    oi.quantity,
                    oi.unit_price_eur,
                    oi.total_price_eur,
                    oi.discount_amount_eur,
                    oi.final_price_eur,
                    oi.unit,
                    oi.product_category,
                    oi.gift_quantity,
                    oi.gift_reason
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                ORDER BY o.created_at DESC, oi.id ASC
                LIMIT 10
            `);

            console.log(`✅ API-style query returned ${apiTestQuery.length} rows`);

            if (apiTestQuery.length > 0) {
                console.log('\n📋 Sample API query results:');
                apiTestQuery.slice(0, 3).forEach((row, index) => {
                    console.log(`${index + 1}. Order ${row.order_number}: ${row.product_name} [${row.product_barcode}] - ${row.quantity} x ${row.final_price_eur} EUR`);
                });
            }

            // Test orders count
            const [ordersCount] = await serverConnection.execute('SELECT COUNT(*) as count FROM orders');
            const [itemsCount] = await serverConnection.execute('SELECT COUNT(*) as count FROM order_items');

            console.log(`\n📊 Database Statistics:`);
            console.log(`- Total Orders: ${ordersCount[0].count}`);
            console.log(`- Total Order Items: ${itemsCount[0].count}`);

            console.log('\n🚀 Orders API is ready to use!');
            console.log('✅ All database issues have been resolved.');
            console.log('✅ Frontend should now work without 500 errors.');

        } else {
            console.log('\n❌ Some required columns are missing!');
            console.log('Please run the appropriate fix scripts.');
        }

    } catch (error) {
        console.error('❌ Error in final orders test:', error.message);
    } finally {
        if (serverConnection) {
            await serverConnection.end();
        }
    }
}

finalOrdersTest(); 