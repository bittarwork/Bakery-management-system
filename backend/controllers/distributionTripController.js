import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import DistributionTrip from '../models/DistributionTrip.js';
import DailyDistributionSchedule from '../models/DailyDistributionSchedule.js';
import LocationTracking from '../models/LocationTracking.js';
import DistributionPerformance from '../models/DistributionPerformance.js';
import DistributionNotification from '../models/DistributionNotification.js';
import { User, Vehicle, Order } from '../models/index.js';
import logger from '../config/logger.js';

// @desc    Get all distribution trips with filters
// @route   GET /api/distribution/trips
// @access  Private
export const getDistributionTrips = async (req, res) => {
    try {
        const {
            distributor_id,
            trip_date,
            trip_status,
            start_date,
            end_date,
            page = 1,
            limit = 20
        } = req.query;

        // Build where clause
        const whereClause = {};
        
        if (distributor_id) {
            whereClause.distributor_id = distributor_id;
        }
        
        if (trip_date) {
            whereClause.trip_date = trip_date;
        }
        
        if (trip_status) {
            whereClause.trip_status = trip_status;
        }
        
        if (start_date && end_date) {
            whereClause.trip_date = {
                [Op.between]: [start_date, end_date]
            };
        }

        // Get trips with pagination
        const offset = (page - 1) * limit;
        const { count, rows: trips } = await DistributionTrip.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'distributor',
                    attributes: ['id', 'full_name', 'phone', 'working_status']
                },
                {
                    model: Vehicle,
                    as: 'vehicle',
                    attributes: ['id', 'vehicle_model', 'vehicle_plate', 'vehicle_type']
                }
            ],
            order: [['trip_date', 'DESC'], ['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        // Calculate summary statistics
        const totalPages = Math.ceil(count / limit);
        const summary = await DistributionTrip.getTripStatistics(
            distributor_id,
            start_date,
            end_date
        );

        res.status(200).json({
            success: true,
            message: 'Distribution trips retrieved successfully',
            data: {
                trips,
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
        logger.error('Error getting distribution trips:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving distribution trips',
            error: error.message
        });
    }
};

// @desc    Get single distribution trip
// @route   GET /api/distribution/trips/:id
// @access  Private
export const getDistributionTrip = async (req, res) => {
    try {
        const { id } = req.params;

        const trip = await DistributionTrip.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'distributor',
                    attributes: ['id', 'full_name', 'phone', 'working_status', 'current_location']
                },
                {
                    model: Vehicle,
                    as: 'vehicle',
                    attributes: ['id', 'vehicle_model', 'vehicle_plate', 'vehicle_type', 'fuel_type']
                }
            ]
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Distribution trip not found'
            });
        }

        // Get related schedule items
        const scheduleItems = await DailyDistributionSchedule.findAll({
            where: {
                distributor_id: trip.distributor_id,
                schedule_date: trip.trip_date
            },
            order: [['visit_order', 'ASC']]
        });

        // Get location tracking for this trip
        const locationHistory = await LocationTracking.getLocationHistory(
            trip.distributor_id,
            trip.start_time,
            trip.end_time || new Date(),
            50
        );

        res.status(200).json({
            success: true,
            message: 'Distribution trip retrieved successfully',
            data: {
                trip,
                schedule_items: scheduleItems,
                location_history: locationHistory,
                trip_duration: trip.getTripDuration(),
                trip_efficiency: trip.getTripEfficiency()
            }
        });

    } catch (error) {
        logger.error('Error getting distribution trip:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving distribution trip',
            error: error.message
        });
    }
};

