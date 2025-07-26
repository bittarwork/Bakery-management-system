import { User } from '../models/index.js';
import logger from '../config/logger.js';

/**
 * Simple Distribution Service
 * Direct assignment of orders to distributors without complex scheduling
 */
class SimpleDistributionService {

    /**
     * Assign order to best available distributor
     * Simple logic: round-robin with availability check
     */
    static async assignOrderToDistributor(order, userId = null) {
        try {
            logger.info(`[DISTRIBUTION] Starting assignment for order ${order.order_number || order.id}`);

            // Find available distributors
            const availableDistributors = await this.getAvailableDistributors();
            logger.info(`[DISTRIBUTION] Found ${availableDistributors.length} available distributors`);

            if (availableDistributors.length === 0) {
                logger.warn(`[DISTRIBUTION] No available distributors found for order ${order.order_number || order.id}`);
                
                // Check if there are any distributors at all
                const allDistributors = await User.findAll({
                    where: { role: 'distributor' },
                    attributes: ['id', 'full_name', 'status']
                });
                
                logger.info(`[DISTRIBUTION] Total distributors in system: ${allDistributors.length}`);
                allDistributors.forEach(dist => {
                    logger.info(`[DISTRIBUTION] Distributor: ${dist.full_name}, Status: ${dist.status}`);
                });

                return {
                    success: false,
                    message: `No available distributors found. Total distributors: ${allDistributors.length}`,
                    assigned_distributor: null,
                    debug_info: {
                        total_distributors: allDistributors.length,
                        distributors: allDistributors.map(d => ({ name: d.full_name, status: d.status }))
                    }
                };
            }

            // Log available distributors
            availableDistributors.forEach(dist => {
                logger.info(`[DISTRIBUTION] Available: ${dist.full_name}, Workload: ${dist.current_workload || 0}, Rating: ${dist.performance_rating || 0}`);
            });

            // Simple assignment logic - get next available distributor
            const assignedDistributor = await this.selectBestDistributor(availableDistributors, order);
            logger.info(`[DISTRIBUTION] Selected distributor: ${assignedDistributor.full_name} (ID: ${assignedDistributor.id})`);

            // Update distributor workload
            await this.updateDistributorWorkload(assignedDistributor.id, 1);

            logger.info(`[DISTRIBUTION] Successfully assigned order ${order.order_number || order.id} to distributor: ${assignedDistributor.full_name}`);

            return {
                success: true,
                message: `Order assigned to ${assignedDistributor.full_name}`,
                assigned_distributor: assignedDistributor,
                assignment_details: {
                    distributor_id: assignedDistributor.id,
                    distributor_name: assignedDistributor.full_name,
                    distributor_phone: assignedDistributor.phone,
                    assigned_at: new Date(),
                    assignment_method: 'automatic'
                }
            };

        } catch (error) {
            logger.error('[DISTRIBUTION] Error in assignOrderToDistributor:', error);
            return {
                success: false,
                message: 'Failed to assign distributor',
                error: error.message,
                assigned_distributor: null
            };
        }
    }

    /**
     * Get list of available distributors
     */
    static async getAvailableDistributors() {
        try {
            const distributors = await User.findAll({
                where: {
                    role: 'distributor',
                    status: 'active'
                },
                attributes: [
                    'id',
                    'full_name',
                    'username',
                    'phone',
                    'email',
                    'current_workload',
                    'performance_rating',
                    'last_active'
                ],
                order: [
                    ['current_workload', 'ASC'], // Prefer less busy distributors
                    ['performance_rating', 'DESC'] // Prefer better rated distributors
                ]
            });

            return distributors || [];

        } catch (error) {
            logger.error('Error getting available distributors:', error);
            return [];
        }
    }

    /**
     * Select best distributor using simple logic
     */
    static async selectBestDistributor(distributors, order) {
        // Simple logic: return the first distributor (already sorted by workload and rating)
        if (distributors.length === 1) {
            return distributors[0];
        }

        // For multiple distributors, prefer the one with lowest workload
        const leastBusyDistributor = distributors.reduce((prev, current) => {
            const prevWorkload = prev.current_workload || 0;
            const currentWorkload = current.current_workload || 0;
            return (currentWorkload < prevWorkload) ? current : prev;
        });

        return leastBusyDistributor;
    }

