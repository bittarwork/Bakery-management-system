import apiService from './apiService';

class DistributionService {
    constructor() {
        this.baseEndpoint = '/distribution';
    }

    // ===== DASHBOARD & OVERVIEW =====

    /**
     * Get comprehensive dashboard data
     */
    async getDashboardData(date = null) {
        try {
            const targetDate = date || new Date().toISOString().split('T')[0];

            // Load real data from multiple sources
            const [ordersResponse, distributorsResponse, statsResponse] = await Promise.all([
                // Get orders for the date
                apiService.get('/orders', {
                    date_from: targetDate,
                    date_to: targetDate,
                    limit: 100
                }),
                // Get distributors
                apiService.get('/users', {
                    role: 'distributor',
                    status: 'active',
                    limit: 50
                }),
                // Get basic stats
                this.getDistributionStats()
            ]);

            // Process orders data
            const orders = ordersResponse.success ? (ordersResponse.data?.orders || ordersResponse.data || []) : [];
            const distributors = distributorsResponse.success ? (distributorsResponse.data?.users || distributorsResponse.data || []) : [];

            // Transform distributors with order data
            const distributorMap = new Map();

            // Initialize distributors
            distributors.forEach(dist => {
                distributorMap.set(dist.id, {
                    id: dist.id,
                    name: dist.full_name || dist.username,
                    phone: dist.phone || '',
                    email: dist.email || '',
                    status: dist.status || 'active',
                    current_location: {
                        address: 'غير محدد',
                        lat: 33.8938,
                        lng: 35.5018,
                        last_update: new Date().toISOString()
                    },
                    current_route: {
                        current_stop: '',
                        completed_stops: 0,
                        total_stops: 0
                    },
                    todayOrders: 0,
                    completedOrders: 0,
                    todayRevenue: 0
                });
            });

            // Process orders and update distributor data
            orders.forEach(order => {
                if (order.assigned_distributor_id && distributorMap.has(order.assigned_distributor_id)) {
                    const distributor = distributorMap.get(order.assigned_distributor_id);

                    distributor.todayOrders++;
                    distributor.todayRevenue += parseFloat(order.total_amount_eur || 0);

                    if (order.status === 'delivered') {
                        distributor.completedOrders++;
                    }

                    // Update current location from active orders
                    if (order.status === 'in_progress' && order.store) {
                        distributor.current_location.address = order.store.address || 'غير محدد';
                        distributor.current_location.lat = order.store.latitude || 33.8938;
                        distributor.current_location.lng = order.store.longitude || 35.5018;
                        distributor.current_route.current_stop = order.store.name || '';
                    }

                    // Update route progress
                    distributor.current_route.total_stops = distributor.todayOrders;
                    distributor.current_route.completed_stops = distributor.completedOrders;
                }
            });

            // Calculate statistics
            const statistics = {
                totalOrders: orders.length,
                activeDistributors: Array.from(distributorMap.values()).filter(d => d.status === 'active').length,
                completedDeliveries: orders.filter(o => o.status === 'delivered').length,
                todayRevenue: orders.reduce((sum, order) => sum + parseFloat(order.total_amount_eur || 0), 0)
            };

            return {
                success: true,
                data: {
                    dailyOrders: orders,
                    distributors: Array.from(distributorMap.values()),
                    stores: [],
                    statistics: statistics,
                    liveTracking: Array.from(distributorMap.values()),
                    notifications: this.generateNotifications(orders, Array.from(distributorMap.values()))
                }
            };

        } catch (error) {
            console.error('Error fetching dashboard data:', error);

            // Return error response - NO MOCK DATA
            return {
                success: false,
                error: 'Failed to fetch distribution data',
                data: {
                    dailyOrders: [],
                    distributors: [],
                    stores: [],
                    statistics: {
                        totalOrders: 0,
                        activeDistributors: 0,
                        completedDeliveries: 0,
                        todayRevenue: 0
                    },
                    liveTracking: [],
                    notifications: []
                }
            };
        }
    }

