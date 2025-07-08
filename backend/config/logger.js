/**
 * إعدادات التسجيل للتطبيق
 */

export const loggerConfig = {
    // مستويات التسجيل
    levels: {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3
    },

    // إعدادات البيئات المختلفة
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

    // الحصول على إعدادات البيئة الحالية
    getCurrentConfig() {
        const env = process.env.NODE_ENV || 'development';
        return this.environments[env] || this.environments.development;
    },

    // التحقق من تفعيل مستوى معين
    isLevelEnabled(level) {
        const config = this.getCurrentConfig();
        const currentLevel = this.levels[config.level];
        const requestedLevel = this.levels[level];
        return requestedLevel <= currentLevel;
    }
};

export default loggerConfig; 