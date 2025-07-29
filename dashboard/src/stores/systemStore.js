import { create } from 'zustand';
import { systemService } from '../services/systemService';
import { dashboardService } from '../services/dashboardService';

export const useSystemStore = create((set, get) => ({
    isInitialized: false,
    isLoading: false,
    error: null,
    systemSettings: null,
    systemSettingsInitialized: false,
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

    // Cache management
    lastFetchTime: null,
    pendingRequest: false,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds

    // Check if data is fresh and doesn't need refetching
    isDataFresh: () => {
        const state = get();
        if (!state.lastFetchTime) return false;

        const now = Date.now();
        const timeSinceLastFetch = now - state.lastFetchTime;

        return timeSinceLastFetch < state.CACHE_DURATION;
    },

    // Optimized fetchSystemStats with deduplication and caching
    fetchSystemStats: async (forceRefresh = false) => {
        const state = get();

        // If there's already a pending request, return early
        if (state.pendingRequest && !forceRefresh) {
            console.log('🚫 Request already pending, skipping duplicate fetch');
            return { success: true, message: 'Request already in progress' };
        }

        // If data is fresh and we're not forcing refresh, return cached data
        if (!forceRefresh && state.isDataFresh() && state.lastFetchTime) {
            console.log('📋 Using cached system stats (data is fresh)');
            return {
                success: true,
                data: state.systemStats,
                fromCache: true
            };
        }

        try {
            // Set pending request flag
            set({ pendingRequest: true, isLoading: true, error: null });

            console.log('🌐 Fetching fresh system stats...');

            // Fetch real data from dashboard service with force refresh
            const [statsResponse, activitiesResponse] = await Promise.allSettled([
                dashboardService.getDashboardStats(forceRefresh),
                dashboardService.getRecentActivities(forceRefresh)
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
            } else {
                console.warn('Failed to fetch stats, using default values');
            }

            // Process recent activities
            let activities = [];
            if (activitiesResponse.status === 'fulfilled') {
                activities = activitiesResponse.value || [];
            } else {
                console.warn('Failed to fetch activities, using empty array');
            }

            // Update state with new data and cache info
            const now = Date.now();
            set({
                systemStats: stats,
                recentActivities: activities,
                isLoading: false,
                error: null,
                pendingRequest: false,
                lastFetchTime: now
            });

            console.log('✅ System stats updated successfully');
            return { success: true, data: stats, timestamp: now };

        } catch (error) {
            console.error('❌ Error fetching system stats:', error);

            set({
                isLoading: false,
                error: error.message || 'Failed to fetch system stats',
                pendingRequest: false
            });

            return {
                success: false,
                message: error.message || 'Failed to fetch system stats'
            };
        }
    },

    // Force refresh system stats (bypasses cache)
    refreshSystemStats: async () => {
        console.log('🔄 Force refreshing system stats...');
        return await get().fetchSystemStats(true);
    },

    // Clear cache and force next fetch
    invalidateCache: () => {
        set({
            lastFetchTime: null,
            pendingRequest: false
        });
        console.log('🗑️ System stats cache invalidated');
    },

    initializeSystem: async () => {
        try {
            const state = get();

            // Prevent multiple initializations
            if (state.isInitialized) {
                console.log('✅ System already initialized');
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

            console.log('🚀 System initialized successfully');
        } catch (error) {
            console.error('❌ System initialization failed:', error);
            set({
                isInitialized: true,
                isLoading: false,
                error: error.message,
            });
        }
    },

    loadSystemSettings: async () => {
        try {
            const state = get();

            // Prevent multiple simultaneous loads
            if (state.isLoading) {
                console.log('⏳ System settings already loading...');
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
                console.log('✅ System settings loaded from API');
            } else {
                // If API fails or user is not authenticated, use default settings
                if (response.isUnauthorized) {
                    console.log('🔐 User not authenticated, using default system settings');
                } else {
                    console.warn('⚠️ Failed to load system settings from API, using defaults:', response.message);
                }

                const defaultSettings = get().getDefaultSettings();

                set({
                    systemSettings: defaultSettings,
                    isLoading: false,
                    error: response.isUnauthorized ? null : response.message,
                    systemSettingsInitialized: true
                });
                console.log('📋 Using default system settings');
            }
        } catch (error) {
            console.error('❌ Failed to load system settings:', error);

            // Use default settings even on error
            const defaultSettings = get().getDefaultSettings();

            set({
                systemSettings: defaultSettings,
                isLoading: false,
                error: error.message,
                systemSettingsInitialized: true
            });
            console.log('📋 Using default settings due to error');
        }
    },

    // Get default settings helper
    getDefaultSettings: () => ({
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
    }),

    // Initialize system store - this can be called without authentication
    initializeSystemStore: () => {
        const defaultSettings = get().getDefaultSettings();

        set({
            systemSettings: defaultSettings,
            isLoading: false,
            error: null,
            systemSettingsInitialized: true
        });
        console.log('🏪 System store initialized with defaults');
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
                console.log('✅ System settings updated successfully');
                return { success: true, data: response.data };
            } else {
                // If it's a network error, show appropriate message
                if (response.isNetworkError) {
                    const message = 'لا يمكن الاتصال بالخادم. تم حفظ الإعدادات محلياً.';
                    set({
                        isLoading: false,
                        error: message,
                    });
                    console.warn('⚠️ Network error during settings update');
                    return { success: false, message };
                }

                set({
                    isLoading: false,
                    error: response.message || 'Failed to update system settings',
                });
                console.error('❌ Failed to update system settings:', response.message);
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('❌ Error updating system settings:', error);

            // If it's a network error, show appropriate message
            if (error.isNetworkError) {
                const message = 'لا يمكن الاتصال بالخادم. تم حفظ الإعدادات محلياً.';
                set({
                    isLoading: false,
                    error: message,
                });
                return { success: false, message };
            }

            const message = error.message || 'Failed to update system settings';
            set({
                isLoading: false,
                error: message,
            });
            return { success: false, message };
        }
    },

    updateSystemStatus: (status) => {
        set((state) => ({
            systemStatus: {
                ...state.systemStatus,
                ...status,
                lastSync: new Date().toISOString(),
            },
        }));
        console.log('📊 System status updated:', status);
    },

    // Get cache info for debugging
    getCacheInfo: () => {
        const state = get();
        return {
            lastFetchTime: state.lastFetchTime,
            isDataFresh: state.isDataFresh(),
            pendingRequest: state.pendingRequest,
            cacheAge: state.lastFetchTime ? Date.now() - state.lastFetchTime : null
        };
    },

    // Reset store to initial state
    reset: () => {
        set({
            isInitialized: false,
            isLoading: false,
            error: null,
            systemSettings: null,
            systemSettingsInitialized: false,
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
            lastFetchTime: null,
            pendingRequest: false
        });
        console.log('🔄 System store reset to initial state');
    }
})); 