// @desc    Create new distribution trip
// @route   POST /api/distribution/trips
// @access  Private
export const createDistributionTrip = async (req, res) => {
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
            trip_date,
            vehicle_id,
            notes
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

        // Check if trip already exists for this distributor and date
        const existingTrip = await DistributionTrip.findOne({
            where: {
                distributor_id,
                trip_date
            }
        });

        if (existingTrip) {
            return res.status(409).json({
                success: false,
                message: 'Distribution trip already exists for this distributor and date'
            });
        }

        // Create the trip
        const trip = await DistributionTrip.create({
            distributor_id,
            trip_date,
            vehicle_id,
            notes,
            trip_status: 'planned'
        });

        // Create notification for distributor
        await DistributionNotification.createScheduleUpdateNotification(
            distributor_id,
            {
                date: trip_date,
                trip_id: trip.id,
                message: 'New distribution trip has been assigned to you'
            }
        );

        // Update user's current trip
        await User.update(
            { current_trip_id: trip.id },
            { where: { id: distributor_id } }
        );

        res.status(201).json({
            success: true,
            message: 'Distribution trip created successfully',
            data: { trip }
        });

    } catch (error) {
        logger.error('Error creating distribution trip:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating distribution trip',
            error: error.message
        });
    }
};

// @desc    Update distribution trip
// @route   PUT /api/distribution/trips/:id
// @access  Private
export const updateDistributionTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const trip = await DistributionTrip.findByPk(id);
        
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Distribution trip not found'
            });
        }

        // Prevent updating completed or cancelled trips
        if (trip.trip_status === 'completed' || trip.trip_status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update completed or cancelled trips'
            });
        }

        // Update the trip
        await trip.update(updateData);

        // If status changed, send notification
        if (updateData.trip_status && updateData.trip_status !== trip.trip_status) {
            await DistributionNotification.createSystemAlertNotification(
                trip.distributor_id,
                {
                    message: `Your trip status has been updated to ${updateData.trip_status}`,
                    priority: 'normal'
                }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Distribution trip updated successfully',
            data: { trip }
        });

    } catch (error) {
        logger.error('Error updating distribution trip:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating distribution trip',
            error: error.message
        });
    }
};

// @desc    Start distribution trip
// @route   POST /api/distribution/trips/:id/start
// @access  Private
export const startDistributionTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const { location } = req.body; // Optional starting location

        const trip = await DistributionTrip.findByPk(id);
        
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Distribution trip not found'
            });
        }

        if (trip.trip_status !== 'planned') {
            return res.status(400).json({
                success: false,
                message: 'Only planned trips can be started'
            });
        }

        // Start the trip
        await trip.startTrip();

        // Update user status
        await User.update(
            { 
                working_status: 'busy',
                is_online: true,
                current_trip_id: trip.id
            },
            { where: { id: trip.distributor_id } }
        );

        // Log starting location if provided
        if (location && location.latitude && location.longitude) {
            await LocationTracking.create({
                distributor_id: trip.distributor_id,
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
            message: 'Distribution trip started successfully',
            data: { trip }
        });

    } catch (error) {
        logger.error('Error starting distribution trip:', error);
        res.status(500).json({
            success: false,
            message: 'Error starting distribution trip',
            error: error.message
        });
    }
};

// @desc    Complete distribution trip
// @route   POST /api/distribution/trips/:id/complete
// @access  Private
export const completeDistributionTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            total_distance,
            fuel_consumption,
            notes,
            location
        } = req.body;

        const trip = await DistributionTrip.findByPk(id);
        
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Distribution trip not found'
            });
        }

        if (trip.trip_status !== 'in_progress') {
            return res.status(400).json({
                success: false,
                message: 'Only in-progress trips can be completed'
            });
        }

        // Complete the trip
        const endData = {
            total_distance,
            fuel_consumption,
            notes
        };

        // Calculate duration if not provided
        if (trip.start_time) {
            endData.total_duration = Math.round((new Date() - new Date(trip.start_time)) / (1000 * 60));
        }

        await trip.completeTrip(endData);

        // Update user status
        await User.update(
            { 
                working_status: 'available',
                current_trip_id: null
            },
            { where: { id: trip.distributor_id } }
        );

        // Log ending location if provided
        if (location && location.latitude && location.longitude) {
            await LocationTracking.create({
                distributor_id: trip.distributor_id,
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy || null,
                speed: 0,
                is_moving: false,
                activity_type: 'still',
                timestamp: new Date()
            });
        }

        // Calculate and update daily performance
        await DistributionPerformance.calculateDailyPerformance(
            trip.distributor_id,
            trip.trip_date
        );

        res.status(200).json({
            success: true,
            message: 'Distribution trip completed successfully',
            data: { trip }
        });

    } catch (error) {
        logger.error('Error completing distribution trip:', error);
        res.status(500).json({
            success: false,
            message: 'Error completing distribution trip',
            error: error.message
        });
    }
};

