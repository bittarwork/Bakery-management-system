import { User, Order, LocationHistory, DistributorDailyPerformance, Store } from '../models/index.js';
import { Op } from 'sequelize';
import logger from '../config/logger.js';

/**
 * Enhanced Distributor Controller
 * Handles real-time location tracking, performance management, and comprehensive distributor operations
 */
class EnhancedDistributorController {

    /**
     * Get all active distributors with their current status and location
     * @route GET /api/distributors/active
     * @access Private (Admin/Manager)
     */
    static async getActiveDistributors(req, res) {
        try {
            const { include_location = true, include_performance = false } = req.query;

            const distributors = await User.findAll({
                where: {
                    role: 'distributor',
                    status: 'active'
                },
                attributes: [
                    'id', 'full_name', 'phone', 'email', 'status', 'work_status',
                    'current_location', 'location_updated_at', 'vehicle_info', 'created_at'
                ],
                order: [['full_name', 'ASC']]
            });

            // Enhanced distributor data with additional information
            const enhancedDistributors = await Promise.all(
                distributors.map(async (distributor) => {
                    const distributorData = distributor.toJSON();

                    // Get today's performance if requested
                    if (include_performance === 'true') {
                        const today = new Date().toISOString().split('T')[0];
                        const performance = await DistributorDailyPerformance.findOne({
                            where: {
                                distributor_id: distributorData.id,
                                date: today
                            }
                        });
                        distributorData.today_performance = performance;
                    }

                    // Get assigned orders count for today
                    const today = new Date().toISOString().split('T')[0];
                    const ordersCount = await Order.count({
                        where: {
                            assigned_distributor_id: distributorData.id,
                            order_date: today
                        }
                    });

                    distributorData.today_orders_count = ordersCount;

                    // Calculate location freshness
                    if (distributorData.location_updated_at) {
                        const lastUpdate = new Date(distributorData.location_updated_at);
                        const now = new Date();
                        const minutesAgo = Math.floor((now - lastUpdate) / (1000 * 60));
                        distributorData.location_age_minutes = minutesAgo;
                        distributorData.location_is_fresh = minutesAgo <= 15; // Fresh if updated within 15 minutes
                    }

                    return distributorData;
                })
            );

            res.json({
                success: true,
                data: {
                    distributors: enhancedDistributors,
                    total_count: enhancedDistributors.length,
                    active_count: enhancedDistributors.filter(d => d.work_status === 'available' || d.work_status === 'busy').length,
                    with_fresh_location: enhancedDistributors.filter(d => d.location_is_fresh).length
                },
                message: `Found ${enhancedDistributors.length} active distributors`
            });

        } catch (error) {
            logger.error('Error getting active distributors:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب الموزعين النشطين',
                error: error.message
            });
        }
    }

    /**
     * Update distributor location (called from mobile app)
     * @route POST /api/distributors/:id/location
     * @access Private (Distributor)
     */
    static async updateDistributorLocation(req, res) {
        try {
            const { id } = req.params;
            const { latitude, longitude, accuracy, speed, heading, address, activity_type = 'moving', order_id, battery_level } = req.body;

            // Validate required fields
            if (!latitude || !longitude) {
                return res.status(400).json({
                    success: false,
                    message: 'Latitude and longitude are required'
                });
            }

            // Find distributor
            const distributor = await User.findOne({
                where: {
                    id,
                    role: 'distributor',
                    status: 'active'
                }
            });

            if (!distributor) {
                return res.status(404).json({
                    success: false,
                    message: 'Distributor not found'
                });
            }

            // Update distributor's current location
            const locationData = {
                lat: parseFloat(latitude),
                lng: parseFloat(longitude),
                accuracy: accuracy || null,
                speed: speed || null,
                heading: heading || null,
                address: address || `${latitude}, ${longitude}`,
                timestamp: new Date()
            };

            await distributor.updateLocation(locationData);

            // Record in location history
            await LocationHistory.create({
                distributor_id: id,
                location: locationData,
                activity_type,
                order_id: order_id || null,
                battery_level: battery_level || null,
                is_manual: false
            });

            res.json({
                success: true,
                data: {
                    distributor_id: id,
                    location: locationData,
                    location_updated_at: distributor.location_updated_at
                },
                message: 'Location updated successfully'
            });

        } catch (error) {
            logger.error('Error updating distributor location:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تحديث موقع الموزع',
                error: error.message
            });
        }
    }

    /**
     * Update distributor work status
     * @route PATCH /api/distributors/:id/work-status
     * @access Private (Distributor/Manager)
     */
    static async updateWorkStatus(req, res) {
        try {
            const { id } = req.params;
            const { work_status, notes } = req.body;

            const validStatuses = ['available', 'busy', 'offline', 'break'];
            if (!validStatuses.includes(work_status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid work status'
                });
            }

            const distributor = await User.findOne({
                where: {
                    id,
                    role: 'distributor',
                    status: 'active'
                }
            });

            if (!distributor) {
                return res.status(404).json({
                    success: false,
                    message: 'Distributor not found'
                });
            }

            await distributor.updateWorkStatus(work_status);

            // Log status change
            logger.info(`Distributor ${id} status changed to ${work_status}`, {
                distributor_id: id,
                old_status: distributor.work_status,
                new_status: work_status,
                notes
            });

            res.json({
                success: true,
                data: {
                    distributor_id: id,
                    work_status,
                    updated_at: new Date()
                },
                message: 'Work status updated successfully'
            });

        } catch (error) {
            logger.error('Error updating work status:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تحديث حالة العمل',
                error: error.message
            });
        }
    }

    /**
     * Get distributor details with comprehensive information
     * @route GET /api/distributors/:id/details
     * @access Private (Admin/Manager)
     */
    static async getDistributorDetails(req, res) {
        try {
            const { id } = req.params;
            const { date = new Date().toISOString().split('T')[0] } = req.query;

            // Get distributor basic info
            const distributor = await User.findOne({
                where: {
                    id,
                    role: 'distributor'
                },
                attributes: [
                    'id', 'full_name', 'phone', 'email', 'status', 'work_status',
                    'current_location', 'location_updated_at', 'vehicle_info', 'created_at'
                ]
            });

            if (!distributor) {
                return res.status(404).json({
                    success: false,
                    message: 'Distributor not found'
                });
            }

            // Get today's performance
            const performance = await DistributorDailyPerformance.findOne({
                where: {
                    distributor_id: id,
                    date
                }
            });

            // Get today's orders
            const orders = await Order.findAll({
                where: {
                    assigned_distributor_id: id,
                    order_date: date
                },
                include: [{
                    model: Store,
                    as: 'store',
                    attributes: ['id', 'name', 'address', 'phone']
                }],
                order: [['created_at', 'DESC']]
            });

            // Get location history for today
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);

            const locationHistory = await LocationHistory.findAll({
                where: {
                    distributor_id: id,
                    recorded_at: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate
                    }
                },
                order: [['recorded_at', 'ASC']],
                limit: 100 // Limit to last 100 location points
            });

            // Calculate some statistics
            const stats = {
                total_orders: orders.length,
                delivered_orders: orders.filter(o => o.status === 'delivered').length,
                pending_orders: orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length,
                total_revenue: orders.reduce((sum, order) => sum + parseFloat(order.final_amount_eur || 0), 0),
                location_points_today: locationHistory.length
            };

            // Calculate working hours if we have start time
            let workingHours = 0;
            if (performance && performance.work_started_at) {
                const startTime = new Date(`${date} ${performance.work_started_at}`);
                const endTime = performance.work_ended_at 
                    ? new Date(`${date} ${performance.work_ended_at}`)
                    : new Date();
                workingHours = (endTime - startTime) / (1000 * 60 * 60); // Convert to hours
            }

            res.json({
                success: true,
                data: {
                    distributor: distributor.toJSON(),
                    performance: performance ? performance.toJSON() : null,
                    orders: orders.map(order => order.toJSON()),
                    location_history: locationHistory.map(loc => loc.toJSON()),
                    statistics: {
                        ...stats,
                        working_hours: Math.round(workingHours * 100) / 100,
                        efficiency_score: performance ? performance.efficiency_score : 0,
                        delivery_rate: stats.total_orders > 0 ? Math.round((stats.delivered_orders / stats.total_orders) * 100) : 0
                    }
                },
                message: 'Distributor details retrieved successfully'
            });

        } catch (error) {
            logger.error('Error getting distributor details:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب تفاصيل الموزع',
                error: error.message
            });
        }
    }

    /**
     * Get live tracking data for all active distributors
     * @route GET /api/distributors/live-tracking
     * @access Private (Admin/Manager)
     */
    static async getLiveTracking(req, res) {
        try {
            const { date = new Date().toISOString().split('T')[0] } = req.query;

            // Get all active distributors with current location
            const distributors = await User.findAll({
                where: {
                    role: 'distributor',
                    status: 'active',
                    work_status: ['available', 'busy']
                },
                attributes: [
                    'id', 'full_name', 'phone', 'work_status',
                    'current_location', 'location_updated_at', 'vehicle_info'
                ]
            });

            // Get today's orders for each distributor
            const trackingData = await Promise.all(
                distributors.map(async (distributor) => {
                    const distributorData = distributor.toJSON();

                    // Get assigned orders for today
                    const orders = await Order.findAll({
                        where: {
                            assigned_distributor_id: distributorData.id,
                            order_date: date
                        },
                        include: [{
                            model: Store,
                            as: 'store',
                            attributes: ['id', 'name', 'address']
                        }],
                        order: [['created_at', 'ASC']]
                    });

                    // Calculate progress
                    const totalOrders = orders.length;
                    const completedOrders = orders.filter(o => o.status === 'delivered').length;
                    const currentOrder = orders.find(o => o.status === 'prepared' || o.status === 'confirmed');

                    // Get today's performance
                    const performance = await DistributorDailyPerformance.findOne({
                        where: {
                            distributor_id: distributorData.id,
                            date
                        }
                    });

                    return {
                        ...distributorData,
                        orders: orders.map(o => o.toJSON()),
                        current_order: currentOrder ? currentOrder.toJSON() : null,
                        progress: {
                            total_orders: totalOrders,
                            completed_orders: completedOrders,
                            pending_orders: totalOrders - completedOrders,
                            completion_percentage: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
                        },
                        performance: performance ? performance.toJSON() : null,
                        location_freshness: distributorData.location_updated_at 
                            ? Math.floor((new Date() - new Date(distributorData.location_updated_at)) / (1000 * 60))
                            : null
                    };
                })
            );

            // Calculate summary statistics
            const summary = {
                total_distributors: trackingData.length,
                active_distributors: trackingData.filter(d => d.work_status === 'busy').length,
                available_distributors: trackingData.filter(d => d.work_status === 'available').length,
                total_orders: trackingData.reduce((sum, d) => sum + d.progress.total_orders, 0),
                completed_orders: trackingData.reduce((sum, d) => sum + d.progress.completed_orders, 0),
                total_revenue: trackingData.reduce((sum, d) => sum + (d.performance?.total_revenue_eur || 0), 0)
            };

            res.json({
                success: true,
                data: {
                    distributors: trackingData,
                    summary,
                    timestamp: new Date(),
                    date
                },
                message: `Live tracking data for ${trackingData.length} distributors`
            });

        } catch (error) {
            logger.error('Error getting live tracking data:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب بيانات التتبع المباشر',
                error: error.message
            });
        }
    }

    /**
     * Start work day for distributor
     * @route POST /api/distributors/:id/start-work
     * @access Private (Distributor)
     */
    static async startWorkDay(req, res) {
        try {
            const { id } = req.params;
            const { location } = req.body;
            const today = new Date().toISOString().split('T')[0];

            const distributor = await User.findOne({
                where: {
                    id,
                    role: 'distributor',
                    status: 'active'
                }
            });

            if (!distributor) {
                return res.status(404).json({
                    success: false,
                    message: 'Distributor not found'
                });
            }

            // Update work status to available
            await distributor.updateWorkStatus('available');

            // Update location if provided
            if (location) {
                await distributor.updateLocation(location);
            }

            // Create or update daily performance record
            const [performance, created] = await DistributorDailyPerformance.findOrCreate({
                where: {
                    distributor_id: id,
                    date: today
                },
                defaults: {
                    work_started_at: new Date().toTimeString().split(' ')[0],
                    total_work_hours: 0
                }
            });

            if (!created && !performance.work_started_at) {
                performance.work_started_at = new Date().toTimeString().split(' ')[0];
                await performance.save();
            }

            res.json({
                success: true,
                data: {
                    distributor_id: id,
                    work_started_at: performance.work_started_at,
                    work_status: 'available'
                },
                message: 'Work day started successfully'
            });

        } catch (error) {
            logger.error('Error starting work day:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في بدء يوم العمل',
                error: error.message
            });
        }
    }

    /**
     * End work day for distributor
     * @route POST /api/distributors/:id/end-work
     * @access Private (Distributor)
     */
    static async endWorkDay(req, res) {
        try {
            const { id } = req.params;
            const { notes } = req.body;
            const today = new Date().toISOString().split('T')[0];

            const distributor = await User.findOne({
                where: {
                    id,
                    role: 'distributor',
                    status: 'active'
                }
            });

            if (!distributor) {
                return res.status(404).json({
                    success: false,
                    message: 'Distributor not found'
                });
            }

            // Update work status to offline
            await distributor.updateWorkStatus('offline');

            // Update daily performance record
            const performance = await DistributorDailyPerformance.findOne({
                where: {
                    distributor_id: id,
                    date: today
                }
            });

            if (performance) {
                const endTime = new Date().toTimeString().split(' ')[0];
                performance.work_ended_at = endTime;
                
                // Calculate total work hours
                if (performance.work_started_at) {
                    const startTime = new Date(`${today} ${performance.work_started_at}`);
                    const endTimeDate = new Date(`${today} ${endTime}`);
                    const workHours = (endTimeDate - startTime) / (1000 * 60 * 60);
                    performance.total_work_hours = Math.round(workHours * 100) / 100;
                }

                if (notes) {
                    performance.notes = notes;
                }

                // Calculate efficiency score
                performance.efficiency_score = performance.calculateEfficiencyScore();
                
                await performance.save();
            }

            res.json({
                success: true,
                data: {
                    distributor_id: id,
                    work_ended_at: performance?.work_ended_at,
                    total_work_hours: performance?.total_work_hours,
                    work_status: 'offline'
                },
                message: 'Work day ended successfully'
            });

        } catch (error) {
            logger.error('Error ending work day:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في إنهاء يوم العمل',
                error: error.message
            });
        }
    }
}

export default EnhancedDistributorController; 