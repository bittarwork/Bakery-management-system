import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import DailyDistributionSchedule from '../models/DailyDistributionSchedule.js';
import DistributionTrip from '../models/DistributionTrip.js';
import LocationTracking from '../models/LocationTracking.js';
import DistributionNotification from '../models/DistributionNotification.js';
import DistributionSettings from '../models/DistributionSettings.js';
import { User, Store, Order } from '../models/index.js';
import logger from '../config/logger.js';

// @desc    Get daily distribution schedules with filters
// @route   GET /api/distribution/schedules
// @access  Private
export const getDistributionSchedules = async (req, res) => {
    try {
        const {
            distributor_id,
            schedule_date,
            store_id,
            visit_status,
            start_date,
            end_date,
            page = 1,
            limit = 50
        } = req.query;

        // Build where clause
        const whereClause = {};

        if (distributor_id) {
            whereClause.distributor_id = distributor_id;
        }

        if (schedule_date) {
            whereClause.schedule_date = schedule_date;
        }

        if (store_id) {
            whereClause.store_id = store_id;
        }

        if (visit_status) {
            whereClause.visit_status = visit_status;
        }

        if (start_date && end_date) {
            whereClause.schedule_date = {
                [Op.between]: [start_date, end_date]
            };
        }

        // Get schedules with pagination
        const offset = (page - 1) * limit;
        const { count, rows: schedules } = await DailyDistributionSchedule.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'distributor',
                    attributes: ['id', 'full_name', 'phone', 'working_status']
                },
                {
                    model: Store,
                    as: 'store',
                    attributes: ['id', 'name', 'address', 'phone', 'gps_coordinates']
                }
            ],
            order: [
                ['schedule_date', 'DESC'],
                ['distributor_id', 'ASC'],
                ['visit_order', 'ASC']
            ],
            limit: parseInt(limit),
            offset: offset
        });

        // Calculate summary statistics
        const totalPages = Math.ceil(count / limit);
        const summary = await DailyDistributionSchedule.getScheduleStatistics(
            distributor_id,
            schedule_date
        );

        res.status(200).json({
            success: true,
            message: 'Distribution schedules retrieved successfully',
            data: {
                schedules,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_records: count,
                    per_page: parseInt(limit)
                },
                summary
            }
        });

    } catch (error) {
        logger.error('Error getting distribution schedules:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving distribution schedules',
            error: error.message
        });
    }
};

// @desc    Get single distribution schedule
// @route   GET /api/distribution/schedules/:id
// @access  Private
export const getDistributionSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const schedule = await DailyDistributionSchedule.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'distributor',
                    attributes: ['id', 'full_name', 'phone', 'working_status', 'current_location']
                },
                {
                    model: Store,
                    as: 'store',
                    attributes: ['id', 'name', 'address', 'phone', 'gps_coordinates', 'delivery_instructions']
                }
            ]
        });

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Distribution schedule not found'
            });
        }

        // Get related orders
        const relatedOrders = schedule.order_ids && schedule.order_ids.length > 0
            ? await Order.findAll({
                where: {
                    id: { [Op.in]: schedule.order_ids }
                },
                attributes: ['id', 'order_number', 'total_amount_eur', 'status', 'notes']
            })
            : [];

        res.status(200).json({
            success: true,
            message: 'Distribution schedule retrieved successfully',
            data: {
                schedule,
                related_orders: relatedOrders,
                delay_minutes: schedule.calculateDelay(),
                visit_duration: schedule.getVisitDuration()
            }
        });

    } catch (error) {
        logger.error('Error getting distribution schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving distribution schedule',
            error: error.message
        });
    }
};

