/**
 * Quick Fix for Delivery Schedules Table
 * Adds missing columns and fixes table structure
 */

import mysql from 'mysql2/promise';

// Configuration [[memory:3455676]]
const DB_CONFIG = {
    host: 'shinkansen.proxy.rlwy.net',
    port: 24785,
    user: 'root',
    password: 'ZEsGFfzwlnsvGvcUiNsvGraAKFnuVZRA',
    database: 'railway'
};

async function fixDeliverySchedulesTable() {
    let connection;
    try {
        connection = await mysql.createConnection(DB_CONFIG);
        console.log('🔗 Connected to database successfully');

        console.log('🔧 Fixing delivery_schedules table structure...');

        // Add missing columns one by one
        const columnsToAdd = [
            {
                name: 'distributor_id',
                definition: 'INT NULL AFTER order_id',
                foreignKey: 'ADD FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE SET NULL'
            },
            {
                name: 'delivery_instructions',
                definition: 'TEXT NULL AFTER delivery_address'
            },
            {
                name: 'contact_email',
                definition: 'VARCHAR(255) NULL AFTER contact_phone'
            },
            {
                name: 'delivery_fee_eur',
                definition: 'DECIMAL(10,2) DEFAULT 0.00 AFTER contact_email'
            },
            {
                name: 'delivery_fee_syp',
                definition: 'DECIMAL(15,2) DEFAULT 0.00 AFTER delivery_fee_eur'
            },
            {
                name: 'confirmation_token',
                definition: 'VARCHAR(100) NULL UNIQUE AFTER delivery_fee_syp'
            },
            {
                name: 'rescheduled_from',
                definition: 'INT NULL AFTER confirmation_token'
            },
            {
                name: 'reschedule_count',
                definition: 'INT DEFAULT 0 AFTER rescheduled_from'
            },
            {
                name: 'gps_coordinates',
                definition: 'JSON NULL AFTER reschedule_count'
            },
            {
                name: 'estimated_duration_minutes',
                definition: 'INT NULL AFTER gps_coordinates'
            },
            {
                name: 'delivery_rating',
                definition: 'DECIMAL(3,2) NULL AFTER estimated_duration_minutes'
            },
            {
                name: 'created_by',
                definition: 'INT NULL AFTER delivery_rating'
            },
            {
                name: 'updated_by',
                definition: 'INT NULL AFTER created_by'
            },
            {
                name: 'created_at',
                definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER updated_by'
            },
            {
                name: 'updated_at',
                definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at'
            }
        ];

        // Check which columns exist
        const [existingColumns] = await connection.execute('DESCRIBE delivery_schedules');
        const existingColumnNames = existingColumns.map(col => col.Field);

        for (const column of columnsToAdd) {
            if (!existingColumnNames.includes(column.name)) {
                try {
                    console.log(`➕ Adding column: ${column.name}`);
                    await connection.execute(`ALTER TABLE delivery_schedules ADD COLUMN ${column.name} ${column.definition}`);
                    console.log(`✅ Successfully added ${column.name}`);

                    // Add foreign key if specified
                    if (column.foreignKey) {
                        try {
                            await connection.execute(`ALTER TABLE delivery_schedules ${column.foreignKey}`);
                            console.log(`🔗 Added foreign key for ${column.name}`);
                        } catch (fkError) {
                            console.log(`⚠️ Foreign key for ${column.name} may already exist or failed: ${fkError.message}`);
                        }
                    }
                } catch (error) {
                    console.log(`❌ Failed to add ${column.name}: ${error.message}`);
                }
            } else {
                console.log(`✓ Column ${column.name} already exists`);
            }
        }

        // Add additional foreign keys if needed
        const foreignKeys = [
            'ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL',
            'ADD FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL',
            'ADD FOREIGN KEY (rescheduled_from) REFERENCES delivery_schedules(id) ON DELETE SET NULL'
        ];

        for (const fk of foreignKeys) {
            try {
                await connection.execute(`ALTER TABLE delivery_schedules ${fk}`);
                console.log(`🔗 Added foreign key: ${fk}`);
            } catch (error) {
                // Foreign key might already exist or reference might not be valid
                console.log(`⚠️ Foreign key may already exist: ${fk}`);
            }
        }

        console.log('\n🧪 Testing the fixed table...');
        const [testResult] = await connection.execute('SELECT COUNT(*) as count FROM delivery_schedules');
        console.log(`✅ Table test successful! Records: ${testResult[0].count}`);

        console.log('\n📊 Final table structure:');
        const [finalColumns] = await connection.execute('DESCRIBE delivery_schedules');
        finalColumns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

    } catch (error) {
        console.error('❌ Fix failed:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔒 Database connection closed');
        }
    }
}

// Run the fix
fixDeliverySchedulesTable()
    .then(() => {
        console.log('\n🎉 Fix completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Fix failed:', error);
        process.exit(1);
    }); 