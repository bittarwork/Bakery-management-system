import { create } from 'zustand';
import { systemService } from '../services/systemService';

export const useSystemStore = create((set, get) => ({
    isInitialized: false,
    isLoading: false,
    error: null,
    systemSettings: null,
    systemStatus: {
        apiStatus: 'operational',
        lastSync: new Date().toISOString(),
    },

    initializeSystem: async () => {
        try {
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
                isInitialized: false,
                isLoading: false,
                error: error.message,
            });
        }
    },

    loadSystemSettings: async () => {
        try {
            set({ isLoading: true, error: null });
            
            const response = await systemService.getSettings();
            
            if (response.success) {
                set({
                    systemSettings: response.data,
                    isLoading: false,
                    error: null,
                });
            } else {
                set({
                    isLoading: false,
                    error: response.message || 'Failed to load system settings',
                });
            }
        } catch (error) {
            console.error('Error loading system settings:', error);
            set({
                isLoading: false,
                error: error.message || 'Failed to load system settings',
                systemSettings: null,
            });
        }
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
                set({
                    isLoading: false,
                    error: response.message || 'Failed to update system settings',
                });
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Error updating system settings:', error);
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