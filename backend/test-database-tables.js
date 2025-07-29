import sequelize from './config/database.js';

async function checkDistributionTables() {
    try {
        console.log('🔍 Checking distribution system tables...');
        
        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection successful');
        
        // List all tables
        const [results] = await sequelize.query("SHOW TABLES");
        console.log('\n📋 Available tables:');
        results.forEach(row => {
            const tableName = Object.values(row)[0];
            console.log(`- ${tableName}`);
        });
        
        // Check specific distribution tables
        const distributionTables = [
            'distribution_trips',
            'daily_distribution_schedule',
            'location_tracking',
            'distribution_performance',
            'distribution_notifications',
            'distribution_settings'
        ];
        
        console.log('\n🚚 Distribution tables status:');
        for (const table of distributionTables) {
            try {
                const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
                const count = result[0].count;
                console.log(`✅ ${table}: ${count} records`);
            } catch (error) {
                console.log(`❌ ${table}: NOT FOUND or ERROR - ${error.message}`);
            }
        }
        
        // Check for users with distributor role
        try {
            const [users] = await sequelize.query("SELECT id, username, role FROM users WHERE role = 'distributor' LIMIT 5");
            console.log('\n👥 Distributors in system:');
            users.forEach(user => {
                console.log(`- ID: ${user.id}, Username: ${user.username}, Role: ${user.role}`);
            });
        } catch (error) {
            console.log('❌ Could not check distributors:', error.message);
        }
        
        // Check for stores
        try {
            const [stores] = await sequelize.query("SELECT id, name FROM stores LIMIT 5");
            console.log('\n🏪 Stores in system:');
            stores.forEach(store => {
                console.log(`- ID: ${store.id}, Name: ${store.name}`);
            });
        } catch (error) {
            console.log('❌ Could not check stores:', error.message);
        }
        
    } catch (error) {
        console.error('💥 Database check failed:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkDistributionTables();