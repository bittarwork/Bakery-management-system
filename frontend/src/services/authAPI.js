import apiClient from './apiClient';

const authAPI = {
    // Set/remove authorization token
    setAuthToken: (token) => {
        if (token) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete apiClient.defaults.headers.common['Authorization'];
        }
    },

    // Login user
    login: async (credentials) => {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Logout user
    logout: async () => {
        try {
            const response = await apiClient.post('/auth/logout');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get current user
    getCurrentUser: async () => {
        try {
            const response = await apiClient.get('/auth/me');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Refresh token
    refreshToken: async () => {
        try {
            const response = await apiClient.post('/auth/refresh');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Change password
    changePassword: async (passwordData) => {
        try {
            const response = await apiClient.put('/auth/change-password', passwordData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default authAPI; 