import { create } from 'zustand';
import apiService from '../services/apiService.js';
import Cookies from 'js-cookie';
import sessionManager from '../utils/sessionManager.js';

export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isInitialized: false, // Add initialization flag
    sessionTimeRemaining: 0, // Session time remaining in milliseconds
    showSessionWarning: false, // Show session expiration warning
    sessionTrackingInterval: null, // Interval ID for session tracking

    initializeAuth: async () => {
        try {
            // Prevent multiple initializations
            if (get().isInitialized) {
                return;
            }

            set({ isLoading: true });
            
            // Check if session is valid first
            if (!sessionManager.isSessionValid()) {
                console.log('No valid session found during initialization');
                set({
                    isLoading: false,
                    isInitialized: true,
                    isAuthenticated: false,
                    user: null,
                    sessionTimeRemaining: 0,
                    showSessionWarning: false
                });
                return;
            }

            const token = Cookies.get('auth_token');
            if (!token) {
                console.log('No token found, destroying session');
                sessionManager.destroySession();
                set({
                    isLoading: false,
                    isInitialized: true,
                    isAuthenticated: false,
                    user: null,
                    sessionTimeRemaining: 0,
                    showSessionWarning: false
                });
                return;
            }

            // Try to validate token with server
            try {
                const response = await apiService.get('/auth/me');
                const userData = response.data || response;

                // Setup session monitoring with logout callback
                sessionManager.onSessionExpired = () => {
                    console.log('Session expired, logging out automatically');
                    get().logout();
                };

                // Start session monitoring if not already started
                if (!sessionManager.intervalId) {
                    sessionManager.startSessionMonitoring();
                }

                // Update session activity
                sessionManager.updateLastActivity();

                // Start session time tracking
                get().startSessionTracking();

                set({
                    user: userData,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                    isInitialized: true,
                    sessionTimeRemaining: sessionManager.getRemainingTime(),
                    showSessionWarning: sessionManager.shouldShowWarning()
                });

                console.log('Authentication initialized successfully');
            } catch (error) {
                console.error('Token validation failed:', error);

                // If it's a network error, keep the session but mark as not authenticated
                // This prevents infinite reloads when server is unavailable
                if (error.isNetworkError) {
                    console.warn('Network error during token validation, keeping session for offline mode');
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null, // Don't show error to user
                        isInitialized: true,
                        sessionTimeRemaining: sessionManager.getRemainingTime(),
                        showSessionWarning: false
                    });
                } else if (error.response && error.response.status === 401) {
                    // Token is invalid or expired, destroy session
                    console.log('Token is invalid or expired, destroying session');
                    sessionManager.destroySession();
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null, // Don't show error to user
                        isInitialized: true,
                        sessionTimeRemaining: 0,
                        showSessionWarning: false
                    });
                } else {
                    // For other errors, destroy session
                    sessionManager.destroySession();
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null, // Don't show error to user
                        isInitialized: true,
                        sessionTimeRemaining: 0,
                        showSessionWarning: false
                    });
                }
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
            sessionManager.destroySession();
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null, // Don't show error to user
                isInitialized: true,
                sessionTimeRemaining: 0,
                showSessionWarning: false
            });
        }
    },

    login: async (usernameOrEmail, password) => {
        try {
            set({ isLoading: true, error: null });

            // Determine if input is email or username
            const isEmail = usernameOrEmail.includes('@');
            const loginData = isEmail
                ? { email: usernameOrEmail, password }
                : { username: usernameOrEmail, password };

            console.log('Attempting login with:', { usernameOrEmail, isEmail });

            const response = await apiService.post('/auth/login', loginData);
            console.log('Login response:', response);

            // Handle different response formats
            let token, userData;
            if (response.success) {
                token = response.data?.token || response.token;
                userData = response.data?.user || response.user;
            } else {
                token = response.token;
                userData = response.user;
            }

            if (!token) {
                throw new Error('استجابة غير صحيحة من الخادم - لا يوجد رمز مصادقة');
            }

            // Create session with 3 hours expiration using sessionManager
            sessionManager.createSession(token, () => {
                console.log('Session expired during login session, logging out automatically');
                get().logout();
            });

            // Start session time tracking
            get().startSessionTracking();

            // Set user data
            set({
                user: userData,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                isInitialized: true,
                sessionTimeRemaining: sessionManager.getRemainingTime(),
                showSessionWarning: sessionManager.shouldShowWarning()
            });

            console.log('Login successful, user:', userData);
            console.log('Session expires at:', new Date(Date.now() + sessionManager.SESSION_DURATION).toLocaleString());
            
            return { success: true, user: userData };
        } catch (error) {
            console.log('Login error:', error);

            let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';

            if (error.code === 'ERR_NETWORK') {
                errorMessage = 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت أو المحاولة لاحقاً';
            } else if (error.isNetworkError) {
                errorMessage = error.message || 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت';
            } else if (error.response) {
                // Server responded with error status
                const status = error.response.status;
                const data = error.response.data;

                if (status === 401) {
                    errorMessage = data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
                } else if (status === 403) {
                    errorMessage = data?.message || 'تم حظر الحساب مؤقتاً';
                } else if (status === 404) {
                    errorMessage = 'المستخدم غير موجود';
                } else if (status === 422) {
                    errorMessage = data?.message || 'بيانات غير صحيحة';
                } else if (status >= 500) {
                    errorMessage = 'خطأ في الخادم. يرجى المحاولة لاحقاً';
                } else {
                    errorMessage = data?.message || `خطأ في الخادم (${status})`;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            // Always set loading to false and return error
            set({
                error: errorMessage,
                isAuthenticated: false,
                user: null,
                isLoading: false,
                isInitialized: true,
                sessionTimeRemaining: 0,
                showSessionWarning: false
            });

            return { success: false, error: errorMessage };
        }
    },

    logout: () => {
        console.log('Logging out and destroying session');
        
        // Destroy session using sessionManager
        sessionManager.destroySession();
        
        // Clear session tracking
        get().stopSessionTracking();
        
        set({
            user: null,
            isAuthenticated: false,
            error: null,
            isInitialized: true,
            sessionTimeRemaining: 0,
            showSessionWarning: false
        });
    },

    updateUser: (userData) => {
        set((state) => ({
            user: { ...state.user, ...userData },
        }));
    },

    clearError: () => {
        set({ error: null });
    },

    // Session management functions
    startSessionTracking: () => {
        // Update session time every 30 seconds
        const trackingInterval = setInterval(() => {
            const state = get();
            if (!state.isAuthenticated) {
                clearInterval(trackingInterval);
                return;
            }

            const remaining = sessionManager.getRemainingTime();
            const shouldWarn = sessionManager.shouldShowWarning();

            set({
                sessionTimeRemaining: remaining,
                showSessionWarning: shouldWarn
            });

            // If session expired, the sessionManager will handle logout
            if (remaining <= 0 && state.isAuthenticated) {
                console.log('Session expired in tracking, triggering logout');
                get().logout();
                clearInterval(trackingInterval);
            }
        }, 30000); // Check every 30 seconds

        // Store interval ID for cleanup
        get().sessionTrackingInterval = trackingInterval;
    },

    stopSessionTracking: () => {
        const state = get();
        if (state.sessionTrackingInterval) {
            clearInterval(state.sessionTrackingInterval);
            set({ sessionTrackingInterval: null });
        }
    },

    renewSession: () => {
        const renewed = sessionManager.renewSession();
        if (renewed) {
            set({
                sessionTimeRemaining: sessionManager.getRemainingTime(),
                showSessionWarning: false
            });
            console.log('Session renewed successfully');
            return true;
        }
        console.log('Failed to renew session');
        return false;
    },

    dismissSessionWarning: () => {
        set({ showSessionWarning: false });
    },

    getSessionInfo: () => {
        return {
            timeRemaining: sessionManager.getRemainingTime(),
            timeRemainingFormatted: sessionManager.getRemainingTimeFormatted(),
            shouldShowWarning: sessionManager.shouldShowWarning(),
            isValid: sessionManager.isSessionValid()
        };
    },

    // Activity tracking - call this on user interactions
    updateActivity: () => {
        if (get().isAuthenticated) {
            sessionManager.updateLastActivity();
        }
    },
})); 