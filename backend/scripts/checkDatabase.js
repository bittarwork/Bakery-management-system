import mysql from 'mysql2/promise';

// Database configuration from Railway environment variables
const config = {
    host: process.env.DB_HOST || process.env.MYSQL_HOST,
    user: process.env.DB_USER || process.env.MYSQL_USER,
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE,
    port: process.env.DB_PORT || process.env.MYSQL_PORT || 3306
};

async function checkDatabase() {
    console.log('🔍 Checking Railway database connection...\n');

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

        // Check tables
        console.log('📋 Checking tables...');
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`✅ Found ${tables.length} tables:`);
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   - ${tableName}`);
        });

        // Check users table specifically
        console.log('\n👥 Checking users table...');
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
        console.log(`✅ Users table has ${users[0].count} records`);

        if (users[0].count > 0) {
            const [userDetails] = await connection.execute('SELECT username, email, role, status FROM users LIMIT 5');
            console.log('\n📋 Sample users:');
            userDetails.forEach(user => {
                console.log(`   - ${user.username} (${user.email}) - ${user.role} - ${user.status}`);
            });
        }

        // Check password hashes
        if (users[0].count > 0) {
            const [passwordHashes] = await connection.execute('SELECT username, LENGTH(password) as hash_length FROM users LIMIT 3');
            console.log('\n🔐 Password hash check:');
            passwordHashes.forEach(hash => {
                const isValid = hash.hash_length === 60;
                console.log(`   - ${hash.username}: ${isValid ? '✅ Valid' : '❌ Invalid'} (${hash.hash_length} chars)`);
            });
        }

        await connection.end();
        console.log('\n🎉 Database check completed successfully!');

    } catch (error) {
        console.error('\n❌ Error during database check:');
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

// Run the check
checkDatabase(); 