// @desc    Get today's schedules for all distributors
// @route   GET /api/distribution/schedules/today
// @access  Private
export const getTodaySchedules = async (req, res) => {
    try {
        const { distributor_id } = req.query;

        const schedules = await DailyDistributionSchedule.getTodaySchedule(distributor_id);

        // Group schedules by distributor
        const schedulesByDistributor = {};

        for (const schedule of schedules) {
            if (!schedulesByDistributor[schedule.distributor_id]) {
                // Get distributor info
                const distributor = await User.findByPk(schedule.distributor_id, {
                    attributes: ['id', 'full_name', 'phone', 'working_status', 'is_online']
                });

                // Get latest location
                const latestLocation = await LocationTracking.getLatestLocation(schedule.distributor_id);

                schedulesByDistributor[schedule.distributor_id] = {
                    distributor,
                    latest_location: latestLocation,
                    schedules: []
                };
            }

            // Get store info
            const store = await Store.findByPk(schedule.store_id, {
                attributes: ['id', 'name', 'address', 'gps_coordinates']
            });

            schedulesByDistributor[schedule.distributor_id].schedules.push({
                ...schedule.toJSON(),
                store,
                delay_minutes: schedule.calculateDelay()
            });
        }

        res.status(200).json({
            success: true,
            message: 'Today\'s schedules retrieved successfully',
            data: {
                schedules_by_distributor: schedulesByDistributor,
                total_distributors: Object.keys(schedulesByDistributor).length,
                total_visits: schedules.length
            }
        });

    } catch (error) {
        logger.error('Error getting today\'s schedules:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving today\'s schedules',
            error: error.message
        });
    }
};