    /**
     * Generate notifications based on orders and distributors data
     */
    generateNotifications(orders, distributors) {
        const notifications = [];

        // Check for unassigned orders
        const unassignedOrders = orders.filter(order => !order.assigned_distributor_id);
        if (unassignedOrders.length > 0) {
            notifications.push({
                id: 'unassigned-orders',
                type: 'warning',
                message: `يوجد ${unassignedOrders.length} طلب غير مُعيَّن لموزع`,
                time: 'الآن'
            });
        }

        // Check for high priority orders
        const highPriorityOrders = orders.filter(order =>
            order.priority === 'high' || order.priority === 'urgent'
        );
        if (highPriorityOrders.length > 0) {
            notifications.push({
                id: 'high-priority',
                type: 'info',
                message: `يوجد ${highPriorityOrders.length} طلب عالي الأولوية`,
                time: 'منذ 5 دقائق'
            });
        }

        // Check for distributor workload
        const overloadedDistributors = distributors.filter(dist =>
            dist.todayOrders > 10
        );
        if (overloadedDistributors.length > 0) {
            notifications.push({
                id: 'overloaded',
                type: 'warning',
                message: `${overloadedDistributors.length} موزع لديه حمولة عالية`,
                time: 'منذ 10 دقائق'
            });
        }

        // Success notification for completed orders
        const completedToday = orders.filter(order => order.status === 'delivered').length;
        if (completedToday > 0) {
            notifications.push({
                id: 'completed',
                type: 'success',
                message: `تم تسليم ${completedToday} طلب بنجاح اليوم`,
                time: 'منذ ساعة'
            });
        }

        return notifications.slice(0, 5); // Return max 5 notifications
    }

    /**
     * Transform backend response to dashboard format
     */
    transformDashboardData(response) {
        if (!response.success) {
            return {
                success: false,
                error: 'Failed to transform distribution data',
                data: {
                    dailyOrders: [],
                    distributors: [],
                    stores: [],
                    statistics: {
                        totalOrders: 0,
                        activeDistributors: 0,
                        completedDeliveries: 0,
                        todayRevenue: 0
                    },
                    liveTracking: [],
                    notifications: []
                }
            };
        }

        const data = response.data;
        return {
            success: true,
            data: {
                statistics: {
                    totalOrders: data.total_orders || 0,
                    activeDistributors: data.active_distributors || 0,
                    completedDeliveries: data.completed_deliveries || 0,
                    pendingOrders: data.pending_orders || 0,
                    todayRevenue: data.total_revenue_eur || 0,
                    averageDeliveryTime: data.average_delivery_time || 0,
                    customerSatisfaction: 4.2, // Mock for now
                    onTimeDeliveryRate: data.on_time_rate || 0,
                },
                dailyOrders: data.orders || [],
                distributors: data.distributors || [],
                notifications: data.notifications || [],
            }
        };
    }

    /**
     * Get live tracking data using correct endpoint
     */
    async getLiveTracking(date = null) {
        try {
            const params = date ? { date } : {};
            const response = await apiService.get(`${this.baseEndpoint}/manager/tracking/live`, params);
            return response;
        } catch (error) {
            console.error('Error fetching live tracking:', error);
            return this.getMockLiveTracking();
        }
    }

