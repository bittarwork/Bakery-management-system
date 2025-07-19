import { apiService } from './apiService';

/**
 * Tax Service
 * Handles tax calculations and price history tracking
 */
class TaxService {
    constructor() {
        this.baseEndpoint = '/tax';
    }

    /**
     * Calculate tax for an order
     * @param {Object} orderData - Order data including items and amounts
     * @returns {Promise} Tax calculation result
     */
    async calculateTax(orderData) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/calculate`, orderData);
            return response;
        } catch (error) {
            throw new Error(`Failed to calculate tax: ${error.message}`);
        }
    }

    /**
     * Get tax configuration
     * @returns {Promise} Tax configuration
     */
    async getTaxConfig() {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/config`);
            return response;
        } catch (error) {
            throw new Error(`Failed to get tax config: ${error.message}`);
        }
    }

    /**
     * Update tax configuration
     * @param {Object} config - Tax configuration
     * @returns {Promise} Update result
     */
    async updateTaxConfig(config) {
        try {
            const response = await apiService.put(`${this.baseEndpoint}/config`, config);
            return response;
        } catch (error) {
            throw new Error(`Failed to update tax config: ${error.message}`);
        }
    }

    /**
     * Get price history for a product
     * @param {number} productId - Product ID
     * @param {Object} params - Query parameters
     * @returns {Promise} Price history
     */
    async getPriceHistory(productId, params = {}) {
        try {
            const response = await apiService.get(`/products/${productId}/price-history`, params);
            return response;
        } catch (error) {
            throw new Error(`Failed to get price history: ${error.message}`);
        }
    }

    /**
     * Record price change
     * @param {number} productId - Product ID
     * @param {Object} priceData - New price data
     * @returns {Promise} Price change result
     */
    async recordPriceChange(productId, priceData) {
        try {
            const response = await apiService.post(`/products/${productId}/price-history`, priceData);
            return response;
        } catch (error) {
            throw new Error(`Failed to record price change: ${error.message}`);
        }
    }

    /**
     * Get tax rates by region
     * @param {string} region - Region code
     * @returns {Promise} Tax rates
     */
    async getTaxRatesByRegion(region) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/rates/${region}`);
            return response;
        } catch (error) {
            throw new Error(`Failed to get tax rates: ${error.message}`);
        }
    }

    /**
     * Generate tax report
     * @param {Object} params - Report parameters
     * @returns {Promise} Tax report
     */
    async generateTaxReport(params) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/report`, params);
            return response;
        } catch (error) {
            throw new Error(`Failed to generate tax report: ${error.message}`);
        }
    }

    /**
     * Get tax exemptions
     * @returns {Promise} Tax exemptions
     */
    async getTaxExemptions() {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/exemptions`);
            return response;
        } catch (error) {
            throw new Error(`Failed to get tax exemptions: ${error.message}`);
        }
    }

    /**
     * Apply tax exemption
     * @param {Object} exemptionData - Exemption data
     * @returns {Promise} Exemption result
     */
    async applyTaxExemption(exemptionData) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/exemptions/apply`, exemptionData);
            return response;
        } catch (error) {
            throw new Error(`Failed to apply tax exemption: ${error.message}`);
        }
    }

    /**
     * Calculate multi-currency tax
     * @param {Object} orderData - Order data
     * @param {string} sourceCurrency - Source currency
     * @param {string} targetCurrency - Target currency
     * @returns {Promise} Multi-currency tax calculation
     */
    async calculateMultiCurrencyTax(orderData, sourceCurrency, targetCurrency) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/calculate/multi-currency`, {
                ...orderData,
                sourceCurrency,
                targetCurrency
            });
            return response;
        } catch (error) {
            throw new Error(`Failed to calculate multi-currency tax: ${error.message}`);
        }
    }

    /**
     * Get tax compliance status
     * @param {Object} params - Query parameters
     * @returns {Promise} Tax compliance status
     */
    async getTaxComplianceStatus(params) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/compliance`, params);
            return response;
        } catch (error) {
            throw new Error(`Failed to get tax compliance status: ${error.message}`);
        }
    }

    /**
     * Export tax data
     * @param {Object} params - Export parameters
     * @returns {Promise} Export result
     */
    async exportTaxData(params) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/export`, params);
            return response;
        } catch (error) {
            throw new Error(`Failed to export tax data: ${error.message}`);
        }
    }
}

export default new TaxService(); 