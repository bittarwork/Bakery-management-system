// API Configuration
const config = {
    // Development vs Production API URLs  
    API_BASE_URL: import.meta.env.VITE_API_URL || 'https://bakery-management-system-production.up.railway.app/api',

    // Local development fallback
    LOCAL_API_URL: 'http://localhost:5001/api',

    // Auto-detect local vs production
    IS_DEVELOPMENT: import.meta.env.DEV || window.location.hostname === 'localhost',

    // Enable local fallback for better development experience
    USE_LOCAL_FALLBACK: true,

    // API endpoints
    ENDPOINTS: {
        AUTH: '/auth',
        USERS: '/users',
        STORES: '/stores',
        PRODUCTS: '/products',
        ORDERS: '/orders',
        PAYMENTS: '/payments',
        REPORTS: '/reports',
        DASHBOARD: '/dashboard',
        DISTRIBUTORS: '/distributors',
        DELIVERY: '/delivery',
        DISTRIBUTION: '/distribution',
        NOTIFICATIONS: '/notifications'
    },

    // Request settings
    REQUEST_TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second

    // UI Settings
    PAGINATION_LIMIT: 10,
    DATE_FORMAT: 'DD/MM/YYYY',
    CURRENCY: 'EUR',

    // Map settings
    DEFAULT_MAP_CENTER: {
        lat: 33.8938, // Beirut, Lebanon
        lng: 35.5018
    },
    
    // Google Maps API configuration
    GOOGLE_MAPS_API_KEY: 'AIzaSyDhnQwiZuURSLApdQAR_86POf0a_f9n2IE',
    GOOGLE_MAPS_SETTINGS: {
        zoom: 13,
        mapTypeId: 'roadmap',
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: true,
        fullscreenControl: true
    },

    // File upload limits
    MAX_FILE_SIZE: 10485760, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],

    // Language and localization
    DEFAULT_LANGUAGE: 'ar',
    RTL_SUPPORT: true,

    // Debug settings
    DEBUG_MODE: import.meta.env.DEV,
    LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info'
};

// Get the appropriate API URL based on environment
export const getApiUrl = () => {
    // Check if we're online
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('Offline mode detected, using local fallback');
        return config.LOCAL_API_URL;
    }
    
    // Use local server in development mode
    if (config.IS_DEVELOPMENT && config.USE_LOCAL_FALLBACK) {
        console.log('Development mode detected, using local server');
        return config.LOCAL_API_URL;
    }
    
    // Use production server
    return config.API_BASE_URL;
};

// Create API endpoint URLs
export const createApiEndpoint = (endpoint) => {
    const baseUrl = getApiUrl();
    return `${baseUrl}${config.ENDPOINTS[endpoint] || endpoint}`;
};

// Export configuration
export default config; 