// @desc    Get distributor's schedule for specific date
// @route   GET /api/distribution/schedules/distributor/:distributorId
// @access  Private
export const getDistributorSchedule = async (req, res) => {
    try {
        const { distributorId } = req.params;
        const { date } = req.query;

        console.log('getDistributorSchedule called with:', { distributorId, date });
        console.log('Request user:', req.user?.id, req.user?.role);

        const schedules = await DailyDistributionSchedule.getDistributorSchedule(
            distributorId,
            date
        );

        console.log('Found schedules count:', schedules.length);

        // Get distributor info
        console.log('Looking for distributor with ID:', distributorId);
        const distributor = await User.findByPk(distributorId, {
            attributes: ['id', 'full_name', 'phone', 'working_status', 'is_online']
        });

        console.log('Distributor found:', distributor ? 'Yes' : 'No');
        if (!distributor) {
            console.log('Distributor not found, returning 404');
            return res.status(404).json({
                success: false,
                message: 'Distributor not found'
            });
        }

        // Enrich schedules with store info and calculations
        console.log('Starting to enrich schedules...');
        const enrichedSchedules = await Promise.all(
            schedules.map(async (schedule, index) => {
                console.log(`Processing schedule ${index + 1}/${schedules.length}, store_id: ${schedule.store_id}`);

                const store = await Store.findByPk(schedule.store_id, {
                    attributes: ['id', 'name', 'address', 'phone', 'gps_coordinates']
                });

                console.log(`Store found for ID ${schedule.store_id}:`, store ? 'Yes' : 'No');

                const relatedOrders = schedule.order_ids && schedule.order_ids.length > 0
                    ? await Order.findAll({
                        where: { id: { [Op.in]: schedule.order_ids } },
                        attributes: ['id', 'order_number', 'total_amount_eur', 'status']
                    })
                    : [];

                console.log(`Related orders for schedule ${index + 1}:`, relatedOrders.length);

                return {
                    ...schedule.toJSON(),
                    store,
                    related_orders: relatedOrders,
                    delay_minutes: schedule.calculateDelay ? schedule.calculateDelay() : 0,
                    visit_duration: schedule.getVisitDuration ? schedule.getVisitDuration() : 0
                };
            })
        );

        console.log('Enriched schedules completed, count:', enrichedSchedules.length);

        res.status(200).json({
            success: true,
            message: 'Distributor schedule retrieved successfully',
            data: {
                distributor,
                schedules: enrichedSchedules,
                total_visits: enrichedSchedules.length
            }
        });

    } catch (error) {
        console.error('Error in getDistributorSchedule:', error);
        console.error('Error stack:', error.stack);
        logger.error('Error getting distributor schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving distributor schedule',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Generate daily schedule for distributor
// @route   POST /api/distribution/schedules/generate
// @access  Private
export const generateDistributionSchedule = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            distributor_id,
            schedule_date,
            stores_data,
            optimize_route = true
        } = req.body;

        // Check if distributor exists and is active
        const distributor = await User.findOne({
            where: {
                id: distributor_id,
                role: 'distributor',
                status: 'active'
            }
        });

        if (!distributor) {
            return res.status(404).json({
                success: false,
                message: 'Active distributor not found'
            });
        }

        // Validate stores data
        if (!stores_data || !Array.isArray(stores_data) || stores_data.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Stores data is required and must be a non-empty array'
            });
        }

        // Check if schedule already exists
        const existingSchedule = await DailyDistributionSchedule.findOne({
            where: {
                distributor_id,
                schedule_date
            }
        });

        if (existingSchedule) {
            return res.status(409).json({
                success: false,
                message: 'Schedule already exists for this distributor and date. Use update instead.'
            });
        }

        // TODO: Implement route optimization using Google Maps API
        let optimizedStoresData = stores_data;

        if (optimize_route) {
            // For now, we'll use the provided order
            // In the next phase, we'll implement Google Maps route optimization
            console.log('Route optimization will be implemented in the next phase');
        }

        // Generate the schedule
        const createdSchedules = await DailyDistributionSchedule.generateSchedule(
            distributor_id,
            schedule_date,
            optimizedStoresData
        );

        // Create or update distribution trip
        let trip = await DistributionTrip.findOne({
            where: {
                distributor_id,
                trip_date: schedule_date
            }
        });

        if (!trip) {
            trip = await DistributionTrip.create({
                distributor_id,
                trip_date: schedule_date,
                trip_status: 'planned'
            });
        }

        // Send notification to distributor
        await DistributionNotification.createScheduleUpdateNotification(
            distributor_id,
            {
                date: schedule_date,
                trip_id: trip.id,
                store_count: createdSchedules.length
            }
        );

        res.status(201).json({
            success: true,
            message: 'Distribution schedule generated successfully',
            data: {
                schedules: createdSchedules,
                trip,
                total_visits: createdSchedules.length
            }
        });

    } catch (error) {
        logger.error('Error generating distribution schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating distribution schedule',
            error: error.message
        });
    }
};

// @desc    Update distribution schedule item
// @route   PUT /api/distribution/schedules/:id
// @access  Private
export const updateDistributionSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const schedule = await DailyDistributionSchedule.findByPk(id);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Distribution schedule not found'
            });
        }

        // Prevent updating completed visits
        if (schedule.visit_status === 'completed' && updateData.visit_status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot modify completed visits'
            });
        }

        // Update the schedule
        await schedule.update(updateData);

        // If status changed to in_progress or completed, send notification
        if (updateData.visit_status && updateData.visit_status !== schedule.visit_status) {
            if (updateData.visit_status === 'in_progress') {
                await DistributionNotification.createSystemAlertNotification(
                    schedule.distributor_id,
                    {
                        message: `Visit to ${schedule.store_name} has started`,
                        priority: 'normal'
                    }
                );
            } else if (updateData.visit_status === 'completed') {
                await DistributionNotification.createSystemAlertNotification(
                    schedule.distributor_id,
                    {
                        message: `Visit to ${schedule.store_name} has been completed`,
                        priority: 'normal'
                    }
                );
            }
        }

        res.status(200).json({
            success: true,
            message: 'Distribution schedule updated successfully',
            data: { schedule }
        });

    } catch (error) {
        logger.error('Error updating distribution schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating distribution schedule',
            error: error.message
        });
    }
};

