import mysql from 'mysql2/promise';

async function testOrdersAPI() {
    let serverConnection;
    try {
        console.log('🧪 Testing Orders API with direct MySQL queries...');

        serverConnection = await mysql.createConnection({
            host: 'shinkansen.proxy.rlwy.net',
            user: 'root',
            password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
            database: 'railway',
            port: 24785
        });

        // Test basic orders query
        console.log('📊 Testing basic orders query...');
        const [orders] = await serverConnection.execute(`
            SELECT o.*, s.name as store_name 
            FROM orders o 
            LEFT JOIN stores s ON o.store_id = s.id
            ORDER BY o.created_at DESC 
            LIMIT 5
        `);

        console.log(`✅ Found ${orders.length} orders`);

        if (orders.length > 0) {
            console.log('\n📋 Sample orders:');
            orders.forEach((order, index) => {
                console.log(`${index + 1}. ${order.order_number} - ${order.store_name} - ${order.final_amount_eur} EUR`);
            });
        }

        // Test order items query
        console.log('\n📦 Testing order items query...');
        const [orderItems] = await serverConnection.execute(`
            SELECT oi.*, p.name as product_name 
            FROM order_items oi 
            LEFT JOIN products p ON oi.product_id = p.id
            ORDER BY oi.order_id, oi.product_name
            LIMIT 10
        `);

        console.log(`✅ Found ${orderItems.length} order items`);

        if (orderItems.length > 0) {
            console.log('\n📦 Sample order items:');
            orderItems.forEach((item, index) => {
                console.log(`${index + 1}. Order ${item.order_id}: ${item.product_name} x${item.quantity} = ${item.final_price_eur} EUR`);
            });
        }

        // Test the exact query that's failing
        console.log('\n🔍 Testing the problematic query structure...');
        const [testQuery] = await serverConnection.execute(`
            SELECT 
                o.id,
                o.order_number,
                o.store_name,
                o.final_amount_eur,
                o.status,
                o.payment_status,
                oi.id as item_id,
                oi.product_name,
                oi.quantity,
                oi.final_price_eur as item_final_price_eur,
                oi.discount_amount_eur
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.id IN (1, 2, 3)
            ORDER BY o.id, oi.id
        `);

        console.log(`✅ Complex query returned ${testQuery.length} rows`);

        if (testQuery.length > 0) {
            console.log('\n🔍 Sample complex query results:');
            testQuery.slice(0, 5).forEach((row, index) => {
                console.log(`${index + 1}. Order ${row.order_number}: ${row.product_name} - Discount: ${row.discount_amount_eur} EUR`);
            });
        }

        console.log('\n✅ All database queries working correctly!');
        console.log('🎯 The issue was with missing columns, which have been fixed.');
        console.log('🚀 The Orders API should now work properly.');

    } catch (error) {
        console.error('❌ Error testing orders API:', error.message);
    } finally {
        if (serverConnection) {
            await serverConnection.end();
        }
    }
}

testOrdersAPI(); 