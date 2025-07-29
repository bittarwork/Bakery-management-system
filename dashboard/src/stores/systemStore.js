import { create } from 'zustand';
import { systemService } from '../services/systemService';
import { dashboardService } from '../services/dashboardService';

export const useSystemStore = create((set, get) => ({
    isInitialized: false,
    isLoading: false,
    error: null,
    systemSettings: null,
    systemSettingsInitialized: false, // Add flag for settings initialization
    systemStatus: {
        apiStatus: 'operational',
        lastSync: new Date().toISOString(),
    },
    systemStats: {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalStores: 0,
        totalUsers: 0,
        activeDistributors: 0,
        totalVehicles: 0,
        activeVehicles: 0
    },
    recentActivities: [],

    fetchSystemStats: async () => {
        try {
            set({ isLoading: true, error: null });

            // Fetch real data from all systems
            const [statsResponse, activitiesResponse] = await Promise.allSettled([
                dashboardService.getDashboardStats(),
                dashboardService.getRecentActivities()
            ]);

            let stats = {
                totalOrders: 0,
                pendingOrders: 0,
                completedOrders: 0,
                totalRevenue: 0,
                totalProducts: 0,
                totalStores: 0,
                totalUsers: 0,
                activeDistributors: 0,
                totalVehicles: 0,
                activeVehicles: 0
            };

            // Process orders stats
            if (statsResponse.status === 'fulfilled' && statsResponse.value.success) {
                const data = statsResponse.value.data;

                if (data.orders) {
                    stats.totalOrders = data.orders.totalOrders || 0;
                    stats.pendingOrders = data.orders.pendingOrders || 0;
                    stats.completedOrders = data.orders.completedOrders || 0;
                    stats.totalRevenue = data.orders.totalRevenue || 0;
                }

                if (data.products) {
                    stats.totalProducts = data.products.totalProducts || 0;
                }

                if (data.stores) {
                    stats.totalStores = data.stores.totalStores || 0;
                }

                if (data.users) {
                    stats.totalUsers = data.users.totalUsers || 0;
                    stats.activeDistributors = data.users.roleCounts?.distributor || 0;
                }

                if (data.vehicles) {
                    stats.totalVehicles = data.vehicles.totalVehicles || 0;
                    stats.activeVehicles = data.vehicles.activeVehicles || 0;
                }
            }

            // Process recent activities
            let activities = [];
            if (activitiesResponse.status === 'fulfilled') {
                activities = activitiesResponse.value || [];
            }

            set({
                systemStats: stats,
                recentActivities: activities,
                isLoading: false,
                error: null
            });

            return { success: true, data: stats };
        } catch (error) {
            console.error('Error fetching system stats:', error);
            set({
                isLoading: false,
                error: error.message || 'Failed to fetch system stats'
            });
            return { success: false, message: error.message };
        }
    },

    initializeSystem: async () => {
        try {
            // Prevent multiple initializations
            if (get().isInitialized) {
                return;
            }

            set({ isLoading: true });

            // TODO: Add system initialization logic
            // For now, just simulate initialization
            await new Promise(resolve => setTimeout(resolve, 500));

            set({
                isInitialized: true,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            set({
                isInitialized: true,
                isLoading: false,
                error: error.message,
            });
        }
    },

    loadSystemSettings: async () => {
        try {
            // Prevent multiple simultaneous loads
            if (get().isLoading) {
                return;
            }

            set({ isLoading: true, error: null });

            // Try to load from API first
            const response = await systemService.getSettings();

            if (response.success) {
                set({
                    systemSettings: response.data,
                    isLoading: false,
                    error: null,
                    systemSettingsInitialized: true
                });
            } else {
                // If API fails or user is not authenticated, use default settings
                if (response.isUnauthorized) {
                    console.log('User not authenticated, using default system settings');
                } else {
                    console.warn('Failed to load system settings from API, using defaults:', response.message);
                }
                const defaultSettings = {
                    dbHost: 'localhost',
                    dbPort: '3306',
                    dbName: 'bakery_db',
                    dbUser: 'root',
                    dbPassword: '',
                    emailHost: 'smtp.gmail.com',
                    emailPort: '587',
                    emailUser: '',
                    emailPassword: '',
                    jwtSecret: 'default-secret',
                    sessionTimeout: '3600',
                    systemName: 'Bakery Management System',
                    version: '1.0.0',
                    maintenanceMode: false,
                    debugMode: true
                };

                set({
                    systemSettings: defaultSettings,
                    isLoading: false,
                    error: response.isUnauthorized ? null : response.message,
                    systemSettingsInitialized: true
                });
            }
        } catch (error) {
            console.error('Failed to load system settings:', error);

            // Use default settings even on error
            const defaultSettings = {
                dbHost: 'localhost',
                dbPort: '3306',
                dbName: 'bakery_db',
                dbUser: 'root',
                dbPassword: '',
                emailHost: 'smtp.gmail.com',
                emailPort: '587',
                emailUser: '',
                emailPassword: '',
                jwtSecret: 'default-secret',
                sessionTimeout: '3600',
                systemName: 'Bakery Management System',
                version: '1.0.0',
                maintenanceMode: false,
                debugMode: true
            };

            set({
                systemSettings: defaultSettings,
                isLoading: false,
                error: error.message,
                systemSettingsInitialized: true
            });
        }
    },

    // Initialize system store - this can be called without authentication
    initializeSystemStore: () => {
        const defaultSettings = {
            dbHost: 'localhost',
            dbPort: '3306',
            dbName: 'bakery_db',
            dbUser: 'root',
            dbPassword: '',
            emailHost: 'smtp.gmail.com',
            emailPort: '587',
            emailUser: '',
            emailPassword: '',
            jwtSecret: 'default-secret',
            sessionTimeout: '3600',
            systemName: 'Bakery Management System',
            version: '1.0.0',
            maintenanceMode: false,
            debugMode: true
        };

        set({
            systemSettings: defaultSettings,
            isLoading: false,
            error: null,
            systemSettingsInitialized: true
        });
    },

    updateSystemSettings: async (settings) => {
        try {
            set({ isLoading: true, error: null });

            const response = await systemService.updateSettings(settings);

            if (response.success) {
                set({
                    systemSettings: response.data,
                    isLoading: false,
                    error: null,
                });
                return { success: true, data: response.data };
            } else {
                // If it's a network error, show appropriate message
                if (response.isNetworkError) {
                    set({
                        isLoading: false,
                        error: 'لا يمكن الاتصال بالخادم. تم حفظ الإعدادات محلياً.',
                    });
                    return { success: false, message: 'لا يمكن الاتصال بالخادم. تم حفظ الإعدادات محلياً.' };
                }

                set({
                    isLoading: false,
                    error: response.message || 'Failed to update system settings',
                });
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Error updating system settings:', error);

            // If it's a network error, show appropriate message
            if (error.isNetworkError) {
                set({
                    isLoading: false,
                    error: 'لا يمكن الاتصال بالخادم. تم حفظ الإعدادات محلياً.',
                });
                return { success: false, message: 'لا يمكن الاتصال بالخادم. تم حفظ الإعدادات محلياً.' };
            }

            set({
                isLoading: false,
                error: error.message || 'Failed to update system settings',
            });
            return { success: false, message: error.message || 'Failed to update system settings' };
        }
    },

    updateSystemStatus: (status) => {
        set((state) => ({
            systemStatus: {
                ...state.systemStatus,
                ...status,
            },
        }));
    },
})); 