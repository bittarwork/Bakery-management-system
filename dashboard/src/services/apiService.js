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

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Add auth token
        const token = Cookies.get('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add timestamp for cache busting (convert to string to avoid CORS issues)
        config.headers['X-Request-Time'] = Date.now().toString();

        // Add request start time for performance tracking
        config.metadata = { startTime: new Date() };

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        // Calculate response time
        const endTime = new Date();
        const duration = endTime - response.config.metadata.startTime;

        // Log performance metrics in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
        }

        // Check if response is HTML instead of JSON
        if (response.headers['content-type']?.includes('text/html')) {
            console.error('Received HTML response instead of JSON:', response.config.url);
            throw new Error('Server returned HTML instead of JSON - Check API server status');
        }

        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle network errors
        if (!error.response) {
            console.error('Network Error Details:', {
                message: error.message,
                code: error.code,
                config: {
                    url: originalRequest?.url,
                    method: originalRequest?.method,
                    baseURL: originalRequest?.baseURL
                }
            });

            let errorMessage = 'خطأ في الاتصال بالخادم';

            if (error.code === 'ERR_NETWORK') {
                errorMessage = 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى';
            } else if (error.code === 'ERR_INTERNET_DISCONNECTED') {
                errorMessage = 'لا يوجد اتصال بالإنترنت';
            }

            // Create a structured error response
            const networkError = new Error(errorMessage);
            networkError.code = error.code;
            networkError.isNetworkError = true;
            networkError.originalError = error;

            return Promise.reject(networkError);
        }

        // Handle different error status codes
        switch (error.response.status) {
            case 401:
                // Unauthorized - don't retry for auth endpoints to avoid infinite loops
                if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
                    // For login/refresh failures, don't retry
                    return Promise.reject(error);
                }

                // For other endpoints, try to refresh token
                if (!originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const response = await apiClient.post('/auth/refresh');
                        const { token } = response.data.data;

                        // Update token in cookies
                        Cookies.set('auth_token', token, {
                            expires: 7,
                            secure: true,
                            sameSite: 'strict'
                        });

                        // Retry original request
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    } catch (refreshError) {
                        // Refresh failed, remove token but don't redirect automatically
                        // Let the calling code handle the authentication state
                        Cookies.remove('auth_token');
                        console.log('Token refresh failed, user needs to login again');
                        return Promise.reject(refreshError);
                    }
                }
                break;

            case 403:
                toast.error('ليس لديك صلاحية للوصول إلى هذا المورد');
                break;

            case 404:
                toast.error('المورد المطلوب غير موجود');
                break;

            case 422:
                // Validation errors
                const validationErrors = error.response.data.errors;
                if (validationErrors) {
                    Object.values(validationErrors).forEach(errorArray => {
                        errorArray.forEach(errorMessage => {
                            toast.error(errorMessage);
                        });
                    });
                }
                break;

            case 429:
                toast.error('محاولات كثيرة جداً. يرجى المحاولة مرة أخرى بعد قليل');
                break;

            case 500:
                toast.error('خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً');
                break;

            case 502:
            case 503:
            case 504:
                toast.error('الخادم غير متاح حالياً. يرجى المحاولة مرة أخرى لاحقاً');
                break;

            default:
                toast.error(error.response.data.message || 'حدث خطأ غير متوقع');
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
            const response = await this.client.get(url, {
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
            const response = await this.client.get(url, {
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