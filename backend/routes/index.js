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
            notifications: '/api/notifications'
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
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);

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