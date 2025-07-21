/**
 * Dashboard Service
 * Handles dashboard data and analytics
 * Phase 6 - Complete Order Management
 */

import apiService from './apiService';

class DashboardService {
    /**
     * Get comprehensive dashboard statistics
     */
    async getDashboardStats(params = {}) {
        const {
            period = 'today',
            include_details = false
        } = params;

        const queryParams = new URLSearchParams({
            period,
            include_details: include_details.toString()
        });

        return await apiService.get(`/dashboard/stats?${queryParams}`);
    }

    /**
     * Get daily overview
     */
    async getDailyOverview(date = null) {
        const queryParams = new URLSearchParams();
        if (date) {
            queryParams.append('date', date);
        }

        return await apiService.get(`/dashboard/overview?${queryParams}`);
    }

    /**
     * Get sales metrics
     */
    async getSalesMetrics(params = {}) {
        const {
            date_from,
            date_to,
            currency = 'EUR',
            include_breakdown = false
        } = params;

        const queryParams = new URLSearchParams({
            currency,
            include_breakdown: include_breakdown.toString()
        });

        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);

        return await apiService.get(`/dashboard/sales?${queryParams}`);
    }

    /**
     * Get distribution metrics
     */
    async getDistributionMetrics(params = {}) {
        const {
            date_from,
            date_to,
            distributor_id,
            include_analytics = false
        } = params;

        const queryParams = new URLSearchParams({
            include_analytics: include_analytics.toString()
        });

        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);
        if (distributor_id) queryParams.append('distributor_id', distributor_id);

        return await apiService.get(`/dashboard/distribution?${queryParams}`);
    }

    /**
     * Get payment metrics
     */
    async getPaymentMetrics(params = {}) {
        const {
            date_from,
            date_to,
            payment_method,
            include_reconciliation = false
        } = params;

        const queryParams = new URLSearchParams({
            include_reconciliation: include_reconciliation.toString()
        });

        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);
        if (payment_method) queryParams.append('payment_method', payment_method);

        return await apiService.get(`/dashboard/payments?${queryParams}`);
    }

    /**
     * Get top performers
     */
    async getTopPerformers(params = {}) {
        const {
            category = 'all',
            limit = 10,
            period = 'month'
        } = params;

        const queryParams = new URLSearchParams({
            category,
            limit: limit.toString(),
            period
        });

        return await apiService.get(`/dashboard/top-performers?${queryParams}`);
    }

    /**
     * Get system health
     */
    async getSystemHealth() {
        return await apiService.get('/dashboard/health');
    }

    /**
     * Get distribution overview
     */
    async getDistributionOverview(params = {}) {
        const {
            period = 'today',
            include_trends = true,
            include_forecasts = false
        } = params;

        const queryParams = new URLSearchParams({
            period,
            include_trends: include_trends.toString(),
            include_forecasts: include_forecasts.toString()
        });

        return await apiService.get(`/dashboard/distribution/overview?${queryParams}`);
    }

    /**
     * Get real-time alerts
     */
    async getRealTimeAlerts(params = {}) {
        const {
            alert_type = 'all',
            severity = 'all',
            limit = 20
        } = params;

        const queryParams = new URLSearchParams({
            alert_type,
            severity,
            limit: limit.toString()
        });

        return await apiService.get(`/dashboard/alerts?${queryParams}`);
    }

    /**
     * Get performance trends
     */
    async getPerformanceTrends(params = {}) {
        const {
            metric = 'delivery_time',
            period = 'week',
            distributor_id,
            include_comparison = false
        } = params;

        const queryParams = new URLSearchParams({
            metric,
            period,
            include_comparison: include_comparison.toString()
        });

        if (distributor_id) queryParams.append('distributor_id', distributor_id);

        return await apiService.get(`/dashboard/trends?${queryParams}`);
    }

    /**
     * Get geographic distribution data
     */
    async getGeographicDistribution(params = {}) {
        const {
            date_from,
            date_to,
            include_heatmap = false
        } = params;

        const queryParams = new URLSearchParams({
            include_heatmap: include_heatmap.toString()
        });

        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);

        return await apiService.get(`/dashboard/geographic?${queryParams}`);
    }

    /**
     * Get customer satisfaction metrics
     */
    async getCustomerSatisfaction(params = {}) {
        const {
            date_from,
            date_to,
            distributor_id,
            include_feedback = false
        } = params;

        const queryParams = new URLSearchParams({
            include_feedback: include_feedback.toString()
        });

        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);
        if (distributor_id) queryParams.append('distributor_id', distributor_id);

        return await apiService.get(`/dashboard/satisfaction?${queryParams}`);
    }

    /**
     * Get operational efficiency metrics
     */
    async getOperationalEfficiency(params = {}) {
        const {
            date_from,
            date_to,
            efficiency_type = 'all',
            include_benchmarks = false
        } = params;

        const queryParams = new URLSearchParams({
            efficiency_type,
            include_benchmarks: include_benchmarks.toString()
        });

        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);

        return await apiService.get(`/dashboard/efficiency?${queryParams}`);
    }

    /**
     * Get cost analysis
     */
    async getCostAnalysis(params = {}) {
        const {
            date_from,
            date_to,
            cost_category = 'all',
            include_breakdown = true
        } = params;

        const queryParams = new URLSearchParams({
            cost_category,
            include_breakdown: include_breakdown.toString()
        });

        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);

        return await apiService.get(`/dashboard/costs?${queryParams}`);
    }

    /**
     * Get inventory insights
     */
    async getInventoryInsights(params = {}) {
        const {
            product_category = 'all',
            include_alerts = true,
            include_forecasts = false
        } = params;

        const queryParams = new URLSearchParams({
            product_category,
            include_alerts: include_alerts.toString(),
            include_forecasts: include_forecasts.toString()
        });

        return await apiService.get(`/dashboard/inventory?${queryParams}`);
    }

    /**
     * Get weather impact analysis
     */
    async getWeatherImpact(params = {}) {
        const {
            location,
            date_from,
            date_to,
            include_forecast = false
        } = params;

        const queryParams = new URLSearchParams({
            include_forecast: include_forecast.toString()
        });

        if (location) queryParams.append('location', location);
        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);

        return await apiService.get(`/dashboard/weather?${queryParams}`);
    }

    /**
     * Get traffic analysis
     */
    async getTrafficAnalysis(params = {}) {
        const {
            route,
            time_slot,
            day_of_week,
            include_predictions = false
        } = params;

        const queryParams = new URLSearchParams({
            include_predictions: include_predictions.toString()
        });

        if (route) queryParams.append('route', route);
        if (time_slot) queryParams.append('time_slot', time_slot);
        if (day_of_week) queryParams.append('day_of_week', day_of_week);

        return await apiService.get(`/dashboard/traffic?${queryParams}`);
    }

    /**
     * Get sustainability metrics
     */
    async getSustainabilityMetrics(params = {}) {
        const {
            date_from,
            date_to,
            metric_type = 'all',
            include_comparison = false
        } = params;

        const queryParams = new URLSearchParams({
            metric_type,
            include_comparison: include_comparison.toString()
        });

        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);

        return await apiService.get(`/dashboard/sustainability?${queryParams}`);
    }

    /**
     * Get quality metrics
     */
    async getQualityMetrics(params = {}) {
        const {
            date_from,
            date_to,
            quality_type = 'all',
            include_details = false
        } = params;

        const queryParams = new URLSearchParams({
            quality_type,
            include_details: include_details.toString()
        });

        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);

        return await apiService.get(`/dashboard/quality?${queryParams}`);
    }

    /**
     * Get compliance metrics
     */
    async getComplianceMetrics(params = {}) {
        const {
            compliance_type = 'all',
            include_violations = true,
            include_certifications = false
        } = params;

        const queryParams = new URLSearchParams({
            compliance_type,
            include_violations: include_violations.toString(),
            include_certifications: include_certifications.toString()
        });

        return await apiService.get(`/dashboard/compliance?${queryParams}`);
    }

    /**
     * Get training and development metrics
     */
    async getTrainingMetrics(params = {}) {
        const {
            date_from,
            date_to,
            training_type = 'all',
            include_certifications = true
        } = params;

        const queryParams = new URLSearchParams({
            training_type,
            include_certifications: include_certifications.toString()
        });

        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);

        return await apiService.get(`/dashboard/training?${queryParams}`);
    }

    /**
     * Get equipment and maintenance metrics
     */
    async getEquipmentMetrics(params = {}) {
        const {
            equipment_type = 'all',
            include_maintenance = true,
            include_utilization = false
        } = params;

        const queryParams = new URLSearchParams({
            equipment_type,
            include_maintenance: include_maintenance.toString(),
            include_utilization: include_utilization.toString()
        });

        return await apiService.get(`/dashboard/equipment?${queryParams}`);
    }

    /**
     * Get communication metrics
     */
    async getCommunicationMetrics(params = {}) {
        const {
            date_from,
            date_to,
            communication_type = 'all',
            include_sentiment = false
        } = params;

        const queryParams = new URLSearchParams({
            communication_type,
            include_sentiment: include_sentiment.toString()
        });

        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);

        return await apiService.get(`/dashboard/communication?${queryParams}`);
    }

    /**
     * Get emergency response metrics
     */
    async getEmergencyMetrics(params = {}) {
        const {
            date_from,
            date_to,
            emergency_type = 'all',
            include_response_times = true
        } = params;

        const queryParams = new URLSearchParams({
            emergency_type,
            include_response_times: include_response_times.toString()
        });

        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);

        return await apiService.get(`/dashboard/emergency?${queryParams}`);
    }

    /**
     * Get backup and contingency metrics
     */
    async getBackupMetrics(params = {}) {
        const {
            backup_type = 'all',
            include_availability = true,
            include_performance = false
        } = params;

        const queryParams = new URLSearchParams({
            backup_type,
            include_availability: include_availability.toString(),
            include_performance: include_performance.toString()
        });

        return await apiService.get(`/dashboard/backup?${queryParams}`);
    }

    /**
     * Export dashboard data
     */
    async exportDashboardData(params = {}) {
        const {
            export_type = 'summary',
            date_from,
            date_to,
            format = 'pdf'
        } = params;

        const queryParams = new URLSearchParams({
            export_type,
            format
        });

        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);

        return await apiService.get(`/dashboard/export?${queryParams}`, {
            responseType: 'blob'
        });
    }

    /**
     * Get dashboard configuration
     */
    async getDashboardConfig() {
        return await apiService.get('/dashboard/config');
    }

    /**
     * Update dashboard configuration
     */
    async updateDashboardConfig(config) {
        return await apiService.put('/dashboard/config', config);
    }

    /**
     * Get user preferences
     */
    async getUserPreferences() {
        return await apiService.get('/dashboard/preferences');
    }

    /**
     * Update user preferences
     */
    async updateUserPreferences(preferences) {
        return await apiService.put('/dashboard/preferences', preferences);
    }
}

export default new DashboardService(); 