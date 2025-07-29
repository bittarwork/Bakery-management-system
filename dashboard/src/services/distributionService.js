import apiService from './apiService';

// API endpoints for distribution management
const DISTRIBUTION_API_BASE = '/distribution';

export const distributionService = {
    // Get distribution schedules with filters
    getDistributionSchedules: async (params = {}) => {
        try {
            const response = await apiService.get(`${DISTRIBUTION_API_BASE}/schedules`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching distribution schedules:', error);
            throw error;
        }
    },

    // Get single distribution schedule by ID
    getDistributionSchedule: async (id) => {
        try {
            const response = await apiService.get(`${DISTRIBUTION_API_BASE}/schedules/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching distribution schedule:', error);
            throw error;
        }
    },

    // Get today's schedules for all distributors
    getTodaySchedules: async (distributorId = null) => {
        try {
            const params = distributorId ? { distributor_id: distributorId } : {};
            const response = await apiService.get(`${DISTRIBUTION_API_BASE}/schedules/today`, {
                params
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching today schedules:', error);
            throw error;
        }
    },

    // Get distributor's schedule for specific date
    getDistributorSchedule: async (distributorId, date) => {
        try {
            const response = await apiService.get(
                `${DISTRIBUTION_API_BASE}/schedules/distributor/${distributorId}`,
                {
                    params: { date }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching distributor schedule:', error);
            throw error;
        }
    },

    // Generate daily schedule for distributor
    generateDistributionSchedule: async (scheduleData) => {
        try {
            const response = await apiService.post(
                `${DISTRIBUTION_API_BASE}/schedules/generate`,
                scheduleData
            );
            return response.data;
        } catch (error) {
            console.error('Error generating distribution schedule:', error);
            throw error;
        }
    },

    // Update distribution schedule item
    updateDistributionSchedule: async (id, updateData) => {
        try {
            const response = await apiService.put(
                `${DISTRIBUTION_API_BASE}/schedules/${id}`,
                updateData
            );
            return response.data;
        } catch (error) {
            console.error('Error updating distribution schedule:', error);
            throw error;
        }
    },

    // Start store visit
    startStoreVisit: async (scheduleId, locationData = null) => {
        try {
            const response = await apiService.post(
                `${DISTRIBUTION_API_BASE}/schedules/${scheduleId}/start`,
                { location: locationData }
            );
            return response.data;
        } catch (error) {
            console.error('Error starting store visit:', error);
            throw error;
        }
    },

    // Complete store visit
    completeStoreVisit: async (scheduleId, notes = '', locationData = null) => {
        try {
            const response = await apiService.post(
                `${DISTRIBUTION_API_BASE}/schedules/${scheduleId}/complete`,
                {
                    notes,
                    location: locationData
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error completing store visit:', error);
            throw error;
        }
    },

    // Cancel store visit
    cancelStoreVisit: async (scheduleId, reason) => {
        try {
            const response = await apiService.post(
                `${DISTRIBUTION_API_BASE}/schedules/${scheduleId}/cancel`,
                { reason }
            );
            return response.data;
        } catch (error) {
            console.error('Error cancelling store visit:', error);
            throw error;
        }
    },

    // Get schedule statistics
    getScheduleStatistics: async (distributorId = null, date = null) => {
        try {
            const params = {};
            if (distributorId) params.distributor_id = distributorId;
            if (date) params.date = date;

            const response = await apiService.get(
                `${DISTRIBUTION_API_BASE}/schedules/statistics`,
                { params }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching schedule statistics:', error);
            throw error;
        }
    },

    // Delete distribution schedule
    deleteDistributionSchedule: async (id) => {
        try {
            const response = await apiService.delete(`${DISTRIBUTION_API_BASE}/schedules/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting distribution schedule:', error);
            throw error;
        }
    },

    // Get automatic distribution schedules for all distributors
    getAutoDistributionSchedules: async (scheduleDate = null) => {
        try {
            const params = {};
            if (scheduleDate) params.schedule_date = scheduleDate;

            // Try the main endpoint first
            try {
                const response = await apiService.get(
                    `${DISTRIBUTION_API_BASE}/schedules/auto`,
                    { params }
                );
                return response.data;
            } catch (mainError) {
                console.warn('Main auto endpoint failed, trying fallback:', mainError.message);
                
                // Fallback to direct route
                const fallbackResponse = await apiService.get(
                    `${DISTRIBUTION_API_BASE}/schedules/auto-direct`,
                    { params }
                );
                return fallbackResponse.data;
            }
        } catch (error) {
            console.error('Error fetching auto distribution schedules:', error);
            throw error;
        }
    }
};

export default distributionService;