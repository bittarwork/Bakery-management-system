import apiService from './apiService.js';

/**
 * Dashboard Service
 * Provides real-time dashboard statistics and analytics
 */
class DashboardService {

    /**
     * Get comprehensive dashboard statistics
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Dashboard statistics
     */
    async getDashboardStats(options = {}) {
        try {
            const response = await apiService.get('/dashboard/stats', { params: options });
            return response;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب إحصائيات اللوحة الرئيسية',
                data: null
            };
        }
    }

    /**
     * Get daily overview
     * @param {string} dateFrom - Start date
     * @param {string} dateTo - End date
     * @param {string} currency - Currency (EUR/SYP)
     * @returns {Promise<Object>} Daily overview data
     */
    async getDailyOverview(dateFrom, dateTo, currency = 'EUR') {
        try {
            const params = { dateFrom, dateTo, currency };
            const response = await apiService.get('/dashboard/overview', { params });
            return response;
        } catch (error) {
            console.error('Error fetching daily overview:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب النظرة العامة اليومية',
                data: null
            };
        }
    }

    /**
     * Get sales metrics
     * @param {string} dateFrom - Start date
     * @param {string} dateTo - End date
     * @param {string} currency - Currency (EUR/SYP)
     * @returns {Promise<Object>} Sales metrics data
     */
    async getSalesMetrics(dateFrom, dateTo, currency = 'EUR') {
        try {
            const params = { dateFrom, dateTo, currency };
            const response = await apiService.get('/dashboard/sales', { params });
            return response;
        } catch (error) {
            console.error('Error fetching sales metrics:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب مقاييس المبيعات',
                data: null
            };
        }
    }

    /**
     * Get distribution metrics
     * @param {string} dateFrom - Start date
     * @param {string} dateTo - End date
     * @returns {Promise<Object>} Distribution metrics data
     */
    async getDistributionMetrics(dateFrom, dateTo) {
        try {
            const params = { dateFrom, dateTo };
            const response = await apiService.get('/dashboard/distribution', { params });
            return response;
        } catch (error) {
            console.error('Error fetching distribution metrics:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب مقاييس التوزيع',
                data: null
            };
        }
    }

    /**
     * Get payment metrics
     * @param {string} dateFrom - Start date
     * @param {string} dateTo - End date
     * @param {string} currency - Currency (EUR/SYP)
     * @returns {Promise<Object>} Payment metrics data
     */
    async getPaymentMetrics(dateFrom, dateTo, currency = 'EUR') {
        try {
            const params = { dateFrom, dateTo, currency };
            const response = await apiService.get('/dashboard/payments', { params });
            return response;
        } catch (error) {
            console.error('Error fetching payment metrics:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب مقاييس المدفوعات',
                data: null
            };
        }
    }

    /**
     * Get top performers
     * @param {string} dateFrom - Start date
     * @param {string} dateTo - End date
     * @param {string} currency - Currency (EUR/SYP)
     * @returns {Promise<Object>} Top performers data
     */
    async getTopPerformers(dateFrom, dateTo, currency = 'EUR') {
        try {
            const params = { dateFrom, dateTo, currency };
            const response = await apiService.get('/dashboard/top-performers', { params });
            return response;
        } catch (error) {
            console.error('Error fetching top performers:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب أفضل الأداء',
                data: null
            };
        }
    }

    /**
     * Get system health
     * @returns {Promise<Object>} System health data
     */
    async getSystemHealth() {
        try {
            const response = await apiService.get('/dashboard/health');
            return response;
        } catch (error) {
            console.error('Error fetching system health:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب صحة النظام',
                data: null
            };
        }
    }

    /**
     * Get order statistics
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Order statistics
     */
    async getOrderStatistics(options = {}) {
        try {
            const response = await apiService.get('/orders/statistics', { params: options });
            return response;
        } catch (error) {
            console.error('Error fetching order statistics:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب إحصائيات الطلبات',
                data: null
            };
        }
    }

    /**
     * Get payment statistics
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Payment statistics
     */
    async getPaymentStatistics(options = {}) {
        try {
            const response = await apiService.get('/payments/statistics', { params: options });
            return response;
        } catch (error) {
            console.error('Error fetching payment statistics:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب إحصائيات المدفوعات',
                data: null
            };
        }
    }

    /**
     * Get product statistics
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Product statistics
     */
    async getProductStatistics(options = {}) {
        try {
            const response = await apiService.get('/products/stats', { params: options });
            return response;
        } catch (error) {
            console.error('Error fetching product statistics:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب إحصائيات المنتجات',
                data: null
            };
        }
    }

    /**
     * Get store statistics
     * @param {number|null} storeId - Store ID (optional)
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Store statistics
     */
    async getStoreStatistics(storeId = null, options = {}) {
        try {
            const endpoint = storeId ? `/stores/${storeId}/statistics` : '/stores/statistics';
            const response = await apiService.get(endpoint, { params: options });
            return response;
        } catch (error) {
            console.error('Error fetching store statistics:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب إحصائيات المحلات',
                data: null
            };
        }
    }

    /**
     * Get user statistics
     * @param {Object} options - Query options
     * @returns {Promise<Object>} User statistics
     */
    async getUserStatistics(options = {}) {
        try {
            const response = await apiService.get('/users/statistics', { params: options });
            return response;
        } catch (error) {
            console.error('Error fetching user statistics:', error);
            return {
                success: false,
                message: error.message || 'خطأ في جلب إحصائيات المستخدمين',
                data: null
            };
        }
    }

    /**
     * Format currency value
     * @param {number} value - Value to format
     * @param {string} currency - Currency code
     * @returns {string} Formatted currency string
     */
    formatCurrency(value, currency = 'EUR') {
        if (!value || isNaN(value)) return '0';

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        return formatter.format(value);
    }

    /**
     * Calculate percentage change
     * @param {number} current - Current value
     * @param {number} previous - Previous value
     * @returns {number} Percentage change
     */
    calculatePercentageChange(current, previous) {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous * 100);
    }

    /**
     * Format percentage
     * @param {number} value - Value to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted percentage string
     */
    formatPercentage(value, decimals = 1) {
        if (!value || isNaN(value)) return '0%';
        return `${value.toFixed(decimals)}%`;
    }

    /**
     * Get default date range (last 30 days)
     * @returns {Object} Date range object
     */
    getDefaultDateRange() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        return {
            dateFrom: startDate.toISOString().split('T')[0],
            dateTo: endDate.toISOString().split('T')[0]
        };
    }
}

export default new DashboardService(); 