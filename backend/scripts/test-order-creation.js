import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Database configuration
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 10,
            min: 2,
            acquire: 60000,
            idle: 10000
        },
        timezone: '+02:00',
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            timestamps: true,
            underscored: true,
            freezeTableName: true
        },
        dialectOptions: {
            connectTimeout: 60000,
            acquireTimeout: 60000,
            timeout: 60000,
            multipleStatements: true,
            supportBigNumbers: true,
            bigNumberStrings: true
        }
    }
);

// Test order creation
const testOrderCreation = async () => {
    try {
        console.log('🔗 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        // Start transaction with better settings
        const transaction = await sequelize.transaction({
            isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
            timeout: 30000
        });

        try {
            console.log('📝 Testing order creation...');

            // Test data
            const testOrderData = {
                store_id: 1,
                items: [
                    { product_id: 1, quantity: 5 },
                    { product_id: 2, quantity: 3 }
                ],
                notes: 'Test order for lock timeout fix',
                priority: 'normal'
            };

            // Simulate order creation process
            console.log('1. Creating order...');
            
            // Generate order number
            const orderNumber = `TEST-${Date.now()}`;
            
            // Create order
            const [orderResult] = await sequelize.query(`
                INSERT INTO orders (
                    order_number, store_id, store_name, order_date,
                    total_amount_eur, total_amount_syp, total_cost_eur, total_cost_syp,
                    commission_eur, commission_syp, status, payment_status,
                    notes, created_by, created_by_name, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, {
                replacements: [
                    orderNumber,
                    testOrderData.store_id,
                    'Test Store',
                    new Date().toISOString().split('T')[0],
                    100.00, 180000.00, 80.00, 144000.00,
                    20.00, 36000.00, 'draft', 'pending',
                    testOrderData.notes,
                    1, 'Test User'
                ],
                transaction
            });

            const orderId = orderResult.insertId;
            console.log(`✅ Order created with ID: ${orderId}`);

            // Create order items
            console.log('2. Creating order items...');
            for (const item of testOrderData.items) {
                await sequelize.query(`
                    INSERT INTO order_items (
                        order_id, product_id, quantity, unit_price_eur, unit_price_syp,
                        total_price_eur, total_price_syp, product_name, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `, {
                    replacements: [
                        orderId,
                        item.product_id,
                        item.quantity,
                        20.00, 36000.00,
                        20.00 * item.quantity, 36000.00 * item.quantity,
                        `Product ${item.product_id}`
                    ],
                    transaction
                });
            }
            console.log('✅ Order items created');

            // Simulate distributor assignment
            console.log('3. Testing distributor assignment...');
            await sequelize.query(`
                UPDATE orders 
                SET assigned_distributor_id = ?, status = ?, updated_at = NOW()
                WHERE id = ?
            `, {
                replacements: [1, 'confirmed', orderId],
                transaction
            });
            console.log('✅ Distributor assigned');

            // Commit transaction
            await transaction.commit();
            console.log('✅ Transaction committed successfully');

            // Clean up test data
            console.log('4. Cleaning up test data...');
            await sequelize.query('DELETE FROM order_items WHERE order_id = ?', {
                replacements: [orderId]
            });
            await sequelize.query('DELETE FROM orders WHERE id = ?', {
                replacements: [orderId]
            });
            console.log('✅ Test data cleaned up');

        } catch (error) {
            await transaction.rollback();
            console.error('❌ Transaction failed:', error.message);
            
            if (error.original && error.original.code === 'ER_LOCK_WAIT_TIMEOUT') {
                console.error('🔒 Lock wait timeout detected');
            }
            throw error;
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await sequelize.close();
        console.log('✅ Database connection closed');
    }
};

// Run test
console.log('🧪 Starting order creation test...');
testOrderCreation().then(() => {
    console.log('✅ Test completed');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
}); 