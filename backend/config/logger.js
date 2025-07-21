/**
 * Logger configuration and implementation
 * Professional logging system for the bakery management application
 */

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

// Logger configuration
export const loggerConfig = {
    // Log levels
    levels: {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3
    },

    // Environment configurations
    environments: {
        development: {
            level: 'DEBUG',
            enableColors: true,
            enableTimestamp: true,
            enableRequestLogging: true,
            enableErrorLogging: true,
            enableDatabaseLogging: false
        },
        production: {
            level: 'INFO',
            enableColors: false,
            enableTimestamp: true,
            enableRequestLogging: true,
            enableErrorLogging: true,
            enableDatabaseLogging: false
        },
        test: {
            level: 'ERROR',
            enableColors: false,
            enableTimestamp: false,
            enableRequestLogging: false,
            enableErrorLogging: false,
            enableDatabaseLogging: false
        }
    },

    // Get current environment configuration
    getCurrentConfig() {
        const env = process.env.NODE_ENV || 'development';
        return this.environments[env] || this.environments.development;
    },

    // Check if level is enabled
    isLevelEnabled(level) {
        const config = this.getCurrentConfig();
        const currentLevel = this.levels[config.level];
        const requestedLevel = this.levels[level];
        return requestedLevel <= currentLevel;
    }
};

// Logger implementation
class Logger {
    constructor() {
        this.config = loggerConfig.getCurrentConfig();
    }

    // Format log message
    formatMessage(level, message, ...args) {
        const timestamp = this.config.enableTimestamp ? `[${formatTime()}] ` : '';
        const levelIcon = this.getLevelIcon(level);
        const formattedMessage = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;

        return `${timestamp}${levelIcon} ${formattedMessage}${args.length ? ' ' + args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
        ).join(' ') : ''}`;
    }

    // Get icon for log level
    getLevelIcon(level) {
        const icons = {
            ERROR: '❌',
            WARN: '⚠️',
            INFO: 'ℹ️',
            DEBUG: '🐛'
        };
        return icons[level] || '📝';
    }

    // Error logging
    error(message, ...args) {
        if (loggerConfig.isLevelEnabled('ERROR')) {
            console.error(this.formatMessage('ERROR', message, ...args));
        }
    }

    // Warning logging
    warn(message, ...args) {
        if (loggerConfig.isLevelEnabled('WARN')) {
            console.warn(this.formatMessage('WARN', message, ...args));
        }
    }

    // Info logging
    info(message, ...args) {
        if (loggerConfig.isLevelEnabled('INFO')) {
            console.log(this.formatMessage('INFO', message, ...args));
        }
    }

    // Debug logging
    debug(message, ...args) {
        if (loggerConfig.isLevelEnabled('DEBUG')) {
            console.log(this.formatMessage('DEBUG', message, ...args));
        }
    }

    // Log database queries (if enabled)
    query(sql, params = []) {
        if (this.config.enableDatabaseLogging && loggerConfig.isLevelEnabled('DEBUG')) {
            console.log(this.formatMessage('DEBUG', `🗃️ SQL Query: ${sql}`, params.length ? `Params: ${JSON.stringify(params)}` : ''));
        }
    }

    // Log API requests (if enabled)
    request(method, url, statusCode, duration) {
        if (this.config.enableRequestLogging && loggerConfig.isLevelEnabled('INFO')) {
            const statusIcon = statusCode >= 400 ? '❌' : statusCode >= 300 ? '↩️' : '✅';
            console.log(this.formatMessage('INFO', `🌐 ${method} ${url} ${statusIcon} ${statusCode} (${duration}ms)`));
        }
    }
}

// Create logger instance
const logger = new Logger();

// Export both the logger instance and config
export { loggerConfig };
export default logger; 