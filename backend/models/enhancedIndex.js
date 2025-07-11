import sequelize from '../config/database.js';

// Enhanced Models
import EnhancedUser from './EnhancedUser.js';
import EnhancedStore from './EnhancedStore.js';
import EnhancedDistributionTrip from './EnhancedDistributionTrip.js';
import EnhancedStoreVisit from './EnhancedStoreVisit.js';
import EnhancedPayment from './EnhancedPayment.js';

// Original Models (for backward compatibility)
import User from './User.js';
import Store from './Store.js';
import Product from './Product.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import UserSession from './UserSession.js';
import Payment from './Payment.js';
import Notification from './Notification.js';

// Define Enhanced Model Associations
const defineEnhancedAssociations = () => {
    // ===============================
    // Enhanced User Associations
    // ===============================

    // User can create stores
    EnhancedUser.hasMany(EnhancedStore, { foreignKey: 'created_by', as: 'createdStores' });
    EnhancedUser.hasMany(EnhancedStore, { foreignKey: 'updated_by', as: 'updatedStores' });

    // User can be a distributor
    EnhancedUser.hasMany(EnhancedDistributionTrip, { foreignKey: 'distributor_id', as: 'distributorTrips' });

    // User can create/verify payments
    EnhancedUser.hasMany(EnhancedPayment, { foreignKey: 'created_by', as: 'createdPayments' });
    EnhancedUser.hasMany(EnhancedPayment, { foreignKey: 'verified_by', as: 'verifiedPayments' });

    // ===============================
    // Enhanced Store Associations
    // ===============================

    // Store belongs to creator/updater
    EnhancedStore.belongsTo(EnhancedUser, { foreignKey: 'created_by', as: 'creator' });
    EnhancedStore.belongsTo(EnhancedUser, { foreignKey: 'updated_by', as: 'updater' });

    // Store has many visits
    EnhancedStore.hasMany(EnhancedStoreVisit, { foreignKey: 'store_id', as: 'visits' });

    // Store has many payments
    EnhancedStore.hasMany(EnhancedPayment, { foreignKey: 'store_id', as: 'payments' });

    // ===============================
    // Enhanced Distribution Trip Associations
    // ===============================

    // Trip belongs to distributor
    EnhancedDistributionTrip.belongsTo(EnhancedUser, { foreignKey: 'distributor_id', as: 'distributor' });
    EnhancedDistributionTrip.belongsTo(EnhancedUser, { foreignKey: 'created_by', as: 'creator' });

    // Trip has many visits
    EnhancedDistributionTrip.hasMany(EnhancedStoreVisit, { foreignKey: 'trip_id', as: 'visits' });

    // ===============================
    // Enhanced Store Visit Associations
    // ===============================

    // Visit belongs to trip and store
    EnhancedStoreVisit.belongsTo(EnhancedDistributionTrip, { foreignKey: 'trip_id', as: 'trip' });
    EnhancedStoreVisit.belongsTo(EnhancedStore, { foreignKey: 'store_id', as: 'store' });

    // Visit can have payment
    EnhancedStoreVisit.hasOne(EnhancedPayment, { foreignKey: 'visit_id', as: 'payment' });

    // ===============================
    // Enhanced Payment Associations
    // ===============================

    // Payment belongs to store, creator, verifier
    EnhancedPayment.belongsTo(EnhancedStore, { foreignKey: 'store_id', as: 'store' });
    EnhancedPayment.belongsTo(EnhancedUser, { foreignKey: 'created_by', as: 'creator' });
    EnhancedPayment.belongsTo(EnhancedUser, { foreignKey: 'verified_by', as: 'verifier' });

    // Payment can belong to visit
    EnhancedPayment.belongsTo(EnhancedStoreVisit, { foreignKey: 'visit_id', as: 'visit' });

    console.log('✅ Enhanced model associations defined');
};

