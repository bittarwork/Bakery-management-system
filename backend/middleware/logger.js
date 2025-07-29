import chalk from 'chalk';

// Enhanced request logging with detailed information
export const enhancedLogger = (req, res, next) => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);

    // Add request ID to request object for tracking
    req.requestId = requestId;

    // Log incoming request with essential details only
    if (process.env.NODE_ENV === 'development') {
        const method = req.method;
        const url = req.originalUrl;
        const userAgent = req.get('User-Agent') || 'Unknown';
        const ip = req.ip || req.connection.remoteAddress;

        console.log(chalk.cyan(`📥 [${new Date().toLocaleTimeString()}] ${method} ${url}`));

        // Only log detailed info for important endpoints
        if (url.includes('/api/orders') || url.includes('/api/auth') || url.includes('/api/distribution')) {
            console.log(chalk.gray(`   └─ IP: ${ip} | Agent: ${userAgent.substring(0, 50)}...`));
        }
    }

    // Capture the original res.json method
    const originalJson = res.json;

    // Override res.json to log responses
    res.json = function (data) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        if (process.env.NODE_ENV === 'development') {
            const statusCode = res.statusCode;
            const method = req.method;
            const url = req.originalUrl;

            // Color code based on status
            let statusColor = chalk.green;
            if (statusCode >= 400 && statusCode < 500) statusColor = chalk.yellow;
            if (statusCode >= 500) statusColor = chalk.red;

            console.log(statusColor(`📤 [${new Date().toLocaleTimeString()}] ${method} ${url} - ${statusCode} (${responseTime}ms)`));

            // Log errors with more detail
            if (statusCode >= 400) {
                console.log(chalk.red(`   └─ Error: ${data?.message || data?.error || 'Unknown error'}`));
            }

            // Log slow requests
            if (responseTime > 1000) {
                console.log(chalk.magenta(`   └─ ⚠️  Slow response: ${responseTime}ms`));
            }
        }

        return originalJson.call(this, data);
    };

    next();
};

// Simple logger for production (existing one)
export const simpleLogger = (req, res, next) => {
    if (process.env.NODE_ENV === 'development' && !req.originalUrl.includes('/health')) {
        const method = req.method;
        const url = req.originalUrl;
        console.log(`${method} ${url}`);
    }
    next();
};

// Database operation logger
export const dbLogger = {
    info: (message, data = null) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(chalk.blue(`🗄️  [DB] ${new Date().toLocaleTimeString()} - ${message}`));
            if (data) {
                console.log(chalk.gray('    Data:', JSON.stringify(data, null, 2).substring(0, 200) + '...'));
            }
        }
    },
    error: (message, error = null) => {
        console.error(chalk.red(`❌ [DB ERROR] ${new Date().toLocaleTimeString()} - ${message}`));
        if (error) {
            console.error(chalk.red('    Error:', error.message || error));
        }
    }
};

// System logger for server events
export const systemLogger = {
    startup: (message) => {
        console.log(chalk.green(`🚀 [STARTUP] ${message}`));
    },
    info: (message) => {
        console.log(chalk.blue(`ℹ️  [INFO] ${message}`));
    },
    warning: (message) => {
        console.log(chalk.yellow(`⚠️  [WARNING] ${message}`));
    },
    error: (message, error = null) => {
        console.error(chalk.red(`❌ [ERROR] ${message}`));
        if (error) {
            console.error(chalk.red(`    Details: ${error.message || error}`));
        }
    },
    success: (message) => {
        console.log(chalk.green(`✅ [SUCCESS] ${message}`));
    }
}; 