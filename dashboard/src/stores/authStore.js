import { create } from 'zustand';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://bakery-management-system-production.up.railway.app/api';

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    initializeAuth: async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                set({ isLoading: false });
                return;
            }

            const response = await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            set({
                user: response.data,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: error.message,
            });
        }
    },

    login: async (username, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                username,
                password,
            });

            const { data } = response.data;
            const { token, user } = data;
            Cookies.set('token', token, { expires: 7 });

            set({
                user,
                isAuthenticated: true,
                error: null,
            });
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to login');
        }
    },

    logout: () => {
        Cookies.remove('token');
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
})); 