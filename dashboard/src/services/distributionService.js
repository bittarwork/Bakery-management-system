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

    // ===== DISTRIBUTOR DETAILS & MANAGEMENT =====

    /**
     * Get detailed distributor information
     */
    async getDistributorDetails(distributorId, date = null) {
        try {
            const params = {};
            if (date) params.date = date;

            const response = await apiService.get(`${this.baseEndpoint}/${distributorId}/details`, params);

            if (response.success) {
                return response;
            }

            // Fallback to mock data if API fails
            console.log('API returned unsuccessful response, using mock data');
            return this.getMockDistributorDetails(distributorId, date);
        } catch (error) {
            console.error('Error fetching distributor details:', error);
            console.log('Using mock data due to API error');
            return this.getMockDistributorDetails(distributorId, date);
        }
    }

    /**
     * Get distributor performance metrics
     */
    async getDistributorPerformance(distributorId, period = 'week') {
        try {
            const params = { period };
            const response = await apiService.get(`${this.baseEndpoint}/distributor/${distributorId}/performance`, params);

            if (response.success) {
                return response;
            }

            return this.getMockDistributorPerformance(distributorId);
        } catch (error) {
            console.error('Error fetching distributor performance:', error);
            return this.getMockDistributorPerformance(distributorId);
        }
    }

    /**
     * Get distributor order history
     */
    async getDistributorOrderHistory(distributorId, params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/distributor/${distributorId}/orders`, params);

            if (response.success) {
                return response;
            }

            return this.getMockDistributorOrderHistory(distributorId);
        } catch (error) {
            console.error('Error fetching distributor order history:', error);
            return this.getMockDistributorOrderHistory(distributorId);
        }
    }

    /**
     * Get distributor location history
     */
    async getDistributorLocationHistory(distributorId, date = null) {
        try {
            const params = date ? { date } : {};
            const response = await apiService.get(`${this.baseEndpoint}/distributor/${distributorId}/location-history`, params);

            if (response.success) {
                return response;
            }

            return this.getMockLocationHistory(distributorId);
        } catch (error) {
            console.error('Error fetching distributor location history:', error);
            return this.getMockLocationHistory(distributorId);
        }
    }

    /**
     * Update distributor status
     */
    async updateDistributorStatus(distributorId, status) {
        try {
            const response = await apiService.patch(`${this.baseEndpoint}/distributor/${distributorId}/status`, {
                status
            });
            return response;
        } catch (error) {
            console.error('Error updating distributor status:', error);
            return { success: false, error: error.message };
        }
    }

    // ===== MOCK DATA METHODS (for backward compatibility and error fallbacks) =====

    /**
     * Get mock active distributors data
     */
    getMockActiveDistributors() {
        return {
            success: true,
            data: {
                distributors: [
                    {
                        id: 1,
                        name: 'أحمد محمد',
                        phone: '+963 12 345 6789',
                        email: 'ahmed@bakery.com',
                        status: 'active',
                        current_location: {
                            address: 'دمشق - المالكي',
                            lat: 33.5138,
                            lng: 36.2765,
                            last_update: new Date().toISOString()
                        },
                        current_route: {
                            current_stop: 'سوبرماركت الأمل',
                            completed_stops: 3,
                            total_stops: 8
                        },
                        todayOrders: 8,
                        completedOrders: 3,
                        todayRevenue: 450.75
                    },
                    {
                        id: 2,
                        name: 'فاطمة عبدالله',
                        phone: '+963 11 234 5678',
                        email: 'fatima@bakery.com',
                        status: 'active',
                        current_location: {
                            address: 'حلب - العزيزية',
                            lat: 36.2021,
                            lng: 37.1343,
                            last_update: new Date().toISOString()
                        },
                        current_route: {
                            current_stop: 'مقهى الياسمين',
                            completed_stops: 5,
                            total_stops: 10
                        },
                        todayOrders: 10,
                        completedOrders: 5,
                        todayRevenue: 625.30
                    },
                    {
                        id: 3,
                        name: 'محمد السوري',
                        phone: '+963 15 987 6543',
                        email: 'mohamed@bakery.com',
                        status: 'active',
                        current_location: {
                            address: 'حمص - الوعر',
                            lat: 34.7394,
                            lng: 36.7163,
                            last_update: new Date().toISOString()
                        },
                        current_route: {
                            current_stop: 'متجر البركة',
                            completed_stops: 2,
                            total_stops: 6
                        },
                        todayOrders: 6,
                        completedOrders: 2,
                        todayRevenue: 380.50
                    }
                ],
                statistics: {
                    totalOrders: 24,
                    activeDistributors: 3,
                    completedDeliveries: 10,
                    todayRevenue: 1456.55
                },
                notifications: [
                    {
                        id: 'mock-1',
                        type: 'info',
                        message: 'يوجد 14 طلب قيد التسليم',
                        time: 'الآن'
                    },
                    {
                        id: 'mock-2',
                        type: 'success',
                        message: 'تم تسليم 10 طلبات بنجاح اليوم',
                        time: 'منذ ساعة'
                    }
                ]
            }
        };
    }

    /**
     * Get mock distributors list
     */
    getMockDistributors() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    name: 'أحمد محمد',
                    phone: '+963 12 345 6789',
                    status: 'active',
                    zone: 'دمشق'
                },
                {
                    id: 2,
                    name: 'فاطمة عبدالله',
                    phone: '+963 11 234 5678',
                    status: 'active',
                    zone: 'حلب'
                },
                {
                    id: 3,
                    name: 'محمد السوري',
                    phone: '+963 15 987 6543',
                    status: 'active',
                    zone: 'حمص'
                }
            ]
        };
    }

    /**
     * Get mock live tracking data
     */
    getMockLiveTracking() {
        return {
            success: true,
            data: {
                distributors: [
                    {
                        id: 1,
                        name: 'أحمد محمد',
                        location: {
                            lat: 33.5138,
                            lng: 36.2765,
                            address: 'دمشق - المالكي',
                            last_update: new Date().toISOString()
                        },
                        status: 'delivering',
                        current_order: 'ORD-2025-001',
                        estimated_arrival: '15 دقيقة'
                    },
                    {
                        id: 2,
                        name: 'فاطمة عبدالله',
                        location: {
                            lat: 36.2021,
                            lng: 37.1343,
                            address: 'حلب - العزيزية',
                            last_update: new Date().toISOString()
                        },
                        status: 'en_route',
                        current_order: 'ORD-2025-002',
                        estimated_arrival: '25 دقيقة'
                    }
                ]
            }
        };
    }

    /**
     * Get mock notifications
     */
    getMockNotifications() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    type: 'info',
                    title: 'طلب جديد',
                    message: 'تم إضافة طلب جديد من سوبرماركت الأمل',
                    time: new Date().toISOString(),
                    read: false
                },
                {
                    id: 2,
                    type: 'success',
                    title: 'تسليم مكتمل',
                    message: 'تم تسليم الطلب ORD-2025-001 بنجاح',
                    time: new Date(Date.now() - 3600000).toISOString(),
                    read: false
                },
                {
                    id: 3,
                    type: 'warning',
                    title: 'تأخير في التسليم',
                    message: 'تأخر تسليم الطلب ORD-2025-003',
                    time: new Date(Date.now() - 7200000).toISOString(),
                    read: true
                }
            ]
        };
    }

    /**
     * Get mock daily report
     */
    getMockDailyReport() {
        return {
            success: true,
            data: {
                date: new Date().toISOString().split('T')[0],
                summary: {
                    totalOrders: 24,
                    completedOrders: 18,
                    pendingOrders: 6,
                    totalRevenue: 1456.55,
                    activeDistributors: 3
                },
                distributors: [
                    {
                        id: 1,
                        name: 'أحمد محمد',
                        completedOrders: 8,
                        revenue: 450.75,
                        efficiency: 92
                    },
                    {
                        id: 2,
                        name: 'فاطمة عبدالله',
                        completedOrders: 6,
                        revenue: 380.50,
                        efficiency: 88
                    }
                ]
            }
        };
    }

    /**
     * Get mock weekly report
     */
    getMockWeeklyReport() {
        return {
            success: true,
            data: {
                week: 'Week 1, 2025',
                summary: {
                    totalOrders: 168,
                    completedOrders: 156,
                    totalRevenue: 10195.85,
                    averageDeliveryTime: 45,
                    customerSatisfaction: 4.3
                }
            }
        };
    }

    /**
     * Get mock monthly report
     */
    getMockMonthlyReport() {
        return {
            success: true,
            data: {
                month: 'January 2025',
                summary: {
                    totalOrders: 672,
                    completedOrders: 624,
                    totalRevenue: 40783.40,
                    averageDeliveryTime: 42,
                    customerSatisfaction: 4.4
                }
            }
        };
    }

    /**
     * Get mock distributor locations
     */
    getMockDistributorLocations() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    name: 'أحمد محمد',
                    lat: 33.5138,
                    lng: 36.2765,
                    status: 'delivering',
                    last_update: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'فاطمة عبدالله',
                    lat: 36.2021,
                    lng: 37.1343,
                    status: 'en_route',
                    last_update: new Date().toISOString()
                }
            ]
        };
    }

    /**
     * Get mock routes data
     */
    getMockRoutes() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    name: 'Route Damascus Central',
                    distributor_id: 1,
                    stops: [
                        { store_id: 1, address: 'سوبرماركت الأمل', status: 'completed' },
                        { store_id: 2, address: 'مقهى الياسمين', status: 'in_progress' },
                        { store_id: 3, address: 'متجر البركة', status: 'pending' }
                    ]
                }
            ]
        };
    }

    /**
     * Get mock traffic data
     */
    getMockTrafficData() {
        return {
            success: true,
            data: {
                current_conditions: 'moderate',
                average_delay: 15,
                affected_routes: ['Route 1', 'Route 3']
            }
        };
    }

    /**
     * Get mock archive data
     */
    getMockArchiveData() {
        return {
            success: true,
            data: {
                total_records: 1250,
                date_range: {
                    from: '2024-01-01',
                    to: '2024-12-31'
                },
                summary: {
                    completed_orders: 1180,
                    total_revenue: 125600.75
                }
            }
        };
    }

    /**
     * Get mock archived operations
     */
    getMockArchivedOperations() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    date: '2024-12-31',
                    total_orders: 45,
                    completed_orders: 42,
                    revenue: 2150.30
                },
                {
                    id: 2,
                    date: '2024-12-30',
                    total_orders: 38,
                    completed_orders: 36,
                    revenue: 1890.75
                }
            ]
        };
    }

    /**
     * Get mock archived reports
     */
    getMockArchivedReports() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    type: 'monthly',
                    period: 'December 2024',
                    created_at: '2025-01-01',
                    file_url: '/reports/monthly-dec-2024.pdf'
                },
                {
                    id: 2,
                    type: 'weekly',
                    period: 'Week 52, 2024',
                    created_at: '2024-12-30',
                    file_url: '/reports/weekly-52-2024.pdf'
                }
            ]
        };
    }

    /**
     * Get mock store analytics
     */
    getMockStoreAnalytics() {
        return {
            success: true,
            data: {
                top_stores: [
                    {
                        id: 1,
                        name: 'سوبرماركت الأمل',
                        total_orders: 156,
                        revenue: 7850.30,
                        satisfaction: 4.5
                    },
                    {
                        id: 2,
                        name: 'مقهى الياسمين',
                        total_orders: 89,
                        revenue: 4230.75,
                        satisfaction: 4.2
                    }
                ],
                performance_metrics: {
                    average_order_value: 58.75,
                    delivery_success_rate: 95.2,
                    customer_retention: 87.3
                }
            }
        };
    }

    /**
     * Get real distributor details from API
     */
    async getRealDistributorDetails(distributorId, date = null) {
        const currentDate = date || new Date().toISOString().split('T')[0];

        try {
            // Try to get real distributor data from API
            const userResponse = await apiService.get(`/users/${distributorId}`);
            if (userResponse.success && userResponse.data) {
                const user = userResponse.data;

                // Transform user data to distributor format with real data
                const distributor = {
                    id: user.id,
                    name: user.full_name,
                    phone: user.phone || 'غير محدد',
                    email: user.email || 'غير محدد',
                    status: user.status || 'active',
                    work_status: user.work_status || 'offline',
                    hire_date: user.hired_date || user.created_at,
                    zone: user.address || 'غير محدد',
                    vehicle_number: user.vehicle_info?.plate || 'غير محدد',
                    current_location: user.current_location || {
                        address: "الموقع غير محدد",
                        lat: 33.5138,
                        lng: 36.2765,
                        last_update: new Date().toISOString()
                    }
                };

                return {
                    success: true,
                    data: {
                        distributor: distributor,
                        daily_performance: user.daily_performance || {
                            date: currentDate,
                            orders_assigned: 0,
                            orders_completed: 0,
                            orders_pending: 0,
                            orders_cancelled: 0,
                            total_revenue: 0,
                            total_distance: 0,
                            working_hours: 0,
                            efficiency_rate: 0,
                            customer_rating: 0,
                            on_time_deliveries: 0,
                            late_deliveries: 0
                        },
                        orders: [],
                        location_history: []
                    }
                };
            }
        } catch (error) {
            console.error('Error fetching real distributor data:', error);
        }

        // Fallback to mock data if API fails
        return this.getMockDistributorDetails(distributorId, date);
    }

    /**
     * Mock distributor details for fallback
     */
    getMockDistributorDetails(distributorId, date = null) {
        const currentDate = date || new Date().toISOString().split('T')[0];

        // Create basic distributor data based on ID
        const distributor = {
            id: parseInt(distributorId),
            name: `موزع ${distributorId}`,
            phone: 'غير محدد',
            email: 'غير محدد',
            status: 'active',
            work_status: 'offline',
            hire_date: new Date().toISOString().split('T')[0],
            zone: 'غير محدد',
            vehicle_number: 'غير محدد',
            current_location: {
                address: "الموقع غير محدد",
                lat: 33.5138,
                lng: 36.2765,
                last_update: new Date().toISOString()
            }
        };

        return {
            success: true,
            data: {
                distributor: distributor,
                daily_performance: {
                    date: currentDate,
                    orders_assigned: 12,
                    orders_completed: 8,
                    orders_pending: 3,
                    orders_cancelled: 1,
                    total_revenue: 1245.75,
                    total_distance: 85.2,
                    working_hours: 7.5,
                    efficiency_rate: 85.2,
                    customer_rating: 4.3,
                    on_time_deliveries: 7,
                    late_deliveries: 1
                },
                orders: this.getMockDistributorOrderHistory(distributorId).data,
                location_history: this.getMockLocationHistory(distributorId).data
            }
        };
    }

    /**
     * Mock distributor performance
     */
    getMockDistributorPerformance(distributorId) {
        return {
            success: true,
            data: {
                weekly_stats: {
                    total_orders: 45,
                    completed_orders: 40,
                    completion_rate: 88.9,
                    total_revenue: 5678.90,
                    average_delivery_time: 32,
                    customer_satisfaction: 4.5
                },
                monthly_stats: {
                    total_orders: 180,
                    completed_orders: 165,
                    completion_rate: 91.7,
                    total_revenue: 22890.45,
                    average_delivery_time: 28,
                    customer_satisfaction: 4.4
                },
                trends: {
                    orders_trend: 'up',
                    revenue_trend: 'up',
                    satisfaction_trend: 'stable'
                }
            }
        };
    }

    /**
     * Mock distributor order history
     */
    getMockDistributorOrderHistory(distributorId) {
        const orders = [
            {
                id: 1,
                order_number: 'ORD-2025-001',
                store_name: 'سوبرماركت الأمل',
                store_address: 'شارع الحمرا - دمشق',
                status: 'delivered',
                assigned_at: '2025-01-26T08:30:00Z',
                completed_at: '2025-01-26T10:15:00Z',
                total_amount: 125.50,
                items_count: 8,
                delivery_notes: 'تم التسليم بنجاح',
                rating: 5
            },
            {
                id: 2,
                order_number: 'ORD-2025-002',
                store_name: 'مقهى الياسمين',
                store_address: 'شارع النصر - دمشق',
                status: 'in_progress',
                assigned_at: '2025-01-26T11:00:00Z',
                completed_at: null,
                total_amount: 89.25,
                items_count: 5,
                delivery_notes: null,
                rating: null
            },
            {
                id: 3,
                order_number: 'ORD-2025-003',
                store_name: 'متجر البركة',
                store_address: 'شارع المتنبي - دمشق',
                status: 'pending',
                assigned_at: '2025-01-26T13:30:00Z',
                completed_at: null,
                total_amount: 210.75,
                items_count: 12,
                delivery_notes: null,
                rating: null
            }
        ];

        return {
            success: true,
            data: orders
        };
    }

    /**
     * Mock location history
     */
    getMockLocationHistory(distributorId) {
        const now = new Date();
        const history = [];

        // Generate location history for the day
        for (let i = 0; i < 10; i++) {
            const timestamp = new Date(now.getTime() - (i * 30 * 60 * 1000)); // Every 30 minutes
            history.push({
                id: i + 1,
                timestamp: timestamp.toISOString(),
                latitude: 33.5138 + (Math.random() - 0.5) * 0.1,
                longitude: 36.2765 + (Math.random() - 0.5) * 0.1,
                address: `موقع ${i + 1} - دمشق`,
                activity: i % 3 === 0 ? 'delivery' : (i % 3 === 1 ? 'travel' : 'waiting'),
                speed: Math.random() * 40, // km/h
                accuracy: Math.random() * 10 + 5 // meters
            });
        }

        return {
            success: true,
            data: history.reverse() // Most recent first
        };
    }

}

// Create and export service instance
export const distributionService = new DistributionService();

// Export default
export default distributionService;