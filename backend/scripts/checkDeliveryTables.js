/**
 * Check Delivery Tables Structure Script
 * Verifies the delivery scheduling tables exist and have the correct structure
 */

import mysql from 'mysql2/promise';

// Configuration [[memory:3455676]]
const DB_CONFIG = {
    host: 'shinkansen.proxy.rlwy.net',
    port: 24785,
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway'
};

async function checkDeliveryTablesStructure() {
    let connection;
    try {
        connection = await mysql.createConnection(DB_CONFIG);
        console.log('🔗 Connected to database successfully');

        // Check if delivery_schedules table exists
        const [tables] = await connection.execute(
            "SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = 'railway' AND table_name LIKE 'delivery_%'"
        );

        console.log('\n📋 Found delivery tables:');
        tables.forEach(table => {
            console.log(`  - ${table.TABLE_NAME}`);
        });

        // Check delivery_schedules table structure specifically
        if (tables.some(t => t.TABLE_NAME === 'delivery_schedules')) {
            console.log('\n🔍 Checking delivery_schedules table structure:');

            const [columns] = await connection.execute(
                "DESCRIBE delivery_schedules"
            );

            console.log('\n📊 Current columns in delivery_schedules:');
            columns.forEach(col => {
                console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
            });

            // Check if distributor_id column exists
            const distributorIdExists = columns.some(col => col.Field === 'distributor_id');
            if (!distributorIdExists) {
                console.log('\n❌ distributor_id column is missing!');
                console.log('🔧 Attempting to add the missing column...');

                try {
                    await connection.execute(`
                        ALTER TABLE delivery_schedules 
                        ADD COLUMN distributor_id INT NULL 
                        AFTER order_id,
                        ADD FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE SET NULL
                    `);
                    console.log('✅ Successfully added distributor_id column');
                } catch (error) {
                    console.log(`❌ Failed to add distributor_id column: ${error.message}`);
                }
            } else {
                console.log('✅ distributor_id column exists');
            }

            // Check for other missing columns that might be needed
            const requiredColumns = [
                'order_id', 'distributor_id', 'scheduled_date', 'scheduled_time_start',
                'scheduled_time_end', 'time_slot', 'delivery_type', 'priority', 'status',
                'delivery_address', 'delivery_instructions', 'contact_person', 'contact_phone',
                'contact_email', 'delivery_fee_eur', 'delivery_fee_syp', 'confirmation_token',
                'rescheduled_from', 'reschedule_count', 'gps_coordinates', 'estimated_duration_minutes',
                'delivery_rating', 'created_at', 'updated_at', 'created_by', 'updated_by'
            ];

            const existingColumns = columns.map(col => col.Field);
            const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

            if (missingColumns.length > 0) {
                console.log('\n⚠️ Missing columns detected:');
                missingColumns.forEach(col => console.log(`  - ${col}`));
            } else {
                console.log('\n✅ All required columns are present');
            }

        } else {
            console.log('\n❌ delivery_schedules table does not exist!');
            console.log('🔧 You need to run the setup script: node scripts/setupDeliveryScheduling.js');
        }

        // Test a simple query
        if (tables.some(t => t.TABLE_NAME === 'delivery_schedules')) {
            console.log('\n🧪 Testing a simple query...');
            try {
                const [testRows] = await connection.execute(
                    'SELECT COUNT(*) as count FROM delivery_schedules'
                );
                console.log(`✅ Query successful. Found ${testRows[0].count} records in delivery_schedules`);
            } catch (error) {
                console.log(`❌ Query failed: ${error.message}`);
            }
        }

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔒 Database connection closed');
        }
    }
}

// Run the check
checkDeliveryTablesStructure()
    .then(() => {
        console.log('\n🎯 Check completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Check failed:', error);
        process.exit(1);
    }); 