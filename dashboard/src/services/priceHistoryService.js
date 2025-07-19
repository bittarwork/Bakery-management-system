import { apiService } from './apiService';

/**
 * Price History Service
 * Handles price tracking and analytics
 */
class PriceHistoryService {
    constructor() {
        this.baseEndpoint = '/price-history';
    }

    /**
     * Get price history for a product
     * @param {number} productId - Product ID
     * @param {Object} params - Query parameters
     * @returns {Promise} Price history data
     */
    async getProductPriceHistory(productId, params = {}) {
        try {
            const queryParams = {
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                currency: params.currency || null,
                limit: params.limit || 50,
                page: params.page || 1,
                ...params
            };

            // Remove null values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(`${this.baseEndpoint}/products/${productId}`, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to get price history: ${error.message}`);
        }
    }

    /**
     * Record a price change
     * @param {number} productId - Product ID
     * @param {Object} priceData - Price change data
     * @returns {Promise} Price change result
     */
    async recordPriceChange(productId, priceData) {
        try {
            const data = {
                product_id: productId,
                old_price_eur: priceData.old_price_eur || null,
                new_price_eur: priceData.new_price_eur,
                old_price_syp: priceData.old_price_syp || null,
                new_price_syp: priceData.new_price_syp,
                currency: priceData.currency || 'EUR',
                change_reason: priceData.change_reason || 'Manual update',
                changed_by: priceData.changed_by || null,
                effective_date: priceData.effective_date || new Date().toISOString(),
                notes: priceData.notes || null,
                exchange_rate: priceData.exchange_rate || null,
                ...priceData
            };

            const response = await apiService.post(`${this.baseEndpoint}/record`, data);
            return response;
        } catch (error) {
            throw new Error(`Failed to record price change: ${error.message}`);
        }
    }

    /**
     * Get price analytics
     * @param {Object} params - Analytics parameters
     * @returns {Promise} Price analytics data
     */
    async getPriceAnalytics(params = {}) {
        try {
            const queryParams = {
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                product_ids: params.product_ids || null,
                category_ids: params.category_ids || null,
                currency: params.currency || null,
                analysis_type: params.analysis_type || 'trends',
                ...params
            };

            // Remove null values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(`${this.baseEndpoint}/analytics`, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to get price analytics: ${error.message}`);
        }
    }

    /**
     * Get price trends
     * @param {Object} params - Trend parameters
     * @returns {Promise} Price trends data
     */
    async getPriceTrends(params = {}) {
        try {
            const queryParams = {
                period: params.period || 'month', // 'day', 'week', 'month', 'year'
                product_ids: params.product_ids || null,
                category_ids: params.category_ids || null,
                currency: params.currency || 'EUR',
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                ...params
            };

            // Remove null values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(`${this.baseEndpoint}/trends`, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to get price trends: ${error.message}`);
        }
    }

    /**
     * Get price change notifications
     * @param {Object} params - Notification parameters
     * @returns {Promise} Price change notifications
     */
    async getPriceChangeNotifications(params = {}) {
        try {
            const queryParams = {
                threshold_percentage: params.threshold_percentage || 5,
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                product_ids: params.product_ids || null,
                notification_type: params.notification_type || 'significant_change',
                ...params
            };

            // Remove null values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(`${this.baseEndpoint}/notifications`, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to get price change notifications: ${error.message}`);
        }
    }

    /**
     * Bulk update prices
     * @param {Array} priceUpdates - Array of price updates
     * @returns {Promise} Bulk update result
     */
    async bulkUpdatePrices(priceUpdates) {
        try {
            const data = {
                updates: priceUpdates.map(update => ({
                    product_id: update.product_id,
                    new_price_eur: update.new_price_eur,
                    new_price_syp: update.new_price_syp,
                    currency: update.currency || 'EUR',
                    change_reason: update.change_reason || 'Bulk update',
                    effective_date: update.effective_date || new Date().toISOString(),
                    notes: update.notes || null,
                    ...update
                }))
            };

            const response = await apiService.post(`${this.baseEndpoint}/bulk-update`, data);
            return response;
        } catch (error) {
            throw new Error(`Failed to bulk update prices: ${error.message}`);
        }
    }

