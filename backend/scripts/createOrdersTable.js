import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config.env') });

// Database configuration
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: console.log,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        timezone: '+02:00',
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            timestamps: true,
            underscored: true,
            freezeTableName: true
        }
    }
);

// Create Orders table
const createOrdersTable = async () => {
    try {
        console.log('🔗 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        // Create Orders table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_number VARCHAR(50) NOT NULL UNIQUE,
                store_id INT NOT NULL,
                store_name VARCHAR(100) NOT NULL,
                order_date DATE NOT NULL DEFAULT (CURRENT_DATE),
                delivery_date DATE NULL,
                total_amount_eur DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                total_amount_syp DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                discount_amount_eur DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                discount_amount_syp DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                final_amount_eur DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                final_amount_syp DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                status ENUM('draft', 'confirmed', 'in_progress', 'delivered', 'cancelled') NOT NULL DEFAULT 'draft',
                payment_status ENUM('pending', 'partial', 'paid', 'overdue') NOT NULL DEFAULT 'pending',
                priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
                notes TEXT NULL,
                special_instructions TEXT NULL,
                assigned_distributor_id INT NULL,
                delivery_address TEXT NULL,
                customer_name VARCHAR(100) NULL,
                customer_phone VARCHAR(20) NULL,
                customer_email VARCHAR(100) NULL,
                created_by INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_order_number (order_number),
                INDEX idx_store_id (store_id),
                INDEX idx_status (status),
                INDEX idx_payment_status (payment_status),
                INDEX idx_order_date (order_date),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Orders table created successfully');

        // Create Order Items table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                product_name VARCHAR(100) NOT NULL,
                quantity DECIMAL(10, 2) NOT NULL,
                unit_price_eur DECIMAL(10, 2) NOT NULL,
                unit_price_syp DECIMAL(15, 2) NOT NULL,
                total_price_eur DECIMAL(10, 2) NOT NULL,
                total_price_syp DECIMAL(15, 2) NOT NULL,
                discount_amount_eur DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                discount_amount_syp DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                final_price_eur DECIMAL(10, 2) NOT NULL,
                final_price_syp DECIMAL(15, 2) NOT NULL,
                notes TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                INDEX idx_order_id (order_id),
                INDEX idx_product_id (product_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Order Items table created successfully');

        // Check if tables were created
        const [ordersResult] = await sequelize.query("SHOW TABLES LIKE 'orders'");
        const [orderItemsResult] = await sequelize.query("SHOW TABLES LIKE 'order_items'");

        console.log('📊 Tables status:');
        console.log(`   Orders table: ${ordersResult.length > 0 ? '✅ EXISTS' : '❌ NOT FOUND'}`);
        console.log(`   Order Items table: ${orderItemsResult.length > 0 ? '✅ EXISTS' : '❌ NOT FOUND'}`);

        // Insert sample data if tables are empty
        const [orderCount] = await sequelize.query("SELECT COUNT(*) as count FROM orders");
        if (orderCount[0].count === 0) {
            console.log('📝 Inserting sample data...');

            // Insert sample order
            await sequelize.query(`
                INSERT INTO orders (
                    order_number, store_id, store_name, order_date, 
                    total_amount_eur, total_amount_syp, final_amount_eur, final_amount_syp,
                    status, payment_status, priority, notes, customer_name, customer_phone
                ) VALUES (
                    'ORD-2024-001', 1, 'Store Central Brussels', CURRENT_DATE,
                    50.00, 2750000.00, 50.00, 2750000.00,
                    'confirmed', 'pending', 'normal', 'Sample order for testing', 
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

            console.log('✅ Sample data inserted successfully');
        }

        console.log('🎉 Orders table setup completed successfully!');

    } catch (error) {
        console.error('❌ Error creating orders table:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
};

// Run the script
createOrdersTable()
    .then(() => {
        console.log('✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }); 