// @desc    Start store visit
// @route   POST /api/distribution/schedules/:id/start
// @access  Private
export const startStoreVisit = async (req, res) => {
    try {
        const { id } = req.params;
        const { location } = req.body; // Optional arrival location

        const schedule = await DailyDistributionSchedule.findByPk(id);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Distribution schedule not found'
            });
        }

        if (schedule.visit_status !== 'scheduled') {
            return res.status(400).json({
                success: false,
                message: 'Only scheduled visits can be started'
            });
        }

        // Start the visit
        await schedule.startVisit();

        // Update user's current schedule
        await User.update(
            { current_schedule_id: schedule.id },
            { where: { id: schedule.distributor_id } }
        );

        // Log arrival location if provided
        if (location && location.latitude && location.longitude) {
            await LocationTracking.create({
                distributor_id: schedule.distributor_id,
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy || null,
                speed: 0,
                is_moving: false,
                activity_type: 'still',
                timestamp: new Date()
            });
        }

        res.status(200).json({
            success: true,
            message: 'Store visit started successfully',
            data: { schedule }
        });

    } catch (error) {
        logger.error('Error starting store visit:', error);
        res.status(500).json({
            success: false,
            message: 'Error starting store visit',
            error: error.message
        });
    }
};

// @desc    Complete store visit
// @route   POST /api/distribution/schedules/:id/complete
// @access  Private
export const completeStoreVisit = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes, location } = req.body;

        const schedule = await DailyDistributionSchedule.findByPk(id);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Distribution schedule not found'
            });
        }

        if (schedule.visit_status !== 'in_progress') {
            return res.status(400).json({
                success: false,
                message: 'Only in-progress visits can be completed'
            });
        }

        // Complete the visit
        await schedule.completeVisit({ notes });

        // Update related orders status to delivered
        if (schedule.order_ids && schedule.order_ids.length > 0) {
            await Order.update(
                {
                    status: 'delivered',
                    actual_delivery_time: new Date()
                },
                {
                    where: {
                        id: { [Op.in]: schedule.order_ids }
                    }
                }
            );
        }

        // Clear user's current schedule if this was the current one
        const user = await User.findByPk(schedule.distributor_id);
        if (user && user.current_schedule_id === schedule.id) {
            await user.update({ current_schedule_id: null });
        }

        // Log departure location if provided
        if (location && location.latitude && location.longitude) {
            await LocationTracking.create({
                distributor_id: schedule.distributor_id,
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy || null,
                speed: 0,
                is_moving: false,
                activity_type: 'still',
                timestamp: new Date()
            });
        }

        res.status(200).json({
            success: true,
            message: 'Store visit completed successfully',
            data: {
                schedule,
                visit_duration: schedule.getVisitDuration()
            }
        });

    } catch (error) {
        logger.error('Error completing store visit:', error);
        res.status(500).json({
            success: false,
            message: 'Error completing store visit',
            error: error.message
        });
    }
};

// @desc    Cancel store visit
// @route   POST /api/distribution/schedules/:id/cancel
// @access  Private
export const cancelStoreVisit = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const schedule = await DailyDistributionSchedule.findByPk(id);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Distribution schedule not found'
            });
        }

        if (schedule.visit_status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel completed visits'
            });
        }

        // Cancel the visit
        await schedule.cancelVisit(reason);

        // Update related orders status
        if (schedule.order_ids && schedule.order_ids.length > 0) {
            await Order.update(
                { status: 'cancelled' },
                {
                    where: {
                        id: { [Op.in]: schedule.order_ids }
                    }
                }
            );
        }

        // Clear user's current schedule if this was the current one
        const user = await User.findByPk(schedule.distributor_id);
        if (user && user.current_schedule_id === schedule.id) {
            await user.update({ current_schedule_id: null });
        }

        res.status(200).json({
            success: true,
            message: 'Store visit cancelled successfully',
            data: { schedule }
        });

    } catch (error) {
        logger.error('Error cancelling store visit:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling store visit',
            error: error.message
        });
    }
};

