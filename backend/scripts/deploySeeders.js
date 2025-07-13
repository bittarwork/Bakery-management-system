import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration from Railway environment variables
const config = {
    host: process.env.DB_HOST || process.env.MYSQL_HOST,
    user: process.env.DB_USER || process.env.MYSQL_USER,
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE,
    port: process.env.DB_PORT || process.env.MYSQL_PORT || 3306,
    multipleStatements: true // Allow multiple SQL statements
};

async function deploySeeders() {
    console.log('🚀 Starting seeder deployment to Railway database...\n');

    // Log configuration (without password)
    console.log('📊 Database Configuration:');
    console.log(`   Host: ${config.host}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Port: ${config.port}\n`);

    try {
        // Connect to database
        console.log('📡 Connecting to database...');
        const connection = await mysql.createConnection(config);
        console.log('✅ Connected successfully!\n');

        // Read seeder file
        const seederPath = path.join(__dirname, '../../database/seeders/01_users_seeder_fixed.sql');
        console.log(`📖 Reading seeder file: ${seederPath}`);

        if (!fs.existsSync(seederPath)) {
            throw new Error(`Seeder file not found: ${seederPath}`);
        }

        const seederContent = fs.readFileSync(seederPath, 'utf8');
        console.log('✅ Seeder file read successfully!\n');

        // Execute SQL
        console.log('⚡ Executing seeder...');
        await connection.execute(seederContent);
        console.log('✅ Seeder executed successfully!\n');

        // Verify the data
        console.log('🔍 Verifying data...');
        const [users] = await connection.execute('SELECT username, email, role, status FROM users');
        console.log(`✅ Found ${users.length} users in database`);

        // Show user details
        console.log('\n📋 Users created:');
        users.forEach(user => {
            console.log(`  - ${user.username} (${user.email}) - ${user.role} - ${user.status}`);
        });

        // Check password hash lengths
        const [passwordHashes] = await connection.execute('SELECT username, LENGTH(password) as hash_length FROM users');
        console.log('\n🔐 Password hash verification:');
        passwordHashes.forEach(hash => {
            const isValid = hash.hash_length === 60;
            console.log(`  - ${hash.username}: ${isValid ? '✅ Valid' : '❌ Invalid'} (${hash.hash_length} chars)`);
        });

        await connection.end();
        console.log('\n🎉 Seeder deployment completed successfully!');
        console.log('🔐 You can now login with:');
        console.log('   - admin@bakery.com / admin123');
        console.log('   - distributor1@bakery.com / distributor123');
        console.log('   - store_owner1@example.com / store123');

    } catch (error) {
        console.error('\n❌ Error during seeder deployment:');
        console.error(error.message);

        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Make sure your database is running and accessible');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n💡 Check your database credentials');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('\n💡 Database does not exist');
        }

        process.exit(1);
    }
}

// Run the deployment
deploySeeders(); 