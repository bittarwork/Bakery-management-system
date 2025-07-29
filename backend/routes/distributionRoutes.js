import express from 'express';
import { body, query, param } from 'express-validator';
import auth from '../middleware/auth.js';

// Import all distribution controllers
import * as distributionTripController from '../controllers/distributionTripController.js';
import * as dailyDistributionScheduleController from '../controllers/dailyDistributionScheduleController.js';
import * as locationTrackingController from '../controllers/locationTrackingController.js';
import * as distributionPerformanceController from '../controllers/distributionPerformanceController.js';
import * as distributionNotificationController from '../controllers/distributionNotificationController.js';
import * as distributionSettingsController from '../controllers/distributionSettingsController.js';

// Import cron job service
import cronJobService from '../services/cronJobService.js';
import { systemLogger } from '../middleware/logger.js';

const router = express.Router();

// ==========================================
// DISTRIBUTION TRIPS ROUTES
// ==========================================

// Get all distribution trips
router.get('/trips', distributionTripController.getDistributionTrips);

// Get single distribution trip
router.get('/trips/:id', distributionTripController.getDistributionTrip);

// Get today's active trips
router.get('/trips/today/active', auth.protect, distributionTripController.getTodayActiveTrips);

// Get trip statistics
router.get('/trips/statistics', auth.protect, distributionTripController.getTripStatistics);

// Create new distribution trip
router.post('/trips', [
    auth.protect,
    body('distributor_id').isInt().withMessage('Distributor ID must be an integer'),
    body('trip_date').isDate().withMessage('Trip date must be a valid date'),
    body('vehicle_id').optional().isInt().withMessage('Vehicle ID must be an integer'),
    body('notes').optional().isString().trim()
], distributionTripController.createDistributionTrip);

// Update distribution trip
router.put('/trips/:id', auth.protect, distributionTripController.updateDistributionTrip);

// Start distribution trip
router.post('/trips/:id/start', auth.protect, distributionTripController.startDistributionTrip);

// Complete distribution trip
router.post('/trips/:id/complete', auth.protect, distributionTripController.completeDistributionTrip);

// Cancel distribution trip
router.post('/trips/:id/cancel', auth.protect, distributionTripController.cancelDistributionTrip);

// Delete distribution trip (Admin only)
router.delete('/trips/:id', auth.protect, distributionTripController.deleteDistributionTrip);

// ==========================================
// DAILY DISTRIBUTION SCHEDULE ROUTES
// ==========================================

// Get distribution schedules
router.get('/schedules', dailyDistributionScheduleController.getDistributionSchedules);

// Get single distribution schedule
router.get('/schedules/:id', auth.protect, dailyDistributionScheduleController.getDistributionSchedule);

// Get today's schedules for all distributors
router.get('/schedules/today', auth.protect, dailyDistributionScheduleController.getTodaySchedules);

// Get distributor's schedule for specific date
router.get('/schedules/distributor/:distributorId', auth.protect, dailyDistributionScheduleController.getDistributorSchedule);

// Get schedule statistics
router.get('/schedules/statistics', auth.protect, dailyDistributionScheduleController.getScheduleStatistics);

// Get automatic distribution schedules for all distributors - Main endpoint
router.get('/schedules/auto', auth.protect, async (req, res) => {
    try {
        systemLogger.info(`Auto schedules requested for date: ${req.query.schedule_date || 'today'}`);
        await dailyDistributionScheduleController.getAutoDistributionSchedules(req, res);
    } catch (error) {
        systemLogger.error('Error in auto schedules endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving auto distribution schedules',
            error: error.message
        });
    }
});

