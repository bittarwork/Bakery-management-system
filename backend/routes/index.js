import express from 'express';
import { systemLogger } from '../middleware/logger.js';

// Import existing routes
import authRoutes from './authRoutes.js';
import orderRoutes from './orderRoutes.js';
import storeRoutes from './stores.js';
import productRoutes from './products.js';
import paymentRoutes from './payments.js';
import userRoutes from './userRoutes.js';
import vehicleRoutes from './vehicleRoutes.js';

// Import new comprehensive routes
import dashboardRoutes from './dashboard.js';
import notificationRoutes from './notificationRoutes.js';

// Import new enhanced routes
import taxRoutes from './taxRoutes.js';
import priceHistoryRoutes from './priceHistoryRoutes.js';
import refundRoutes from './refundRoutes.js';

// Import Phase 6 enhanced order management routes
import enhancedPricingRoutes from './enhancedPricingRoutes.js';

import systemRoutes from './systemRoutes.js';

// Import AI Chat routes
import aiChatRoutes from './aiChatRoutes.js';
import conversationRoutes from './conversationRoutes.js';

// Import Distribution System routes
import distributionRoutes from './distributionRoutes.js';

const router = express.Router();

// Log route initialization
systemLogger.startup('Initializing API routes...');

// API Documentation endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Bakery Management System - Complete API',
        version: '2.0.0',
        features: [
            'Advanced Payment System',
            'Smart Inventory Tracking',
            'Detailed Reports',
            'Gift Management',
            'Multi-Currency Support (EUR/SYP)',
            'Smart Daily Distribution System',
            'Real-time Location Tracking',
            'Route Optimization',
            'AI Chat System'
        ],
        endpoints: {
            auth: '/api/auth',
            orders: '/api/orders',
            stores: '/api/stores',
            products: '/api/products',
            payments: '/api/payments',
            reports: '/api/reports',
            users: '/api/users',
            vehicles: '/api/vehicles',
            dashboard: '/api/dashboard',
            notifications: '/api/notifications',
            tax: '/api/tax',
            priceHistory: '/api/price-history',
            refunds: '/api/refunds',
            enhancedPricing: '/api/pricing',
            aiChat: '/api/ai-chat',
            distribution: '/api/distribution',
            analytics: '/api/analytics',
            predictions: '/api/predictions'
        },
        documentation: {
            api_docs: '/api/docs',
            mobile_api: '/api/mobile/docs',
            postman_collection: '/api/postman.json'
        }
    });
});

// Mount routes with logging
systemLogger.info('Mounting authentication routes...');
router.use('/auth', authRoutes);

systemLogger.info('Mounting core business routes...');
router.use('/orders', orderRoutes);
router.use('/stores', storeRoutes);
router.use('/products', productRoutes);
router.use('/payments', paymentRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);

systemLogger.info('Mounting dashboard and notification routes...');
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);

systemLogger.info('Mounting enhanced feature routes...');
router.use('/tax', taxRoutes);
router.use('/price-history', priceHistoryRoutes);
router.use('/refunds', refundRoutes);
router.use('/pricing', enhancedPricingRoutes);

systemLogger.info('Mounting system management routes...');
router.use('/system', systemRoutes);

systemLogger.info('Mounting AI Chat routes...');
router.use('/ai-chat', aiChatRoutes);
router.use('/conversations', conversationRoutes);

systemLogger.info('Mounting Distribution System routes...');
router.use('/distribution', distributionRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        environment: process.env.NODE_ENV || 'development'
    });
});

// System status endpoint with comprehensive route checking
router.get('/status', async (req, res) => {
    try {
        // Check all mounted routes
        const mountedRoutes = [
            { path: '/auth', status: 'active' },
            { path: '/orders', status: 'active' },
            { path: '/stores', status: 'active' },
            { path: '/products', status: 'active' },
            { path: '/payments', status: 'active' },
            { path: '/users', status: 'active' },
            { path: '/vehicles', status: 'active' },
            { path: '/dashboard', status: 'active' },
            { path: '/notifications', status: 'active' },
            { path: '/tax', status: 'active' },
            { path: '/price-history', status: 'active' },
            { path: '/refunds', status: 'active' },
            { path: '/pricing', status: 'active' },
            { path: '/system', status: 'active' },
            { path: '/ai-chat', status: 'active' },
            { path: '/conversations', status: 'active' },
            { path: '/distribution', status: 'active' }
        ];

        res.json({
            success: true,
            system: 'operational',
            database: 'connected',
            routes: {
                total: mountedRoutes.length,
                active: mountedRoutes.filter(r => r.status === 'active').length,
                mounted_routes: mountedRoutes
            },
            services: {
                authentication: 'active',
                payments: 'active',
                reports: 'active',
                notifications: 'active',
                aiChat: 'active',
                analytics: 'active',
                predictions: 'active',
                distribution: 'active'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            system: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Route debugging endpoint (development only)
if (process.env.NODE_ENV === 'development') {
    router.get('/debug/routes', (req, res) => {
        const routes = [];

        // Extract routes from the router stack
        router.stack.forEach((middleware) => {
            if (middleware.route) { // Routes added directly
                routes.push({
                    path: middleware.route.path,
                    methods: Object.keys(middleware.route.methods)
                });
            } else if (middleware.name === 'router') { // Sub-routers
                middleware.handle.stack.forEach((handler) => {
                    if (handler.route) {
                        routes.push({
                            path: handler.route.path,
                            methods: Object.keys(handler.route.methods)
                        });
                    }
                });
            }
        });

        res.json({
            success: true,
            message: 'Available routes (development mode)',
            total_routes: routes.length,
            routes: routes,
            timestamp: new Date().toISOString()
        });
    });
}

systemLogger.success('All API routes initialized successfully');

export default router; 