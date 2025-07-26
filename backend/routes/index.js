import express from 'express';

// Import existing routes
import authRoutes from './authRoutes.js';
import orderRoutes from './orderRoutes.js';
import storeRoutes from './stores.js';
import productRoutes from './products.js';
import paymentRoutes from './payments.js';
import reportRoutes from './reports.js';
import userRoutes from './userRoutes.js';

// Import new comprehensive routes
import comprehensiveDistributionRoutes from './comprehensiveDistribution.js';
import dashboardRoutes from './dashboard.js';
import notificationRoutes from './notificationRoutes.js';

// Import new enhanced routes
import taxRoutes from './taxRoutes.js';
import priceHistoryRoutes from './priceHistoryRoutes.js';
import refundRoutes from './refundRoutes.js';

// Import Phase 6 enhanced order management routes
import enhancedPricingRoutes from './enhancedPricingRoutes.js';
import distributorRoutes from './distributorRoutes.js';
import tempDeliveryRoutes from './tempDeliveryRoutes.js';
import distributionTripsRoutes from './distributionTrips.js';
import distributionRoutes from './distributionRoutes.js';
import systemRoutes from './systemRoutes.js';
import enhancedDistributorRoutes from './enhancedDistributorRoutes.js';

// Import AI Chat routes
import aiChatRoutes from './aiChatRoutes.js';
import conversationRoutes from './conversationRoutes.js';

const router = express.Router();

// API Documentation endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'نظام إدارة المخبزة - API الشامل',
        version: '2.0.0',
        features: [
            'إدارة شاملة للتوزيع',
            'نظام دفعات متقدم',
            'تتبع المخزون الذكي',
            'تقارير تفصيلية',
            'خرائط ومسارات ذكية',
            'تتبع المواقع',
            'إدارة الهدايا',
            'العملات المتعددة (EUR/SYP)',
            'تطبيق موبايل للموزعين'
        ],
        endpoints: {
            auth: '/api/auth',
            orders: '/api/orders',
            stores: '/api/stores',
            products: '/api/products',
            payments: '/api/payments',
            reports: '/api/reports',
            users: '/api/users',
            distribution: '/api/distribution',
            dashboard: '/api/dashboard',
            notifications: '/api/notifications',
            tax: '/api/tax',
            priceHistory: '/api/price-history',
            refunds: '/api/refunds',
            // Phase 6 Enhanced Order Management
            enhancedPricing: '/api/pricing',
            distributors: '/api/distributors',
            // AI Chat System
            aiChat: '/api/ai-chat'
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
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);

// Mount new comprehensive routes
router.use('/distribution', comprehensiveDistributionRoutes);
router.use('/distribution/trips', distributionTripsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);

// Mount enhanced routes
router.use('/tax', taxRoutes);
router.use('/price-history', priceHistoryRoutes);
router.use('/refunds', refundRoutes);

// Mount Phase 6 enhanced order management routes
router.use('/pricing', enhancedPricingRoutes);
router.use('/distributors', distributorRoutes);
router.use('/delivery', tempDeliveryRoutes);
router.use('/simple-distribution', distributionRoutes);

// Mount system routes
router.use('/system', systemRoutes);

// Mount enhanced distributor routes
router.use('/distributors', enhancedDistributorRoutes);

// Mount AI Chat routes
router.use('/ai-chat', aiChatRoutes);

// Mount conversation management routes
router.use('/conversations', conversationRoutes);

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
                distribution: 'active',
                payments: 'active',
                reports: 'active',
                maps: 'active',
                notifications: 'active'
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