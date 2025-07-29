import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import LocationTracking from '../models/LocationTracking.js';
import DailyDistributionSchedule from '../models/DailyDistributionSchedule.js';
import DistributionTrip from '../models/DistributionTrip.js';
import DistributionNotification from '../models/DistributionNotification.js';
import DistributionSettings from '../models/DistributionSettings.js';
import { User } from '../models/index.js';
import logger from '../config/logger.js';

// @desc    Update distributor location
// @route   POST /api/distribution/location/update
// @access  Private (Distributor only)
export const updateLocation = async (req, res) => {
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
            latitude,
            longitude,
            accuracy,
            speed,
            heading,
            altitude,
            battery_level,
            is_moving,
            activity_type = 'unknown'
        } = req.body;

        const distributor_id = req.user.id; // From auth middleware

        // Validate that user is a distributor
        if (req.user.role !== 'distributor') {
            return res.status(403).json({
                success: false,
                message: 'Only distributors can update location'
            });
        }

        // Create location tracking record
        const locationRecord = await LocationTracking.create({
            distributor_id,
            latitude,
            longitude,
            accuracy,
            speed,
            heading,
            altitude,
            battery_level,
            is_moving,
            activity_type,
            timestamp: new Date()
        });

        // Update user's last location update time and online status
        await User.update(
            {
                last_location_update: new Date(),
                is_online: true,
                current_location: {
                    latitude,
                    longitude,
                    timestamp: new Date()
                }
            },
            { where: { id: distributor_id } }
        );

        // Check if distributor is significantly delayed
        const currentSchedule = await DailyDistributionSchedule.findOne({
            where: {
                distributor_id,
                schedule_date: new Date().toISOString().split('T')[0],
                visit_status: ['scheduled', 'in_progress']
            },
            order: [['visit_order', 'ASC']]
        });

        if (currentSchedule) {
            const delay = currentSchedule.calculateDelay();
            const alertThreshold = await DistributionSettings.getSetting('performance_alert_threshold', 80);
            
            if (delay && delay > 30) { // More than 30 minutes late
                await DistributionNotification.createDelayAlertNotification(
                    distributor_id,
                    {
                        delay_minutes: delay,
                        store_name: currentSchedule.store_name,
                        schedule_id: currentSchedule.id
                    }
                );
            }
        }

        res.status(201).json({
            success: true,
            message: 'Location updated successfully',
            data: {
                location_record: locationRecord,
                is_online: true
            }
        });

    } catch (error) {
        logger.error('Error updating location:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating location',
            error: error.message
        });
    }
};

// @desc    Get distributor's latest location
// @route   GET /api/distribution/location/latest/:distributorId
// @access  Private
export const getLatestLocation = async (req, res) => {
    try {
        const { distributorId } = req.params;

        // Check if distributor exists
        const distributor = await User.findOne({
            where: {
                id: distributorId,
                role: 'distributor'
            },
            attributes: ['id', 'full_name', 'phone', 'working_status', 'is_online', 'last_location_update']
        });

        if (!distributor) {
            return res.status(404).json({
                success: false,
                message: 'Distributor not found'
            });
        }

        // Get latest location
        const latestLocation = await LocationTracking.getLatestLocation(distributorId);

        if (!latestLocation) {
            return res.status(404).json({
                success: false,
                message: 'No location data found for this distributor'
            });
        }

        // Get current schedule if any
        const currentSchedule = await DailyDistributionSchedule.findOne({
            where: {
                distributor_id: distributorId,
                schedule_date: new Date().toISOString().split('T')[0],
                visit_status: 'in_progress'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Latest location retrieved successfully',
            data: {
                distributor,
                location: latestLocation.getLocationInfo(),
                current_schedule: currentSchedule,
                battery_status: latestLocation.getBatteryStatus(),
                speed_kmh: latestLocation.getSpeedInKmh()
            }
        });

    } catch (error) {
        logger.error('Error getting latest location:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving latest location',
            error: error.message
        });
    }
};

// @desc    Get all active distributors locations
// @route   GET /api/distribution/location/active
// @access  Private
export const getAllActiveLocations = async (req, res) => {
    try {
        const activeLocations = await LocationTracking.getAllActiveLocations();
        
        // Enrich with distributor info and current schedule
        const enrichedLocations = await Promise.all(
            activeLocations.map(async (location) => {
                const distributor = await User.findByPk(location.distributor_id, {
                    attributes: ['id', 'full_name', 'phone', 'working_status', 'is_online']
                });
                
                const currentSchedule = await DailyDistributionSchedule.findOne({
                    where: {
                        distributor_id: location.distributor_id,
                        schedule_date: new Date().toISOString().split('T')[0],
                        visit_status: 'in_progress'
                    }
                });

                const currentTrip = await DistributionTrip.findOne({
                    where: {
                        distributor_id: location.distributor_id,
                        trip_date: new Date().toISOString().split('T')[0],
                        trip_status: 'in_progress'
                    }
                });

                return {
                    distributor,
                    location: location.getLocationInfo(),
                    current_schedule: currentSchedule,
                    current_trip: currentTrip,
                    battery_status: location.getBatteryStatus(),
                    speed_kmh: location.getSpeedInKmh()
                };
            })
        );

        res.status(200).json({
            success: true,
            message: 'Active locations retrieved successfully',
            data: {
                active_distributors: enrichedLocations,
                total_active: enrichedLocations.length,
                last_updated: new Date()
            }
        });

    } catch (error) {
        logger.error('Error getting active locations:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving active locations',
            error: error.message
        });
    }
};

