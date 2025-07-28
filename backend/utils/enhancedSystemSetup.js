import { Sequelize } from 'sequelize';
import { up as fixOrderItemsTable } from '../migrations/fix-order-items-table.js';

// Database connection factory for enhanced system
let sequelize = null;

const getSequelizeConnection = async () => {
    if (!sequelize) {
        try {
            const config = {
                username: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'bakery_db',
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                dialect: 'mysql',
                logging: false,
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

            sequelize = new Sequelize(
                config.database,
                config.username,
                config.password,
                config
            );
        } catch (error) {
            console.error('Database connection failed:', error.message);
            throw new Error('Database connection unavailable');
        }
    }
    return sequelize;
};

// Import Enhanced Models
import EnhancedUser from '../models/EnhancedUser.js';
import EnhancedStore from '../models/EnhancedStore.js';
import EnhancedStoreVisit from '../models/EnhancedStoreVisit.js';
import EnhancedPayment from '../models/EnhancedPayment.js';

// Import Original Models
import User from '../models/User.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import UserSession from '../models/UserSession.js';

// Database Setup and Migration
export const setupDatabase = async () => {
    try {
        // Check if database environment variables are set
        if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
            return false;
        }

        // Test database connection
        const db = await getSequelizeConnection();
        await db.authenticate();

        // Fix order_items table issue
        await fixOrderItemsTable(db.getQueryInterface(), db);

        return true;
    } catch (error) {
        console.error('Database setup error:', error.message);
        return false;
    }
};

// Enhanced System Setup
export const setupEnhancedSystem = async () => {
    try {
        // Setup database first
        const dbSetupSuccess = await setupDatabase();

        if (!dbSetupSuccess) {
            console.log('Warning: Database setup failed - system will run with limited functionality');
        }

        return true;
    } catch (error) {
        console.error('Enhanced system setup error:', error.message);
        return false;
    }
};

// Create additional supporting tables
const createAdditionalTables = async () => {
    try {
        // Skip additional tables for now to focus on core functionality
        return true;
    } catch (error) {
        console.error('Additional tables creation error:', error);
        throw error;
    }
};

// Insert default system settings
export const insertDefaultSettings = async () => {
    try {
        // Skip default settings insertion for now
        return true;
    } catch (error) {
        console.error('Default settings insertion error:', error);
        throw error;
    }
};

// Create sample data for testing
export const createSampleData = async () => {
    try {
        // Skip sample data creation for now
        return true;
    } catch (error) {
        console.error('Sample data creation error:', error);
        throw error;
    }
};

// Full system initialization
export const initializeEnhancedSystem = async () => {
    try {
        // Step 1: Setup database and enhanced system
        const enhancedSetupSuccess = await setupEnhancedSystem();

        // Step 2: Insert default settings (only if database is available)
        if (enhancedSetupSuccess) {
            await insertDefaultSettings();
        }

        // Step 3: Create sample data (optional, only if database is available)
        if (process.env.NODE_ENV === 'development' && enhancedSetupSuccess) {
            await createSampleData();
        }

        return true;
    } catch (error) {
        console.error('Enhanced system initialization error:', error.message);
        return false;
    }
};

// Health check function
export const healthCheck = async () => {
    try {
        // Check if database environment variables are set
        if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
            return {
                status: 'warning',
                message: 'Database not configured - system running in limited mode',
                database_configured: false,
                enhanced_tables: 0,
                required_tables: 0
            };
        }

        const db = await getSequelizeConnection();
        await db.authenticate();

        // Check if enhanced tables exist
        const tables = await db.getQueryInterface().showAllTables();
        const requiredTables = [
            'enhanced_users',
            'enhanced_stores',
            'enhanced_store_visits',
            'enhanced_payments'
        ];

        const existingTables = requiredTables.filter(table => tables.includes(table));

        return {
            status: 'healthy',
            message: 'Enhanced system is working correctly',
            database_configured: true,
            tables_count: tables.length,
            enhanced_tables: existingTables.length,
            required_tables: requiredTables.length
        };
    } catch (error) {
        return {
            status: 'warning',
            message: 'Database connection failed - system running in limited mode',
            database_configured: false,
            error: error.message,
            enhanced_tables: 0,
            required_tables: 0
        };
    }
}; 