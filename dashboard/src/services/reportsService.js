import apiService from './apiService';

class ReportsService {
    /**
     * Get detailed report based on type and parameters
     */
    async getDetailedReport({ type, dateRange, storeId = null }) {
        try {
            const params = new URLSearchParams({
                type,
                dateRange,
                ...(storeId && { storeId })
            });

            const response = await apiService.get(`/reports/detailed?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching detailed report:', error);
            throw error;
        }
    }

    /**
     * Get profitability analysis
     */
    async getProfitabilityAnalysis(dateRange = 'last30days', storeId = null) {
        try {
            const params = new URLSearchParams({
                dateRange,
                ...(storeId && { storeId })
            });

            const response = await apiService.get(`/reports/profitability?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching profitability analysis:', error);
            throw error;
        }
    }

    /**
     * Get peak hours analysis
     */
    async getPeakHoursAnalysis(dateRange = 'last30days', storeId = null) {
        try {
            const params = new URLSearchParams({
                dateRange,
                ...(storeId && { storeId })
            });

            const response = await apiService.get(`/reports/peak-hours?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching peak hours analysis:', error);
            throw error;
        }
    }

    /**
     * Get store performance comparison
     */
    async getStorePerformance(dateRange = 'last30days') {
        try {
            const params = new URLSearchParams({ dateRange });
            const response = await apiService.get(`/reports/store-performance?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching store performance:', error);
            throw error;
        }
    }

    /**
     * Get product trends analysis
     */
    async getProductTrends(dateRange = 'last30days', storeId = null) {
        try {
            const params = new URLSearchParams({
                dateRange,
                ...(storeId && { storeId })
            });

            const response = await apiService.get(`/reports/product-trends?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching product trends:', error);
            throw error;
        }
    }

    /**
     * Get customer behavior analysis
     */
    async getCustomerBehavior(dateRange = 'last30days', storeId = null) {
        try {
            const params = new URLSearchParams({
                dateRange,
                ...(storeId && { storeId })
            });

            const response = await apiService.get(`/reports/customer-behavior?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching customer behavior:', error);
            throw error;
        }
    }

    /**
     * Get inventory optimization recommendations
     */
    async getInventoryOptimization(dateRange = 'last30days', storeId = null) {
        try {
            const params = new URLSearchParams({
                dateRange,
                ...(storeId && { storeId })
            });

            const response = await apiService.get(`/reports/inventory-optimization?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching inventory optimization:', error);
            throw error;
        }
    }

    /**
     * Export report to PDF/Excel
     */
    async exportReport({ type, data, dateRange, format = 'pdf' }) {
        try {
            const response = await apiService.post('/reports/export', {
                type,
                data,
                dateRange,
                format
            }, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report-${type}-${dateRange}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error('Error exporting report:', error);
            throw error;
        }
    }

    /**
     * Get report templates
     */
    async getReportTemplates() {
        try {
            const response = await apiService.get('/reports/templates');
            return response;
        } catch (error) {
            console.error('Error fetching report templates:', error);
            throw error;
        }
    }

    /**
     * Save custom report configuration
     */
    async saveReportConfiguration(config) {
        try {
            const response = await apiService.post('/reports/configurations', config);
            return response;
        } catch (error) {
            console.error('Error saving report configuration:', error);
            throw error;
        }
    }

    /**
     * Get saved report configurations
     */
    async getReportConfigurations() {
        try {
            const response = await apiService.get('/reports/configurations');
            return response;
        } catch (error) {
            console.error('Error fetching report configurations:', error);
            throw error;
        }
    }

    /**
     * Generate financial summary report
     */
    async getFinancialSummary(dateRange = 'last30days') {
        try {
            const params = new URLSearchParams({ dateRange });
            const response = await apiService.get(`/reports/financial-summary?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching financial summary:', error);
            throw error;
        }
    }

    /**
     * Get comparative analysis between periods
     */
    async getComparativeAnalysis({ currentPeriod, previousPeriod, metrics }) {
        try {
            const response = await apiService.post('/reports/comparative-analysis', {
                currentPeriod,
                previousPeriod,
                metrics
            });
            return response;
        } catch (error) {
            console.error('Error fetching comparative analysis:', error);
            throw error;
        }
    }

    /**
     * Generate AI-powered insights report
     */
    async getAIInsights(reportType, data) {
        try {
            const response = await apiService.post('/reports/ai-insights', {
                reportType,
                data
            });
            return response;
        } catch (error) {
            console.error('Error fetching AI insights:', error);
            throw error;
        }
    }

    /**
     * Get real-time analytics dashboard data
     */
    async getRealTimeAnalytics() {
        try {
            const response = await apiService.get('/reports/real-time');
            return response;
        } catch (error) {
            console.error('Error fetching real-time analytics:', error);
            throw error;
        }
    }

    /**
     * Schedule automated report
     */
    async scheduleReport({ reportType, frequency, recipients, parameters }) {
        try {
            const response = await apiService.post('/reports/schedule', {
                reportType,
                frequency,
                recipients,
                parameters
            });
            return response;
        } catch (error) {
            console.error('Error scheduling report:', error);
            throw error;
        }
    }

    /**
     * Get scheduled reports
     */
    async getScheduledReports() {
        try {
            const response = await apiService.get('/reports/scheduled');
            return response;
        } catch (error) {
            console.error('Error fetching scheduled reports:', error);
            throw error;
        }
    }
}

export const reportsService = new ReportsService();
export default reportsService; 