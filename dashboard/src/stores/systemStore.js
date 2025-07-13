import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'https://bakery-management-system-production.up.railway.app/api';

export const useSystemStore = create((set) => ({
    isInitialized: false,
    isLoading: false,
    error: null,
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

    updateSystemStatus: (status) => {
        set((state) => ({
            systemStatus: {
                ...state.systemStatus,
                ...status,
            },
        }));
    },
})); 