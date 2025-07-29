import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { getApiUrl } from '../config/config.js';

// API Configuration with dynamic URL
const API_CONFIG = {
    baseURL: getApiUrl(),
    timeout: 45000, // Increased timeout for Railway
    retryAttempts: 5, // More retry attempts  
    retryDelay: 1500, // Longer delay between retries
    maxRetryDelay: 10000 // Maximum delay cap
};

// Fallback API Client for local development  
let fallbackClient = null;
const createFallbackClient = () => {
    // Only create fallback client if we're actually running on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        if (!fallbackClient) {
            fallbackClient = axios.create({
                baseURL: 'http://localhost:5001/api',
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
        }
        return fallbackClient;
    }
    return null;
};

// Enhanced logging configuration
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

const CURRENT_LOG_LEVEL = process.env.NODE_ENV === 'production' ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;

// Smart logger that respects log levels
const smartLog = {
    error: (message, data) => {
        if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
            console.error(`❌ [API ERROR] ${message}`, data);
        }
    },
    warn: (message, data) => {
        if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
            console.warn(`⚠️  [API WARN] ${message}`, data);
        }
    },
    info: (message, data) => {
        if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO && !message.includes('/health')) {
            console.log(`ℹ️  [API] ${message}`, data || '');
        }
    },
    debug: (message, data) => {
        if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
            console.log(`🔍 [API DEBUG] ${message}`, data);
        }
    }
};

// Create axios instance
const apiClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Fallback client for offline mode
const createOfflineClient = () => {
    // Only create offline client if we're actually running on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return axios.create({
            baseURL: 'http://localhost:5001/api',
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }
    return null;
};

