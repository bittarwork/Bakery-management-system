import sequelize from '../config/database.js';
import { connectDB, closeDB } from '../config/database.js';

// List of tables we need for distributors and delivery scheduling
const REQUIRED_TABLES = [
    'distributors',
    'delivery_schedules',
    'distributor_assignments',
    'distribution_trips',
    'store_visits'
];

async function checkDistributorTables() {
    try {
        console.log('🔍 Checking distributor and delivery scheduling tables...\n');

        await connectDB();

        // Get all existing tables
        const [tables] = await sequelize.query("SHOW TABLES");
        const existingTables = tables.map(table => Object.values(table)[0]);

        console.log('📋 Existing tables in database:');
        console.log('='.repeat(50));
        existingTables.forEach(table => {
            console.log(`✅ ${table}`);
        });
        console.log('='.repeat(50));

        console.log('\n🔍 Checking required distributor tables:');
        console.log('='.repeat(50));

        const missingTables = [];

        for (const requiredTable of REQUIRED_TABLES) {
            const exists = existingTables.includes(requiredTable);
            if (exists) {
                console.log(`✅ ${requiredTable} - EXISTS`);

                // Get table structure
                try {
                    const [columns] = await sequelize.query(`DESCRIBE ${requiredTable}`);
                    console.log(`   → ${columns.length} columns`);
                } catch (error) {
                    console.log(`   → Error getting structure: ${error.message}`);
                }
            } else {
                console.log(`❌ ${requiredTable} - MISSING`);
                missingTables.push(requiredTable);
            }
        }

        console.log('='.repeat(50));

        // Summary
        console.log('\n📊 Summary:');
        console.log(`Total required tables: ${REQUIRED_TABLES.length}`);
        console.log(`Existing tables: ${REQUIRED_TABLES.length - missingTables.length}`);
        console.log(`Missing tables: ${missingTables.length}`);

        if (missingTables.length > 0) {
            console.log('\n⚠️  Missing tables:');
            missingTables.forEach(table => {
                console.log(`   - ${table}`);
            });

            console.log('\n💡 Next steps:');
            console.log('   1. Create the missing tables using migrations');
            console.log('   2. Run: node scripts/createDistributorTables.js');
        } else {
            console.log('\n✅ All required tables exist!');
        }

        // Check if users table has distributor role
        if (existingTables.includes('users')) {
            console.log('\n🔍 Checking users table for distributor support:');
            try {
                const [userColumns] = await sequelize.query("DESCRIBE users");
                const roleColumn = userColumns.find(col => col.Field === 'role');

                if (roleColumn) {
                    console.log(`✅ role column exists: ${roleColumn.Type}`);

                    // Check if distributor role exists
                    const [distributorUsers] = await sequelize.query(
                        "SELECT COUNT(*) as count FROM users WHERE role = 'distributor'"
                    );
                    console.log(`📊 Current distributor users: ${distributorUsers[0].count}`);
                } else {
                    console.log('❌ role column not found in users table');
                }
            } catch (error) {
                console.log(`⚠️  Error checking users table: ${error.message}`);
            }
        }

        await closeDB();

    } catch (error) {
        console.error('❌ Error checking distributor tables:', error);
        process.exit(1);
    }
}

// Run the check
checkDistributorTables(); 