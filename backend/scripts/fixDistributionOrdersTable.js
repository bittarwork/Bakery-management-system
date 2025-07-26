import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config.env') });

console.log('🚀 Starting Distribution Orders Table Fix...');

const fixDistributionOrdersTable = async () => {
    try {
        console.log('🔧 Fixing orders table with distribution columns...');

        // Database configuration
        const sequelize = new Sequelize(
            process.env.DB_NAME,
            process.env.DB_USER,
            process.env.DB_PASSWORD,
            {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT || 3306,
                dialect: 'mysql',
                logging: (msg) => {
                    if (msg.includes('Executing')) {
                        console.log('📊 SQL:', msg.replace('Executing (default): ', ''));
                    }
                }
            }
        );

        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // Check current table structure
        console.log('📊 Checking current orders table structure...');
        const [columns] = await sequelize.query('DESCRIBE orders');

        const existingColumns = columns.map(col => col.Field);
        console.log('Current columns:', existingColumns.join(', '));

        // Distribution columns that need to be added
        const distributionColumns = [
            {
                name: 'assigned_at',
                definition: 'DATETIME NULL COMMENT "When the order was assigned to distributor"'
            },
            {
                name: 'delivery_started_at',
                definition: 'DATETIME NULL COMMENT "When distributor started delivery"'
            },
            {
                name: 'delivery_completed_at',
                definition: 'DATETIME NULL COMMENT "When delivery was completed"'
            },
            {
                name: 'total_cost_eur',
                definition: 'DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT "Total cost in EUR"'
            },
            {
                name: 'total_cost_syp',
                definition: 'DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT "Total cost in SYP"'
            },
            {
                name: 'commission_eur',
                definition: 'DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT "Commission in EUR"'
            },
            {
                name: 'commission_syp',
                definition: 'DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT "Commission in SYP"'
            },
            {
                name: 'scheduled_delivery_date',
                definition: 'DATE NULL COMMENT "Scheduled delivery date"'
            },
            {
                name: 'currency',
                definition: "ENUM('EUR', 'SYP', 'MIXED') NOT NULL DEFAULT 'EUR' COMMENT 'Order currency'"
            },
            {
                name: 'exchange_rate',
                definition: 'DECIMAL(10, 4) NULL COMMENT "Exchange rate used"'
            },
            {
                name: 'gift_applied',
                definition: 'JSON NULL COMMENT "Gift/discount details applied"'
            },
            {
                name: 'created_by_name',
                definition: 'VARCHAR(100) NULL COMMENT "Name of user who created the order"'
            }
        ];

        // Add missing columns
        for (const column of distributionColumns) {
            const columnExists = existingColumns.includes(column.name);

            if (!columnExists) {
                console.log(`➕ Adding column: ${column.name}`);
                try {
                    await sequelize.query(`ALTER TABLE orders ADD COLUMN ${column.name} ${column.definition}`);
                    console.log(`✅ Column ${column.name} added successfully`);
                } catch (error) {
                    console.error(`❌ Error adding column ${column.name}:`, error.message);
                }
            } else {
                console.log(`✅ Column ${column.name} already exists`);
            }
        }

        // Update status ENUM to include 'prepared' if not exists
        console.log('🔄 Updating status ENUM values...');
        try {
            await sequelize.query(`
                ALTER TABLE orders 
                MODIFY COLUMN status ENUM('draft', 'pending', 'confirmed', 'prepared', 'delivered', 'cancelled') 
                NOT NULL DEFAULT 'draft'
            `);
            console.log('✅ Status ENUM updated successfully');
        } catch (error) {
            console.log('⚠️ Status ENUM update warning:', error.message);
        }

        // Add missing indexes for distribution columns
        console.log('🔍 Adding distribution-related indexes...');
        const indexesToAdd = [
            {
                name: 'idx_assigned_at',
                query: 'CREATE INDEX idx_assigned_at ON orders(assigned_at)'
            },
            {
                name: 'idx_delivery_started_at',
                query: 'CREATE INDEX idx_delivery_started_at ON orders(delivery_started_at)'
            },
            {
                name: 'idx_delivery_completed_at',
                query: 'CREATE INDEX idx_delivery_completed_at ON orders(delivery_completed_at)'
            },
            {
                name: 'idx_scheduled_delivery_date',
                query: 'CREATE INDEX idx_scheduled_delivery_date ON orders(scheduled_delivery_date)'
            },
            {
                name: 'idx_currency',
                query: 'CREATE INDEX idx_currency ON orders(currency)'
            }
        ];

        for (const index of indexesToAdd) {
            try {
                await sequelize.query(index.query);
                console.log(`✅ Index ${index.name} added successfully`);
            } catch (error) {
                if (error.message.includes('Duplicate key name')) {
                    console.log(`✅ Index ${index.name} already exists`);
                } else {
                    console.warn(`⚠️ Index ${index.name} creation warning:`, error.message);
                }
            }
        }

        // Verify the changes
        console.log('🔍 Verifying orders table after fixes...');
        const [updatedColumns] = await sequelize.query('DESCRIBE orders');
        console.log(`✅ Orders table now has ${updatedColumns.length} columns`);

        // Check if we have any orders to verify structure
        const [orderCount] = await sequelize.query("SELECT COUNT(*) as count FROM orders");
        console.log(`📊 Current orders count: ${orderCount[0].count}`);

        // If no orders exist, insert a test order to verify all columns work
        if (orderCount[0].count === 0) {
            console.log('📝 Inserting test order to verify structure...');
            try {
                await sequelize.query(`
                    INSERT INTO orders (
                        order_number, store_id, store_name, order_date,
                        total_amount_eur, total_amount_syp, 
                        final_amount_eur, final_amount_syp,
                        total_cost_eur, total_cost_syp,
                        commission_eur, commission_syp,
                        status, payment_status, currency, exchange_rate,
                        notes, created_by, created_by_name,
                        assigned_at, scheduled_delivery_date
                    ) VALUES (
                        'TEST-2025-001', 1, 'Test Store', CURRENT_DATE,
                        100.00, 180000.00,
                        100.00, 180000.00,
                        80.00, 144000.00,
                        20.00, 36000.00,
                        'confirmed', 'pending', 'EUR', 1800.0000,
                        'Test order for distribution system verification', 
                        1, 'System Administrator',
                        NOW(), CURRENT_DATE
                    )
                `);
                console.log('✅ Test order inserted successfully');

                // Clean up test order
                await sequelize.query("DELETE FROM orders WHERE order_number = 'TEST-2025-001'");
                console.log('🧹 Test order cleaned up');
                
            } catch (error) {
                console.error('❌ Error with test order:', error.message);
            }
        }

        await sequelize.close();
        console.log('🎉 Distribution orders table fixed successfully!');

        return {
            success: true,
            message: 'Distribution orders table structure updated successfully',
            columnsAdded: distributionColumns
                .filter(col => !existingColumns.includes(col.name))
                .map(col => col.name)
        };

    } catch (error) {
        console.error('❌ Error fixing distribution orders table:', error);
        throw error;
    }
};

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    fixDistributionOrdersTable()
        .then((result) => {
            console.log('✅ Script completed successfully');
            console.log('📊 Result:', result);
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error.message);
            process.exit(1);
        });
}

export default fixDistributionOrdersTable; 