// Direct auto distribution schedules endpoint - Alternative endpoint
router.get('/schedules/auto-direct', auth.protect, async (req, res) => {
    try {
        systemLogger.info(`Auto schedules (direct) requested for date: ${req.query.schedule_date || 'today'}`);
        // Use the same controller function but mark it as direct access
        req.isDirect = true;
        await dailyDistributionScheduleController.getAutoDistributionSchedules(req, res);
    } catch (error) {
        systemLogger.error('Error in auto schedules direct endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving auto distribution schedules (direct)',
            error: error.message
        });
    }
});

// Test endpoint to verify routes are working
router.get('/schedules/auto-test', (req, res) => {
    systemLogger.info('Auto schedules test endpoint accessed');
    res.json({
        success: true,
        message: 'Auto distribution schedules endpoint is working',
        data: {
            distributors_schedules: [],
            overall_statistics: {
                total_distributors: 0,
                total_orders: 0,
                total_stores: 0
            },
            schedule_date: req.query.schedule_date || 'today'
        }
    });
});

// Generate daily schedule for distributor
router.post('/schedules/generate', [
    auth.protect,
    body('distributor_id').isInt().withMessage('Distributor ID must be an integer'),
    body('schedule_date').isDate().withMessage('Schedule date must be a valid date'),
    body('stores_data').isArray().withMessage('Stores data must be an array'),
    body('optimize_route').optional().isBoolean().withMessage('Optimize route must be boolean')
], dailyDistributionScheduleController.generateDistributionSchedule);

// Update distribution schedule item
router.put('/schedules/:id', auth.protect, dailyDistributionScheduleController.updateDistributionSchedule);

// Start store visit
router.post('/schedules/:id/start', auth.protect, dailyDistributionScheduleController.startStoreVisit);

// Complete store visit
router.post('/schedules/:id/complete', auth.protect, dailyDistributionScheduleController.completeStoreVisit);

// Cancel store visit
router.post('/schedules/:id/cancel', auth.protect, dailyDistributionScheduleController.cancelStoreVisit);

// Delete distribution schedule (Admin only)
router.delete('/schedules/:id', auth.protect, dailyDistributionScheduleController.deleteDistributionSchedule);

// ==========================================
// CRON JOB STATUS AND SYSTEM ROUTES
// ==========================================

// Get cron job status (Admin/Manager only)
router.get('/system/cron-status', auth.protect, (req, res) => {
    try {
        // Check if user has admin or manager role
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or Manager role required.'
            });
        }

        const status = cronJobService.getJobStatus();
        systemLogger.info(`Cron status requested by user ${req.user.id} (${req.user.role})`);

        res.status(200).json({
            success: true,
            message: 'Cron job status retrieved successfully',
            data: {
                cron_job_status: status,
                system_info: {
                    environment: process.env.NODE_ENV || 'development',
                    server_time: new Date().toISOString(),
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            }
        });
    } catch (error) {
        systemLogger.error('Error retrieving cron job status:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving cron job status',
            error: error.message
        });
    }
});

// Manually trigger distribution schedule generation (Admin only)
router.post('/system/trigger-schedule-generation', auth.protect, async (req, res) => {
    try {
        // Check if user has admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        if (cronJobService.isRunning) {
            return res.status(409).json({
                success: false,
                message: 'Schedule generation is already running. Please wait for it to complete.'
            });
        }

        systemLogger.info(`Manual schedule generation triggered by admin user ${req.user.id}`);

        // Manually trigger the schedule generation
        const results = await cronJobService.generateDailyDistributionSchedules();

        res.status(200).json({
            success: true,
            message: 'Distribution schedule generation triggered successfully',
            data: results
        });
    } catch (error) {
        systemLogger.error('Error triggering schedule generation:', error);
        res.status(500).json({
            success: false,
            message: 'Error triggering schedule generation',
            error: error.message
        });
    }
});

// ==========================================
// LOCATION TRACKING ROUTES
// ==========================================

