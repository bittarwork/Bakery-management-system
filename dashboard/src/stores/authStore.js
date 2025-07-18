import { create } from 'zustand';
import apiService from '../services/apiService.js';
import Cookies from 'js-cookie';

export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    initializeAuth: async () => {
        try {
            set({ isLoading: true });
            const token = Cookies.get('auth_token');
            if (!token) {
                set({ isLoading: false });
                return;
            }

            const response = await apiService.get('/auth/me');
            const userData = response.data || response;

            set({
                user: userData,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
            Cookies.remove('auth_token');
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: error.message,
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

            // Set token in cookie
            Cookies.set('auth_token', token, {
                expires: 7,
                secure: true,
                sameSite: 'strict'
            });

            // Set user data
            set({
                user: userData,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });

            console.log('Login successful, user:', userData);
            return { success: true, user: userData };
        } catch (error) {
            console.log('Login error:', error);

            let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';

            if (error.code === 'ERR_NETWORK') {
                errorMessage = 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت أو المحاولة لاحقاً';
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
                isLoading: false
            });

            return { success: false, error: errorMessage };
        }
    },

    logout: () => {
        Cookies.remove('auth_token');
        set({
            user: null,
            isAuthenticated: false,
            error: null,
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
})); 