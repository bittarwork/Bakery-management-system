import mysql from 'mysql2/promise';

// Database configuration for Railway MySQL
const dbConfig = {
    host: 'shinkansen.proxy.rlwy.net',
    port: 24785,
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway',
    ssl: false
};

console.log('🔧 Starting Simple Users Table Fix...');
console.log('📊 Connecting to Railway MySQL Database...');

async function fixUsersTable() {
    let connection;
    
    try {
        // Create database connection
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database successfully');

        // Check if current_location column exists
        console.log('🔍 Checking if current_location column exists...');
        const [checkResult] = await connection.execute(`
            SELECT COUNT(*) as column_exists
            FROM information_schema.columns 
            WHERE table_schema = 'railway' 
            AND table_name = 'users' 
            AND column_name = 'current_location'
        `);
        
        if (checkResult[0].column_exists === 0) {
            console.log('➕ Adding missing columns to users table...');
            
            // Add columns one by one
            const columns = [
                'ADD COLUMN current_location JSON NULL COMMENT "Current GPS location with timestamp for distributors"',
                'ADD COLUMN location_updated_at DATETIME NULL COMMENT "When location was last updated"',
                'ADD COLUMN vehicle_info JSON NULL COMMENT "Vehicle details for distributors"',
                'ADD COLUMN work_status ENUM("available", "busy", "offline", "break") NULL COMMENT "Current work status for distributors"',
                'ADD COLUMN daily_performance JSON NULL COMMENT "Daily performance metrics for distributors"'
            ];
            
            for (const column of columns) {
                try {
                    await connection.execute(`ALTER TABLE users ${column}`);
                    console.log(`   ✅ Added: ${column.split(' ')[2]}`);
                } catch (error) {
                    if (error.code === 'ER_DUP_FIELDNAME') {
                        console.log(`   ⚠️  Column ${column.split(' ')[2]} already exists, skipping...`);
                    } else {
                        console.error(`   ❌ Failed to add ${column.split(' ')[2]}:`, error.message);
                    }
                }
            }

            // Add indexes
            console.log('📊 Adding indexes...');
            const indexes = [
                'CREATE INDEX idx_users_work_status ON users(work_status)',
                'CREATE INDEX idx_users_location_updated ON users(location_updated_at)',
                'CREATE INDEX idx_users_role_status ON users(role, status)'
            ];
            
            for (const index of indexes) {
                try {
                    await connection.execute(index);
                    console.log(`   ✅ Added index: ${index.split(' ')[2]}`);
                } catch (error) {
                    if (error.code === 'ER_DUP_KEYNAME') {
                        console.log(`   ⚠️  Index already exists, skipping...`);
                    } else {
                        console.error(`   ❌ Failed to add index:`, error.message);
                    }
                }
            }
            
        } else {
            console.log('✅ current_location column already exists');
        }

        // Verify all columns exist
        console.log('🔍 Verifying new columns...');
        const [newColumns] = await connection.execute(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'railway' 
            AND table_name = 'users' 
            AND column_name IN ('current_location', 'location_updated_at', 'vehicle_info', 'work_status', 'daily_performance')
            ORDER BY column_name
        `);
        
        console.log('📋 Available columns:');
        newColumns.forEach(col => {
            console.log(`   ✅ ${col.column_name}`);
        });

        // Test the login functionality that was failing
        console.log('🧪 Testing user query that was failing...');
        
        const [testResult] = await connection.execute(`
            SELECT id, username, email, full_name, role, status, current_location
            FROM users 
            WHERE (username = 'admin' OR email = 'admin@bakery.com') 
            AND status = 'active'
            LIMIT 1
        `);
        
        if (testResult.length > 0) {
            console.log('✅ Login query test successful');
            console.log('👤 Test user found:', {
                id: testResult[0].id,
                username: testResult[0].username,
                email: testResult[0].email,
                role: testResult[0].role
            });
        } else {
            console.log('❌ No admin user found');
        }

    } catch (error) {
        console.error('❌ Fix failed:', error.message);
        console.error('📝 Full error:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔐 Database connection closed');
        }
    }
}

// Run the fix
fixUsersTable()
    .then(() => {
        console.log('🎉 Users table fix completed successfully!');
        console.log('🔄 You can now try logging in again.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Fix failed:', error.message);
        process.exit(1);
    }); 