// @desc    Get distributor's location history
// @route   GET /api/distribution/location/history/:distributorId
// @access  Private
export const getLocationHistory = async (req, res) => {
    try {
        const { distributorId } = req.params;
        const {
            start_time,
            end_time,
            limit = 100,
            include_statistics = false
        } = req.query;

        // Check if distributor exists
        const distributor = await User.findOne({
            where: {
                id: distributorId,
                role: 'distributor'
            },
            attributes: ['id', 'full_name', 'phone']
        });

        if (!distributor) {
            return res.status(404).json({
                success: false,
                message: 'Distributor not found'
            });
        }

        // Get location history
        const locationHistory = await LocationTracking.getLocationHistory(
            distributorId,
            start_time,
            end_time,
            parseInt(limit)
        );

        let statistics = null;
        if (include_statistics === 'true' && start_time && end_time) {
            statistics = await LocationTracking.getLocationStatistics(
                distributorId,
                start_time,
                end_time
            );
        }

        res.status(200).json({
            success: true,
            message: 'Location history retrieved successfully',
            data: {
                distributor,
                location_history: locationHistory.map(loc => loc.getLocationInfo()),
                statistics,
                total_points: locationHistory.length
            }
        });

    } catch (error) {
        logger.error('Error getting location history:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving location history',
            error: error.message
        });
    }
};

// @desc    Get distributor's route for specific time period
// @route   GET /api/distribution/location/route/:distributorId
// @access  Private
export const getDistributorRoute = async (req, res) => {
    try {
        const { distributorId } = req.params;
        const { start_time, end_time } = req.query;

        if (!start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'start_time and end_time are required'
            });
        }

        // Check if distributor exists
        const distributor = await User.findOne({
            where: {
                id: distributorId,
                role: 'distributor'
            },
            attributes: ['id', 'full_name', 'phone']
        });

        if (!distributor) {
            return res.status(404).json({
                success: false,
                message: 'Distributor not found'
            });
        }

        // Get route data
        const route = await LocationTracking.getDistributorRoute(
            distributorId,
            start_time,
            end_time
        );

        // Calculate total distance
        const totalDistance = await LocationTracking.calculateTotalDistance(
            distributorId,
            start_time,
            end_time
        );

        // Get statistics
        const statistics = await LocationTracking.getLocationStatistics(
            distributorId,
            start_time,
            end_time
        );

        res.status(200).json({
            success: true,
            message: 'Distributor route retrieved successfully',
            data: {
                distributor,
                route: route.map(loc => loc.getLocationInfo()),
                total_distance: Math.round(totalDistance * 100) / 100,
                statistics,
                route_points: route.length
            }
        });

    } catch (error) {
        logger.error('Error getting distributor route:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving distributor route',
            error: error.message
        });
    }
};

// @desc    Get location statistics
// @route   GET /api/distribution/location/statistics/:distributorId
// @access  Private
export const getLocationStatistics = async (req, res) => {
    try {
        const { distributorId } = req.params;
        const { start_time, end_time } = req.query;

        if (!start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'start_time and end_time are required'
            });
        }

        // Check if distributor exists
        const distributor = await User.findOne({
            where: {
                id: distributorId,
                role: 'distributor'
            },
            attributes: ['id', 'full_name', 'phone']
        });

        if (!distributor) {
            return res.status(404).json({
                success: false,
                message: 'Distributor not found'
            });
        }

        // Get statistics
        const statistics = await LocationTracking.getLocationStatistics(
            distributorId,
            start_time,
            end_time
        );

        res.status(200).json({
            success: true,
            message: 'Location statistics retrieved successfully',
            data: {
                distributor,
                statistics,
                period: {
                    start_time,
                    end_time
                }
            }
        });

    } catch (error) {
        logger.error('Error getting location statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving location statistics',
            error: error.message
        });
    }
};

