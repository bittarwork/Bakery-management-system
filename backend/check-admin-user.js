import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'shinkansen.proxy.rlwy.net',
    port: process.env.DB_PORT || 24785,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: process.env.DB_NAME || 'railway'
};

async function checkAdminUser() {
    console.log('🔍 Checking admin user in database...');
    console.log('🌐 Database config:', {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        database: dbConfig.database
    });

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connected successfully');

        // Check if users table exists
        const [tables] = await connection.execute('SHOW TABLES LIKE "users"');
        if (tables.length === 0) {
            console.log('❌ Users table does not exist');
            return;
        }

        // Get all users
        const [users] = await connection.execute('SELECT id, username, email, role, status, created_at FROM users LIMIT 10');

        console.log('\n📋 Users in database:');
        if (users.length === 0) {
            console.log('❌ No users found in database');
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}, Status: ${user.status}`);
            });
        }

        // Check for admin user specifically
        const [adminUsers] = await connection.execute('SELECT id, username, email, role, status FROM users WHERE role = "admin" OR username = "admin"');

        console.log('\n👑 Admin users:');
        if (adminUsers.length === 0) {
            console.log('❌ No admin users found');
        } else {
            adminUsers.forEach((user, index) => {
                console.log(`${index + 1}. ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}, Status: ${user.status}`);
            });
        }

    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkAdminUser(); 