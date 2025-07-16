import mysql from 'mysql2/promise';

async function checkOrdersDetails() {
    let serverConnection;
    try {
        console.log('Connecting to Railway database for detailed check...');

        serverConnection = await mysql.createConnection({
            host: 'shinkansen.proxy.rlwy.net',
            user: 'root',
            password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
            database: 'railway',
            port: 24785
        });

        // Check if orders table has all required columns
        console.log('\n=== ORDERS TABLE DETAILS ===');
        const [orders] = await serverConnection.execute(`
            SELECT order_number, store_name, order_date, delivery_date, 
                   final_amount_eur, currency, customer_phone, customer_email
            FROM orders 
            ORDER BY order_date DESC
        `);

        console.log(`Found ${orders.length} orders:`);
        orders.forEach(order => {
            console.log(`- ${order.order_number} | ${order.store_name} | ${order.order_date} | ${order.final_amount_eur} ${order.currency}`);
        });

        // Check order_items table structure
        console.log('\n=== ORDER_ITEMS TABLE DETAILS ===');
        const [itemsStructure] = await serverConnection.execute("DESCRIBE order_items");
        console.log('Order_items table structure:');
        itemsStructure.forEach(col => {
            console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });

        // Check order items with product details
        const [orderItems] = await serverConnection.execute(`
            SELECT oi.order_id, oi.product_name, oi.quantity, oi.unit_price_eur, oi.final_price
            FROM order_items oi
            ORDER BY oi.order_id, oi.product_name
        `);

        console.log(`\nFound ${orderItems.length} order items:`);
        orderItems.forEach(item => {
            console.log(`- Order ${item.order_id}: ${item.product_name} x${item.quantity} = ${item.final_price} EUR`);
        });

        // Check if status and payment_status columns exist
        console.log('\n=== CHECKING MISSING COLUMNS ===');
        const [ordersStructure] = await serverConnection.execute("DESCRIBE orders");
        const hasStatus = ordersStructure.some(col => col.Field === 'status');
        const hasPaymentStatus = ordersStructure.some(col => col.Field === 'payment_status');
        const hasCustomerName = ordersStructure.some(col => col.Field === 'customer_name');
        const hasPriority = ordersStructure.some(col => col.Field === 'priority');

        console.log(`Status column exists: ${hasStatus}`);
        console.log(`Payment_status column exists: ${hasPaymentStatus}`);
        console.log(`Customer_name column exists: ${hasCustomerName}`);
        console.log(`Priority column exists: ${hasPriority}`);

    } catch (error) {
        console.error('Error checking orders details:', error.message);
    } finally {
        if (serverConnection) {
            await serverConnection.end();
        }
    }
}

checkOrdersDetails(); 