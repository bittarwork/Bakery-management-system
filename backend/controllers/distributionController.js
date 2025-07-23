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
}

export default DistributionController; 