import apiService from './apiService';

class DistributionService {
    constructor() {
        this.baseEndpoint = '/distribution';
    }

    // ===== DASHBOARD & OVERVIEW =====

    /**
     * Get dashboard data
     */
    async getDashboardData(date = null) {
        try {
            const params = date ? { date } : {};
            const response = await apiService.get(`${this.baseEndpoint}/dashboard`, params);
            return response;
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            return this.getMockDashboardData();
        }
    }

    /**
     * Get live tracking data
     */
    async getLiveTracking() {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/live-tracking`);
            return response;
        } catch (error) {
            console.error('Error fetching live tracking:', error);
            return this.getMockLiveTracking();
        }
    }

    /**
     * Get notifications
     */
    async getNotifications(unreadOnly = true) {
        try {
            const params = { unread: unreadOnly };
            const response = await apiService.get(`${this.baseEndpoint}/notifications`, params);
            return response;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return this.getMockNotifications();
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

    /**
     * Get available distributors
     */
    async getAvailableDistributors() {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/distributors`);
            return response;
        } catch (error) {
            console.error('Error fetching distributors:', error);
            return this.getMockDistributors();
        }
    }

    // ===== STATISTICS & REPORTS =====

    /**
     * Get distribution statistics
     */
    async getDistributionStats(params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/stats`, params);
            return response;
        } catch (error) {
            console.error('Error fetching distribution stats:', error);
            return this.getMockStats();
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
            return this.getMockStoreOrders();
        }
    }

    // ===== MOCK DATA METHODS =====

    getMockDashboardData() {
        return {
            success: true,
            data: {
                statistics: {
                    totalOrders: 156,
                    activeDistributors: 8,
                    completedDeliveries: 124,
                    pendingOrders: 32,
                    todayRevenue: 8450.75,
                    averageDeliveryTime: 42,
                    customerSatisfaction: 4.2,
                    onTimeDeliveryRate: 89,
                },
                dailyOrders: [
                    { id: 1, orderNumber: "ORD-001", store: "متجر الصباح", status: "pending", amount: 245.50 },
                    { id: 2, orderNumber: "ORD-002", store: "مخبز النور", status: "delivered", amount: 180.25 },
                    { id: 3, orderNumber: "ORD-003", store: "متجر السلام", status: "in_progress", amount: 320.00 },
                ],
                distributors: [
                    { id: 1, name: "أحمد محمد", status: "active", orders: 12, location: "وسط البلد" },
                    { id: 2, name: "سارة أحمد", status: "active", orders: 8, location: "الحمرا" },
                    { id: 3, name: "محمد علي", status: "break", orders: 15, location: "الأشرفية" },
                ],
                notifications: [
                    { id: 1, type: "warning", message: "تأخير في التسليم - الطلب #ORD-001", time: "10 دقائق" },
                    { id: 2, type: "success", message: "تم تسليم الطلب #ORD-002 بنجاح", time: "15 دقيقة" },
                    { id: 3, type: "info", message: "موزع جديد انضم للفريق", time: "30 دقيقة" },
                ],
            }
        };
    }

    getMockLiveTracking() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    distributor: "أحمد محمد",
                    currentLocation: { lat: 33.5138, lng: 36.2765 },
                    status: "active",
                    ordersCount: 12,
                    lastUpdate: new Date().toISOString()
                }
            ]
        };
    }

    getMockNotifications() {
        return {
            success: true,
            data: [
                { id: 1, type: "warning", message: "تأخير في التسليم", time: "10 دقائق" },
                { id: 2, type: "success", message: "تم تسليم الطلب بنجاح", time: "15 دقيقة" },
            ]
        };
    }

    getMockDistributors() {
        return {
            success: true,
            data: [
                { id: 1, name: "أحمد محمد", status: "active", capacity: 15, currentLoad: 8 },
                { id: 2, name: "سارة أحمد", status: "active", capacity: 12, currentLoad: 5 },
                { id: 3, name: "محمد علي", status: "break", capacity: 18, currentLoad: 0 },
            ]
        };
    }

    getMockStats() {
        return {
            success: true,
            data: {
                totalOrders: 156,
                completedOrders: 124,
                averageDeliveryTime: 42,
                onTimeRate: 89,
                totalRevenue: 8450.75,
                activeDistributors: 8
            }
        };
    }

    getMockDailyReport() {
        return {
            success: true,
            data: {
                summary: {
                    totalOrders: 45,
                    completedOrders: 38,
                    pendingOrders: 7,
                    totalRevenue: 2850.50,
                    averageOrderValue: 63.34,
                    deliveryRate: 84.4,
                    customerSatisfaction: 4.2
                },
                ordersByHour: [
                    { hour: "08:00", orders: 5, revenue: 315 },
                    { hour: "09:00", orders: 8, revenue: 512 },
                    { hour: "10:00", orders: 12, revenue: 768 },
                ],
                topProducts: [
                    { name: "خبز عربي", quantity: 120, revenue: 360 },
                    { name: "كعك محلى", quantity: 85, revenue: 680 },
                ],
                distributorPerformance: [
                    { name: "أحمد محمد", orders: 15, completionRate: 93, revenue: 980 },
                    { name: "سارة أحمد", orders: 12, completionRate: 88, revenue: 756 },
                ]
            }
        };
    }

    getMockWeeklyReport() {
        return {
            success: true,
            data: {
                summary: {
                    totalOrders: 315,
                    completedOrders: 267,
                    totalRevenue: 19950.75,
                    deliveryRate: 84.8,
                    customerSatisfaction: 4.1
                },
                dailyTrend: [
                    { day: "الأحد", orders: 42, revenue: 2680 },
                    { day: "الاثنين", orders: 48, revenue: 3040 },
                    { day: "الثلاثاء", orders: 45, revenue: 2850 },
                ]
            }
        };
    }

    getMockMonthlyReport() {
        return {
            success: true,
            data: {
                summary: {
                    totalOrders: 1380,
                    completedOrders: 1295,
                    totalRevenue: 87650.25,
                    deliveryRate: 93.8,
                    customerSatisfaction: 4.3
                },
                weeklyTrend: [
                    { week: "الأسبوع الأول", orders: 320, revenue: 20380 },
                    { week: "الأسبوع الثاني", orders: 365, revenue: 23200 },
                ]
            }
        };
    }

    getMockDistributorLocations() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    name: "أحمد محمد",
                    currentLocation: { lat: 33.5138, lng: 36.2765 },
                    status: "active",
                    route: "المسار الشمالي"
                }
            ]
        };
    }

    getMockRoutes() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    name: "المسار الشمالي",
                    distributor: "أحمد محمد",
                    status: "active",
                    totalDistance: "45 كم",
                    stores: 12,
                    completedStores: 8
                }
            ]
        };
    }

    getMockTrafficData() {
        return {
            success: true,
            data: {
                overall: "متوسط",
                zones: [
                    { name: "وسط بيروت", level: "عالي", color: "red" },
                    { name: "الحمرا", level: "متوسط", color: "yellow" },
                ]
            }
        };
    }

    getMockArchiveData() {
        return {
            success: true,
            data: {
                summary: {
                    totalOperations: 1250,
                    totalRevenue: 89500.75,
                    completedOrders: 1180,
                    successRate: 94.4
                },
                operations: [
                    {
                        id: 1,
                        date: "2024-01-15",
                        title: "توزيع يومي - المنطقة الشمالية",
                        distributor: "أحمد محمد",
                        status: "completed",
                        orders: 12,
                        revenue: 890.50
                    }
                ]
            }
        };
    }

    getMockArchivedOperations() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    date: "2024-01-15",
                    title: "توزيع يومي",
                    status: "completed",
                    orders: 12,
                    revenue: 890.50
                }
            ]
        };
    }

    getMockArchivedReports() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    name: "تقرير التوزيع الأسبوعي",
                    date: "2024-01-15",
                    type: "weekly",
                    size: "2.4 MB",
                    status: "available"
                }
            ]
        };
    }

    getMockStoreAnalytics() {
        return {
            success: true,
            data: {
                totalStores: 45,
                activeStores: 38,
                averageOrderValue: 185.25,
                topStores: [
                    { name: "متجر الصباح", orders: 156, revenue: 12450 },
                    { name: "مخبز النور", orders: 134, revenue: 10890 },
                ]
            }
        };
    }

    getMockStoreOrders() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    orderNumber: "ORD-001",
                    date: "2024-01-15",
                    amount: 245.50,
                    status: "delivered"
                }
            ]
        };
    }
}

// Create and export service instance
export default new DistributionService();