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

// Import comprehensive routes
import apiRoutes from './routes/index.js';

// Import models and database initialization
import { initializeModels } from './models/index.js';
import { initializeEnhancedSystem, healthCheck } from './utils/enhancedSystemSetup.js';

// Import cron job service
import cronJobService from './services/cronJobService.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { enhancedLogger, systemLogger } from './middleware/logger.js';
import { updateSessionActivity, checkSessionExpiry, detectDevice } from './middleware/sessionMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Enhanced startup logging
systemLogger.startup('🍞 Bakery Management System API - Starting Server...');
systemLogger.info(`Environment: ${NODE_ENV}`);
systemLogger.info(`Port: ${PORT}`);

// Enable trust proxy with secure configuration for Railway and other hosting platforms
app.set('trust proxy', ['127.0.0.1', '::1', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']);

// Rate limiting with secure configuration
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: process.env.MOBILE_RATE_LIMIT ? parseInt(process.env.MOBILE_RATE_LIMIT) : 200,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    // Use secure trust proxy configuration
    trustProxy: ['127.0.0.1', '::1', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'],
    skip: (req) => {
        return req.path === '/api/health' || req.path.startsWith('/static/');
    },
    keyGenerator: (req) => {
        // Use more secure key generation
        const forwarded = req.headers['x-forwarded-for'];
        const ip = forwarded ? forwarded.split(',')[0].trim() : req.connection.remoteAddress;
        return req.user ? `user:${req.user.id}` : `ip:${ip}`;
    }
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS configuration with proper headers
app.use(cors({
    origin: true, // Allow all origins for now
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Cache-Control',
        'Pragma',
        'X-Request-Time'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range', 'X-Total-Count'],
    maxAge: 86400,
    optionsSuccessStatus: 200,
    preflightContinue: false
}));

// Handle OPTIONS requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma, X-Request-Time');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    res.status(200).end();
});

// Add CORS headers to all responses
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma, X-Request-Time');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Basic middleware
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Serve static files with CORS headers
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Range');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
}, express.static(path.join(__dirname, 'storage/uploads'), {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));

// Enhanced request logging (only in development)
if (NODE_ENV === 'development') {
    app.use(enhancedLogger);
}

// Session middleware
app.use(detectDevice);
app.use(updateSessionActivity);
app.use(checkSessionExpiry);

// Mount all API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const enhancedHealth = await healthCheck();
        res.status(200).json({
            status: 'success',
            message: 'Bakery Management System API is running',
            timestamp: new Date().toISOString(),
            enhanced_system: enhancedHealth
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'System health check failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Enhanced system health check endpoint
app.get('/api/enhanced/health', async (req, res) => {
    try {
        const health = await healthCheck();
        res.status(health.status === 'healthy' ? 200 : 503).json(health);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Enhanced system health check failed',
            error: error.message
        });
    }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Optimized server startup
const startServer = async () => {
    try {
        systemLogger.startup('Initializing database models...');
        // Initialize original models and database
        await initializeModels();
        systemLogger.success('Database models initialized');

        systemLogger.startup('Initializing enhanced system...');
        // Initialize enhanced system
        await initializeEnhancedSystem();
        systemLogger.success('Enhanced system initialized');

        // Initialize cron job service for automatic distribution scheduling (only in non-test environment)
        if (NODE_ENV !== 'test') {
            systemLogger.startup('Initializing cron job service...');
            try {
                await cronJobService.initialize();
                systemLogger.success('Cron job service initialized');
            } catch (cronError) {
                systemLogger.warning('Cron job service initialization failed, continuing without it');
                systemLogger.error('Cron Error:', cronError);
            }
        }

        app.listen(PORT, () => {
            if (NODE_ENV !== 'test') {
                console.log('\n' + '='.repeat(60));
                console.log('🍞 Bakery Management System API - Server Ready');
                console.log('='.repeat(60));
                systemLogger.success(`Server running on: http://localhost:${PORT}`);
                systemLogger.info(`Health check: http://localhost:${PORT}/api/health`);
                systemLogger.info(`Environment: ${NODE_ENV}`);
                systemLogger.info(`Process ID: ${process.pid}`);
                systemLogger.success('All systems operational - Ready to accept requests');
                console.log('='.repeat(60) + '\n');
            }
        });
    } catch (error) {
        systemLogger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app; 