// @desc    Set distributor offline
// @route   POST /api/distribution/location/offline
// @access  Private (Distributor only)
export const setDistributorOffline = async (req, res) => {
    try {
        const distributor_id = req.user.id;
        const { reason } = req.body;

        // Validate that user is a distributor
        if (req.user.role !== 'distributor') {
            return res.status(403).json({
                success: false,
                message: 'Only distributors can set offline status'
            });
        }

        // Update user status
        await User.update(
            {
                is_online: false,
                working_status: 'offline',
                last_location_update: new Date()
            },
            { where: { id: distributor_id } }
        );

        // Create notification if there's an active trip
        const activeTrip = await DistributionTrip.findOne({
            where: {
                distributor_id,
                trip_status: 'in_progress'
            }
        });

        if (activeTrip) {
            await DistributionNotification.createSystemAlertNotification(
                distributor_id,
                {
                    message: `Distributor went offline during active trip. Reason: ${reason || 'Not specified'}`,
                    priority: 'high'
                }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Distributor set to offline successfully',
            data: {
                is_online: false,
                working_status: 'offline',
                timestamp: new Date()
            }
        });

    } catch (error) {
        logger.error('Error setting distributor offline:', error);
        res.status(500).json({
            success: false,
            message: 'Error setting distributor offline',
            error: error.message
        });
    }
};

// @desc    Get nearby distributors to a location
// @route   GET /api/distribution/location/nearby
// @access  Private
export const getNearbyDistributors = async (req, res) => {
    try {
        const { latitude, longitude, radius = 10 } = req.query; // radius in km

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'latitude and longitude are required'
            });
        }

        // Get all active locations
        const activeLocations = await LocationTracking.getAllActiveLocations();
        
        // Filter by distance
        const nearbyDistributors = [];
        
        for (const location of activeLocations) {
            const distance = location.calculateDistance({
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            });
            
            if (distance <= parseFloat(radius)) {
                const distributor = await User.findByPk(location.distributor_id, {
                    attributes: ['id', 'full_name', 'phone', 'working_status', 'is_online']
                });
                
                const currentSchedule = await DailyDistributionSchedule.findOne({
                    where: {
                        distributor_id: location.distributor_id,
                        schedule_date: new Date().toISOString().split('T')[0],
                        visit_status: 'in_progress'
                    }
                });

                nearbyDistributors.push({
                    distributor,
                    location: location.getLocationInfo(),
                    distance_km: Math.round(distance * 100) / 100,
                    current_schedule: currentSchedule,
                    battery_status: location.getBatteryStatus()
                });
            }
        }

        // Sort by distance
        nearbyDistributors.sort((a, b) => a.distance_km - b.distance_km);

        res.status(200).json({
            success: true,
            message: 'Nearby distributors retrieved successfully',
            data: {
                search_location: {
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude)
                },
                radius_km: parseFloat(radius),
                nearby_distributors: nearbyDistributors,
                total_found: nearbyDistributors.length
            }
        });

    } catch (error) {
        logger.error('Error getting nearby distributors:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving nearby distributors',
            error: error.message
        });
    }
};

// @desc    Clean old location records
// @route   DELETE /api/distribution/location/cleanup
// @access  Private (Admin only)
export const cleanupOldLocations = async (req, res) => {
    try {
        const { days_to_keep = 30 } = req.query;

        // Only admins can perform cleanup
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can perform location cleanup'
            });
        }

        const deletedCount = await LocationTracking.cleanOldRecords(parseInt(days_to_keep));

        res.status(200).json({
            success: true,
            message: 'Location cleanup completed successfully',
            data: {
                deleted_records: deletedCount,
                days_kept: parseInt(days_to_keep),
                cleanup_date: new Date()
            }
        });

    } catch (error) {
        logger.error('Error cleaning up locations:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing location cleanup',
            error: error.message
        });
    }
};

// @desc    Get location tracking summary
// @route   GET /api/distribution/location/summary
// @access  Private
export const getLocationTrackingSummary = async (req, res) => {
    try {
        const { date = new Date().toISOString().split('T')[0] } = req.query;

        // Get all distributors
        const distributors = await User.findAll({
            where: {
                role: 'distributor',
                status: 'active'
            },
            attributes: ['id', 'full_name', 'phone', 'working_status', 'is_online', 'last_location_update']
        });

        const summary = {
            total_distributors: distributors.length,
            online_distributors: 0,
            offline_distributors: 0,
            active_trips: 0,
            distributors_with_schedules: 0,
            location_updates_today: 0
        };

        // Calculate summary statistics
        for (const distributor of distributors) {
            if (distributor.is_online) {
                summary.online_distributors++;
            } else {
                summary.offline_distributors++;
            }

            // Check for active trip
            const activeTrip = await DistributionTrip.findOne({
                where: {
                    distributor_id: distributor.id,
                    trip_date: date,
                    trip_status: 'in_progress'
                }
            });

            if (activeTrip) {
                summary.active_trips++;
            }

            // Check for schedule
            const schedule = await DailyDistributionSchedule.findOne({
                where: {
                    distributor_id: distributor.id,
                    schedule_date: date
                }
            });

            if (schedule) {
                summary.distributors_with_schedules++;
            }
        }

        // Count location updates for today
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        summary.location_updates_today = await LocationTracking.count({
            where: {
                timestamp: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Location tracking summary retrieved successfully',
            data: {
                summary,
                date,
                last_updated: new Date()
            }
        });

    } catch (error) {
        logger.error('Error getting location tracking summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving location tracking summary',
            error: error.message
        });
    }
};