// Update distributor location (Distributor only)
router.post('/location/update', [
    auth.protect,
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    body('accuracy').optional().isFloat({ min: 0 }).withMessage('Accuracy must be a positive number'),
    body('speed').optional().isFloat({ min: 0 }).withMessage('Speed must be a positive number'),
    body('heading').optional().isFloat({ min: 0, max: 360 }).withMessage('Heading must be between 0 and 360'),
    body('altitude').optional().isFloat().withMessage('Altitude must be a number'),
    body('battery_level').optional().isInt({ min: 0, max: 100 }).withMessage('Battery level must be between 0 and 100'),
    body('is_moving').optional().isBoolean().withMessage('Is moving must be boolean'),
    body('activity_type').optional().isIn(['still', 'walking', 'running', 'on_bicycle', 'in_vehicle', 'unknown']).withMessage('Invalid activity type')
], locationTrackingController.updateLocation);

// Get distributor's latest location
router.get('/location/latest/:distributorId', auth.protect, locationTrackingController.getLatestLocation);

// Get all active distributors locations
router.get('/location/active', auth.protect, locationTrackingController.getAllActiveLocations);

// Get distributor's location history
router.get('/location/history/:distributorId', auth.protect, locationTrackingController.getLocationHistory);

// Get distributor's route for specific time period
router.get('/location/route/:distributorId', auth.protect, locationTrackingController.getDistributorRoute);

// Get location statistics
router.get('/location/statistics/:distributorId', auth.protect, locationTrackingController.getLocationStatistics);

// Get nearby distributors to a location
router.get('/location/nearby', [
    auth.protect,
    query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    query('radius').optional().isFloat({ min: 0 }).withMessage('Radius must be a positive number')
], locationTrackingController.getNearbyDistributors);

// Get location tracking summary
router.get('/location/summary', auth.protect, locationTrackingController.getLocationTrackingSummary);

// Set distributor offline (Distributor only)
router.post('/location/offline', auth.protect, locationTrackingController.setDistributorOffline);

// Clean old location records (Admin only)
router.delete('/location/cleanup', auth.protect, locationTrackingController.cleanupOldLocations);

// ==========================================
// PERFORMANCE ROUTES
// ==========================================

// Get performance metrics
router.get('/performance', auth.protect, distributionPerformanceController.getPerformanceMetrics);

// Get performance summary
router.get('/performance/summary', auth.protect, distributionPerformanceController.getPerformanceSummary);

// Calculate daily performance
router.post('/performance/calculate', [
    auth.protect,
    body('distributor_id').isInt().withMessage('Distributor ID must be an integer'),
    body('date').isDate().withMessage('Date must be a valid date')
], distributionPerformanceController.calculateDailyPerformance);

// ==========================================
// NOTIFICATIONS ROUTES
// ==========================================

// Get notifications
router.get('/notifications', auth.protect, distributionNotificationController.getNotifications);

// Get unread count for distributor
router.get('/notifications/unread-count/:distributorId', auth.protect, distributionNotificationController.getUnreadCount);

// Mark notification as read
router.put('/notifications/:id/read', auth.protect, distributionNotificationController.markAsRead);

// ==========================================
// SETTINGS ROUTES
// ==========================================

// Get all distribution settings (Admin only)
router.get('/settings', auth.protect, distributionSettingsController.getSettings);

// Get specific setting
router.get('/settings/:key', auth.protect, distributionSettingsController.getSetting);

// Update setting (Admin only)
router.put('/settings/:key', [
    auth.protect,
    body('value').notEmpty().withMessage('Value is required'),
    body('description').optional().isString().trim()
], distributionSettingsController.updateSetting);

// Health check for distribution system
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Distribution system is operational',
        timestamp: new Date().toISOString(),
        availableRoutes: [
            'GET /schedules',
            'GET /schedules/auto',
            'GET /schedules/auto-direct',
            'GET /schedules/statistics',
            'POST /schedules/generate',
            'GET /system/cron-status',
            'POST /system/trigger-schedule-generation'
        ]
    });
});

export default router;