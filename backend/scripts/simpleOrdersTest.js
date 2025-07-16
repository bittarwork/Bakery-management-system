import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config.env') });

// Simple orders test
const testSimpleOrders = async () => {
    try {
        console.log('🧪 Testing simple orders query...');

        // Database configuration
        const sequelize = new Sequelize(
            process.env.DB_NAME,
            process.env.DB_USER,
            process.env.DB_PASSWORD,
            {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT || 3306,
                dialect: 'mysql',
                logging: console.log
            }
        );

        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // Test simple query
        const [orders] = await sequelize.query('SELECT * FROM orders LIMIT 5');
        console.log(`✅ Found ${orders.length} orders`);

        if (orders.length > 0) {
            console.log('📋 Sample order:');
            const order = orders[0];
            console.log(`   ID: ${order.id}`);
            console.log(`   Number: ${order.order_number}`);
            console.log(`   Store: ${order.store_name}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Payment: ${order.payment_status}`);
        }

        // Test order items
        const [orderItems] = await sequelize.query('SELECT * FROM order_items LIMIT 5');
        console.log(`✅ Found ${orderItems.length} order items`);

        await sequelize.close();
        console.log('🎉 Simple test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        throw error;
    }
};

// Run the test
testSimpleOrders()
    .then(() => {
        console.log('✅ Test completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }); 