// @desc    Cancel distribution trip
// @route   POST /api/distribution/trips/:id/cancel
// @access  Private
export const cancelDistributionTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const trip = await DistributionTrip.findByPk(id);
        
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Distribution trip not found'
            });
        }

        if (trip.trip_status === 'completed' || trip.trip_status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel completed or already cancelled trips'
            });
        }

        // Cancel the trip
        await trip.cancelTrip(reason);

        // Update user status if trip was in progress
        if (trip.trip_status === 'in_progress') {
            await User.update(
                { 
                    working_status: 'available',
                    current_trip_id: null
                },
                { where: { id: trip.distributor_id } }
            );
        }

        // Send notification
        await DistributionNotification.createSystemAlertNotification(
            trip.distributor_id,
            {
                message: `Your trip has been cancelled. Reason: ${reason || 'No reason provided'}`,
                priority: 'high'
            }
        );

        res.status(200).json({
            success: true,
            message: 'Distribution trip cancelled successfully',
            data: { trip }
        });

    } catch (error) {
        logger.error('Error cancelling distribution trip:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling distribution trip',
            error: error.message
        });
    }
};

// @desc    Get today's active trips
// @route   GET /api/distribution/trips/today/active
// @access  Private
export const getTodayActiveTrips = async (req, res) => {
    try {
        const activeTrips = await DistributionTrip.getActiveTrips();
        
        // Get additional info for each trip
        const tripsWithDetails = await Promise.all(
            activeTrips.map(async (trip) => {
                const distributor = await User.findByPk(trip.distributor_id, {
                    attributes: ['id', 'full_name', 'phone', 'working_status']
                });
                
                const latestLocation = await LocationTracking.getLatestLocation(trip.distributor_id);
                
                const currentSchedule = await DailyDistributionSchedule.findOne({
                    where: {
                        distributor_id: trip.distributor_id,
                        schedule_date: trip.trip_date,
                        visit_status: 'in_progress'
                    }
                });

                return {
                    ...trip.toJSON(),
                    distributor,
                    latest_location: latestLocation,
                    current_schedule: currentSchedule
                };
            })
        );

        res.status(200).json({
            success: true,
            message: 'Active trips retrieved successfully',
            data: {
                active_trips: tripsWithDetails,
                total_active: tripsWithDetails.length
            }
        });

    } catch (error) {
        logger.error('Error getting active trips:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving active trips',
            error: error.message
        });
    }
};

// @desc    Get trip statistics
// @route   GET /api/distribution/trips/statistics
// @access  Private
export const getTripStatistics = async (req, res) => {
    try {
        const { distributor_id, start_date, end_date } = req.query;

        const statistics = await DistributionTrip.getTripStatistics(
            distributor_id,
            start_date,
            end_date
        );

        res.status(200).json({
            success: true,
            message: 'Trip statistics retrieved successfully',
            data: { statistics }
        });

    } catch (error) {
        logger.error('Error getting trip statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving trip statistics',
            error: error.message
        });
    }
};

// @desc    Delete distribution trip
// @route   DELETE /api/distribution/trips/:id
// @access  Private (Admin only)
export const deleteDistributionTrip = async (req, res) => {
    try {
        const { id } = req.params;

        const trip = await DistributionTrip.findByPk(id);
        
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Distribution trip not found'
            });
        }

        // Only allow deletion of planned or cancelled trips
        if (trip.trip_status === 'in_progress' || trip.trip_status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete in-progress or completed trips'
            });
        }

        await trip.destroy();

        res.status(200).json({
            success: true,
            message: 'Distribution trip deleted successfully'
        });

    } catch (error) {
        logger.error('Error deleting distribution trip:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting distribution trip',
            error: error.message
        });
    }
};