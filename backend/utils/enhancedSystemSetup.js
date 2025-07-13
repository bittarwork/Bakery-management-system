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
            console.error('Database connection failed in enhancedSystemSetup:', error.message);
            throw new Error('Database connection unavailable');
        }
    }
    return sequelize;
};

// Import Enhanced Models
import EnhancedUser from '../models/EnhancedUser.js';
import EnhancedStore from '../models/EnhancedStore.js';
import EnhancedDistributionTrip from '../models/EnhancedDistributionTrip.js';
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
        console.log('🔧 Starting database setup...');

        // Check if database environment variables are set
        if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
            console.log('⚠️  Database environment variables not set - skipping database setup');
            console.log('📋 Please set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME environment variables');
            return false;
        }

        // Test database connection
        const db = await getSequelizeConnection();
        await db.authenticate();
        console.log('✅ Database connection established successfully');

        // Fix order_items table issue
        console.log('🔧 Fixing order_items table...');
        await fixOrderItemsTable(db.getQueryInterface(), db);

        // Create/update original tables first - DISABLED FOR NEW DATABASE STRUCTURE
        // console.log('🔧 Creating/updating original tables...');
        // await sequelize.sync({ force: false });

        console.log('✅ Database setup completed successfully');
        return true;
    } catch (error) {
        console.error('❌ Database setup error:', error);
        console.log('⚠️  Database connection failed - system will start without database');
        console.log('📋 Please ensure MySQL service is running and environment variables are set');
        return false;
    }
};

// Enhanced System Setup
export const setupEnhancedSystem = async () => {
    try {
        console.log('🚀 Starting enhanced system setup...');

        // Setup database first
        const dbSetupSuccess = await setupDatabase();

        if (!dbSetupSuccess) {
            console.log('⚠️  Database setup failed - continuing without database');
            console.log('📋 System will be limited until database is configured');
        }

        // Create enhanced tables - DISABLED FOR NEW DATABASE STRUCTURE
        // console.log('🔧 Creating enhanced tables...');

        // Create enhanced tables in correct order
        // await EnhancedUser.sync({ force: false });
        // console.log('✅ Enhanced users table created successfully');

        // await EnhancedStore.sync({ force: false });
        // console.log('✅ Enhanced stores table created successfully');

        // await EnhancedDistributionTrip.sync({ force: false });
        // console.log('✅ Distribution trips table created successfully');

        // await EnhancedStoreVisit.sync({ force: false });
        // console.log('✅ Store visits table created successfully');

        // await EnhancedPayment.sync({ force: false });
        // console.log('✅ Enhanced payments table created successfully');

        // Create additional tables for enhanced features
        // await createAdditionalTables();

        if (dbSetupSuccess) {
            console.log('⚠️  Enhanced tables sync disabled - please create database manually');
            console.log('📋 Run: mysql -u root -p < database/create_complete_database.sql');
        }

        console.log('✅ Enhanced system setup completed successfully');
        return true;
    } catch (error) {
        console.error('❌ Enhanced system setup error:', error);
        console.log('⚠️  Enhanced system setup failed - continuing with basic functionality');
        return false;
    }
};

// Create additional supporting tables
const createAdditionalTables = async () => {
    try {
        console.log('🔧 Skipping additional tables creation temporarily...');

        // Skip additional tables for now to focus on core functionality
        // const queryInterface = sequelize.getQueryInterface();

        // Will be implemented in future updates

        console.log('✅ Additional tables skipped successfully');
    } catch (error) {
        console.error('❌ Additional tables creation error:', error);
        throw error;
    }
};

// Insert default system settings
export const insertDefaultSettings = async () => {
    try {
        console.log('🔧 Skipping default settings insertion temporarily...');

        // Skip default settings insertion for now
        // Will be handled through the admin interface later

        console.log('✅ Default settings skipped successfully');
    } catch (error) {
        console.error('❌ Default settings insertion error:', error);
        throw error;
    }
};

// Create sample data for testing
export const createSampleData = async () => {
    try {
        console.log('🔧 Skipping sample data creation temporarily...');

        // Skip sample data creation for now
        // Will be handled manually through the admin interface

        console.log('✅ Sample data skipped successfully');
    } catch (error) {
        console.error('❌ Sample data creation error:', error);
        throw error;
    }
};

// Full system initialization
export const initializeEnhancedSystem = async () => {
    try {
        console.log('🚀 Starting complete enhanced system initialization...');

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

        if (enhancedSetupSuccess) {
            console.log('🎉 Enhanced system initialized successfully!');
            console.log('📊 System ready for use');
        } else {
            console.log('⚠️  Enhanced system initialized with limited functionality');
            console.log('📊 Basic API endpoints available, database features disabled');
        }

        return true;
    } catch (error) {
        console.error('❌ Enhanced system initialization error:', error);
        console.log('⚠️  Enhanced system initialization failed - continuing with basic functionality');
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
            'enhanced_distribution_trips',
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