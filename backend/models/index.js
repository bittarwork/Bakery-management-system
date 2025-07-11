import sequelize from '../config/database.js';
import User from './User.js';
import Store from './Store.js';
import Product from './Product.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import UserSession from './UserSession.js';
import Payment from './Payment.js';
import Notification from './Notification.js';
import Distributor from './Distributor.js';
import DistributionTrip from './DistributionTrip.js';
import StoreVisit from './StoreVisit.js';

// Define associations here
const defineAssociations = () => {
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

    // Distributor associations
    Distributor.hasMany(DistributionTrip, { foreignKey: 'distributor_id', as: 'trips' });

    // DistributionTrip associations
    DistributionTrip.belongsTo(Distributor, { foreignKey: 'distributor_id', as: 'distributor' });
    DistributionTrip.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
    DistributionTrip.hasMany(StoreVisit, { foreignKey: 'trip_id', as: 'visits' });

    // StoreVisit associations
    StoreVisit.belongsTo(DistributionTrip, { foreignKey: 'trip_id', as: 'trip' });
    StoreVisit.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
    StoreVisit.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

    // Store additional associations
    Store.hasMany(StoreVisit, { foreignKey: 'store_id', as: 'visits' });

    // User additional associations  
    User.hasMany(DistributionTrip, { foreignKey: 'created_by', as: 'createdTrips' });

    // Payment additional associations
    Payment.belongsTo(User, { foreignKey: 'distributor_id', as: 'distributor' });
    Payment.belongsTo(StoreVisit, { foreignKey: 'visit_id', as: 'visit' });

    if (process.env.NODE_ENV !== 'test') {
        console.log('✅ Model associations defined');
    }
};

// Initialize models
const initializeModels = async () => {
    try {
        // Define associations
        defineAssociations();

        // Sync models with database - DISABLED FOR NEW DATABASE STRUCTURE
        // if (process.env.NODE_ENV === 'development') {
        //     await sequelize.sync({ alter: true });
        //     if (process.env.NODE_ENV !== 'test') {
        //         console.log('✅ Models synchronized with database');
        //     }
        // }

        // Database should be created manually using database/create_complete_database.sql
        if (process.env.NODE_ENV !== 'test') {
            console.log('⚠️  Database sync disabled - please create database manually');
            console.log('📋 Run: mysql -u root -p < database/create_complete_database.sql');
        }

        return {
            sequelize,
            User,
            Store,
            Product,
            Order,
            OrderItem,
            UserSession,
            Payment,
            Notification,
            Distributor,
            DistributionTrip,
            StoreVisit
        };
    } catch (error) {
        console.error('❌ Error initializing models:', error);
        throw error;
    }
};

export {
    sequelize,
    User,
    Store,
    Product,
    Order,
    OrderItem,
    UserSession,
    Payment,
    Notification,
    Distributor,
    DistributionTrip,
    StoreVisit,
    initializeModels
};

export default {
    sequelize,
    User,
    Store,
    Product,
    Order,
    OrderItem,
    UserSession,
    Payment,
    Notification,
    Distributor,
    DistributionTrip,
    StoreVisit,
    initializeModels
}; 