// Request interceptor - simplified logging
apiClient.interceptors.request.use(
    (config) => {
        const token = Cookies.get('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Only log important requests
        if (config.url.includes('/auth') || config.url.includes('/orders') || config.method !== 'get') {
            smartLog.info(`→ ${config.method?.toUpperCase()} /${config.url}`);
        }

        config.metadata = { startTime: Date.now() };
        return config;
    },
    (error) => {
        smartLog.error('Request interceptor error:', error.message);
        return Promise.reject(error);
    }
);

// Response interceptor - enhanced error handling and reduced logging
apiClient.interceptors.response.use(
    (response) => {
        const { config } = response;
        const duration = Date.now() - (config.metadata?.startTime || 0);

        // Only log important responses or slow requests
        if (config.url.includes('/auth') || config.url.includes('/orders') || config.method !== 'get' || duration > 1000) {
            const method = config.method?.toUpperCase();
            const url = config.url;
            const status = response.status;

            if (duration > 1000) {
                smartLog.warn(`← ${method} /${url} - ${status} (${duration}ms) - Slow response!`);
            } else {
                smartLog.info(`← ${method} /${url} - ${status} (${duration}ms)`);
            }
        }

        return response;
    },
    (error) => {
        const { config, response } = error;
        const duration = config?.metadata ? Date.now() - config.metadata.startTime : 0;

        if (response?.status === 401) {
            smartLog.warn('Authentication failed - redirecting to login');
            // Handle auth redirect without excessive logging
            if (window.location.pathname !== '/login') {
                Cookies.remove('auth_token');
                Cookies.remove('user');
                window.location.href = '/login';
            }
        } else if (response?.status >= 500) {
            smartLog.error(`Server Error: ${config?.method?.toUpperCase()} /${config?.url} - ${response.status} (${duration}ms)`, response.data);
        } else if (response?.status >= 400) {
            // Only log client errors for important endpoints
            if (config?.url.includes('/auth') || config?.url.includes('/orders')) {
                smartLog.warn(`Client Error: ${config?.method?.toUpperCase()} /${config?.url} - ${response.status}`, response.data?.message);
            }
        } else {
            smartLog.error('Network or unknown error:', error.message);
        }

        return Promise.reject(error);
    }
);

// Enhanced retry logic for Railway server reliability
const retryRequest = async (requestFn, maxRetries = API_CONFIG.retryAttempts) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await requestFn();

            // If we succeed after retries, log it
            if (i > 0) {
                console.log(`✅ Request succeeded on attempt ${i + 1}/${maxRetries}`);
            }

            return result;
        } catch (error) {
            const isRetryableError =
                error.code === 'ERR_NETWORK' ||
                error.code === 'ECONNREFUSED' ||
                error.code === 'ETIMEDOUT' ||
                error.response?.status === 502 ||
                error.response?.status === 503 ||
                error.response?.status === 504 ||
                error.response?.status === 429; // Rate limiting

            console.log(`🔄 Request attempt ${i + 1}/${maxRetries} failed:`, error.response?.status || error.code);

            if (i === maxRetries - 1 || !isRetryableError) {
                // Try fallback to local server if in development and main server fails
                if (process.env.NODE_ENV === 'development' &&
                    (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') &&
                    !originalRequest._fallbackAttempted) {

                    console.log('🔄 Attempting fallback to local server...');
                    try {
                        const fallback = createFallbackClient();
                        const token = Cookies.get('auth_token');
                        if (token) {
                            fallback.defaults.headers.Authorization = `Bearer ${token}`;
                        }

                        originalRequest._fallbackAttempted = true;
                        const fallbackResponse = await fallback.request({
                            ...originalRequest,
                            baseURL: 'http://localhost:5001/api'
                        });

                        console.log('✅ Fallback to local server succeeded');
                        return fallbackResponse;
                    } catch (fallbackError) {
                        console.log('❌ Fallback to local server also failed:', fallbackError.message);
                    }
                }

                // Create user-friendly error messages
                if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
                    throw new Error('لا يمكن الاتصال بالخادم. تحقق من اتصال الإنترنت أو أن الخادم متاح.');
                }
                if (error.response?.status === 502) {
                    throw new Error('خطأ في البوابة. الخادم قد يكون قيد إعادة التشغيل.');
                }
                if (error.response?.status === 503) {
                    throw new Error('الخدمة غير متاحة مؤقتاً. يرجى المحاولة لاحقاً.');
                }
                if (error.response?.status === 504) {
                    throw new Error('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.');
                }
                if (error.response?.status >= 500) {
                    throw new Error('خطأ في الخادم. يرجى المحاولة لاحقاً.');
                }

                // For non-retryable errors, re-throw original error
                throw error;
            }

            // Calculate backoff delay (exponential with jitter)
            const baseDelay = API_CONFIG.retryDelay * Math.pow(2, i);
            const jitter = Math.random() * 1000; // Add randomness to prevent thundering herd
            const delay = Math.min(baseDelay + jitter, API_CONFIG.maxRetryDelay);

            console.log(`⏳ Waiting ${Math.round(delay)}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Connection health checker
const checkServerHealth = async () => {
    try {
        const response = await apiClient.get('/health', { timeout: 10000 });
        console.log('🟢 Server health check passed:', response.data.status);
        return true;
    } catch (error) {
        console.log('🔴 Server health check failed:', error.message);
        return false;
    }
};

// API Service Class
class ApiService {
    constructor() {
        this.apiService = apiClient;
        this.serverHealthy = true;
        this.lastHealthCheck = 0;
        this.healthCheckInterval = 60000; // Check every minute
    }

    // Check server health before making requests
    async ensureServerHealth() {
        const now = Date.now();
        if (now - this.lastHealthCheck > this.healthCheckInterval) {
            this.serverHealthy = await checkServerHealth();
            this.lastHealthCheck = now;
        }

        if (!this.serverHealthy) {
            throw new Error('الخادم غير متاح حالياً. يرجى المحاولة لاحقاً.');
        }
    }

    // Generic HTTP methods
    async get(url, config = {}) {
        try {
            const response = await this.apiService.get(url, config);
            return this.handleResponse(response);
        } catch (error) {
            // Try fallback client if main client fails
            if (error.isNetworkError && !navigator.onLine) {
                try {
                    const fallbackClient = createOfflineClient();
                    const response = await fallbackClient.get(url, config);
                    return this.handleResponse(response);
                } catch (fallbackError) {
                    throw error; // Throw original error if fallback also fails
                }
            }
            throw error;
        }
    }

    async post(url, data = {}, config = {}) {
        try {
            const response = await this.apiService.post(url, data, config);
            return this.handleResponse(response);
        } catch (error) {
            // Try fallback client if main client fails
            if (error.isNetworkError && !navigator.onLine) {
                try {
                    const fallbackClient = createOfflineClient();
                    const response = await fallbackClient.post(url, data, config);
                    return this.handleResponse(response);
                } catch (fallbackError) {
                    throw error; // Throw original error if fallback also fails
                }
            }
            throw error;
        }
    }

    async put(url, data = {}, config = {}) {
        try {
            const response = await this.apiService.put(url, data, config);
            return this.handleResponse(response);
        } catch (error) {
            // Try fallback client if main client fails
            if (error.isNetworkError && !navigator.onLine) {
                try {
                    const fallbackClient = createOfflineClient();
                    const response = await fallbackClient.put(url, data, config);
                    return this.handleResponse(response);
                } catch (fallbackError) {
                    throw error; // Throw original error if fallback also fails
                }
            }
            throw error;
        }
    }

    async patch(url, data = {}, config = {}) {
        try {
            const response = await this.apiService.patch(url, data, config);
            return this.handleResponse(response);
        } catch (error) {
            // Try fallback client if main client fails
            if (error.isNetworkError && !navigator.onLine) {
                try {
                    const fallbackClient = createOfflineClient();
                    const response = await fallbackClient.patch(url, data, config);
                    return this.handleResponse(response);
                } catch (fallbackError) {
                    throw error; // Throw original error if fallback also fails
                }
            }
            throw error;
        }
    }

    async delete(url, config = {}) {
        try {
            const response = await this.apiService.delete(url, config);
            return this.handleResponse(response);
        } catch (error) {
            // Try fallback client if main client fails
            if (error.isNetworkError && !navigator.onLine) {
                try {
                    const fallbackClient = createOfflineClient();
                    const response = await fallbackClient.delete(url, config);
                    return this.handleResponse(response);
                } catch (fallbackError) {
                    throw error; // Throw original error if fallback also fails
                }
            }
            throw error;
        }
    }

    // Handle response format
    handleResponse(response) {
        if (response.data.success !== undefined) {
            return response.data;
        }

        // Legacy format support
        return {
            success: response.status >= 200 && response.status < 300,
            data: response.data,
            message: response.data.message || 'Success'
        };
    }

    // File upload
    async uploadFile(url, file, onProgress = null) {
        const formData = new FormData();
        formData.append('file', file);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            }
        };

        return this.post(url, formData, config);
    }

    // Multiple files upload
    async uploadFiles(url, files, onProgress = null) {
        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append(`files[${index}]`, file);
        });

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            }
        };

        return this.post(url, formData, config);
    }

    // Download file
    async downloadFile(url, filename) {
        try {
            const response = await this.apiService.get(url, {
                responseType: 'blob'
            });

            // Create blob link and trigger download
            const blob = new Blob([response.data]);
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();

            // Clean up
            window.URL.revokeObjectURL(link.href);

            return { success: true, message: 'File downloaded successfully' };
        } catch (error) {
            return { success: false, message: 'Failed to download file' };
        }
    }

    // Export data
    async exportData(url, format = 'csv', filename = 'export') {
        try {
            const response = await this.apiService.get(url, {
                params: { format },
                responseType: 'blob'
            });

            const blob = new Blob([response.data]);
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `${filename}.${format}`;
            link.click();

            window.URL.revokeObjectURL(link.href);

            return { success: true, message: 'Data exported successfully' };
        } catch (error) {
            return { success: false, message: 'Failed to export data' };
        }
    }

    // Batch requests
    async batchRequest(requests) {
        try {
            const promises = requests.map(request => {
                const { method, url, data, config } = request;
                return this[method](url, data, config);
            });

            const results = await Promise.allSettled(promises);

            return {
                success: true,
                data: results.map((result, index) => ({
                    index,
                    success: result.status === 'fulfilled',
                    data: result.status === 'fulfilled' ? result.value : null,
                    error: result.status === 'rejected' ? result.reason : null
                }))
            };
        } catch (error) {
            return {
                success: false,
                message: 'Batch request failed',
                error: error.message
            };
        }
    }

    // Health check
    async healthCheck() {
        try {
            const response = await this.get('/health');
            return response;
        } catch (error) {
            // Try fallback client if main client fails
            if (error.isNetworkError && !navigator.onLine) {
                try {
                    const fallbackClient = createOfflineClient();
                    const response = await fallbackClient.get('/health');
                    return this.handleResponse(response);
                } catch (fallbackError) {
                    return {
                        success: false,
                        message: 'Health check failed - offline mode',
                        error: error.message
                    };
                }
            }

            return {
                success: false,
                message: 'Health check failed',
                error: error.message
            };
        }
    }

    // Get API info
    async getApiInfo() {
        try {
            const response = await this.get('/info');
            return response;
        } catch (error) {
            // Try fallback client if main client fails
            if (error.isNetworkError && !navigator.onLine) {
                try {
                    const fallbackClient = createOfflineClient();
                    const response = await fallbackClient.get('/info');
                    return this.handleResponse(response);
                } catch (fallbackError) {
                    return {
                        success: false,
                        message: 'Failed to get API info - offline mode',
                        error: error.message
                    };
                }
            }

            return {
                success: false,
                message: 'Failed to get API info',
                error: error.message
            };
        }
    }
}

// Create and export service instance
export const apiService = new ApiService();

// Export specific methods for convenience
export const {
    get,
    post,
    put,
    patch,
    delete: deleteRequest,
    uploadFile,
    uploadFiles,
    downloadFile,
    exportData,
    batchRequest,
    healthCheck,
    getApiInfo
} = apiService;

// Export axios instance for direct use if needed
export { apiClient };

// Export configuration
export { API_CONFIG };

export default apiService; 