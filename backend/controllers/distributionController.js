import SimpleDistributionService from '../services/simpleDistributionService.js';
import { Order, User, Store } from '../models/index.js';
import logger from '../config/logger.js';

/**
 * Simple Distribution Controller
 * Handles order assignment and distributor management
 */
class DistributionController {

    /**
     * Get all orders with their distribution status
     * @route GET /api/distribution/orders
     * @access Private (Admin/Manager)
     */
    static async getOrdersWithDistribution(req, res) {
        try {
            const { page = 1, limit = 10, status = null, distributor_id = null } = req.query;

            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
            const offset = (pageNum - 1) * limitNum;

            const whereClause = {};

            // Filter by status
            if (status && status !== 'all') {
                whereClause.status = status;
            }

            // Filter by distributor
            if (distributor_id && distributor_id !== 'all') {
                const distributorIdNum = parseInt(distributor_id);
                if (!isNaN(distributorIdNum)) {
                    whereClause.assigned_distributor_id = distributorIdNum;
                }
            }

            const { count, rows: orders } = await Order.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: 'assigned_distributor',
                        attributes: ['id', 'full_name', 'phone', 'status'],
                        required: false
                    },
                    {
                        model: Store,
                        as: 'store',
                        attributes: ['id', 'name', 'address', 'phone']
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: limitNum,
                offset: offset
            });

            const pagination = {
                currentPage: pageNum,
                totalPages: Math.ceil(count / limitNum),
                totalItems: count,
                itemsPerPage: limitNum
            };