// @desc    Get schedule statistics
// @route   GET /api/distribution/schedules/statistics
// @access  Private
export const getScheduleStatistics = async (req, res) => {
    try {
        const { distributor_id, date } = req.query;

        const statistics = await DailyDistributionSchedule.getScheduleStatistics(
            distributor_id,
            date
        );

        res.status(200).json({
            success: true,
            message: 'Schedule statistics retrieved successfully',
            data: { statistics }
        });

    } catch (error) {
        logger.error('Error getting schedule statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving schedule statistics',
            error: error.message
        });
    }
};

// @desc    Delete distribution schedule
// @route   DELETE /api/distribution/schedules/:id
// @access  Private (Admin only)
export const deleteDistributionSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const schedule = await DailyDistributionSchedule.findByPk(id);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Distribution schedule not found'
            });
        }

        // Only allow deletion of scheduled visits
        if (schedule.visit_status !== 'scheduled') {
            return res.status(400).json({
                success: false,
                message: 'Can only delete scheduled visits'
            });
        }

        await schedule.destroy();

        res.status(200).json({
            success: true,
            message: 'Distribution schedule deleted successfully'
        });

    } catch (error) {
        logger.error('Error deleting distribution schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting distribution schedule',
            error: error.message
        });
    }
};

