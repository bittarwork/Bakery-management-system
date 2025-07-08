import axios from 'axios';

// Create axios instance
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
    withCredentials: true, // For cookies (refresh token)
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Helper function to get token from storage
const getStoredToken = () => {
    try {
        // Try the direct token first
        const directToken = localStorage.getItem('token');
        if (directToken) {
            return directToken;
        }

        // Fallback to auth-storage format
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
            const parsed = JSON.parse(authStorage);
            return parsed.state?.token || parsed.token;
        }
    } catch (error) {
        console.warn('Error parsing auth storage:', error);
    }
    return null;
};

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Add authorization header if token exists
        const token = getStoredToken();
        if (token && !config.headers['Authorization']) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Log API requests in development (only errors)
        // Removed non-essential logging

        return config;
    },
    (error) => {
        if (import.meta.env.DEV) {
            console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        // Removed non-essential logging
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Only log critical errors in development
        if (import.meta.env.DEV && error.response?.status >= 500) {
            console.error(`❌ ${error.response?.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
        }

        // Handle token refresh - but avoid infinite loops
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/') && !originalRequest.url?.includes('/sessions/validate')) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const response = await axios.post(
                    `${apiClient.defaults.baseURL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                if (response.data.success) {
                    const { token } = response.data.data;

                    // Update authorization header
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;

                    // Update token in localStorage
                    try {
                        // Update direct token
                        localStorage.setItem('token', token);

                        // Also update auth-storage if it exists
                        const authStorage = localStorage.getItem('auth-storage');
                        if (authStorage) {
                            const parsed = JSON.parse(authStorage);
                            if (parsed.state) {
                                parsed.state.token = token;
                            } else {
                                parsed.token = token;
                            }
                            localStorage.setItem('auth-storage', JSON.stringify(parsed));
                        }
                    } catch (error) {
                        console.warn('Error updating token in storage:', error);
                    }

                    // Retry original request
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login only if not already on login page
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                    // Clear all auth storage
                    localStorage.removeItem('auth-storage');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('userPreferences');

                    // Redirect to login
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            }
        }

        // Handle network errors
        if (!error.response) {
            const networkError = {
                ...error,
                response: {
                    data: {
                        success: false,
                        message: 'خطأ في الاتصال بالخادم. تأكد من اتصالك بالإنترنت.'
                    }
                }
            };
            return Promise.reject(networkError);
        }

        // Handle server errors
        if (error.response?.status >= 500) {
            const serverError = {
                ...error,
                response: {
                    ...error.response,
                    data: {
                        success: false,
                        message: 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.'
                    }
                }
            };
            return Promise.reject(serverError);
        }

        return Promise.reject(error);
    }
);

export default apiClient; 