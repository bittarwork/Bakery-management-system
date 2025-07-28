/**
 * Simplified logging middleware
 */

/**
 * Simple logging middleware for development
 */
export const simpleLogger = (req, res, next) => {
    const method = req.method;
    const url = req.originalUrl || req.url;
    
    // Only log non-GET requests and important endpoints
    if (method !== 'GET' || url.includes('/api/auth') || url.includes('/api/orders')) {
        console.log(`${method} ${url}`);
    }
    
    next();
};

/**
 * Error logging middleware - simplified
 */
export const errorLogger = (err, req, res, next) => {
    const method = req.method;
    const url = req.originalUrl || req.url;
    
    console.log(`ERROR: ${method} ${url} - ${err.message}`);
    
    // Log stack trace only in development
    if (process.env.NODE_ENV === 'development') {
        console.log(err.stack);
    }
    
    next(err);
};

/**
 * Request logging middleware - minimal version
 */
export const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    
    // Override res.json to log only errors and important operations
    const originalJson = res.json;
    res.json = function (data) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        
        // Only log errors (4xx, 5xx) or slow requests (>1000ms)
        if (statusCode >= 400 || duration > 1000) {
            console.log(`${req.method} ${req.originalUrl} ${statusCode} ${duration}ms`);
            
            if (statusCode >= 400 && data && data.message) {
                console.log(`Error: ${data.message}`);
            }
        }
        
        return originalJson.call(this, data);
    };
    
    next();
};

export default {
    requestLogger,
    errorLogger,
    simpleLogger
}; 