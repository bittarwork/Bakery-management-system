import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config.env') });

// Fix orders table structure
const fixOrdersTable = async () => {
    try {
        console.log('🔧 Fixing orders table structure...');

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

        // Check current table structure
        console.log('📊 Checking current orders table structure...');
        const [columns] = await sequelize.query('DESCRIBE orders');

        console.log('Current columns:');
        columns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type})`);
        });

        // Add missing columns
        const columnsToAdd = [
            {
                name: 'priority',
                definition: "ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal'"
            },
            {
                name: 'special_instructions',
                definition: 'TEXT NULL'
            },
            {
                name: 'assigned_distributor_id',
                definition: 'INT NULL'
            },
            {
                name: 'delivery_address',
                definition: 'TEXT NULL'
            },
            {
                name: 'customer_name',
                definition: 'VARCHAR(100) NULL'
            },
            {
                name: 'customer_phone',
                definition: 'VARCHAR(20) NULL'
            },
            {
                name: 'customer_email',
                definition: 'VARCHAR(100) NULL'
            },
            {
                name: 'created_by',
                definition: 'INT NULL'
            }
        ];

        for (const column of columnsToAdd) {
            const columnExists = columns.some(col => col.Field === column.name);

            if (!columnExists) {
                console.log(`➕ Adding column: ${column.name}`);
                await sequelize.query(`ALTER TABLE orders ADD COLUMN ${column.name} ${column.definition}`);
            } else {
                console.log(`✅ Column ${column.name} already exists`);
            }
        }

        // Add missing indexes
        console.log('🔍 Adding missing indexes...');
        const indexesToAdd = [
            'CREATE INDEX IF NOT EXISTS idx_payment_status ON orders(payment_status)',
            'CREATE INDEX IF NOT EXISTS idx_priority ON orders(priority)',
            'CREATE INDEX IF NOT EXISTS idx_assigned_distributor ON orders(assigned_distributor_id)'
        ];

        for (const indexQuery of indexesToAdd) {
            try {
                await sequelize.query(indexQuery);
                console.log(`✅ Index added successfully`);
            } catch (error) {
                if (error.message.includes('Duplicate key name')) {
                    console.log(`✅ Index already exists`);
                } else {
                    console.warn(`⚠️ Index creation warning: ${error.message}`);
                }
            }
        }

        // Now try to insert sample data
        console.log('📝 Inserting sample data...');

        // Check if we already have data
        const [orderCount] = await sequelize.query("SELECT COUNT(*) as count FROM orders");

        if (orderCount[0].count === 0) {
            // Insert sample order without priority first
            await sequelize.query(`
                INSERT INTO orders (
                    order_number, store_id, store_name, order_date, 
                    total_amount_eur, total_amount_syp, final_amount_eur, final_amount_syp,
                    status, payment_status, notes, customer_name, customer_phone
                ) VALUES (
                    'ORD-2024-001', 1, 'Store Central Brussels', CURRENT_DATE,
                    50.00, 2750000.00, 50.00, 2750000.00,
                    'confirmed', 'pending', 'Sample order for testing', 
                    'John Doe', '+32 123 456 789'
                )
            `);

            // Get the inserted order ID
            const [orderResult] = await sequelize.query("SELECT id FROM orders WHERE order_number = 'ORD-2024-001'");
            const orderId = orderResult[0].id;

            // Insert sample order items
            await sequelize.query(`
                INSERT INTO order_items (
                    order_id, product_id, product_name, quantity,
                    unit_price_eur, unit_price_syp, total_price_eur, total_price_syp,
                    final_price_eur, final_price_syp
                ) VALUES 
                (${orderId}, 1, 'Bread Loaf', 10.00, 2.50, 137500.00, 25.00, 1375000.00, 25.00, 1375000.00),
                (${orderId}, 2, 'Croissant', 20.00, 1.25, 68750.00, 25.00, 1375000.00, 25.00, 1375000.00)
            `);

            // Add a few more sample orders
            await sequelize.query(`
                INSERT INTO orders (
                    order_number, store_id, store_name, order_date, 
                    total_amount_eur, total_amount_syp, final_amount_eur, final_amount_syp,
                    status, payment_status, notes, customer_name, customer_phone
                ) VALUES 
                ('ORD-2024-002', 2, 'Store Antwerp', CURRENT_DATE, 75.00, 4125000.00, 75.00, 4125000.00, 'draft', 'pending', 'Another test order', 'Jane Smith', '+32 987 654 321'),
                ('ORD-2024-003', 1, 'Store Central Brussels', CURRENT_DATE, 100.00, 5500000.00, 100.00, 5500000.00, 'in_progress', 'paid', 'Third test order', 'Bob Johnson', '+32 555 123 456')
            `);

            console.log('✅ Sample data inserted successfully');
        } else {
            console.log('ℹ️ Orders table already contains data');
        }

        // Verify the fix
        console.log('🔍 Verifying orders table...');
        const [orders] = await sequelize.query('SELECT * FROM orders LIMIT 3');
        console.log(`✅ Found ${orders.length} orders`);

        if (orders.length > 0) {
            console.log('📋 Sample orders:');
            orders.forEach(order => {
                console.log(`   ${order.order_number} - ${order.store_name} - ${order.status}`);
            });
        }

        await sequelize.close();
        console.log('🎉 Orders table fixed successfully!');

    } catch (error) {
        console.error('❌ Error fixing orders table:', error);
        throw error;
    }
};

// Run the script
fixOrdersTable()
    .then(() => {
        console.log('✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error.message);
        process.exit(1);
    }); 