// @desc    Get automatic distribution schedules for all distributors with their orders
// @route   GET /api/distribution/schedules/auto
// @access  Private
export const getAutoDistributionSchedules = async (req, res) => {
    try {
        const { schedule_date = new Date().toISOString().split('T')[0] } = req.query;

        // Get all active distributors
        const distributors = await User.findAll({
            where: {
                role: 'distributor',
                status: 'active'
            },
            attributes: ['id', 'full_name', 'phone', 'email', 'working_status', 'is_online']
        });

        if (distributors.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No active distributors found',
                data: {
                    distributors_schedules: [],
                    overall_statistics: {
                        total_distributors: 0,
                        total_orders: 0,
                        total_stores: 0,
                        total_estimated_duration: 0,
                        distributors_with_orders: 0,
                        distributors_with_existing_schedules: 0
                    },
                    schedule_date
                }
            });
        }

        // Get distribution schedules for all distributors for the specified date
        const distributorSchedules = await Promise.all(
            distributors.map(async (distributor) => {
                // Get existing schedule
                let existingSchedule = await DailyDistributionSchedule.findAll({
                    where: {
                        distributor_id: distributor.id,
                        schedule_date: schedule_date
                    },
                    include: [
                        {
                            model: Store,
                            as: 'store',
                            attributes: ['id', 'name', 'address', 'phone', 'gps_coordinates']
                        }
                    ],
                    order: [['visit_order', 'ASC']]
                });

                // Get assigned orders for this distributor and date
                const assignedOrders = await Order.findAll({
                    where: {
                        assigned_distributor_id: distributor.id,
                        delivery_date: schedule_date,
                        status: ['confirmed', 'in_progress']
                    },
                    attributes: [
                        'id', 'order_number', 'store_id', 'store_name',
                        'total_amount_eur', 'total_amount_syp', 'status',
                        'priority', 'notes', 'special_instructions',
                        'delivery_address', 'customer_name', 'customer_phone'
                    ],
                    order: [['priority', 'DESC'], ['created_at', 'ASC']]
                });

                // Get stores assigned to this distributor
                const assignedStores = await Store.findAll({
                    where: {
                        assigned_distributor_id: distributor.id,
                        status: 'active'
                    },
                    attributes: ['id', 'name', 'address', 'phone', 'gps_coordinates']
                });

                // Group orders by store
                const ordersByStore = {};
                assignedOrders.forEach(order => {
                    if (!ordersByStore[order.store_id]) {
                        ordersByStore[order.store_id] = [];
                    }
                    ordersByStore[order.store_id].push(order);
                });

                // If no existing schedule, create auto-schedule based on orders and assigned stores
                let scheduleItems = [];

                if (existingSchedule.length === 0 && (assignedOrders.length > 0 || assignedStores.length > 0)) {
                    // Create automatic schedule
                    let visitOrder = 1;

                    // First, add stores that have orders
                    for (const [storeId, storeOrders] of Object.entries(ordersByStore)) {
                        const store = assignedStores.find(s => s.id == storeId) ||
                            await Store.findByPk(storeId, {
                                attributes: ['id', 'name', 'address', 'phone', 'gps_coordinates']
                            });

                        if (store) {
                            scheduleItems.push({
                                id: `auto-${distributor.id}-${storeId}`,
                                distributor_id: distributor.id,
                                schedule_date: schedule_date,
                                store_id: parseInt(storeId),
                                visit_order: visitOrder++,
                                visit_status: 'scheduled',
                                estimated_duration: Math.max(15, storeOrders.length * 5), // Minimum 15 min, +5 min per order
                                order_ids: storeOrders.map(o => o.id),
                                orders: storeOrders,
                                store: store,
                                is_auto_generated: true
                            });
                        }
                    }

                    // Then add assigned stores without orders (if needed for regular visits)
                    assignedStores.forEach(store => {
                        if (!ordersByStore[store.id]) {
                            scheduleItems.push({
                                id: `auto-${distributor.id}-${store.id}`,
                                distributor_id: distributor.id,
                                schedule_date: schedule_date,
                                store_id: store.id,
                                visit_order: visitOrder++,
                                visit_status: 'scheduled',
                                estimated_duration: 15,
                                order_ids: [],
                                orders: [],
                                store: store,
                                is_auto_generated: true,
                                is_regular_visit: true
                            });
                        }
                    });
                } else {
                    // Use existing schedule and enrich with order data
                    scheduleItems = existingSchedule.map(schedule => {
                        const storeOrders = ordersByStore[schedule.store_id] || [];
                        return {
                            ...schedule.toJSON(),
                            orders: storeOrders,
                            is_auto_generated: false
                        };
                    });
                }

                // Calculate schedule statistics
                const totalOrders = assignedOrders.length;
                const totalStores = scheduleItems.length;
                const estimatedDuration = scheduleItems.reduce((sum, item) => sum + (item.estimated_duration || 15), 0);

                return {
                    distributor: distributor.toJSON(),
                    schedule_items: scheduleItems,
                    assigned_orders: assignedOrders,
                    assigned_stores: assignedStores,
                    statistics: {
                        total_orders: totalOrders,
                        total_stores: totalStores,
                        estimated_duration_minutes: estimatedDuration,
                        has_existing_schedule: existingSchedule.length > 0
                    }
                };
            })
        );

        // Calculate overall statistics
        const overallStats = {
            total_distributors: distributors.length,
            total_orders: distributorSchedules.reduce((sum, ds) => sum + ds.statistics.total_orders, 0),
            total_stores: distributorSchedules.reduce((sum, ds) => sum + ds.statistics.total_stores, 0),
            total_estimated_duration: distributorSchedules.reduce((sum, ds) => sum + ds.statistics.estimated_duration_minutes, 0),
            distributors_with_orders: distributorSchedules.filter(ds => ds.statistics.total_orders > 0).length,
            distributors_with_existing_schedules: distributorSchedules.filter(ds => ds.statistics.has_existing_schedule).length
        };

        res.status(200).json({
            success: true,
            message: 'Auto distribution schedules retrieved successfully',
            data: {
                distributors_schedules: distributorSchedules,
                overall_statistics: overallStats,
                schedule_date
            }
        });

    } catch (error) {
        logger.error('Error getting auto distribution schedules:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving auto distribution schedules',
            error: error.message
        });
    }
};