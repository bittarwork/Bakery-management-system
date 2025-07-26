const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config.env') });

console.log('🚀 Starting Complete Orders Table Fix...');

const completeOrdersTableFix = async () => {
    try {
        console.log('🔧 Fixing orders table with ALL missing columns...');

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

        console.log('📊 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // Get current table structure
        console.log('📊 Checking current orders table structure...');
        const [columns] = await sequelize.query('DESCRIBE orders');
        const existingColumns = columns.map(col => col.Field);
        
        console.log('📋 Current columns in database:');
        existingColumns.forEach(col => console.log(`   - ${col}`));

        // Define ALL columns that should exist based on Order.js model
        const requiredColumns = [
            // Basic order info
            { name: 'id', definition: 'INT AUTO_INCREMENT PRIMARY KEY' },
            { name: 'order_number', definition: 'VARCHAR(50) NOT NULL UNIQUE' },
            { name: 'store_id', definition: 'INT NOT NULL' },
            { name: 'store_name', definition: 'VARCHAR(100) NOT NULL' },
            { name: 'order_date', definition: 'DATE NOT NULL DEFAULT (CURRENT_DATE)' },
            { name: 'delivery_date', definition: 'DATE NULL' },
            
            // Amounts
            { name: 'total_amount_eur', definition: 'DECIMAL(10, 2) NOT NULL DEFAULT 0.00' },
            { name: 'total_amount_syp', definition: 'DECIMAL(15, 2) NOT NULL DEFAULT 0.00' },
            { name: 'discount_amount_eur', definition: 'DECIMAL(10, 2) NOT NULL DEFAULT 0.00' },
            { name: 'discount_amount_syp', definition: 'DECIMAL(15, 2) NOT NULL DEFAULT 0.00' },
            { name: 'final_amount_eur', definition: 'DECIMAL(10, 2) NOT NULL DEFAULT 0.00' },
            { name: 'final_amount_syp', definition: 'DECIMAL(15, 2) NOT NULL DEFAULT 0.00' },
            { name: 'total_cost_eur', definition: 'DECIMAL(10, 2) NOT NULL DEFAULT 0.00' },
            { name: 'total_cost_syp', definition: 'DECIMAL(15, 2) NOT NULL DEFAULT 0.00' },
            { name: 'commission_eur', definition: 'DECIMAL(10, 2) NOT NULL DEFAULT 0.00' },
            { name: 'commission_syp', definition: 'DECIMAL(15, 2) NOT NULL DEFAULT 0.00' },
            
            // Status and priority
            { name: 'priority', definition: "ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal'" },
            { name: 'status', definition: "ENUM('draft', 'pending', 'confirmed', 'prepared', 'delivered', 'cancelled') NOT NULL DEFAULT 'draft'" },
            { name: 'payment_status', definition: "ENUM('pending', 'partial', 'paid', 'overdue') NOT NULL DEFAULT 'pending'" },
            
            // Dates and currency
            { name: 'scheduled_delivery_date', definition: 'DATE NULL COMMENT "Scheduled delivery date"' },
            { name: 'currency', definition: "ENUM('EUR', 'SYP', 'MIXED') NOT NULL DEFAULT 'EUR'" },
            { name: 'exchange_rate', definition: 'DECIMAL(10, 4) NULL' },
            
            // JSON and text fields
            { name: 'gift_applied', definition: 'JSON NULL' },
            { name: 'notes', definition: 'TEXT NULL' },
            
            // User info
            { name: 'created_by', definition: 'INT NOT NULL' },
            { name: 'created_by_name', definition: 'VARCHAR(100) NULL' },
            
            // Distribution fields
            { name: 'assigned_distributor_id', definition: 'INT NULL' },
            { name: 'assigned_at', definition: 'DATETIME NULL COMMENT "When the order was assigned to distributor"' },
            { name: 'delivery_started_at', definition: 'DATETIME NULL COMMENT "When distributor started delivery"' },
            { name: 'delivery_completed_at', definition: 'DATETIME NULL COMMENT "When delivery was completed"' },
            { name: 'delivery_notes', definition: 'TEXT NULL COMMENT "Delivery notes from distributor"' },
            
            // Timestamps
            { name: 'created_at', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
            { name: 'updated_at', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
        ];

        // Check and add missing columns
        let columnsAdded = [];
        let columnsSkipped = [];

        for (const column of requiredColumns) {
            const columnExists = existingColumns.includes(column.name);

            if (!columnExists) {
                console.log(`➕ Adding missing column: ${column.name}`);
                try {
                    await sequelize.query(`ALTER TABLE orders ADD COLUMN ${column.name} ${column.definition}`);
                    console.log(`✅ Column ${column.name} added successfully`);
                    columnsAdded.push(column.name);
                } catch (error) {
                    console.error(`❌ Error adding column ${column.name}:`, error.message);
                }
            } else {
                columnsSkipped.push(column.name);
            }
        }

        // Add indexes for better performance
        console.log('🔍 Adding/updating indexes...');
        const indexesToAdd = [
            { name: 'idx_order_number', query: 'CREATE UNIQUE INDEX idx_order_number ON orders(order_number)' },
            { name: 'idx_store_id', query: 'CREATE INDEX idx_store_id ON orders(store_id)' },
            { name: 'idx_status', query: 'CREATE INDEX idx_status ON orders(status)' },
            { name: 'idx_payment_status', query: 'CREATE INDEX idx_payment_status ON orders(payment_status)' },
            { name: 'idx_order_date', query: 'CREATE INDEX idx_order_date ON orders(order_date)' },
            { name: 'idx_created_at', query: 'CREATE INDEX idx_created_at ON orders(created_at)' },
            { name: 'idx_assigned_distributor_id', query: 'CREATE INDEX idx_assigned_distributor_id ON orders(assigned_distributor_id)' },
            { name: 'idx_assigned_at', query: 'CREATE INDEX idx_assigned_at ON orders(assigned_at)' },
            { name: 'idx_delivery_started_at', query: 'CREATE INDEX idx_delivery_started_at ON orders(delivery_started_at)' },
            { name: 'idx_delivery_completed_at', query: 'CREATE INDEX idx_delivery_completed_at ON orders(delivery_completed_at)' },
            { name: 'idx_scheduled_delivery_date', query: 'CREATE INDEX idx_scheduled_delivery_date ON orders(scheduled_delivery_date)' },
            { name: 'idx_currency', query: 'CREATE INDEX idx_currency ON orders(currency)' },
            { name: 'idx_priority', query: 'CREATE INDEX idx_priority ON orders(priority)' },
            { name: 'idx_created_by', query: 'CREATE INDEX idx_created_by ON orders(created_by)' }
        ];

        for (const index of indexesToAdd) {
            try {
                await sequelize.query(index.query);
                console.log(`✅ Index ${index.name} added/updated successfully`);
            } catch (error) {
                if (error.message.includes('Duplicate key name') || 
                    error.message.includes('already exists') ||
                    error.message.includes('Duplicate entry')) {
                    console.log(`✅ Index ${index.name} already exists`);
                } else {
                    console.warn(`⚠️ Index ${index.name} warning:`, error.message);
                }
            }
        }

        // Verify the final table structure
        console.log('🔍 Verifying final orders table structure...');
        const [finalColumns] = await sequelize.query('DESCRIBE orders');
        
        console.log('📋 Final columns in orders table:');
        finalColumns.forEach(col => {
            const status = columnsAdded.includes(col.Field) ? '🆕' : '✅';
            console.log(`   ${status} ${col.Field} (${col.Type})`);
        });

        // Test the table with a sample query
        console.log('🧪 Testing table with sample query...');
        try {
            const [testResult] = await sequelize.query(`
                SELECT COUNT(*) as total_orders,
                       COUNT(CASE WHEN assigned_distributor_id IS NOT NULL THEN 1 END) as assigned_orders,
                       COUNT(CASE WHEN delivery_notes IS NOT NULL THEN 1 END) as orders_with_delivery_notes
                FROM orders
            `);
            
            console.log('📊 Table test results:');
            console.log(`   Total orders: ${testResult[0].total_orders}`);
            console.log(`   Assigned orders: ${testResult[0].assigned_orders}`);
            console.log(`   Orders with delivery notes: ${testResult[0].orders_with_delivery_notes}`);
            
        } catch (error) {
            console.error('❌ Table test failed:', error.message);
        }

        await sequelize.close();
        console.log('🎉 Complete orders table fix finished successfully!');

        return {
            success: true,
            message: 'Orders table structure completely updated',
            columnsAdded: columnsAdded,
            columnsSkipped: columnsSkipped.length,
            totalColumns: finalColumns.length
        };

    } catch (error) {
        console.error('❌ Error in complete orders table fix:', error);
        throw error;
    }
};

// Run the script
completeOrdersTableFix()
    .then((result) => {
        console.log('✅ Script completed successfully');
        console.log('📊 Summary:');
        console.log(`   - Columns added: ${result.columnsAdded.length}`);
        console.log(`   - Columns already existed: ${result.columnsSkipped}`);
        console.log(`   - Total columns now: ${result.totalColumns}`);
        console.log(`   - Added columns: ${result.columnsAdded.join(', ')}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error.message);
        process.exit(1);
    }); 