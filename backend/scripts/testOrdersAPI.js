import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import models
import { Order, OrderItem, Store, Product, User } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config.env') });

// Test orders API functionality
const testOrdersAPI = async () => {
    try {
        console.log('🧪 Testing Orders API functionality...');

        // Test database connection
        console.log('🔗 Testing database connection...');
        const sequelize = new Sequelize(
            process.env.DB_NAME,
            process.env.DB_USER,
            process.env.DB_PASSWORD,
            {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT || 3306,
                dialect: 'mysql',
                logging: false
            }
        );

        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // Test orders query
        console.log('📊 Testing orders query...');
        const orders = await Order.findAll({
            include: [
                { model: Store, as: 'store' },
                { model: User, as: 'creator', attributes: ['id', 'full_name', 'username'] },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'unit'] }]
                }
            ],
            limit: 5,
            order: [['created_at', 'DESC']]
        });

        console.log(`✅ Found ${orders.length} orders`);

        if (orders.length > 0) {
            console.log('📋 Sample order:');
            const order = orders[0];
            console.log(`   ID: ${order.id}`);
            console.log(`   Number: ${order.order_number}`);
            console.log(`   Store: ${order.store_name}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Payment: ${order.payment_status}`);
            console.log(`   Total EUR: ${order.final_amount_eur}`);
            console.log(`   Total SYP: ${order.final_amount_syp}`);
        }

        // Test order items
        console.log('📦 Testing order items query...');
        const orderItems = await OrderItem.findAll({
            limit: 5,
            order: [['created_at', 'DESC']]
        });

        console.log(`✅ Found ${orderItems.length} order items`);

        await sequelize.close();
        console.log('🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);

        // More detailed error information
        if (error.name === 'SequelizeConnectionError') {
            console.error('💡 Database connection failed. Check your database configuration.');
        } else if (error.name === 'SequelizeDatabaseError') {
            console.error('💡 Database query failed. Check if tables exist and have correct structure.');
            console.error('   Error details:', error.message);
        } else {
            console.error('💡 Unexpected error:', error.message);
        }

        throw error;
    }
};

// Run the test
testOrdersAPI()
    .then(() => {
        console.log('✅ Test completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }); 