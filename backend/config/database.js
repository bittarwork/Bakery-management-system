import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load from config.env first, then from .env
try {
    dotenv.config({ path: path.join(__dirname, '../config.env') });
} catch (err) {
    dotenv.config();
}

// Database configuration
const config = {
    development: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bakery_db',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false, // استخدم middleware الجديد بدلاً من sequelize logging
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        timezone: '+02:00', // Brussels timezone
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            timestamps: true,
            underscored: true,
            freezeTableName: true
        }
    },
    test: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME_TEST || 'bakery_db_test',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 20,
            min: 0,
            acquire: 60000,
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
    }
};

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create Sequelize instance
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
);

// Test database connection
export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        if (process.env.NODE_ENV !== 'test') {
            console.log('✅ Database connection established successfully.');
        }

        // Sync models in development
        if (env === 'development') {
            await sequelize.sync({ alter: true });
            if (process.env.NODE_ENV !== 'test') {
                console.log('✅ Database models synchronized.');
            }
        }
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        throw error;
    }
};

// Close database connection
export const closeDB = async () => {
    try {
        await sequelize.close();
        if (process.env.NODE_ENV !== 'test') {
            console.log('✅ Database connection closed.');
        }
    } catch (error) {
        console.error('❌ Error closing database connection:', error);
        throw error;
    }
};

export default sequelize; 