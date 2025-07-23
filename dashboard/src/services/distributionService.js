import apiService from './apiService.js';

/**
 * Distribution Service
 * Handles distribution trips, store visits, and delivery scheduling
 */
class DistributionService {
    constructor() {
        this.baseEndpoint = '/distribution';
    }

    /**
     * Get all distribution trips
     * @param {Object} params - Query parameters
     * @returns {Promise} API response
     */
    async getDistributionTrips(params = {}) {
        try {
            const queryParams = {
                date: params.date || null,
                distributor_id: params.distributor_id || null,
                status: params.status || null,
                page: params.page || 1,
                limit: params.limit || 10
            };

            // Remove null values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(`${this.baseEndpoint}/trips`, queryParams);
            return response;
        } catch (error) {
            console.error('Error fetching distribution trips:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب رحلات التوزيع',
                data: null
            };
        }
    }

    /**
     * Get store visits
     * @param {Object} params - Query parameters
     * @returns {Promise} API response
     */
    async getStoreVisits(params = {}) {
        try {
            const queryParams = {
                trip_id: params.trip_id || null,
                store_id: params.store_id || null,
                visit_status: params.visit_status || null,
                date: params.date || null
            };

            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(`${this.baseEndpoint}/trips/visits`, queryParams);
            return response;
        } catch (error) {
            console.error('Error fetching store visits:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب زيارات المحلات',
                data: null
            };
        }
    }

    /**
     * Get distribution statistics
     */
    async getDistributionStats(params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/trips/stats`, params);
            return response;
        } catch (error) {
            console.error('Error fetching distribution statistics:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب إحصائيات التوزيع',
                data: null
            };
        }
    }

    /**
     * Format trip data for display
     */
    formatTripForDisplay(trip) {
        return {
            ...trip,
            completion_rate: trip.total_stores > 0 ?
                ((trip.completed_stores / trip.total_stores) * 100).toFixed(1) : 0,
            status_display: this.getStatusDisplayName(trip.status),
            formatted_amount_eur: new Intl.NumberFormat('ar-SA', {
                style: 'currency',
                currency: 'EUR'
            }).format(trip.total_amount_eur || 0)
        };
    }

    /**
     * Get status display name
     */
    getStatusDisplayName(status) {
        const statusMap = {
            'pending': 'في الانتظار',
            'in_progress': 'قيد التنفيذ',
            'completed': 'مكتمل',
            'cancelled': 'ملغي'
        };
        return statusMap[status] || status;
    }

    /**
     * Get status options for filters
     */
    getStatusOptions() {
        return [
            { value: '', label: 'جميع الحالات' },
            { value: 'pending', label: 'في الانتظار', color: 'yellow' },
            { value: 'in_progress', label: 'قيد التنفيذ', color: 'blue' },
            { value: 'completed', label: 'مكتمل', color: 'green' },
            { value: 'cancelled', label: 'ملغي', color: 'red' }
        ];
    }
}

// Create and export service instance
const distributionService = new DistributionService();
export default distributionService;