import sequelize from '../config/database.js';

const testMigration = async () => {
    try {
        console.log('🔍 Testing database connection...');
        
        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection successful');
        
        // Check if distribution tables exist
        const tablesToCheck = [
            'distribution_trips',
            'daily_distribution_schedule',
            'location_tracking',
            'distribution_performance',
            'route_optimization_cache',
            'distribution_notifications',
            'distribution_settings'
        ];
        
        console.log('\n📋 Checking distribution tables...');
        
        for (const tableName of tablesToCheck) {
            try {
                const [results] = await sequelize.query(`SHOW TABLES LIKE '${tableName}'`);
                if (results.length > 0) {
                    console.log(`✅ Table '${tableName}' exists`);
                } else {
                    console.log(`❌ Table '${tableName}' not found`);
                }
            } catch (error) {
                console.log(`❌ Error checking table '${tableName}':`, error.message);
            }
        }
        
        // Check if new columns were added to existing tables
        console.log('\n📋 Checking new columns in existing tables...');
        
        try {
            const [orderColumns] = await sequelize.query("SHOW COLUMNS FROM orders LIKE 'distribution_trip_id'");
            if (orderColumns.length > 0) {
                console.log('✅ distribution_trip_id column added to orders table');
            } else {
                console.log('❌ distribution_trip_id column not found in orders table');
            }
        } catch (error) {
            console.log('❌ Error checking orders table:', error.message);
        }
        
        try {
            const [userColumns] = await sequelize.query("SHOW COLUMNS FROM users LIKE 'working_status'");
            if (userColumns.length > 0) {
                console.log('✅ working_status column added to users table');
            } else {
                console.log('❌ working_status column not found in users table');
            }
        } catch (error) {
            console.log('❌ Error checking users table:', error.message);
        }
        
        // Check distribution settings
        console.log('\n📋 Checking distribution settings...');
        try {
            const [settings] = await sequelize.query('SELECT COUNT(*) as count FROM distribution_settings');
            console.log(`✅ Distribution settings count: ${settings[0].count}`);
        } catch (error) {
            console.log('❌ Error checking distribution settings:', error.message);
        }
        
        console.log('\n🎉 Migration test completed!');
        
    } catch (error) {
        console.error('💥 Migration test failed:', error);
    } finally {
        await sequelize.close();
        console.log('🔌 Database connection closed');
    }
};

testMigration();