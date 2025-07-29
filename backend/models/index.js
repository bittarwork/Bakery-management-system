import { Sequelize } from 'sequelize';
import User from './User.js';
import Store from './Store.js';
import Product from './Product.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Vehicle from './Vehicle.js';
import UserSession from './UserSession.js';
import Payment from './Payment.js';
import Notification from './Notification.js';

// Distribution system models
import DailyDistributionSchedule from './DailyDistributionSchedule.js';
import DistributionTrip from './DistributionTrip.js';
import LocationTracking from './LocationTracking.js';
import DistributionNotification from './DistributionNotification.js';
import DistributionSettings from './DistributionSettings.js';
import DistributionPerformance from './DistributionPerformance.js';

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

// Define simple associations
const defineAssociations = () => {
    // Order associations - Core system
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

    // User associations - Essential only
    User.hasMany(Order, { foreignKey: 'created_by', as: 'orders' });
    User.hasMany(Order, { foreignKey: 'assigned_distributor_id', as: 'distributedOrders' });
    User.hasMany(UserSession, { foreignKey: 'user_id', as: 'sessions' });
    User.hasMany(Payment, { foreignKey: 'created_by', as: 'payments' });
    User.hasMany(Vehicle, { foreignKey: 'assigned_distributor_id', as: 'assignedVehicles' });
    User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

    // Vehicle associations
    Vehicle.belongsTo(User, { foreignKey: 'assigned_distributor_id', as: 'assignedDistributor' });
    Vehicle.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

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

    // Distribution system associations
    DailyDistributionSchedule.belongsTo(User, { foreignKey: 'distributor_id', as: 'distributor' });
    DailyDistributionSchedule.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

    DistributionTrip.belongsTo(User, { foreignKey: 'distributor_id', as: 'distributor' });
    DistributionTrip.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

    LocationTracking.belongsTo(User, { foreignKey: 'distributor_id', as: 'distributor' });

    DistributionNotification.belongsTo(User, { foreignKey: 'distributor_id', as: 'distributor' });

    DistributionPerformance.belongsTo(User, { foreignKey: 'distributor_id', as: 'distributor' });

    if (process.env.NODE_ENV !== 'test') {
        console.log('✅ Simple model associations defined');
    }
};

// Initialize models
const initializeModels = async () => {
    try {
        // Define associations
        defineAssociations();

        // Get database connection when needed
        const db = await getSequelizeConnection();

        // Database should be created manually using migrations
        if (process.env.NODE_ENV !== 'test') {
            console.log('⚠️  Database sync disabled - using manual database structure');
            console.log('📋 Simple order system initialized successfully');
        }

        return {
            sequelize: db,
            User,
            Store,
            Product,
            Order,
            OrderItem,
            Vehicle,
            UserSession,
            Payment,
            Notification,
            DailyDistributionSchedule,
            DistributionTrip,
            LocationTracking,
            DistributionNotification,
            DistributionSettings,
            DistributionPerformance
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
    Vehicle,
    UserSession,
    Payment,
    Notification,
    DailyDistributionSchedule,
    DistributionTrip,
    LocationTracking,
    DistributionNotification,
    DistributionSettings,
    DistributionPerformance,
    initializeModels
};

export default {
    getSequelizeConnection,
    User,
    Store,
    Product,
    Order,
    OrderItem,
    Vehicle,
    UserSession,
    Payment,
    Notification,
    DailyDistributionSchedule,
    DistributionTrip,
    LocationTracking,
    DistributionNotification,
    DistributionSettings,
    DistributionPerformance,
    initializeModels
}; 