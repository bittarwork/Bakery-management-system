import { User, Store, Product, Order } from '../models/index.js';
import { systemLogger, dbLogger } from '../middleware/logger.js';
import sequelize from '../config/database.js';

/**
 * Optimized enhanced system initialization
 * Reduced operations for faster startup
 */
export const initializeEnhancedSystem = async () => {
    try {
        systemLogger.startup('Enhanced system initialization starting...');

        // Test database connection first
        await testDatabaseConnection();

        // Only run essential checks during startup
        if (process.env.NODE_ENV !== 'production') {
            await performBasicHealthCheck();
        }

        systemLogger.success('Enhanced system initialization completed');
        return { status: 'initialized', timestamp: new Date().toISOString() };

    } catch (error) {
        systemLogger.error('Enhanced system initialization failed:', error);
        throw error;
    }
};

/**
 * Test database connection
 */
const testDatabaseConnection = async () => {
    try {
        await sequelize.authenticate();
        dbLogger.info('Database connection verified');
    } catch (error) {
        dbLogger.error('Database connection failed', error);
        throw new Error('Database connection failed');
    }
};

/**
 * Basic health check (only essential operations)
 */
const performBasicHealthCheck = async () => {
    try {
        // Quick count queries instead of full data fetches
        const [userCount, storeCount, productCount] = await Promise.all([
            User.count({ limit: 1 }),
            Store.count({ limit: 1 }),
            Product.count({ limit: 1 })
        ]);

        dbLogger.info(`System entities verified - Users: ${userCount}, Stores: ${storeCount}, Products: ${productCount}`);

    } catch (error) {
        systemLogger.warning('Basic health check failed, but system can continue', error);
        // Don't throw error - system can still work
    }
};

/**
 * Comprehensive health check (for API endpoint)
 */
export const healthCheck = async () => {
    try {
        const startTime = Date.now();

        // Database connectivity check
        await sequelize.authenticate();

        // Quick model availability check
        const [users, stores, products, orders] = await Promise.allSettled([
            User.count({ limit: 1 }),
            Store.count({ limit: 1 }),
            Product.count({ limit: 1 }),
            Order.count({ limit: 1 })
        ]);

        const dbChecks = {
            users: users.status === 'fulfilled',
            stores: stores.status === 'fulfilled',
            products: products.status === 'fulfilled',
            orders: orders.status === 'fulfilled'
        };

        const allDbChecksPass = Object.values(dbChecks).every(check => check);
        const responseTime = Date.now() - startTime;

        return {
            status: allDbChecksPass ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            response_time_ms: responseTime,
            database: {
                connected: true,
                models: dbChecks
            },
            system: {
                environment: process.env.NODE_ENV || 'development',
                node_version: process.version,
                uptime: process.uptime(),
                memory_usage: process.memoryUsage()
            }
        };

    } catch (error) {
        return {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message,
            database: {
                connected: false
            }
        };
    }
};

/**
 * System metrics (lightweight version)
 */
export const getSystemMetrics = () => {
    return {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        environment: process.env.NODE_ENV || 'development',
        node_version: process.version
    };
};

/**
 * Reset system state (for maintenance)
 */
export const resetSystem = async () => {
    try {
        systemLogger.info('System reset initiated');

        // Clear any cached data or temporary states
        // This is a placeholder for future reset operations

        systemLogger.success('System reset completed');
        return { status: 'reset', timestamp: new Date().toISOString() };

    } catch (error) {
        systemLogger.error('System reset failed:', error);
        throw error;
    }
};

export default {
    initializeEnhancedSystem,
    healthCheck,
    getSystemMetrics,
    resetSystem
}; 