import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

// API Configuration
const API_CONFIG = {
    baseURL: 'https://bakery-management-system-production.up.railway.app/api/',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
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

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Add auth token
        const token = Cookies.get('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add timestamp for cache busting
        config.headers['X-Request-Time'] = Date.now();

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

        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle network errors
        if (!error.response) {
            const errorMessage = 'خطأ في الاتصال بالخادم. تحقق من اتصال الإنترنت.';
            toast.error(errorMessage);
            return Promise.reject(new Error(errorMessage));
        }

        // Handle different error status codes
        switch (error.response.status) {
            case 401:
                // Unauthorized - try to refresh token
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
                        // Refresh failed, redirect to login
                        Cookies.remove('auth_token');
                        window.location.href = '/login';
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

// Retry logic
const retryRequest = async (requestFn, maxRetries = API_CONFIG.retryAttempts) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await requestFn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;

            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * (i + 1)));
        }
    }
};

// API Service Class
class ApiService {
    constructor() {
        this.client = apiClient;
    }

    // Generic HTTP methods
    async get(url, config = {}) {
        return retryRequest(async () => {
            const response = await this.client.get(url, config);
            return this.handleResponse(response);
        });
    }

    async post(url, data = {}, config = {}) {
        return retryRequest(async () => {
            const response = await this.client.post(url, data, config);
            return this.handleResponse(response);
        });
    }

    async put(url, data = {}, config = {}) {
        return retryRequest(async () => {
            const response = await this.client.put(url, data, config);
            return this.handleResponse(response);
        });
    }

    async patch(url, data = {}, config = {}) {
        return retryRequest(async () => {
            const response = await this.client.patch(url, data, config);
            return this.handleResponse(response);
        });
    }

    async delete(url, config = {}) {
        return retryRequest(async () => {
            const response = await this.client.delete(url, config);
            return this.handleResponse(response);
        });
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