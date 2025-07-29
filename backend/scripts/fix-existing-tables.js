import sequelize from '../config/database.js';

const fixExistingTables = async () => {
    try {
        console.log('🔧 Fixing existing tables...');

        // Test connection first
        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // Add columns to orders table
        console.log('📋 Adding columns to orders table...');
        const orderColumns = [
            'distribution_trip_id INT NULL',
            'scheduled_delivery_time TIME NULL',
            'actual_delivery_time DATETIME NULL',
            'delivery_notes TEXT NULL',
            'delivery_rating INT NULL',
            'delivery_feedback TEXT NULL'
        ];

        for (const column of orderColumns) {
            try {
                const columnName = column.split(' ')[0];
                await sequelize.query(`ALTER TABLE orders ADD COLUMN ${column}`);
                console.log(`✅ Added column '${columnName}' to orders table`);
            } catch (error) {
                if (error.message.includes('Duplicate column name')) {
                    console.log(`⚠️  Column '${column.split(' ')[0]}' already exists in orders table`);
                } else {
                    console.error(`❌ Error adding column to orders:`, error.message);
                }
            }
        }

        // Add columns to users table
        console.log('\n📋 Adding columns to users table...');
        const userColumns = [
            'current_trip_id INT NULL',
            'current_schedule_id INT NULL',
            'last_location_update TIMESTAMP NULL',
            'is_online BOOLEAN DEFAULT FALSE',
            'working_status ENUM("available", "busy", "break", "offline") DEFAULT "offline"',
            'daily_quota_orders INT DEFAULT 0',
            'daily_quota_distance DECIMAL(10,2) DEFAULT 0.00'
        ];

        for (const column of userColumns) {
            try {
                const columnName = column.split(' ')[0];
                await sequelize.query(`ALTER TABLE users ADD COLUMN ${column}`);
                console.log(`✅ Added column '${columnName}' to users table`);
            } catch (error) {
                if (error.message.includes('Duplicate column name')) {
                    console.log(`⚠️  Column '${column.split(' ')[0]}' already exists in users table`);
                } else {
                    console.error(`❌ Error adding column to users:`, error.message);
                }
            }
        }

        // Add columns to stores table
        console.log('\n📋 Adding columns to stores table...');
        const storeColumns = [
            'preferred_delivery_days JSON NULL',
            'delivery_time_slot VARCHAR(50) NULL',
            'delivery_instructions TEXT NULL',
            'last_delivery_date DATE NULL',
            'average_delivery_rating DECIMAL(3,2) DEFAULT 0.00'
        ];

        for (const column of storeColumns) {
            try {
                const columnName = column.split(' ')[0];
                await sequelize.query(`ALTER TABLE stores ADD COLUMN ${column}`);
                console.log(`✅ Added column '${columnName}' to stores table`);
            } catch (error) {
                if (error.message.includes('Duplicate column name')) {
                    console.log(`⚠️  Column '${column.split(' ')[0]}' already exists in stores table`);
                } else {
                    console.error(`❌ Error adding column to stores:`, error.message);
                }
            }
        }

        console.log('\n🎉 Existing tables fixed successfully!');

    } catch (error) {
        console.error('💥 Fix failed:', error);
    } finally {
        await sequelize.close();
        console.log('🔌 Database connection closed');
    }
};

fixExistingTables();