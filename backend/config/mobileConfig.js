/**
 * تكوين تطبيق الموبايل
 */

export const MOBILE_CONFIG = {
    // إعدادات API
    API_VERSION: process.env.MOBILE_API_VERSION || 'v1',
    RATE_LIMIT: parseInt(process.env.MOBILE_RATE_LIMIT) || 500,

    // إعدادات الموقع
    LOCATION_UPDATE_INTERVAL: 30000, // 30 seconds
    LOCATION_ACCURACY: 10, // meters

    // إعدادات الإشعارات
    NOTIFICATION_BATCH_SIZE: 20,
    NOTIFICATION_RETENTION_DAYS: 30,

    // إعدادات التخزين المؤقت
    CACHE_DURATION: {
        STORES: 3600000, // 1 hour
        PRODUCTS: 3600000, // 1 hour
        SCHEDULES: 300000, // 5 minutes
        REPORTS: 1800000 // 30 minutes
    },

    // إعدادات المزامنة
    SYNC_INTERVAL: 60000, // 1 minute
    OFFLINE_RETRY_ATTEMPTS: 3,
    OFFLINE_RETRY_DELAY: 5000, // 5 seconds

    // إعدادات الملفات
    MAX_FILE_SIZE: 10485760, // 10MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],

    // إعدادات الأمان
    SESSION_TIMEOUT: 3600000, // 1 hour
    AUTO_LOGOUT: true,

    // إعدادات التطبيق
    DEFAULT_LANGUAGE: 'ar',
    DEFAULT_THEME: 'light',
    ENABLE_ANALYTICS: false,

    // إعدادات التطوير
    DEBUG_MODE: process.env.NODE_ENV === 'development',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

// دوال مساعدة للتطبيق
export const MOBILE_HELPERS = {
    // التحقق من صحة البيانات
    validateLocation: (latitude, longitude) => {
        return latitude >= -90 && latitude <= 90 &&
            longitude >= -180 && longitude <= 180;
    },

    // تنسيق البيانات للعرض
    formatCurrency: (amount, currency = 'EUR') => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // حساب المسافة بين نقطتين
    calculateDistance: (lat1, lon1, lat2, lon2) => {
        const R = 6371; // نصف قطر الأرض بالكيلومترات
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    // التحقق من الاتصال بالإنترنت
    isOnline: () => {
        return navigator.onLine;
    },

    // تأخير زمني
    delay: (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

export default {
    MOBILE_CONFIG,
    MOBILE_HELPERS
}; 