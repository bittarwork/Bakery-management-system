import sequelize from '../config/database.js';
import User from './User.js';
import Store from './Store.js';
import Product from './Product.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import UserSession from './UserSession.js';

import Notification from './Notification.js';

// Import other models as we create them
// import Region from './Region.js';
// import DistributionSchedule from './DistributionSchedule.js';
// import Payment from './Payment.js';

// Define associations here
const defineAssociations = () => {
    // Order associations
    Order.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
    Order.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
    Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

    // OrderItem associations
    OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
    OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

    // Store associations
    Store.hasMany(Order, { foreignKey: 'store_id', as: 'orders' });

    // Product associations
    Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });

    // User associations
    User.hasMany(Order, { foreignKey: 'created_by', as: 'orders' });
    User.hasMany(UserSession, { foreignKey: 'user_id', as: 'sessions' });


    // UserSession associations
    UserSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });



    // Notification associations
    Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    Notification.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
    Notification.belongsTo(Order, { foreignKey: 'related_order_id', as: 'relatedOrder' });
    Notification.belongsTo(Product, { foreignKey: 'related_product_id', as: 'relatedProduct' });

    // User has many notifications
    User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

    if (process.env.NODE_ENV !== 'test') {
        console.log('✅ Model associations defined');
    }
};

// Initialize models
const initializeModels = async () => {
    try {
        // Define associations
        defineAssociations();

        // Sync models with database
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            if (process.env.NODE_ENV !== 'test') {
                console.log('✅ Models synchronized with database');
            }
        }

        return {
            sequelize,
            User,
            Store,
            Product,
            Order,
            OrderItem,
            UserSession,

            Notification
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
    Notification,
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
    Notification,
    initializeModels
}; 