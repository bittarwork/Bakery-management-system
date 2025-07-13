import mysql from 'mysql2/promise';

// Direct database configuration for Railway
const config = {
    host: 'shinkansen.proxy.rlwy.net',
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway',
    port: 24785
};

async function checkUsers() {
    console.log('🔍 Checking users in Railway database...\n');

    try {
        // Connect to database
        console.log('📡 Connecting to database...');
        const connection = await mysql.createConnection(config);
        console.log('✅ Connected successfully!\n');

        // Check all users
        console.log('👥 All users in database:');
        const [users] = await connection.execute('SELECT username, email, role, status FROM users');

        users.forEach((user, index) => {
            console.log(`${index + 1}. Username: "${user.username}" | Email: "${user.email}" | Role: ${user.role} | Status: ${user.status}`);
        });

        // Check specific admin user
        console.log('\n🔍 Checking admin user specifically:');
        const [adminUsers] = await connection.execute('SELECT username, email, role, status FROM users WHERE username = "admin"');

        if (adminUsers.length > 0) {
            console.log('✅ Admin user found:');
            adminUsers.forEach(user => {
                console.log(`   Username: "${user.username}" | Email: "${user.email}" | Role: ${user.role} | Status: ${user.status}`);
            });
        } else {
            console.log('❌ No admin user found with username "admin"');
        }

        // Check users with admin@bakery.com email
        console.log('\n🔍 Checking users with admin@bakery.com email:');
        const [emailUsers] = await connection.execute('SELECT username, email, role, status FROM users WHERE email = "admin@bakery.com"');

        if (emailUsers.length > 0) {
            console.log('✅ Users with admin@bakery.com email:');
            emailUsers.forEach(user => {
                console.log(`   Username: "${user.username}" | Email: "${user.email}" | Role: ${user.role} | Status: ${user.status}`);
            });
        } else {
            console.log('❌ No users found with email "admin@bakery.com"');
        }

        await connection.end();
        console.log('\n🎉 Database check completed!');

    } catch (error) {
        console.error('\n❌ Error during database check:');
        console.error(error.message);
        process.exit(1);
    }
}

// Run the check
checkUsers(); 