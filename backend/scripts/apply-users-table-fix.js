import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration for Railway MySQL
const dbConfig = {
    host: 'shinkansen.proxy.rlwy.net',
    port: 24785,
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway',
    ssl: false,
    multipleStatements: true
};

console.log('🔧 Starting Users Table Fix Migration...');
console.log('📊 Connecting to Railway MySQL Database...');

async function applyUserTableFix() {
    let connection;
    
    try {
        // Create database connection
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database successfully');

        // Read the migration SQL file
        const migrationPath = path.join(__dirname, '../migrations/fix-users-table-missing-fields.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('📄 Migration SQL loaded successfully');
        console.log('🚀 Executing migration...');

        // Execute the migration
        const [results] = await connection.execute(migrationSQL);
        
        console.log('✅ Migration executed successfully');
        
        // Verify the fix by checking if current_location column exists
        const [checkResult] = await connection.execute(`
            SELECT COUNT(*) as column_exists
            FROM information_schema.columns 
            WHERE table_schema = DATABASE() 
            AND table_name = 'users' 
            AND column_name = 'current_location'
        `);
        
        if (checkResult[0].column_exists > 0) {
            console.log('✅ current_location column added successfully');
            
            // Check all new columns
            const [newColumns] = await connection.execute(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = DATABASE() 
                AND table_name = 'users' 
                AND column_name IN ('current_location', 'location_updated_at', 'vehicle_info', 'work_status', 'daily_performance')
                ORDER BY column_name
            `);
            
            console.log('📋 New columns added:');
            newColumns.forEach(col => {
                console.log(`   ✅ ${col.column_name}`);
            });
            
        } else {
            console.log('❌ current_location column was not added');
        }

        // Test the login functionality
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
                role: testResult[0].role,
                current_location: testResult[0].current_location
            });
        } else {
            console.log('❌ No test user found');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('📝 Full error:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔐 Database connection closed');
        }
    }
}

// Run the migration
applyUserTableFix()
    .then(() => {
        console.log('🎉 Users table fix completed successfully!');
        console.log('🔄 You can now try logging in again.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Migration failed:', error.message);
        process.exit(1);
    }); 