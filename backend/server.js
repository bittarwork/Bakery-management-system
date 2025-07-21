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

// Add enhanced CORS preflight handling
app.use((req, res, next) => {
    // Set CORS headers
    const origin = req.headers.origin;

    // Allow localhost origins in all environments
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('0.0.0.0'))) {
        res.header('Access-Control-Allow-Origin', origin);
    } else if (origin === 'https://bakery-management-system-nine.vercel.app') {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-Time, Cache-Control, Pragma');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log(`🔧 Handling OPTIONS preflight for ${req.path} from origin: ${origin}`);
        res.status(200).end();
        return;
    }

    next();
});

app.use(cors({
    origin: function (origin, callback) {
        // List of allowed origins for production and development
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://localhost:3000', // React development server
            'http://localhost:5173', // Vite default port
            'http://localhost:4173', // Vite preview port
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:4173',
            // Production frontend domain
            'https://bakery-management-system-nine.vercel.app',
            // Flutter development origins
            'http://localhost:8080', // Flutter web development
            'http://127.0.0.1:8080',
            // Mobile app origins (for development)
            'capacitor://localhost',
            'ionic://localhost',
            // Allow requests with no origin (like mobile apps)
            null
        ];

        // Log CORS requests for debugging
        console.log('🌐 CORS Request from origin:', origin);
        console.log('✅ Allowed origins:', allowedOrigins);

        // Allow requests without origin (like mobile apps)
        if (!origin) {
            console.log('✅ Allowing request with no origin (mobile/postman)');
            return callback(null, true);
        }

        // Check if origin is in allowed list
        if (allowedOrigins.indexOf(origin) !== -1) {
            console.log('✅ Origin allowed:', origin);
            callback(null, true);
        } else {
            // In development environment, allow all localhost origins
            if (process.env.NODE_ENV === 'development' ||
                origin.includes('localhost') ||
                origin.includes('127.0.0.1') ||
                origin.includes('0.0.0.0')) {
                console.log('🔧 Development mode - allowing localhost origin:', origin);
                callback(null, true);
            } else {
                console.log('❌ Origin not allowed:', origin);
                // Allow in production for now to debug
                console.log('⚠️  Allowing for debugging in production...');
                callback(null, true);
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
        'Access-Control-Request-Headers',
        'X-Request-Time'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200 // For legacy browser support
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Handle favicon requests to avoid 404 errors
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No Content
});

// Serve static files (uploaded images) with CORS headers
app.use('/uploads', (req, res, next) => {
    // Add comprehensive CORS headers for static files
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Range');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.header('Referrer-Policy', 'no-referrer-when-downgrade');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
}, express.static(path.join(__dirname, 'storage/uploads'), {
    // Express static options for better performance
    maxAge: '1d', // Cache for 1 day
    etag: true,
    lastModified: true
}));

// Request logging middleware
if (process.env.NODE_ENV !== 'test') {
    app.use(requestLogger);
}

// Session middleware
app.use(detectDevice);
app.use(updateSessionActivity);
app.use(checkSessionExpiry);

// Mount all API routes
app.use('/api', apiRoutes);

// Health check with enhanced system status
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
app.use(errorLogger);
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        console.log('🍞 Bakery Management System - Enhanced Edition');
        console.log('═'.repeat(50));

        // Initialize original models and database first
        console.log('🔧 Initializing original system...');
        await initializeModels();

        // Initialize enhanced system
        console.log('🚀 Initializing enhanced system...');
        await initializeEnhancedSystem();

        app.listen(PORT, () => {
            if (process.env.NODE_ENV !== 'test') {
                console.log('\n🎉 Enhanced Bakery Management System API');
                console.log('═'.repeat(50));
                console.log(`🚀 Server: http://localhost:${PORT}`);
                console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log(`🔗 API: http://localhost:${PORT}/api`);
                console.log(`📊 Health: http://localhost:${PORT}/api/health`);
                console.log(`🌟 Enhanced Health: http://localhost:${PORT}/api/enhanced/health`);
                console.log('');
                console.log('📋 Enhanced Endpoints:');
                console.log(`   • Distribution: http://localhost:${PORT}/api/enhanced/distribution`);
                console.log(`   • Stores: http://localhost:${PORT}/api/enhanced/stores`);
                console.log(`   • Payments: http://localhost:${PORT}/api/enhanced/payments`);
                console.log('');
                console.log('💰 Currency Support: EUR (primary), SYP (secondary)');
                console.log('🗓️ Date Format: Gregorian Calendar');
                console.log('═'.repeat(50));
                console.log('✅ Enhanced system ready to accept requests!\n');
            }
        });
    } catch (error) {
        console.error('❌ Failed to start enhanced server:', error);
        process.exit(1);
    }
};

startServer();

export default app; 