// Define Original Model Associations (for backward compatibility)
const defineOriginalAssociations = () => {
    // Order associations
    Order.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
    Order.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
    Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
    Order.hasMany(Payment, { foreignKey: 'order_id', as: 'payments' });

    // OrderItem associations
    OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
    OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

    // Store associations
    Store.hasMany(Order, { foreignKey: 'store_id', as: 'orders' });
    Store.hasMany(Payment, { foreignKey: 'store_id', as: 'payments' });

    // Product associations
    Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });

    // User associations
    User.hasMany(Order, { foreignKey: 'created_by', as: 'orders' });
    User.hasMany(UserSession, { foreignKey: 'user_id', as: 'sessions' });
    User.hasMany(Payment, { foreignKey: 'created_by', as: 'payments' });

    // Payment associations
    Payment.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
    Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
    Payment.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

    // UserSession associations
    UserSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

    // Notification associations
    Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    Notification.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
    Notification.belongsTo(Order, { foreignKey: 'related_order_id', as: 'relatedOrder' });
    Notification.belongsTo(Product, { foreignKey: 'related_product_id', as: 'relatedProduct' });
    Notification.belongsTo(Payment, { foreignKey: 'related_payment_id', as: 'relatedPayment' });

    // User has many notifications
    User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

    console.log('✅ Original model associations defined');
};

// Initialize Enhanced Models
const initializeEnhancedModels = async () => {
    try {
        // Define associations
        defineEnhancedAssociations();
        defineOriginalAssociations();

        // Sync models with database - DISABLED FOR NEW DATABASE STRUCTURE
        // if (process.env.NODE_ENV === 'development') {
        //     await sequelize.sync({ alter: true });
        //     console.log('✅ Enhanced models synchronized with database');
        // }

        console.log('⚠️  Enhanced models sync disabled - please create database manually');
        console.log('📋 Run: mysql -u root -p < database/create_complete_database.sql');

        return {
            sequelize,
            // Enhanced Models
            EnhancedUser,
            EnhancedStore,
            EnhancedDistributionTrip,
            EnhancedStoreVisit,
            EnhancedPayment,
            // Original Models
            User,
            Store,
            Product,
            Order,
            OrderItem,
            UserSession,
            Payment,
            Notification
        };
    } catch (error) {
        console.error('❌ Error initializing enhanced models:', error);
        throw error;
    }
};

// Model Statistics
const getModelStatistics = async () => {
    try {
        const stats = {
            enhanced_models: {
                users: await EnhancedUser.count(),
                stores: await EnhancedStore.count(),
                trips: await EnhancedDistributionTrip.count(),
                visits: await EnhancedStoreVisit.count(),
                payments: await EnhancedPayment.count()
            },
            original_models: {
                users: await User.count(),
                stores: await Store.count(),
                products: await Product.count(),
                orders: await Order.count(),
                order_items: await OrderItem.count(),
                payments: await Payment.count(),
                notifications: await Notification.count()
            }
        };

        return stats;
    } catch (error) {
        console.error('❌ Error getting model statistics:', error);
        throw error;
    }
};

// Health Check
const healthCheck = async () => {
    try {
        await sequelize.authenticate();
        const stats = await getModelStatistics();

        return {
            status: 'healthy',
            database: 'connected',
            models: 'initialized',
            statistics: stats,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

export {
    sequelize,
    // Enhanced Models
    EnhancedUser,
    EnhancedStore,
    EnhancedDistributionTrip,
    EnhancedStoreVisit,
    EnhancedPayment,
    // Original Models
    User,
    Store,
    Product,
    Order,
    OrderItem,
    UserSession,
    Payment,
    Notification,
    // Functions
    initializeEnhancedModels,
    getModelStatistics,
    healthCheck
};

export default {
    sequelize,
    // Enhanced Models
    EnhancedUser,
    EnhancedStore,
    EnhancedDistributionTrip,
    EnhancedStoreVisit,
    EnhancedPayment,
    // Original Models
    User,
    Store,
    Product,
    Order,
    OrderItem,
    UserSession,
    Payment,
    Notification,
    // Functions
    initializeEnhancedModels,
    getModelStatistics,
    healthCheck
}; 