import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config.env') });

// Insert order items
const insertOrderItems = async () => {
    try {
        console.log('📦 Inserting order items...');

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

        // Get all orders
        const [orders] = await sequelize.query("SELECT id, order_number FROM orders ORDER BY id");
        console.log(`📊 Found ${orders.length} orders`);

        // Check if we already have order items
        const [itemCount] = await sequelize.query("SELECT COUNT(*) as count FROM order_items");
        console.log(`📦 Current order items count: ${itemCount[0].count}`);

        if (itemCount[0].count === 0) {
            console.log('📝 Inserting order items...');

            // Insert order items for each order
            for (const order of orders) {
                await sequelize.query(`
                    INSERT INTO order_items (
                        order_id, product_id, product_name, quantity,
                        unit_price_eur, unit_price_syp, total_price_eur, total_price_syp,
                        final_price, notes
                    ) VALUES 
                    (${order.id}, 1, 'Bread Loaf', 5, 2.50, 137500.00, 12.50, 687500.00, 12.50, 'Fresh bread loaf'),
                    (${order.id}, 2, 'Croissant', 10, 1.25, 68750.00, 12.50, 687500.00, 12.50, 'Butter croissant'),
                    (${order.id}, 3, 'Baguette', 3, 1.80, 99000.00, 5.40, 297000.00, 5.40, 'French baguette')
                `);

                console.log(`✅ Items added for order ${order.order_number}`);
            }

            console.log('✅ All order items inserted successfully');
        } else {
            console.log('ℹ️ Order items table already contains data');
        }

        // Verify the data
        console.log('🔍 Verifying inserted data...');
        const [orderItems] = await sequelize.query(`
            SELECT oi.*, o.order_number 
            FROM order_items oi 
            JOIN orders o ON oi.order_id = o.id 
            ORDER BY oi.id 
            LIMIT 10
        `);

        console.log(`✅ Found ${orderItems.length} order items`);

        if (orderItems.length > 0) {
            console.log('📦 Sample order items:');
            orderItems.forEach(item => {
                console.log(`   ${item.order_number} - ${item.product_name} (${item.quantity}x) - €${item.final_price}`);
            });
        }

        await sequelize.close();
        console.log('🎉 Order items inserted successfully!');

    } catch (error) {
        console.error('❌ Error inserting order items:', error);
        throw error;
    }
};

// Run the script
insertOrderItems()
    .then(() => {
        console.log('✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error.message);
        process.exit(1);
    }); 