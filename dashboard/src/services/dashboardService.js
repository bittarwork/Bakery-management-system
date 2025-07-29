/**
 * Dashboard Service
 * Handles dashboard data and analytics
 * Phase 6 - Complete Order Management
 */

import { apiClient } from './apiService.js';

class DashboardService {
    /**
 * Format currency value
 */
    formatCurrency(amount, currency = 'EUR') {
        if (amount === null || amount === undefined) {
            return '€0.00';
        }

        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

        if (isNaN(numericAmount)) {
            return '€0.00';
        }

        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numericAmount);
    }

    /**
     * Get default date range (last 30 days)
     */
    getDefaultDateRange() {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        return {
            dateFrom: thirtyDaysAgo.toISOString().split('T')[0],
            dateTo: today.toISOString().split('T')[0]
        };
    }

    /**
     * Get date range for specific period
     */
    getDateRange(period = 'month') {
        const today = new Date();
        const startDate = new Date();

        switch (period) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(today.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(today.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(today.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(today.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(today.getMonth() - 1);
        }

        return {
            dateFrom: startDate.toISOString().split('T')[0],
            dateTo: today.toISOString().split('T')[0]
        };
    }

    // Get comprehensive dashboard statistics
    async getDashboardStats() {
        try {
            const [
                ordersResponse,
                productsResponse,
                storesResponse,
                usersResponse,
                vehiclesResponse
            ] = await Promise.allSettled([
                this.getOrdersStats(),
                this.getProductsStats(),
                this.getStoresStats(),
                this.getUsersStats(),
                this.getVehiclesStats()
            ]);

            const stats = {
                orders: ordersResponse.status === 'fulfilled' ? ordersResponse.value : null,
                products: productsResponse.status === 'fulfilled' ? productsResponse.value : null,
                stores: storesResponse.status === 'fulfilled' ? storesResponse.value : null,
                users: usersResponse.status === 'fulfilled' ? usersResponse.value : null,
                vehicles: vehiclesResponse.status === 'fulfilled' ? vehiclesResponse.value : null
            };

            return {
                success: true,
                data: stats
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch dashboard statistics'
            };
        }
    }

    // Get orders statistics
    async getOrdersStats() {
        try {
            const response = await apiClient.get('/orders?limit=100');
            console.log('Orders API Response:', response);
            
            if (response.data && response.data.success) {
                const orders = response.data.data.orders || [];
                const totalOrders = response.data.data.pagination?.total || orders.length;
                
                // Count orders by status
                const statusCounts = {
                    draft: 0,
                    confirmed: 0,
                    in_progress: 0,
                    delivered: 0,
                    cancelled: 0
                };

                orders.forEach(order => {
                    if (statusCounts.hasOwnProperty(order.status)) {
                        statusCounts[order.status]++;
                    }
                });

                // Calculate total revenue from delivered orders
                const deliveredOrders = orders.filter(order => order.status === 'delivered');
                const totalRevenue = deliveredOrders.reduce((sum, order) => {
                    return sum + (parseFloat(order.final_amount_eur) || 0);
                }, 0);

                return {
                    totalOrders,
                    pendingOrders: statusCounts.confirmed + statusCounts.in_progress,
                    completedOrders: statusCounts.delivered,
                    cancelledOrders: statusCounts.cancelled,
                    totalRevenue,
                    recentOrders: orders.slice(0, 5)
                };
            }

            return {
                totalOrders: 0,
                pendingOrders: 0,
                completedOrders: 0,
                cancelledOrders: 0,
                totalRevenue: 0,
                recentOrders: []
            };
        } catch (error) {
            console.error('Error fetching orders stats:', error);
            return {
                totalOrders: 0,
                pendingOrders: 0,
                completedOrders: 0,
                cancelledOrders: 0,
                totalRevenue: 0,
                recentOrders: []
            };
        }
    }

    // Get products statistics
    async getProductsStats() {
        try {
            const response = await apiClient.get('/products?limit=100');
            console.log('Products API Response:', response);
            
            if (response.data && response.data.success) {
                const products = response.data.data.products || [];
                const totalProducts = response.data.data.pagination?.total || products.length;
                
                // Count active products
                const activeProducts = products.filter(product => product.status === 'active').length;
                
                // Count featured products
                const featuredProducts = products.filter(product => product.is_featured).length;

                return {
                    totalProducts,
                    activeProducts,
                    featuredProducts,
                    recentProducts: products.slice(0, 5)
                };
            }

            return {
                totalProducts: 0,
                activeProducts: 0,
                featuredProducts: 0,
                recentProducts: []
            };
        } catch (error) {
            console.error('Error fetching products stats:', error);
            return {
                totalProducts: 0,
                activeProducts: 0,
                featuredProducts: 0,
                recentProducts: []
            };
        }
    }

    // Get stores statistics
    async getStoresStats() {
        try {
            const response = await apiClient.get('/stores?limit=100');
            console.log('Stores API Response:', response);
            
            if (response.data && response.data.success) {
                const stores = response.data.data.stores || [];
                const totalStores = response.data.data.pagination?.total || stores.length;
                
                // Count active stores
                const activeStores = stores.filter(store => store.status === 'active').length;

                return {
                    totalStores,
                    activeStores,
                    recentStores: stores.slice(0, 5)
                };
            }

            return {
                totalStores: 0,
                activeStores: 0,
                recentStores: []
            };
        } catch (error) {
            console.error('Error fetching stores stats:', error);
            return {
                totalStores: 0,
                activeStores: 0,
                recentStores: []
            };
        }
    }

    // Get users statistics
    async getUsersStats() {
        try {
            const response = await apiClient.get('/users?limit=100');
            console.log('Users API Response:', response);
            
            if (response.data && response.data.success) {
                const users = response.data.data.users || [];
                const totalUsers = response.data.data.pagination?.total || users.length;
                
                // Count users by role
                const roleCounts = {
                    admin: 0,
                    manager: 0,
                    distributor: 0,
                    assistant: 0
                };

                users.forEach(user => {
                    if (roleCounts.hasOwnProperty(user.role)) {
                        roleCounts[user.role]++;
                    }
                });

                // Count active users
                const activeUsers = users.filter(user => user.status === 'active').length;

                return {
                    totalUsers,
                    activeUsers,
                    roleCounts,
                    recentUsers: users.slice(0, 5)
                };
            }

            return {
                totalUsers: 0,
                activeUsers: 0,
                roleCounts: {
                    admin: 0,
                    manager: 0,
                    distributor: 0,
                    assistant: 0
                },
                recentUsers: []
            };
        } catch (error) {
            console.error('Error fetching users stats:', error);
            return {
                totalUsers: 0,
                activeUsers: 0,
                roleCounts: {
                    admin: 0,
                    manager: 0,
                    distributor: 0,
                    assistant: 0
                },
                recentUsers: []
            };
        }
    }

    // Get vehicles statistics
    async getVehiclesStats() {
        try {
            const response = await apiClient.get('/vehicles?limit=100');
            console.log('Vehicles API Response:', response);
            
            if (response.data && response.data.success) {
                const vehicles = response.data.data.vehicles || [];
                const totalVehicles = response.data.data.pagination?.total || vehicles.length;
                
                // Count active vehicles
                const activeVehicles = vehicles.filter(vehicle => vehicle.status === 'active').length;

                return {
                    totalVehicles,
                    activeVehicles,
                    recentVehicles: vehicles.slice(0, 5)
                };
            }

            return {
                totalVehicles: 0,
                activeVehicles: 0,
                recentVehicles: []
            };
        } catch (error) {
            console.error('Error fetching vehicles stats:', error);
            return {
                totalVehicles: 0,
                activeVehicles: 0,
                recentVehicles: []
            };
        }
    }

    // Get payments statistics
    async getPaymentsStats() {
        try {
            const response = await apiClient.get('/payments?limit=1');

            if (response.success) {
                const payments = response.data.payments || [];
                const totalPayments = response.data.total || 0;

                // Calculate total revenue
                const totalRevenue = payments.reduce((sum, payment) => {
                    return sum + (payment.amount || 0);
                }, 0);

                // Count payments by status
                const statusCounts = {
                    pending: 0,
                    partial: 0,
                    paid: 0,
                    overdue: 0
                };

                payments.forEach(payment => {
                    if (statusCounts.hasOwnProperty(payment.status)) {
                        statusCounts[payment.status]++;
                    }
                });

                return {
                    totalPayments,
                    totalRevenue,
                    statusCounts,
                    recentPayments: payments.slice(0, 5)
                };
            }

            return null;
        } catch (error) {
            console.error('Error fetching payments stats:', error);
            return null;
        }
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

    // Get recent activities
    async getRecentActivities() {
        try {
            const [ordersResponse, productsResponse, usersResponse] = await Promise.allSettled([
                apiClient.get('/orders?limit=5&sortBy=created_at&sortOrder=DESC'),
                apiClient.get('/products?limit=5&sortBy=created_at&sortOrder=DESC'),
                apiClient.get('/users?limit=5&sortBy=created_at&sortOrder=DESC')
            ]);

            const activities = [];

            // Process orders
            if (ordersResponse.status === 'fulfilled' && ordersResponse.value.data?.success) {
                const orders = ordersResponse.value.data.data.orders || [];
                orders.forEach(order => {
                    activities.push({
                        id: `order-${order.id}`,
                        type: 'order',
                        message: `تم إنشاء طلب جديد #${order.order_number || order.id}`,
                        time: this.formatTimeAgo(order.created_at),
                        status: 'success',
                        data: order
                    });
                });
            }

            // Process products
            if (productsResponse.status === 'fulfilled' && productsResponse.value.data?.success) {
                const products = productsResponse.value.data.data.products || [];
                products.forEach(product => {
                    activities.push({
                        id: `product-${product.id}`,
                        type: 'product',
                        message: `تم إضافة منتج جديد: ${product.name}`,
                        time: this.formatTimeAgo(product.created_at),
                        status: 'info',
                        data: product
                    });
                });
            }

            // Process users
            if (usersResponse.status === 'fulfilled' && usersResponse.value.data?.success) {
                const users = usersResponse.value.data.data.users || [];
                users.forEach(user => {
                    activities.push({
                        id: `user-${user.id}`,
                        type: 'user',
                        message: `تم تسجيل مستخدم جديد: ${user.full_name || user.username}`,
                        time: this.formatTimeAgo(user.created_at),
                        status: 'info',
                        data: user
                    });
                });
            }

            // Sort by time and return top 10
            return activities
                .sort((a, b) => new Date(b.data.created_at) - new Date(a.data.created_at))
                .slice(0, 10);

        } catch (error) {
            console.error('Error fetching recent activities:', error);
            return [];
        }
    }

    // Helper method to format time ago
    formatTimeAgo(dateString) {
        if (!dateString) return 'غير محدد';
        
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) {
            return 'الآن';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes} دقيقة`;
        } else if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours} ساعة`;
        } else {
            const days = Math.floor(diffInMinutes / 1440);
            return `${days} يوم`;
        }
    }
}

export const dashboardService = new DashboardService(); 