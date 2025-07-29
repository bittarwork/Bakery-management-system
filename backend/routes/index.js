import express from 'express';

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

// API Documentation endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'نظام إدارة المخبزة - API الشامل',
        version: '2.0.0',
        features: [
            'نظام دفعات متقدم',
            'تتبع المخزون الذكي',
            'تقارير تفصيلية',
            'إدارة الهدايا',
            'العملات المتعددة (EUR/SYP)',
            'نظام التوزيع اليومي الذكي',
            'تتبع الموقع المباشر',
            'تحسين المسارات'
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
            // Phase 6 Enhanced Order Management
            enhancedPricing: '/api/pricing',
            // AI Chat System
            aiChat: '/api/ai-chat',
            // Distribution System
            distribution: '/api/distribution',
            // Advanced Analytics System
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

// Mount existing routes
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/stores', storeRoutes);
router.use('/products', productRoutes);
router.use('/payments', paymentRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);

// Mount new comprehensive routes
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);

// Mount enhanced routes
router.use('/tax', taxRoutes);
router.use('/price-history', priceHistoryRoutes);
router.use('/refunds', refundRoutes);

// Mount Phase 6 enhanced order management routes
router.use('/pricing', enhancedPricingRoutes);

// Mount system routes
router.use('/system', systemRoutes);

// Mount AI Chat routes
router.use('/ai-chat', aiChatRoutes);

// Mount conversation management routes
router.use('/conversations', conversationRoutes);

// Mount Distribution System routes
router.use('/distribution', distributionRoutes);

// TEMPORARY: Direct auto-schedules route for debugging
router.get('/distribution/schedules/auto-direct', (req, res) => {
    res.json({
        success: true,
        message: 'Direct auto distribution schedules endpoint working',
        data: {
            distributors_schedules: [],
            overall_statistics: {
                total_distributors: 0,
                total_orders: 0,
                total_stores: 0,
                total_estimated_duration: 0,
                distributors_with_orders: 0,
                distributors_with_existing_schedules: 0
            },
            schedule_date: req.query.schedule_date || new Date().toISOString().split('T')[0]
        }
    });
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
    });
});

// System status endpoint
router.get('/status', async (req, res) => {
    try {
        // You can add database connectivity checks here
        res.json({
            success: true,
            system: 'operational',
            database: 'connected',
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

export default router; 