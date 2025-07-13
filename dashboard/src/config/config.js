// Application Configuration
const config = {
    // API Configuration
    api: {
        baseURL: 'https://bakery-management-system-production.up.railway.app/api/',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000
    },

    // App Configuration
    app: {
        name: 'نظام إدارة المخبزة',
        version: '2.0.0',
        description: 'نظام إدارة المخبزة - لوحة التحكم',
        author: 'Bakery Management System',
        defaultLanguage: 'ar',
        defaultDirection: 'rtl',
        defaultTheme: 'light'
    },

    // Authentication
    auth: {
        tokenKey: 'auth_token',
        refreshTokenKey: 'refresh_token',
        tokenExpiry: 7, // days
        maxLoginAttempts: 5,
        lockoutDuration: 300000 // 5 minutes
    },

    // Currency Configuration
    currency: {
        primary: {
            code: 'EUR',
            symbol: '€',
            name: 'Euro',
            nameAr: 'يورو',
            position: 'after'
        },
        secondary: {
            code: 'SYP',
            symbol: 'ل.س',
            name: 'Syrian Pound',
            nameAr: 'ليرة سورية',
            position: 'after'
        },
        exchangeRate: 15000 // 1 EUR = 15000 SYP
    },

    // Features Configuration
    features: {
        mapsIntegration: true,
        notifications: true,
        darkMode: true,
        realTimeUpdates: true,
        advancedReports: true,
        mobileApp: true,
        multiCurrency: true,
        exportData: true
    },

    // UI Configuration
    ui: {
        sidebarWidth: 256,
        headerHeight: 64,
        footerHeight: 48,
        animationDuration: 300,
        toastDuration: 4000,
        pageTransitionDuration: 300
    },

    // Map Configuration
    maps: {
        provider: 'leaflet', // 'leaflet' or 'google'
        googleMapsApiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || '',
        defaultCenter: {
            lat: 33.5138,
            lng: 36.2765
        },
        defaultZoom: 12,
        maxZoom: 18,
        minZoom: 6
    },

    // Pagination
    pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [10, 20, 50, 100],
        maxPageSize: 100
    },

    // File Upload
    upload: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
        maxFiles: 5
    },

    // Notification Configuration
    notifications: {
        position: 'top-right',
        duration: 4000,
        maxNotifications: 5,
        showProgress: true,
        closeButton: true,
        pauseOnHover: true
    },

    // Development Configuration
    development: {
        debug: process.env.NODE_ENV === 'development',
        apiLogging: process.env.NODE_ENV === 'development',
        errorReporting: process.env.NODE_ENV === 'production',
        performanceMonitoring: true
    },

    // Security Configuration
    security: {
        cookieSecure: process.env.NODE_ENV === 'production',
        cookieSameSite: 'strict',
        csrfProtection: true,
        xssProtection: true,
        contentSecurityPolicy: true
    },

    // Performance Configuration
    performance: {
        enableServiceWorker: process.env.NODE_ENV === 'production',
        enableCodeSplitting: true,
        enableLazyLoading: true,
        cacheTimeout: 300000 // 5 minutes
    },

    // Error Handling
    errorHandling: {
        enableErrorBoundary: true,
        logErrors: true,
        showErrorDetails: process.env.NODE_ENV === 'development',
        errorReportingService: null // Add your error reporting service
    },

    // Routes Configuration
    routes: {
        home: '/',
        login: '/login',
        dashboard: '/dashboard',
        orders: '/orders',
        distribution: '/distribution',
        payments: '/payments',
        reports: '/reports',
        settings: '/settings',
        profile: '/profile'
    },

    // Local Storage Keys
    storage: {
        theme: 'bakery_theme',
        language: 'bakery_language',
        settings: 'bakery_settings',
        sidebar: 'bakery_sidebar',
        filters: 'bakery_filters'
    },

    // Chart Configuration
    charts: {
        defaultColors: [
            '#f97316', // orange
            '#3b82f6', // blue
            '#22c55e', // green
            '#eab308', // yellow
            '#ef4444', // red
            '#8b5cf6', // purple
            '#06b6d4', // cyan
            '#f59e0b'  // amber
        ],
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        }
    }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
    config.api.baseURL = 'http://localhost:5001/api/';
    config.development.debug = true;
    config.development.apiLogging = true;
}

if (process.env.NODE_ENV === 'production') {
    config.security.cookieSecure = true;
    config.development.debug = false;
    config.development.apiLogging = false;
    config.development.errorReporting = true;
}

export default config; 