    /**
     * Get price comparison
     * @param {Object} params - Comparison parameters
     * @returns {Promise} Price comparison data
     */
    async getPriceComparison(params = {}) {
        try {
            const queryParams = {
                product_ids: params.product_ids || null,
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                comparison_type: params.comparison_type || 'period', // 'period', 'products', 'currencies'
                currency: params.currency || 'EUR',
                ...params
            };

            // Remove null values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(`${this.baseEndpoint}/comparison`, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to get price comparison: ${error.message}`);
        }
    }

    /**
     * Export price history
     * @param {Object} params - Export parameters
     * @returns {Promise} Export result
     */
    async exportPriceHistory(params = {}) {
        try {
            const queryParams = {
                format: params.format || 'csv', // 'csv', 'excel', 'json'
                product_ids: params.product_ids || null,
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                currency: params.currency || null,
                include_analytics: params.include_analytics || false,
                ...params
            };

            // Remove null values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(`${this.baseEndpoint}/export`, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to export price history: ${error.message}`);
        }
    }

    /**
     * Get price forecasting
     * @param {Object} params - Forecasting parameters
     * @returns {Promise} Price forecasting data
     */
    async getPriceForecasting(params = {}) {
        try {
            const queryParams = {
                product_ids: params.product_ids || null,
                forecast_period: params.forecast_period || 30, // days
                model_type: params.model_type || 'linear', // 'linear', 'polynomial', 'exponential'
                currency: params.currency || 'EUR',
                confidence_level: params.confidence_level || 0.95,
                ...params
            };

            // Remove null values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(`${this.baseEndpoint}/forecasting`, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to get price forecasting: ${error.message}`);
        }
    }

    /**
     * Get price volatility analysis
     * @param {Object} params - Volatility parameters
     * @returns {Promise} Price volatility data
     */
    async getPriceVolatility(params = {}) {
        try {
            const queryParams = {
                product_ids: params.product_ids || null,
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                currency: params.currency || 'EUR',
                volatility_type: params.volatility_type || 'standard_deviation',
                period: params.period || 'month',
                ...params
            };

            // Remove null values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(`${this.baseEndpoint}/volatility`, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to get price volatility: ${error.message}`);
        }
    }

    /**
     * Set price alerts
     * @param {Object} alertData - Alert configuration
     * @returns {Promise} Alert creation result
     */
    async setPriceAlert(alertData) {
        try {
            const data = {
                product_id: alertData.product_id,
                alert_type: alertData.alert_type || 'price_change', // 'price_change', 'threshold', 'percentage'
                threshold_value: alertData.threshold_value || null,
                threshold_type: alertData.threshold_type || 'percentage', // 'percentage', 'absolute'
                currency: alertData.currency || 'EUR',
                notification_method: alertData.notification_method || 'email', // 'email', 'sms', 'push'
                is_active: alertData.is_active !== undefined ? alertData.is_active : true,
                alert_name: alertData.alert_name || null,
                description: alertData.description || null,
                ...alertData
            };

            const response = await apiService.post(`${this.baseEndpoint}/alerts`, data);
            return response;
        } catch (error) {
            throw new Error(`Failed to set price alert: ${error.message}`);
        }
    }

    /**
     * Get price alerts
     * @param {Object} params - Query parameters
     * @returns {Promise} Price alerts
     */
    async getPriceAlerts(params = {}) {
        try {
            const queryParams = {
                product_ids: params.product_ids || null,
                alert_type: params.alert_type || null,
                is_active: params.is_active !== undefined ? params.is_active : null,
                currency: params.currency || null,
                ...params
            };

            // Remove null values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(`${this.baseEndpoint}/alerts`, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to get price alerts: ${error.message}`);
        }
    }

    /**
     * Calculate price impact
     * @param {Object} params - Price impact parameters
     * @returns {Promise} Price impact analysis
     */
    async calculatePriceImpact(params = {}) {
        try {
            const data = {
                product_id: params.product_id,
                old_price: params.old_price,
                new_price: params.new_price,
                currency: params.currency || 'EUR',
                date_from: params.date_from || null,
                date_to: params.date_to || null,
                include_sales_impact: params.include_sales_impact || true,
                include_revenue_impact: params.include_revenue_impact || true,
                ...params
            };

            const response = await apiService.post(`${this.baseEndpoint}/impact`, data);
            return response;
        } catch (error) {
            throw new Error(`Failed to calculate price impact: ${error.message}`);
        }
    }
}

export default new PriceHistoryService(); 