    /**
     * Update distributor workload
     */
    static async updateDistributorWorkload(distributorId, increment = 1) {
        try {
            const distributor = await User.findByPk(distributorId);
            if (distributor) {
                const currentWorkload = distributor.current_workload || 0;
                await distributor.update({
                    current_workload: Math.max(0, currentWorkload + increment)
                });

                logger.info(`Updated distributor ${distributorId} workload: ${currentWorkload + increment}`);
            }
        } catch (error) {
            logger.error('Error updating distributor workload:', error);
        }
    }

    /**
     * Get distributor orders (for mobile app)
     */
    static async getDistributorOrders(distributorId, status = null) {
        try {
            const { Order, OrderItem, Product, Store } = await import('../models/index.js');

            const whereClause = {
                assigned_distributor_id: distributorId
            };

            // Filter by status if provided
            if (status && status !== 'all') {
                whereClause.status = status;
            } else {
                // Default: show only active orders (not delivered or cancelled)
                const { Op } = await import('sequelize');
                whereClause.status = {
                    [Op.not]: ['delivered', 'cancelled']
                };
            }

            const orders = await Order.findAll({
                where: whereClause,
                include: [
                    {
                        model: Store,
                        as: 'store',
                        attributes: ['id', 'name', 'address', 'phone', 'latitude', 'longitude']
                    },
                    {
                        model: OrderItem,
                        as: 'items',
                        include: [
                            {
                                model: Product,
                                as: 'product',
                                attributes: ['id', 'name', 'unit', 'image_url']
                            }
                        ]
                    }
                ],
                order: [
                    ['priority', 'DESC'], // High priority first
                    ['scheduled_delivery_date', 'ASC'], // Earlier delivery first
                    ['created_at', 'ASC'] // Older orders first
                ]
            });

            return {
                success: true,
                orders: orders || [],
                count: orders?.length || 0
            };

        } catch (error) {
            logger.error('Error getting distributor orders:', error);
            return {
                success: false,
                orders: [],
                count: 0,
                error: error.message
            };
        }
    }

    /**
     * Unassign distributor from order (for reassignment)
     */
    static async unassignDistributor(orderId, reason = 'manual_reassignment') {
        try {
            const { Order } = await import('../models/index.js');

            const order = await Order.findByPk(orderId);
            if (!order) {
                return { success: false, message: 'Order not found' };
            }

            const previousDistributorId = order.assigned_distributor_id;

            // Remove assignment
            await order.update({
                assigned_distributor_id: null,
                status: 'confirmed' // Reset to confirmed status
            });

            // Decrease previous distributor workload
            if (previousDistributorId) {
                await this.updateDistributorWorkload(previousDistributorId, -1);
            }

            logger.info(`Unassigned distributor from order ${order.order_number}. Reason: ${reason}`);

            return {
                success: true,
                message: 'Distributor unassigned successfully',
                previous_distributor_id: previousDistributorId
            };

        } catch (error) {
            logger.error('Error unassigning distributor:', error);
            return {
                success: false,
                message: 'Failed to unassign distributor',
                error: error.message
            };
        }
    }

    /**
     * Get distribution statistics
     */
    static async getDistributionStats() {
        try {
            const { Order } = await import('../models/index.js');
            const { Op } = await import('sequelize');

            // Get basic stats
            const [
                totalOrders,
                assignedOrders,
                pendingOrders,
                distributorStats
            ] = await Promise.all([
                Order.count(),
                Order.count({ where: { assigned_distributor_id: { [Op.not]: null } } }),
                Order.count({ where: { assigned_distributor_id: null, status: ['confirmed', 'draft'] } }),
                this.getDistributorStats()
            ]);

            return {
                success: true,
                stats: {
                    total_orders: totalOrders,
                    assigned_orders: assignedOrders,
                    pending_orders: pendingOrders,
                    assignment_rate: totalOrders > 0 ? Math.round((assignedOrders / totalOrders) * 100) : 0,
                    distributors: distributorStats
                }
            };

        } catch (error) {
            logger.error('Error getting distribution stats:', error);
            return {
                success: false,
                stats: null,
                error: error.message
            };
        }
    }

    /**
     * Get distributor statistics
     */
    static async getDistributorStats() {
        try {
            const distributors = await User.findAll({
                where: { role: 'distributor' },
                attributes: [
                    'id',
                    'full_name',
                    'status',
                    'current_workload',
                    'performance_rating'
                ]
            });

            return distributors.map(dist => ({
                id: dist.id,
                name: dist.full_name,
                status: dist.status,
                workload: dist.current_workload || 0,
                rating: dist.performance_rating || 0
            }));

        } catch (error) {
            logger.error('Error getting distributor stats:', error);
            return [];
        }
    }
}

export default SimpleDistributionService; 