            res.json({
                success: true,
                data: {
                    orders,
                    pagination
                },
                message: `تم جلب ${orders.length} طلب`
            });

        } catch (error) {
            logger.error('Error getting orders with distribution:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب الطلبات',
                error: error.message
            });
        }
    }

    /**
     * Assign order to distributor manually
     * @route POST /api/distribution/assign
     * @access Private (Admin/Manager)
     */
    static async assignOrderToDistributor(req, res) {
        try {
            const { order_id, distributor_id } = req.body;

            if (!order_id || !distributor_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID and Distributor ID are required'
                });
            }

            // Find order
            const order = await Order.findByPk(order_id);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            // Find distributor
            const distributor = await User.findOne({
                where: { id: distributor_id, role: 'distributor', status: 'active' }
            });
            if (!distributor) {
                return res.status(404).json({
                    success: false,
                    message: 'Active distributor not found'
                });
            }

            // Update previous distributor workload if exists
            if (order.assigned_distributor_id && order.assigned_distributor_id !== distributor_id) {
                await SimpleDistributionService.updateDistributorWorkload(order.assigned_distributor_id, -1);
            }

            // Assign new distributor
            await order.update({
                assigned_distributor_id: distributor_id,
                status: 'confirmed'
            });

            // Update new distributor workload
            await SimpleDistributionService.updateDistributorWorkload(distributor_id, 1);

            logger.info(`Order ${order.order_number} manually assigned to distributor ${distributor.full_name} by user ${req.user.id}`);

            res.json({
                success: true,
                data: {
                    order_id: order.id,
                    order_number: order.order_number,
                    distributor: {
                        id: distributor.id,
                        name: distributor.full_name,
                        phone: distributor.phone
                    }
                },
                message: `تم تعيين الطلب للموزع ${distributor.full_name}`
            });

        } catch (error) {
            logger.error('Error assigning order to distributor:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تعيين الموزع',
                error: error.message
            });
        }
    }

    /**
     * Unassign distributor from order
     * @route POST /api/distribution/unassign
     * @access Private (Admin/Manager)
     */
    static async unassignDistributor(req, res) {
        try {
            const { order_id, reason } = req.body;

            if (!order_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID is required'
                });
            }

            const result = await SimpleDistributionService.unassignDistributor(order_id, reason);

            if (result.success) {
                logger.info(`Order ${order_id} unassigned by user ${req.user.id}. Reason: ${reason || 'manual'}`);

                res.json({
                    success: true,
                    message: result.message,
                    data: { order_id }
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message
                });
            }

        } catch (error) {
            logger.error('Error unassigning distributor:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في إلغاء تعيين الموزع',
                error: error.message
            });
        }
    }

    /**
     * Auto-assign unassigned orders
     * @route POST /api/distribution/auto-assign
     * @access Private (Admin/Manager)
     */
    static async autoAssignOrders(req, res) {
        try {
            // Find unassigned orders
            const unassignedOrders = await Order.findAll({
                where: {
                    assigned_distributor_id: null,
                    status: ['draft', 'confirmed']
                },
                limit: 50 // Process max 50 orders at once
            });

            if (unassignedOrders.length === 0) {
                return res.json({
                    success: true,
                    message: 'لا توجد طلبات غير معينة',
                    data: { processed: 0, assigned: 0, failed: 0 }
                });
            }

            let assigned = 0;
            let failed = 0;
            const results = [];

            for (const order of unassignedOrders) {
                try {
                    const assignmentResult = await SimpleDistributionService.assignOrderToDistributor(order);

                    if (assignmentResult.success) {
                        await order.update({
                            assigned_distributor_id: assignmentResult.assigned_distributor.id,
                            status: 'confirmed'
                        });
                        assigned++;
                        results.push({
                            order_id: order.id,
                            order_number: order.order_number,
                            distributor: assignmentResult.assigned_distributor.full_name,
                            success: true
                        });
                    } else {
                        failed++;
                        results.push({
                            order_id: order.id,
                            order_number: order.order_number,
                            error: assignmentResult.message,
                            success: false
                        });
                    }
                } catch (orderError) {
                    failed++;
                    logger.error(`Error processing order ${order.id}:`, orderError);
                    results.push({
                        order_id: order.id,
                        order_number: order.order_number,
                        error: orderError.message,
                        success: false
                    });
                }
            }

            logger.info(`Auto-assignment completed by user ${req.user.id}: ${assigned} assigned, ${failed} failed`);

            res.json({
                success: true,
                message: `تم معالجة ${unassignedOrders.length} طلب: ${assigned} تم تعيينهم، ${failed} فشلوا`,
                data: {
                    processed: unassignedOrders.length,
                    assigned,
                    failed,
                    results
                }
            });

        } catch (error) {
            logger.error('Error in auto-assignment:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في التعيين التلقائي',
                error: error.message
            });
        }
    }

    /**
     * Get distribution statistics
     * @route GET /api/distribution/stats
     * @access Private (Admin/Manager)
     */
    static async getDistributionStats(req, res) {
        try {
            const stats = await SimpleDistributionService.getDistributionStats();

            if (stats.success) {
                res.json({
                    success: true,
                    data: stats.stats,
                    message: 'تم جلب الإحصائيات بنجاح'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'خطأ في جلب الإحصائيات',
                    error: stats.error
                });
            }

        } catch (error) {
            logger.error('Error getting distribution stats:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب الإحصائيات',
                error: error.message
            });
        }
    }

    /**
     * Get orders for specific distributor (for mobile app)
     * @route GET /api/distribution/distributor/:id/orders
     * @access Private (Distributor)
     */
    static async getDistributorOrders(req, res) {
        try {
            const distributorId = parseInt(req.params.id);
            const { status } = req.query;

            // Ensure distributor can only access their own orders (or admin can access any)
            if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== distributorId) {
                return res.status(403).json({
                    success: false,
                    message: 'غير مصرح بالوصول لهذه الطلبات'
                });
            }

            const result = await SimpleDistributionService.getDistributorOrders(distributorId, status);

            if (result.success) {
                res.json({
                    success: true,
                    data: {
                        orders: result.orders,
                        count: result.count
                    },
                    message: `تم جلب ${result.count} طلب`
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'خطأ في جلب الطلبات',
                    error: result.error
                });
            }

        } catch (error) {
            logger.error('Error getting distributor orders:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب الطلبات',
                error: error.message
            });
        }
    }

    /**
     * Get available distributors
     * @route GET /api/distribution/distributors
     * @access Private (Admin/Manager)
     */
    static async getAvailableDistributors(req, res) {
        try {
            const distributors = await SimpleDistributionService.getAvailableDistributors();

            res.json({
                success: true,
                data: distributors,
                message: `تم جلب ${distributors.length} موزع`
            });

        } catch (error) {
            logger.error('Error getting available distributors:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب الموزعين',
                error: error.message
            });
        }
    }

    // ===== DASHBOARD METHODS =====

    /**
     * Get dashboard data
     * @route GET /api/distribution/dashboard
     * @access Private (Admin/Manager)
     */
    static async getDashboardData(req, res) {
        try {
            const { date } = req.query;
            const currentDate = date || new Date().toISOString().split('T')[0];

            // Get statistics
            const stats = await SimpleDistributionService.getDashboardStats(currentDate);

            // Get recent orders
            const recentOrders = await Order.findAll({
                limit: 10,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: Store,
                        as: 'store',
                        attributes: ['id', 'name']
                    }
                ]
            });

            // Get active distributors
            const distributors = await User.findAll({
                where: { role: 'distributor', status: 'active' },
                attributes: ['id', 'full_name', 'phone', 'status'],
                limit: 10
            });

            // Get notifications (mock for now)
            const notifications = [
                {
                    id: 1,
                    type: 'warning',
                    message: 'تأخير في التسليم - الطلب #ORD-001',
                    time: '10 دقائق',
                    created_at: new Date()
                },
                {
                    id: 2,
                    type: 'success',
                    message: 'تم تسليم الطلب #ORD-002 بنجاح',
                    time: '15 دقيقة',
                    created_at: new Date()
                }
            ];

            res.json({
                success: true,
                data: {
                    statistics: stats,
                    dailyOrders: recentOrders,
                    distributors: distributors,
                    notifications: notifications
                }
            });

        } catch (error) {
            logger.error('Error fetching dashboard data:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب بيانات لوحة التحكم',
                error: error.message
            });
        }
    }

    // ===== REPORTS METHODS =====

    /**
     * Get daily reports
     * @route GET /api/distribution/reports/daily
     * @access Private (Admin/Manager)
     */
    static async getDailyReports(req, res) {
        try {
            const { date } = req.query;
            const currentDate = date || new Date().toISOString().split('T')[0];

            // Mock daily report data
            const dailyReport = {
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
                    { hour: "11:00", orders: 8, revenue: 504 },
                    { hour: "12:00", orders: 6, revenue: 378 },
                    { hour: "13:00", orders: 4, revenue: 252 },
                    { hour: "14:00", orders: 2, revenue: 126 }
                ],
                topProducts: [
                    { name: "خبز عربي", quantity: 120, revenue: 360 },
                    { name: "كعك محلى", quantity: 85, revenue: 680 },
                    { name: "معمول", quantity: 65, revenue: 520 }
                ],
                distributorPerformance: [
                    { name: "أحمد محمد", orders: 15, completionRate: 93, revenue: 980 },
                    { name: "سارة أحمد", orders: 12, completionRate: 88, revenue: 756 },
                    { name: "محمد علي", orders: 11, completionRate: 91, revenue: 714 }
                ]
            };

            res.json({
                success: true,
                data: dailyReport
            });

        } catch (error) {
            logger.error('Error fetching daily reports:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب التقرير اليومي',
                error: error.message
            });
        }
    }

    /**
     * Get weekly reports
     * @route GET /api/distribution/reports/weekly
     * @access Private (Admin/Manager)
     */
    static async getWeeklyReports(req, res) {
        try {
            const { week } = req.query;

            // Mock weekly report data
            const weeklyReport = {
                summary: {
                    totalOrders: 315,
                    completedOrders: 267,
                    totalRevenue: 19950.75,
                    deliveryRate: 84.8,
                    customerSatisfaction: 4.1,
                    averageDeliveryTime: 38,
                    onTimeDeliveryRate: 87
                },
                dailyTrend: [
                    { day: "الأحد", date: "2024-01-14", orders: 42, revenue: 2680, completionRate: 88 },
                    { day: "الاثنين", date: "2024-01-15", orders: 48, revenue: 3040, completionRate: 92 },
                    { day: "الثلاثاء", date: "2024-01-16", orders: 45, revenue: 2850, completionRate: 85 },
                    { day: "الأربعاء", date: "2024-01-17", orders: 52, revenue: 3296, completionRate: 90 },
                    { day: "الخميس", date: "2024-01-18", orders: 49, revenue: 3108, completionRate: 87 },
                    { day: "الجمعة", date: "2024-01-19", orders: 43, revenue: 2726, completionRate: 83 },
                    { day: "السبت", date: "2024-01-20", orders: 36, revenue: 2281, completionRate: 79 }
                ],
                topDistributors: [
                    { name: "أحمد محمد", orders: 89, revenue: 5680, completionRate: 94 },
                    { name: "سارة أحمد", orders: 76, revenue: 4864, completionRate: 91 },
                    { name: "محمد علي", orders: 82, revenue: 5248, completionRate: 89 }
                ],
                challenges: [
                    { day: "الجمعة", issue: "طقس سيء", impact: "تأخير في التوصيل" },
                    { day: "السبت", issue: "عطل في المركبة", impact: "إعادة توزيع الطلبات" }
                ]
            };

            res.json({
                success: true,
                data: weeklyReport
            });

        } catch (error) {
            logger.error('Error fetching weekly reports:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب التقرير الأسبوعي',
                error: error.message
            });
        }
    }

    /**
     * Get monthly reports
     * @route GET /api/distribution/reports/monthly
     * @access Private (Admin/Manager)
     */
    static async getMonthlyReports(req, res) {
        try {
            const { month } = req.query;

            // Mock monthly report data
            const monthlyReport = {
                summary: {
                    totalOrders: 1380,
                    completedOrders: 1295,
                    totalRevenue: 87650.25,
                    deliveryRate: 93.8,
                    customerSatisfaction: 4.3,
                    averageOrderValue: 63.51,
                    growth: {
                        orders: 12.5,
                        revenue: 15.2,
                        satisfaction: 2.1
                    }
                },
                weeklyTrend: [
                    { week: "الأسبوع الأول", startDate: "2024-01-01", orders: 320, revenue: 20380, completionRate: 91 },
                    { week: "الأسبوع الثاني", startDate: "2024-01-08", orders: 365, revenue: 23200, completionRate: 94 },
                    { week: "الأسبوع الثالث", startDate: "2024-01-15", orders: 342, revenue: 21780, completionRate: 96 },
                    { week: "الأسبوع الرابع", startDate: "2024-01-22", orders: 353, revenue: 22490, completionRate: 93 }
                ],
                topProducts: [
                    { name: "خبز عربي", quantity: 4800, revenue: 14400, growth: 8.5 },
                    { name: "كعك محلى", quantity: 2400, revenue: 19200, growth: 15.2 },
                    { name: "معمول", quantity: 1800, revenue: 14400, growth: 22.1 }
                ],
                distributorRankings: [
                    { rank: 1, name: "أحمد محمد", orders: 285, revenue: 18240, efficiency: 96 },
                    { rank: 2, name: "سارة أحمد", orders: 268, revenue: 17152, efficiency: 94 },
                    { rank: 3, name: "محمد علي", orders: 275, revenue: 17600, efficiency: 92 }
                ]
            };

            res.json({
                success: true,
                data: monthlyReport
            });

        } catch (error) {
            logger.error('Error fetching monthly reports:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب التقرير الشهري',
                error: error.message
            });
        }
    }

    // ===== MAPS & ROUTES METHODS =====

    /**
     * Get distributor locations
     * @route GET /api/distribution/maps/distributors
     * @access Private (Admin/Manager)
     */
    static async getDistributorLocations(req, res) {
        try {
            // Mock location data
            const locations = [
                {
                    id: 1,
                    name: "أحمد محمد",
                    currentLocation: { lat: 33.5138, lng: 36.2765 },
                    status: "active",
                    route: "المسار الشمالي",
                    ordersRemaining: 5,
                    estimatedReturn: "14:30"
                },
                {
                    id: 2,
                    name: "سارة أحمد",
                    currentLocation: { lat: 33.5200, lng: 36.2800 },
                    status: "active",
                    route: "المسار الجنوبي",
                    ordersRemaining: 3,
                    estimatedReturn: "15:00"
                },
                {
                    id: 3,
                    name: "محمد علي",
                    currentLocation: { lat: 33.5100, lng: 36.2700 },
                    status: "break",
                    route: "المسار الشرقي",
                    ordersRemaining: 0,
                    estimatedReturn: "13:00"
                }
            ];

            res.json({
                success: true,
                data: locations
            });

        } catch (error) {
            logger.error('Error fetching distributor locations:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب مواقع الموزعين',
                error: error.message
            });
        }
    }

    /**
     * Get routes data
     * @route GET /api/distribution/maps/routes
     * @access Private (Admin/Manager)
     */
    static async getRoutes(req, res) {
        try {
            // Mock routes data
            const routes = [
                {
                    id: 1,
                    name: "المسار الشمالي",
                    distributor: "أحمد محمد",
                    status: "active",
                    totalDistance: "45 كم",
                    estimatedTime: "4 ساعات",
                    stores: 12,
                    completedStores: 7,
                    currentStore: "متجر النور",
                    waypoints: [
                        { name: "نقطة البداية", lat: 33.5138, lng: 36.2765, completed: true },
                        { name: "متجر الصباح", lat: 33.5200, lng: 36.2800, completed: true },
                        { name: "مخبز الهدى", lat: 33.5180, lng: 36.2820, completed: false }
                    ]
                },
                {
                    id: 2,
                    name: "المسار الجنوبي",
                    distributor: "سارة أحمد",
                    status: "active",
                    totalDistance: "38 كم",
                    estimatedTime: "3.5 ساعات",
                    stores: 10,
                    completedStores: 6,
                    currentStore: "متجر السلام",
                    waypoints: [
                        { name: "نقطة البداية", lat: 33.5100, lng: 36.2700, completed: true },
                        { name: "متجر الأمل", lat: 33.5050, lng: 36.2650, completed: true }
                    ]
                }
            ];

            res.json({
                success: true,
                data: routes
            });

        } catch (error) {
            logger.error('Error fetching routes:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب بيانات المسارات',
                error: error.message
            });
        }
    }

    /**
     * Get traffic data
     * @route GET /api/distribution/maps/traffic
     * @access Private (Admin/Manager)
     */
    static async getTrafficData(req, res) {
        try {
            // Mock traffic data
            const trafficData = {
                overall: "متوسط",
                zones: [
                    { name: "وسط بيروت", level: "عالي", color: "red", delay: "15-20 دقيقة" },
                    { name: "الحمرا", level: "متوسط", color: "yellow", delay: "5-10 دقائق" },
                    { name: "الأشرفية", level: "منخفض", color: "green", delay: "أقل من 5 دقائق" },
                    { name: "برج حمود", level: "متوسط", color: "yellow", delay: "8-12 دقيقة" }
                ],
                incidents: [
                    {
                        id: 1,
                        type: "حادث مروري",
                        location: "طريق الحزام - وسط بيروت",
                        severity: "متوسط",
                        estimatedDuration: "30 دقيقة"
                    },
                    {
                        id: 2,
                        type: "أعمال صيانة",
                        location: "شارع الحمرا",
                        severity: "منخفض",
                        estimatedDuration: "1 ساعة"
                    }
                ]
            };

            res.json({
                success: true,
                data: trafficData
            });

        } catch (error) {
            logger.error('Error fetching traffic data:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب بيانات المرور',
                error: error.message
            });
        }
    }

    // ===== ARCHIVE METHODS =====

    /**
     * Get archive data
     * @route GET /api/distribution/archive
     * @access Private (Admin/Manager)
     */
    static async getArchiveData(req, res) {
        try {
            const { page = 1, limit = 10, dateFrom, dateTo, type } = req.query;

            // Mock archive data
            const archiveData = {
                summary: {
                    totalOperations: 1250,
                    totalRevenue: 89500.75,
                    completedOrders: 1180,
                    successRate: 94.4,
                    averageOrderValue: 71.61,
                    peakDay: "الخميس",
                    topDistributor: "أحمد محمد"
                },
                operations: [
                    {
                        id: 1,
                        date: "2024-01-15",
                        title: "توزيع يومي - المنطقة الشمالية",
                        distributor: "أحمد محمد",
                        status: "completed",
                        orders: 12,
                        revenue: 890.50,
                        deliveryTime: "4.2 ساعات",
                        efficiency: 94
                    },
                    {
                        id: 2,
                        date: "2024-01-14",
                        title: "توزيع يومي - المنطقة الجنوبية",
                        distributor: "سارة أحمد",
                        status: "completed",
                        orders: 10,
                        revenue: 724.25,
                        deliveryTime: "3.8 ساعات",
                        efficiency: 91
                    }
                ],
                pagination: {
                    current: parseInt(page),
                    total: 125,
                    pages: 13,
                    limit: parseInt(limit)
                }
            };

            res.json({
                success: true,
                data: archiveData
            });

        } catch (error) {
            logger.error('Error fetching archive data:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب بيانات الأرشيف',
                error: error.message
            });
        }
    }

    /**
     * Get archived reports
     * @route GET /api/distribution/archive/reports
     * @access Private (Admin/Manager)
     */
    static async getArchivedReports(req, res) {
        try {
            const { page = 1, limit = 10, type } = req.query;

            // Mock archived reports
            const reports = [
                {
                    id: 1,
                    name: "تقرير التوزيع الأسبوعي - الأسبوع الثالث من يناير",
                    date: "2024-01-21",
                    type: "weekly",
                    size: "2.4 MB",
                    status: "available",
                    downloads: 12,
                    format: "PDF"
                },
                {
                    id: 2,
                    name: "تقرير التوزيع اليومي - 15 يناير 2024",
                    date: "2024-01-15",
                    type: "daily",
                    size: "1.8 MB",
                    status: "available",
                    downloads: 8,
                    format: "PDF"
                },
                {
                    id: 3,
                    name: "تقرير الأداء الشهري - يناير 2024",
                    date: "2024-01-31",
                    type: "monthly",
                    size: "3.2 MB",
                    status: "available",
                    downloads: 25,
                    format: "PDF"
                }
            ];

            res.json({
                success: true,
                data: {
                    reports,
                    pagination: {
                        current: parseInt(page),
                        total: 45,
                        pages: 5,
                        limit: parseInt(limit)
                    }
                }
            });

        } catch (error) {
            logger.error('Error fetching archived reports:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب التقارير المؤرشفة',
                error: error.message
            });
        }
    }

    // ===== STORE ANALYTICS METHODS =====

    /**
     * Get store analytics
     * @route GET /api/distribution/stores/analytics
     * @access Private (Admin/Manager)
     */
    static async getStoreAnalytics(req, res) {
        try {
            // Mock store analytics
            const analytics = {
                summary: {
                    totalStores: 45,
                    activeStores: 38,
                    inactiveStores: 7,
                    averageOrderValue: 185.25,
                    totalRevenue: 87650.25,
                    averageOrdersPerStore: 24.6
                },
                topStores: [
                    {
                        id: 1,
                        name: "متجر الصباح",
                        orders: 156,
                        revenue: 12450.50,
                        averageOrderValue: 79.81,
                        lastOrder: "2024-01-20",
                        performance: "ممتاز"
                    },
                    {
                        id: 2,
                        name: "مخبز النور",
                        orders: 134,
                        revenue: 10890.25,
                        averageOrderValue: 81.27,
                        lastOrder: "2024-01-19",
                        performance: "جيد جداً"
                    },
                    {
                        id: 3,
                        name: "متجر السلام",
                        orders: 128,
                        revenue: 9850.75,
                        averageOrderValue: 76.96,
                        lastOrder: "2024-01-18",
                        performance: "جيد"
                    }
                ],
                orderDistribution: [
                    { range: "أقل من 50€", stores: 12, percentage: 26.7 },
                    { range: "50€ - 100€", stores: 18, percentage: 40.0 },
                    { range: "100€ - 200€", stores: 12, percentage: 26.7 },
                    { range: "أكثر من 200€", stores: 3, percentage: 6.7 }
                ],
                trends: {
                    newStores: 3,
                    lostStores: 1,
                    growthRate: 8.5,
                    retentionRate: 92.3
                }
            };

            res.json({
                success: true,
                data: analytics
            });

        } catch (error) {
            logger.error('Error fetching store analytics:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب تحليلات المتاجر',
                error: error.message
            });
        }
    }
}

export default DistributionController; 