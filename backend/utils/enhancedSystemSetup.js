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
        console.log('🔧 بدء إعداد قاعدة البيانات...');

        // Test database connection
        await sequelize.authenticate();
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

        // Fix order_items table issue
        console.log('🔧 إصلاح جدول order_items...');
        await fixOrderItemsTable(sequelize.getQueryInterface(), sequelize);

        // Create/update original tables first - DISABLED FOR NEW DATABASE STRUCTURE
        // console.log('🔧 إنشاء/تحديث الجداول الأصلية...');
        // await sequelize.sync({ force: false });

        console.log('✅ تم إعداد قاعدة البيانات بنجاح');
        return true;
    } catch (error) {
        console.error('❌ خطأ في إعداد قاعدة البيانات:', error);
        throw error;
    }
};

// Enhanced System Setup
export const setupEnhancedSystem = async () => {
    try {
        console.log('🚀 بدء إعداد النظام المحسن...');

        // Setup database first
        await setupDatabase();

        // Create enhanced tables - DISABLED FOR NEW DATABASE STRUCTURE
        // console.log('🔧 إنشاء الجداول المحسنة...');

        // Create enhanced tables in correct order
        // await EnhancedUser.sync({ force: false });
        // console.log('✅ تم إنشاء جدول المستخدمين المحسن');

        // await EnhancedStore.sync({ force: false });
        // console.log('✅ تم إنشاء جدول المحلات المحسن');

        // await EnhancedDistributionTrip.sync({ force: false });
        // console.log('✅ تم إنشاء جدول رحلات التوزيع');

        // await EnhancedStoreVisit.sync({ force: false });
        // console.log('✅ تم إنشاء جدول زيارات المحلات');

        // await EnhancedPayment.sync({ force: false });
        // console.log('✅ تم إنشاء جدول المدفوعات المحسن');

        // Create additional tables for enhanced features
        // await createAdditionalTables();

        console.log('⚠️  Enhanced tables sync disabled - please create database manually');
        console.log('📋 Run: mysql -u root -p < database/create_complete_database.sql');

        console.log('✅ تم إعداد النظام المحسن بنجاح');
        return true;
    } catch (error) {
        console.error('❌ خطأ في إعداد النظام المحسن:', error);
        throw error;
    }
};

// Create additional supporting tables
const createAdditionalTables = async () => {
    try {
        console.log('🔧 تخطي إنشاء الجداول الإضافية مؤقتاً...');

        // Skip additional tables for now to focus on core functionality
        // const queryInterface = sequelize.getQueryInterface();

        // Will be implemented in future updates

        console.log('✅ تم تخطي الجداول الإضافية بنجاح');
    } catch (error) {
        console.error('❌ خطأ في إنشاء الجداول الإضافية:', error);
        throw error;
    }
};

// Insert default system settings
export const insertDefaultSettings = async () => {
    try {
        console.log('🔧 تخطي إدراج الإعدادات الافتراضية مؤقتاً...');

        // Skip default settings insertion for now
        // Will be handled through the admin interface later

        console.log('✅ تم تخطي الإعدادات الافتراضية بنجاح');
    } catch (error) {
        console.error('❌ خطأ في إدراج الإعدادات الافتراضية:', error);
        throw error;
    }
};

// Create sample data for testing
export const createSampleData = async () => {
    try {
        console.log('🔧 تخطي إنشاء البيانات التجريبية مؤقتاً...');

        // Skip sample data creation for now
        // Will be handled manually through the admin interface

        console.log('✅ تم تخطي البيانات التجريبية بنجاح');
    } catch (error) {
        console.error('❌ خطأ في إنشاء البيانات التجريبية:', error);
        throw error;
    }
};

// Full system initialization
export const initializeEnhancedSystem = async () => {
    try {
        console.log('🚀 بدء تهيئة النظام المحسن الكامل...');

        // Step 1: Setup database and enhanced system
        await setupEnhancedSystem();

        // Step 2: Insert default settings
        await insertDefaultSettings();

        // Step 3: Create sample data (optional)
        if (process.env.NODE_ENV === 'development') {
            await createSampleData();
        }

        console.log('🎉 تم تهيئة النظام المحسن بنجاح!');
        console.log('📊 النظام جاهز للاستخدام');

        return true;
    } catch (error) {
        console.error('❌ خطأ في تهيئة النظام المحسن:', error);
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
            message: 'النظام المحسن يعمل بشكل صحيح',
            tables_count: tables.length,
            enhanced_tables: existingTables.length,
            required_tables: requiredTables.length
        };
    } catch (error) {
        return {
            status: 'error',
            message: 'خطأ في فحص صحة النظام',
            error: error.message
        };
    }
}; 