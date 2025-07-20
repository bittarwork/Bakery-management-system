import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
try {
    dotenv.config({ path: path.join(__dirname, 'config.env') });
} catch (err) {
    dotenv.config();
}

import { Sequelize } from 'sequelize';

async function testDatabaseConnection() {
    console.log('Testing database connection...');
    console.log('Environment variables:');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');

    const config = {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bakery_db',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: console.log,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        timezone: '+02:00',
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            timestamps: true,
            underscored: true,
            freezeTableName: true
        }
    };

    console.log('Database config:', {
        ...config,
        password: config.password ? '***SET***' : 'NOT SET'
    });

    const sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    );

    try {
        await sequelize.authenticate();
        console.log('✅ Database connection successful!');

        // Test a simple query
        const [results] = await sequelize.query('SELECT 1 as test');
        console.log('✅ Database query successful:', results);

        await sequelize.close();
        console.log('✅ Database connection closed');

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Full error:', error);

        if (error.parent) {
            console.error('Parent error:', error.parent.message);
            console.error('Error code:', error.parent.code);
        }
    }
}

testDatabaseConnection(); 