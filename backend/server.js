import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables first
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load from config.env first, then from .env
try {
    dotenv.config({ path: path.join(__dirname, 'config.env') });
} catch (err) {
    dotenv.config();
}

// Import routes
import authRoutes from './routes/authRoutes.js';
import storeRoutes from './routes/stores.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orderRoutes.js';
import distributionRoutes from './routes/distribution.js';
import paymentRoutes from './routes/payments.js';
import reportRoutes from './routes/reports.js';
import sessionRoutes from './routes/sessionRoutes.js';
import preferencesRoutes from './routes/preferencesRoutes.js';
import notificationRoutes from './routes/notifications.js';

// Import models and database initialization
import { initializeModels } from './models/index.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { requestLogger, errorLogger } from './middleware/logger.js';
import { updateSessionActivity, checkSessionExpiry, detectDevice } from './middleware/sessionMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Rate limiting - temporarily increased for development
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: process.env.MOBILE_RATE_LIMIT ? parseInt(process.env.MOBILE_RATE_LIMIT) : 200, // limit each IP to requests per minute
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health check and static files
        return req.path === '/api/health' || req.path.startsWith('/static/');
    },
    keyGenerator: (req) => {
        // Use user ID if available, otherwise use IP
        return req.user ? req.user.id.toString() : req.ip;
    }
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: function (origin, callback) {
        // قائمة الـ origins المسموح بها
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://localhost:5173', // Vite default port
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            // Flutter development origins
            'http://localhost:8080', // Flutter web development
            'http://127.0.0.1:8080',
            // Mobile app origins (for development)
            'capacitor://localhost',
            'ionic://localhost',
            // Allow requests with no origin (like mobile apps)
            null
        ];

        // السماح للطلبات بدون origin (مثل تطبيقات الموبايل)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // في بيئة التطوير، السماح لجميع الـ origins
            if (process.env.NODE_ENV === 'development') {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
if (process.env.NODE_ENV !== 'test') {
    app.use(requestLogger);
}

// Session middleware
app.use(detectDevice);
app.use(updateSessionActivity);
app.use(checkSessionExpiry);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/distribution', distributionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Bakery Management System API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use(notFound);
app.use(errorLogger);
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        // Initialize models and database
        await initializeModels();

        app.listen(PORT, () => {
            if (process.env.NODE_ENV !== 'test') {
                console.log('\n🍞 Bakery Management System API');
                console.log('═'.repeat(40));
                console.log(`🚀 Server: http://localhost:${PORT}`);
                console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log(`🔗 API: http://localhost:${PORT}/api`);
                console.log(`📊 Health: http://localhost:${PORT}/api/health`);
                console.log('═'.repeat(40));
                console.log('✅ Ready to accept requests!\n');
            }
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app; 