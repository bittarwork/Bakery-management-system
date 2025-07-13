/**
 * Middleware لتسجيل الطلبات الواردة بطريقة احترافية
 * Professional request logging middleware
 */

// Icons for different HTTP methods
const methodIcons = {
    GET: '📖',
    POST: '📝',
    PUT: '✏️',
    PATCH: '🔧',
    DELETE: '🗑️'
};

// Format time function
const formatTime = () => {
    return new Date().toLocaleString('en-GB', {
        timeZone: 'Europe/Brussels',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

// Format response duration
const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
};

// Extract user information
const getUserInfo = (req) => {
    if (req.user) {
        return `${req.user.full_name} (${req.user.role})`;
    }
    return 'غير مُسجل';
};

// Format data size
const formatSize = (bytes) => {
    if (!bytes) return '0B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)}${sizes[i]}`;
};

// Extract real IP address
const getRealIP = (req) => {
    return req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
        req.ip;
};

/**
 * Main logging middleware
 */
export const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const timestamp = formatTime();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = getRealIP(req);

    // Log request start
    const methodIcon = methodIcons[method] || '📄';

    console.log(`[${timestamp}] ${methodIcon} ${method} ${url} from ${ip ? ip.replace('::ffff:', '') : 'unknown'}`);

    // Log additional information for important requests
    if (method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
        const bodySize = JSON.stringify(req.body).length;
        console.log(`    📦 Body: ${formatSize(bodySize)}`);
    }

    // Override res.json to log response
    const originalJson = res.json;
    res.json = function (data) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        const statusClass = Math.floor(statusCode / 100);

        // Status emoji based on status class
        const statusEmoji = statusClass === 2 ? '✅' :
            statusClass === 3 ? '↩️' :
                statusClass === 4 ? '⚠️' :
                    statusClass === 5 ? '❌' : '❓';

        // Log response
        console.log(`[${formatTime()}] ${methodIcon} ${method} ${url} ${statusEmoji} ${statusCode} ${formatDuration(duration)}`);

        // Log user information for protected requests
        if (req.user) {
            console.log(`    👤 User: ${getUserInfo(req)}`);
        }

        // Log errors
        if (statusClass >= 4) {
            if (data && data.message) {
                console.log(`    ❌ Error: ${data.message}`);
            }
        }

        // Log important operations
        if (method !== 'GET' && data && data.success) {
            if (data.data && data.data.id) {
                console.log(`    ✅ Resource ID: ${data.data.id}`);
            }
        }

        console.log(`    ${'─'.repeat(50)}`);

        return originalJson.call(this, data);
    };

    next();
};

/**
 * Error logging middleware
 */
export const errorLogger = (err, req, res, next) => {
    const timestamp = formatTime();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const ip = getRealIP(req);

    console.log(`[${timestamp}] 💥 ERROR`);
    console.log(`    ${method} ${url} from ${ip ? ip.replace('::ffff:', '') : 'unknown'}`);
    console.log(`    Message: ${err.message}`);

    if (req.user) {
        console.log(`    User: ${getUserInfo(req)}`);
    }

    // Log stack trace in development only
    if (process.env.NODE_ENV === 'development') {
        console.log(`    Stack: ${err.stack}`);
    }

    console.log(`    ${'═'.repeat(50)}`);

    next(err);
};

/**
 * Simple logging middleware for development
 */
export const simpleLogger = (req, res, next) => {
    const method = req.method;
    const url = req.originalUrl || req.url;
    const methodIcon = methodIcons[method] || '📄';

    console.log(`${methodIcon} ${method} ${url}`);
    next();
};

export default {
    requestLogger,
    errorLogger,
    simpleLogger
}; 