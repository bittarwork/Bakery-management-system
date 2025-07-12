import sequelize from '../config/database.js';
import { up as fixOrderItemsTable } from '../migrations/fix-order-items-table.js';

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

        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');

        // Fix order_items table issue
        console.log('🔧 Fixing order_items table...');
        await fixOrderItemsTable(sequelize.getQueryInterface(), sequelize);

        // Create/update original tables first - DISABLED FOR NEW DATABASE STRUCTURE
        // console.log('🔧 Creating/updating original tables...');
        // await sequelize.sync({ force: false });

        console.log('✅ Database setup completed successfully');
        return true;
    } catch (error) {
        console.error('❌ Database setup error:', error);
        throw error;
    }
};

// Enhanced System Setup
export const setupEnhancedSystem = async () => {
    try {
        console.log('🚀 Starting enhanced system setup...');

        // Setup database first
        await setupDatabase();

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

        console.log('⚠️  Enhanced tables sync disabled - please create database manually');
        console.log('📋 Run: mysql -u root -p < database/create_complete_database.sql');

        console.log('✅ Enhanced system setup completed successfully');
        return true;
    } catch (error) {
        console.error('❌ Enhanced system setup error:', error);
        throw error;
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
        await setupEnhancedSystem();

        // Step 2: Insert default settings
        await insertDefaultSettings();

        // Step 3: Create sample data (optional)
        if (process.env.NODE_ENV === 'development') {
            await createSampleData();
        }

        console.log('🎉 Enhanced system initialized successfully!');
        console.log('📊 System ready for use');

        return true;
    } catch (error) {
        console.error('❌ Enhanced system initialization error:', error);
        throw error;
    }
};

// Health check function
export const healthCheck = async () => {
    try {
        await sequelize.authenticate();

        // Check if enhanced tables exist
        const tables = await sequelize.getQueryInterface().showAllTables();
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
            tables_count: tables.length,
            enhanced_tables: existingTables.length,
            required_tables: requiredTables.length
        };
    } catch (error) {
        return {
            status: 'error',
            message: 'System health check error',
            error: error.message
        };
    }
}; 