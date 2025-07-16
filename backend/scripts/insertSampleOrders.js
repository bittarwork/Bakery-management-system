import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config.env') });

// Insert sample orders
const insertSampleOrders = async () => {
    try {
        console.log('📝 Inserting sample orders...');

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

        // Check if we already have data
        const [orderCount] = await sequelize.query("SELECT COUNT(*) as count FROM orders");
        console.log(`📊 Current orders count: ${orderCount[0].count}`);

        if (orderCount[0].count === 0) {
            console.log('📝 Inserting sample orders...');

            // Insert sample orders with correct status values
            await sequelize.query(`
                INSERT INTO orders (
                    order_number, store_id, store_name, order_date, 
                    total_amount_eur, total_amount_syp, final_amount_eur, final_amount_syp,
                    status, payment_status, notes, customer_name, customer_phone,
                    created_by, created_by_name, currency, exchange_rate
                ) VALUES 
                ('ORD-2024-001', 1, 'Store Central Brussels', CURRENT_DATE, 50.00, 2750000.00, 50.00, 2750000.00, 'confirmed', 'pending', 'Sample order for testing', 'John Doe', '+32 123 456 789', 1, 'Admin User', 'EUR', 55000.00),
                ('ORD-2024-002', 2, 'Store Antwerp', CURRENT_DATE, 75.00, 4125000.00, 75.00, 4125000.00, 'draft', 'pending', 'Another test order', 'Jane Smith', '+32 987 654 321', 1, 'Admin User', 'EUR', 55000.00),
                ('ORD-2024-003', 1, 'Store Central Brussels', CURRENT_DATE, 100.00, 5500000.00, 100.00, 5500000.00, 'prepared', 'paid', 'Third test order', 'Bob Johnson', '+32 555 123 456', 1, 'Admin User', 'EUR', 55000.00),
                ('ORD-2024-004', 3, 'Store Ghent', CURRENT_DATE, 25.00, 1375000.00, 25.00, 1375000.00, 'delivered', 'paid', 'Delivered order', 'Alice Brown', '+32 444 789 123', 1, 'Admin User', 'EUR', 55000.00),
                ('ORD-2024-005', 2, 'Store Antwerp', CURRENT_DATE, 150.00, 8250000.00, 150.00, 8250000.00, 'pending', 'partial', 'Large order', 'Charlie Wilson', '+32 333 456 789', 1, 'Admin User', 'EUR', 55000.00)
            `);

            console.log('✅ Sample orders inserted successfully');

            // Get inserted order IDs
            const [orders] = await sequelize.query("SELECT id, order_number FROM orders ORDER BY id");

            // Insert sample order items for each order
            for (const order of orders) {
                await sequelize.query(`
                    INSERT INTO order_items (
                        order_id, product_id, product_name, quantity,
                        unit_price_eur, unit_price_syp, total_price_eur, total_price_syp,
                        final_price_eur, final_price_syp
                    ) VALUES 
                    (${order.id}, 1, 'Bread Loaf', 5.00, 2.50, 137500.00, 12.50, 687500.00, 12.50, 687500.00),
                    (${order.id}, 2, 'Croissant', 10.00, 1.25, 68750.00, 12.50, 687500.00, 12.50, 687500.00)
                `);
            }

            console.log('✅ Sample order items inserted successfully');
        } else {
            console.log('ℹ️ Orders table already contains data');
        }

        // Verify the data
        console.log('🔍 Verifying inserted data...');
        const [orders] = await sequelize.query('SELECT * FROM orders ORDER BY id LIMIT 5');
        console.log(`✅ Found ${orders.length} orders`);

        if (orders.length > 0) {
            console.log('📋 Sample orders:');
            orders.forEach(order => {
                console.log(`   ${order.order_number} - ${order.store_name} - ${order.status} - ${order.payment_status}`);
            });
        }

        const [orderItems] = await sequelize.query('SELECT * FROM order_items ORDER BY id LIMIT 5');
        console.log(`✅ Found ${orderItems.length} order items`);

        await sequelize.close();
        console.log('🎉 Sample data inserted successfully!');

    } catch (error) {
        console.error('❌ Error inserting sample data:', error);
        throw error;
    }
};

// Run the script
insertSampleOrders()
    .then(() => {
        console.log('✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error.message);
        process.exit(1);
    }); 