    /**
     * Get daily distribution schedule
     */
    async getDailySchedule(date = null, distributorId = null) {
        try {
            const params = {};
            if (date) params.date = date;
            if (distributorId) params.distributor_id = distributorId;

            const response = await apiService.get(`${this.baseEndpoint}/schedule/daily`, params);
            return response;
        } catch (error) {
            console.error('Error fetching daily schedule:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get daily orders for processing
     */
    async getDailyOrders(date = null) {
        try {
            const params = date ? { date } : {};
            const response = await apiService.get(`${this.baseEndpoint}/manager/orders/daily`, params);
            return response;
        } catch (error) {
            console.error('Error fetching daily orders:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate distribution schedules
     */
    async generateSchedules(date, distributorAssignments) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/manager/schedules/generate`, {
                date,
                distributorAssignments
            });
            return response;
        } catch (error) {
            console.error('Error generating schedules:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get distributor performance
     */
    async getDistributorPerformance(distributorId = null, period = 'week') {
        try {
            const params = { period };
            if (distributorId) params.distributorId = distributorId;

            const response = await apiService.get(`${this.baseEndpoint}/manager/performance`, params);
            return response;
        } catch (error) {
            console.error('Error fetching distributor performance:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get distribution analytics
     */
    async getDistributionAnalytics(period = 'week', filters = {}) {
        try {
            const params = {
                period,
                filters: JSON.stringify(filters)
            };

            const response = await apiService.get(`${this.baseEndpoint}/manager/analytics`, params);
            return response;
        } catch (error) {
            console.error('Error fetching distribution analytics:', error);
            return { success: false, error: error.message };
        }
    }

    // ===== DISTRIBUTOR SPECIFIC FUNCTIONS =====

    /**
     * Get store delivery details
     */
    async getStoreDeliveryDetails(storeId) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/store/${storeId}/details`);
            return response;
        } catch (error) {
            console.error('Error fetching store details:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update delivery quantities
     */
    async updateDeliveryQuantities(deliveryId, quantities, notes) {
        try {
            const response = await apiService.patch(`${this.baseEndpoint}/delivery/${deliveryId}/quantities`, {
                quantities,
                notes
            });
            return response;
        } catch (error) {
            console.error('Error updating delivery quantities:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Complete delivery
     */
    async completeDelivery(deliveryId, deliveryData) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/delivery/${deliveryId}/complete`, deliveryData);
            return response;
        } catch (error) {
            console.error('Error completing delivery:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Record payment
     */
    async recordPayment(paymentData) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/payment/record`, paymentData);
            return response;
        } catch (error) {
            console.error('Error recording payment:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get vehicle inventory
     */
    async getVehicleInventory(distributorId = null) {
        try {
            const params = distributorId ? { distributor_id: distributorId } : {};
            const response = await apiService.get(`${this.baseEndpoint}/vehicle/inventory`, params);
            return response;
        } catch (error) {
            console.error('Error fetching vehicle inventory:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Record vehicle expense
     */
    async recordVehicleExpense(expenseData) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/expense/record`, expenseData);
            return response;
        } catch (error) {
            console.error('Error recording expense:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Submit daily report
     */
    async submitDailyReport(reportData) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/report/daily/submit`, reportData);
            return response;
        } catch (error) {
            console.error('Error submitting daily report:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get distributor history
     */
    async getDistributorHistory(distributorId = null, options = {}) {
        try {
            const params = { ...options };
            if (distributorId) params.distributor_id = distributorId;

            const response = await apiService.get(`${this.baseEndpoint}/history`, params);
            return response;
        } catch (error) {
            console.error('Error fetching distributor history:', error);
            return { success: false, error: error.message };
        }
    }

    // ===== MANAGER FUNCTIONS =====

    /**
     * Add manual order
     */
    async addManualOrder(orderData) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/manager/orders/add`, orderData);
            return response;
        } catch (error) {
            console.error('Error adding manual order:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Assign store to distributor
     */
    async assignStoreToDistributor(storeId, distributorId, zone) {
        try {
            const response = await apiService.patch(`${this.baseEndpoint}/manager/stores/assign`, {
                storeId,
                distributorId,
                zone
            });
            return response;
        } catch (error) {
            console.error('Error assigning store:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update store balance manually
     */
    async updateStoreBalance(storeId, amount, currency, reason, notes) {
        try {
            const response = await apiService.patch(`${this.baseEndpoint}/manager/stores/${storeId}/balance`, {
                amount,
                currency,
                reason,
                notes
            });
            return response;
        } catch (error) {
            console.error('Error updating store balance:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Approve distributor report
     */
    async approveDistributorReport(reportId, approved, notes) {
        try {
            const response = await apiService.patch(`${this.baseEndpoint}/manager/reports/${reportId}/approve`, {
                approved,
                notes
            });
            return response;
        } catch (error) {
            console.error('Error approving report:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate weekly report
     */
    async generateWeeklyReport(weekStart, weekEnd, format = 'pdf') {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/manager/reports/weekly`, {
                weekStart,
                weekEnd,
                format
            });
            return response;
        } catch (error) {
            console.error('Error generating weekly report:', error);
            return { success: false, error: error.message };
        }
    }

    // ===== LEGACY METHODS (kept for backward compatibility) =====

    /**
     * Get notifications (simplified)
     */
    async getNotifications(unreadOnly = true) {
        try {
            // This would need a dedicated endpoint in the backend
            return this.getMockNotifications();
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return this.getMockNotifications();
        }
    }

    /**
     * Get available distributors
     */
    async getAvailableDistributors() {
        try {
            // This could be part of the live tracking endpoint
            const response = await this.getLiveTracking();
            if (response.success && response.data && response.data.distributors) {
                return {
                    success: true,
                    data: response.data.distributors
                };
            }
            return this.getMockDistributors();
        } catch (error) {
            console.error('Error fetching distributors:', error);
            return this.getMockDistributors();
        }
    }

    /**
     * Get active distributors with enhanced data for dashboard
     */
    async getActiveDistributors(options = {}) {
        try {
            // Get dashboard data which includes distributors
            const dashboardResponse = await this.getDashboardData();

            if (dashboardResponse.success && dashboardResponse.data) {
                return {
                    success: true,
                    data: {
                        distributors: dashboardResponse.data.distributors || [],
                        statistics: dashboardResponse.data.statistics || {},
                        notifications: dashboardResponse.data.notifications || []
                    }
                };
            }

            // Fallback to mock data
            return this.getMockActiveDistributors();
        } catch (error) {
            console.error('Error fetching active distributors:', error);
            return this.getMockActiveDistributors();
        }
    }

    // ===== ORDERS & DISTRIBUTION =====

    /**
     * Get orders with distribution status
     */
    async getOrdersWithDistribution(params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/orders`, params);
            return response;
        } catch (error) {
            console.error('Error fetching orders with distribution:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Assign order to distributor
     */
    async assignOrderToDistributor(orderId, distributorId) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/assign`, {
                order_id: orderId,
                distributor_id: distributorId
            });
            return response;
        } catch (error) {
            console.error('Error assigning order:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Auto-assign orders
     */
    async autoAssignOrders(orderIds = []) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/auto-assign`, {
                order_ids: orderIds
            });
            return response;
        } catch (error) {
            console.error('Error auto-assigning orders:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get distributor orders
     */
    async getDistributorOrders(distributorId, params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/distributor/${distributorId}/orders`, params);
            return response;
        } catch (error) {
            console.error('Error fetching distributor orders:', error);
            return { success: false, error: error.message };
        }
    }

    // ===== STATISTICS & REPORTS =====

    /**
     * Get distribution statistics
     */
    async getDistributionStats() {
        try {
            // This would normally call a specific stats endpoint
            // For now, return basic structure
            return {
                success: true,
                data: {
                    total_orders: 0,
                    assigned_orders: 0,
                    completed_orders: 0,
                    active_distributors: 0
                }
            };
        } catch (error) {
            console.error('Error getting distribution stats:', error);
            return {
                success: false,
                data: {
                    total_orders: 0,
                    assigned_orders: 0,
                    completed_orders: 0,
                    active_distributors: 0
                }
            };
        }
    }

    /**
     * Get daily reports
     */
    async getDailyReports(date = null) {
        try {
            const params = date ? { date } : {};
            const response = await apiService.get(`${this.baseEndpoint}/reports/daily`, params);
            return response;
        } catch (error) {
            console.error('Error fetching daily reports:', error);
            return this.getMockDailyReport();
        }
    }

    /**
     * Get weekly reports
     */
    async getWeeklyReports(week = null) {
        try {
            const params = week ? { week } : {};
            const response = await apiService.get(`${this.baseEndpoint}/reports/weekly`, params);
            return response;
        } catch (error) {
            console.error('Error fetching weekly reports:', error);
            return this.getMockWeeklyReport();
        }
    }

    /**
     * Get monthly reports
     */
    async getMonthlyReports(month = null) {
        try {
            const params = month ? { month } : {};
            const response = await apiService.get(`${this.baseEndpoint}/reports/monthly`, params);
            return response;
        } catch (error) {
            console.error('Error fetching monthly reports:', error);
            return this.getMockMonthlyReport();
        }
    }

    /**
     * Export report
     */
    async exportReport(type, format = 'pdf', params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/reports/${type}/export`, {
                format,
                ...params
            }, {
                responseType: 'blob'
            });
            return response;
        } catch (error) {
            console.error('Error exporting report:', error);
            return { success: false, error: error.message };
        }
    }

    // ===== MAPS & ROUTES =====

    /**
     * Get live distributor locations
     */
    async getDistributorLocations() {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/maps/distributors`);
            return response;
        } catch (error) {
            console.error('Error fetching distributor locations:', error);
            return this.getMockDistributorLocations();
        }
    }

    /**
     * Get routes data
     */
    async getRoutes(params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/maps/routes`, params);
            return response;
        } catch (error) {
            console.error('Error fetching routes:', error);
            return this.getMockRoutes();
        }
    }

    /**
     * Optimize route
     */
    async optimizeRoute(routeId) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/maps/routes/${routeId}/optimize`);
            return response;
        } catch (error) {
            console.error('Error optimizing route:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get traffic data
     */
    async getTrafficData() {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/maps/traffic`);
            return response;
        } catch (error) {
            console.error('Error fetching traffic data:', error);
            return this.getMockTrafficData();
        }
    }

    // ===== ARCHIVE & ANALYTICS =====

    /**
     * Get archive data
     */
    async getArchiveData(params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/archive`, params);
            return response;
        } catch (error) {
            console.error('Error fetching archive data:', error);
            return this.getMockArchiveData();
        }
    }

    /**
     * Get archived operations
     */
    async getArchivedOperations(params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/archive/operations`, params);
            return response;
        } catch (error) {
            console.error('Error fetching archived operations:', error);
            return this.getMockArchivedOperations();
        }
    }

    /**
     * Get archived reports
     */
    async getArchivedReports(params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/archive/reports`, params);
            return response;
        } catch (error) {
            console.error('Error fetching archived reports:', error);
            return this.getMockArchivedReports();
        }
    }

    // ===== STORE MANAGEMENT =====

    /**
     * Get store analytics
     */
    async getStoreAnalytics(params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/stores/analytics`, params);
            return response;
        } catch (error) {
            console.error('Error fetching store analytics:', error);
            return this.getMockStoreAnalytics();
        }
    }

    /**
     * Get store orders
     */
    async getStoreOrders(storeId, params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/stores/${storeId}/orders`, params);
            return response;
        } catch (error) {
            console.error('Error fetching store orders:', error);
            return {
                success: false,
                error: 'Failed to fetch store orders',
                data: []
            };
        }
    }

}

// Create and export service instance
export const distributionService = new DistributionService();

// Export default
export default distributionService;