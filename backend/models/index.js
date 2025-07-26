import { Sequelize } from 'sequelize';
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
import TempDeliverySchedule from './TempDeliverySchedule.js';
import DeliverySchedule from './DeliverySchedule.js';
import DeliveryCapacity from './DeliveryCapacity.js';
import DeliveryTracking from './DeliveryTracking.js';
import LocationHistory from './LocationHistory.js';
import DistributorDailyPerformance from './DistributorDailyPerformance.js';

// Database connection factory
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
            console.error('Database connection failed in models/index.js:', error.message);
            throw new Error('Database connection unavailable');
        }
    }
    return sequelize;
};

// Define associations here
const defineAssociations = () => {
    // Order associations
    Order.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
    Order.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
    Order.belongsTo(User, { foreignKey: 'assigned_distributor_id', as: 'assignedDistributor' });
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
    User.hasMany(Order, { foreignKey: 'assigned_distributor_id', as: 'distributedOrders' });
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

    // ===============================
    // Delivery Scheduling Associations
    // ===============================

    // DeliverySchedule associations
    DeliverySchedule.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
    DeliverySchedule.belongsTo(User, { foreignKey: 'distributor_id', as: 'distributor' });
    DeliverySchedule.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
    DeliverySchedule.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });
    DeliverySchedule.belongsTo(DeliverySchedule, { foreignKey: 'rescheduled_from', as: 'rescheduled_from_schedule' });
    DeliverySchedule.hasMany(DeliverySchedule, { foreignKey: 'rescheduled_from', as: 'rescheduled_to_schedules' });
    DeliverySchedule.hasOne(DeliveryTracking, { foreignKey: 'delivery_schedule_id', as: 'tracking' });

    // Order has delivery schedules
    Order.hasMany(DeliverySchedule, { foreignKey: 'order_id', as: 'delivery_schedules' });

    // User delivery scheduling associations
    User.hasMany(DeliverySchedule, { foreignKey: 'distributor_id', as: 'assigned_schedules' });
    User.hasMany(DeliverySchedule, { foreignKey: 'created_by', as: 'created_schedules' });

    // DeliveryTracking associations
    DeliveryTracking.belongsTo(DeliverySchedule, { foreignKey: 'delivery_schedule_id', as: 'schedule' });
    DeliveryTracking.belongsTo(User, { foreignKey: 'distributor_id', as: 'distributor' });

    // User tracking associations
    User.hasMany(DeliveryTracking, { foreignKey: 'distributor_id', as: 'delivery_trackings' });

    if (process.env.NODE_ENV !== 'test') {
        console.log('✅ Model associations defined');
    }
};

// Initialize models
const initializeModels = async () => {
    try {
        // Define associations
        defineAssociations();

        // Get database connection when needed
        const db = await getSequelizeConnection();

        // Sync models with database - DISABLED FOR NEW DATABASE STRUCTURE
        // if (process.env.NODE_ENV === 'development') {
        //     await db.sync({ alter: true });
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
            sequelize: db,
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
            DeliverySchedule,
            DeliveryCapacity,
            DeliveryTracking
        };
    } catch (error) {
        console.error('❌ Error initializing models:', error);
        throw error;
    }
};

export {
    getSequelizeConnection,
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
    DeliverySchedule,
    DeliveryCapacity,
    DeliveryTracking,
    LocationHistory,
    DistributorDailyPerformance,
    initializeModels
};

export default {
    getSequelizeConnection,
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
    TempDeliverySchedule,
    DeliverySchedule,
    DeliveryCapacity,
    DeliveryTracking,
    LocationHistory,
    DistributorDailyPerformance,
    initializeModels
}; 