import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authAPI from '../services/authAPI';

// Toast function that can be used outside React components
let toastInstance = null;
export const setToastInstance = (toast) => {
    toastInstance = toast;
};

const showToast = (message, type = 'info') => {
    if (toastInstance) {
        toastInstance[type](message);
    } else {
        console.log(`Toast ${type}:`, message);
    }
};

const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            // Actions
            login: async (credentials) => {
                try {
                    set({ isLoading: true });

                    const response = await authAPI.login(credentials);

                    if (response.success) {
                        const { user, token } = response.data;

                        set({
                            user,
                            token,
                            isAuthenticated: true,
                            isLoading: false
                        });

                        // Set authorization header for future requests
                        authAPI.setAuthToken(token);

                        showToast(response.message || 'تم تسجيل الدخول بنجاح', 'success');
                        return { success: true };
                    } else {
                        throw new Error(response.message || 'فشل في تسجيل الدخول');
                    }
                } catch (error) {
                    console.error('Login error:', error);

                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false
                    });

                    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'حدث خطأ أثناء تسجيل الدخول';

                    showToast(errorMessage, 'error');
                    return { success: false, error: errorMessage };
                }
            },

            logout: async () => {
                try {
                    // Call logout API to clear refresh token
                    await authAPI.logout();
                } catch (error) {
                    console.error('Logout API error:', error);
                } finally {
                    // Clear local state regardless of API response
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false
                    });

                    // Clear authorization header
                    authAPI.setAuthToken(null);

                    showToast('تم تسجيل الخروج بنجاح', 'success');
                }
            },

            refreshToken: async () => {
                try {
                    const response = await authAPI.refreshToken();

                    if (response.success) {
                        const { token } = response.data;

                        set({ token });
                        authAPI.setAuthToken(token);

                        return { success: true };
                    } else {
                        throw new Error('Failed to refresh token');
                    }
                } catch (error) {
                    console.error('Token refresh error:', error);

                    // If refresh fails, logout user
                    get().logout();
                    return { success: false };
                }
            },

            getCurrentUser: async () => {
                try {
                    set({ isLoading: true });

                    const response = await authAPI.getCurrentUser();

                    if (response.success) {
                        set({
                            user: response.data,
                            isLoading: false
                        });

                        return { success: true };
                    } else {
                        throw new Error(response.message || 'Failed to get user');
                    }
                } catch (error) {
                    console.error('Get current user error:', error);

                    // If getting user fails, logout
                    get().logout();
                    return { success: false };
                }
            },

            changePassword: async (passwordData) => {
                try {
                    const response = await authAPI.changePassword(passwordData);

                    if (response.success) {
                        showToast(response.message || 'تم تغيير كلمة المرور بنجاح', 'success');
                        return { success: true };
                    } else {
                        throw new Error(response.message || 'فشل في تغيير كلمة المرور');
                    }
                } catch (error) {
                    console.error('Change password error:', error);

                    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'حدث خطأ أثناء تغيير كلمة المرور';

                    showToast(errorMessage, 'error');
                    return { success: false, error: errorMessage };
                }
            },

            initializeAuth: async () => {
                const state = get();

                // Prevent multiple initialization calls
                if (state.isLoading) return;

                set({ isLoading: true });

                try {
                    if (state.token && !state.user) {
                        // Set token in API client
                        authAPI.setAuthToken(state.token);

                        // Try to get current user
                        const result = await state.getCurrentUser();

                        if (!result.success) {
                            // If failed to get user, clear everything
                            set({
                                user: null,
                                token: null,
                                isAuthenticated: false,
                                isLoading: false
                            });
                            return;
                        }
                    } else if (state.token && state.user) {
                        // Token and user exist, just set token in API client
                        authAPI.setAuthToken(state.token);
                        set({ isAuthenticated: true });
                    }
                } catch (error) {
                    console.error('Initialize auth error:', error);
                    // Clear everything on error
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                    return;
                }

                set({ isLoading: false });
            },

            // Helper methods
            hasRole: (role) => {
                const { user } = get();
                return user?.role === role;
            },

            hasAnyRole: (roles) => {
                const { user } = get();
                return roles.includes(user?.role);
            },

            isAdmin: () => {
                return get().hasRole('admin');
            },

            isManager: () => {
                return get().hasRole('manager');
            },

            isDistributor: () => {
                return get().hasRole('distributor');
            },

            canManage: () => {
                return get().hasAnyRole(['admin', 'manager']);
            },

            canDistribute: () => {
                return get().hasAnyRole(['admin', 'manager', 'distributor']);
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);

export { useAuthStore }; 