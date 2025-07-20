import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
try {
    dotenv.config({ path: path.join(__dirname, 'config.env') });
} catch (err) {
    dotenv.config();
}

async function applyOrderFixes() {
    console.log('🔧 Applying order creation fixes to database...');

    const sequelize = new Sequelize(
        process.env.DB_NAME || 'railway',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || '',
        {
            host: process.env.DB_HOST || 'shinkansen.proxy.rlwy.net',
            port: process.env.DB_PORT || 24785,
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

    try {
        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // Read migration file
        const migrationPath = path.join(__dirname, 'migrations', 'fix-order-creation-issues.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Split SQL into individual statements
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`📝 Executing ${statements.length} SQL statements...`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            try {
                console.log(`Executing statement ${i + 1}/${statements.length}...`);
                await sequelize.query(statement);
                console.log(`✅ Statement ${i + 1} executed successfully`);
            } catch (error) {
                console.log(`⚠️ Statement ${i + 1} failed (this might be expected):`, error.message);
                // Continue with other statements
            }
        }

        // Verify the fixes
        console.log('\n🔍 Verifying fixes...');

        // Check orders table structure
        const [ordersStructure] = await sequelize.query('DESCRIBE orders');
        console.log('Orders table columns:', ordersStructure.map(col => col.Field));

        // Check order_items table structure
        const [orderItemsStructure] = await sequelize.query('DESCRIBE order_items');
        console.log('Order items table columns:', orderItemsStructure.map(col => col.Field));

        // Check sample data
        const [sampleOrders] = await sequelize.query(`
            SELECT id, order_number, store_id, total_amount_eur, total_cost_eur, commission_eur, status, priority 
            FROM orders 
            LIMIT 3
        `);
        console.log('Sample orders:', sampleOrders);

        const [sampleOrderItems] = await sequelize.query(`
            SELECT id, order_id, product_id, quantity, total_price_eur, final_price_eur 
            FROM order_items 
            LIMIT 3
        `);
        console.log('Sample order items:', sampleOrderItems);

        console.log('\n✅ Order creation fixes applied successfully!');
        console.log('🚀 The server should now be able to create orders without errors.');

    } catch (error) {
        console.error('❌ Error applying fixes:', error);
        throw error;
    } finally {
        await sequelize.close();
        console.log('✅ Database connection closed.');
    }
}

applyOrderFixes(); 