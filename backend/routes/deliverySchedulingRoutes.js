/**
 * Delivery Scheduling Routes
 * Routes for advanced delivery scheduling with calendar integration
 */

import express from 'express';
import DeliverySchedulingController from '../controllers/deliverySchedulingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ==============================================
// DELIVERY SCHEDULE MANAGEMENT ROUTES
// ==============================================

// @desc    Get delivery schedules (list or calendar view)
// @route   GET /api/delivery/schedules
// @access  Private
router.get('/schedules', protect, DeliverySchedulingController.getDeliverySchedules);

// @desc    Create delivery schedule
// @route   POST /api/delivery/schedules
// @access  Private
router.post('/schedules', protect, DeliverySchedulingController.createDeliverySchedule);

// @desc    Update delivery schedule
// @route   PUT /api/delivery/schedules/:id
// @access  Private
router.put('/schedules/:id', protect, DeliverySchedulingController.updateDeliverySchedule);

// @desc    Reschedule delivery
// @route   POST /api/delivery/schedules/:id/reschedule
// @access  Private
router.post('/schedules/:id/reschedule', protect, DeliverySchedulingController.rescheduleDelivery);

// @desc    Cancel delivery schedule
// @route   DELETE /api/delivery/schedules/:id
// @access  Private (Admin/Manager only)
router.delete('/schedules/:id', protect, authorize(['admin', 'manager']), DeliverySchedulingController.cancelDeliverySchedule);

// ==============================================
// DELIVERY CAPACITY AND AVAILABILITY ROUTES
// ==============================================

// @desc    Get delivery capacity and availability
// @route   GET /api/delivery/capacity
// @access  Private
router.get('/capacity', protect, DeliverySchedulingController.getDeliveryCapacity);

// @desc    Check time slot availability
// @route   POST /api/delivery/check-availability
// @access  Private
router.post('/check-availability', protect, async (req, res) => {
    try {
        const { date, start_time, end_time, exclude_schedule_id } = req.body;

        if (!date || !start_time) {
            return res.status(400).json({
                success: false,
                message: 'التاريخ ووقت البداية مطلوبان'
            });
        }

        const conflictingSchedules = await DeliverySchedulingController.checkTimeSlotAvailability(
            date, start_time, end_time, exclude_schedule_id
        );

        res.json({
            success: true,
            data: {
                is_available: conflictingSchedules.length === 0,
                conflicting_schedules: conflictingSchedules,
                checked_slot: {
                    date,
                    start_time,
                    end_time: end_time || start_time
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في فحص توفر الوقت',
            error: error.message
        });
    }
});

// ==============================================
// CUSTOMER CONFIRMATION ROUTES
// ==============================================

// @desc    Confirm delivery schedule by customer
// @route   POST /api/delivery/schedules/confirm/:token
// @access  Public
router.post('/schedules/confirm/:token', DeliverySchedulingController.confirmDeliverySchedule);

// @desc    Get delivery schedule by confirmation token (for customer view)
// @route   GET /api/delivery/schedules/confirm/:token
// @access  Public
router.get('/schedules/confirm/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { default: db } = await import('../config/database.js');

        const schedule = await db.get(`
            SELECT 
                ds.*,
                o.order_number,
                o.total_amount_eur,
                s.name as store_name,
                s.address as store_address,
                s.phone as store_phone
            FROM delivery_schedules ds
            LEFT JOIN orders o ON ds.order_id = o.id
            LEFT JOIN stores s ON o.store_id = s.id
            WHERE ds.confirmation_token = ?
        `, [token]);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'رابط التأكيد غير صالح أو منتهي الصلاحية'
            });
        }

        // Don't expose sensitive information
        const publicScheduleInfo = {
            id: schedule.id,
            order_number: schedule.order_number,
            scheduled_date: schedule.scheduled_date,
            scheduled_time_start: schedule.scheduled_time_start,
            scheduled_time_end: schedule.scheduled_time_end,
            time_slot: schedule.time_slot,
            delivery_type: schedule.delivery_type,
            delivery_address: schedule.delivery_address,
            contact_person: schedule.contact_person,
            contact_phone: schedule.contact_phone,
            status: schedule.status,
            store_name: schedule.store_name,
            store_address: schedule.store_address,
            store_phone: schedule.store_phone
        };

        res.json({
            success: true,
            data: publicScheduleInfo
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب بيانات التأكيد',
            error: error.message
        });
    }
});

// ==============================================
// DELIVERY STATISTICS ROUTES
// ==============================================

// @desc    Get delivery schedule statistics
// @route   GET /api/delivery/schedules/statistics
// @access  Private
router.get('/schedules/statistics', protect, DeliverySchedulingController.getDeliveryStatistics);

// @desc    Get delivery schedule analytics
// @route   GET /api/delivery/schedules/analytics
// @access  Private
router.get('/schedules/analytics', protect, DeliverySchedulingController.getDeliveryAnalytics);

// ==============================================
// LIVE TRACKING ROUTES
// ==============================================

// @desc    Get live delivery tracking
// @route   GET /api/delivery/tracking/live
// @access  Private
router.get('/tracking/live', protect, DeliverySchedulingController.getLiveDeliveryTracking);

// @desc    Update delivery tracking status
// @route   PUT /api/delivery/tracking/:id/status
// @access  Private
router.put('/tracking/:id/status', protect, DeliverySchedulingController.updateDeliveryTrackingStatus);

// @desc    Get delivery performance metrics
// @route   GET /api/delivery/performance
// @access  Private
router.get('/performance', protect, async (req, res) => {
    try {
        const { default: db } = await import('../config/database.js');
        const { date_from, date_to, time_slot, delivery_type } = req.query;

        // Set default date range (last 30 days)
        const dateFrom = date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const dateTo = date_to || new Date().toISOString().split('T')[0];

        let whereClause = 'WHERE ds.scheduled_date BETWEEN ? AND ?';
        const params = [dateFrom, dateTo];

        if (time_slot) {
            whereClause += ' AND ds.time_slot = ?';
            params.push(time_slot);
        }

        if (delivery_type) {
            whereClause += ' AND ds.delivery_type = ?';
            params.push(delivery_type);
        }

        // Get performance metrics
        const performanceQuery = `
            SELECT 
                COUNT(*) as total_schedules,
                COUNT(CASE WHEN ds.status = 'delivered' THEN 1 END) as completed_deliveries,
                COUNT(CASE WHEN ds.status = 'missed' THEN 1 END) as missed_deliveries,
                COUNT(CASE WHEN ds.status = 'rescheduled' THEN 1 END) as rescheduled_deliveries,
                COUNT(CASE WHEN ds.status IN ('scheduled', 'confirmed') THEN 1 END) as pending_deliveries,
                ROUND(AVG(ds.delivery_fee_eur), 2) as avg_delivery_fee,
                SUM(ds.delivery_fee_eur) as total_delivery_revenue,
                COUNT(CASE WHEN ds.time_slot = 'morning' THEN 1 END) as morning_deliveries,
                COUNT(CASE WHEN ds.time_slot = 'afternoon' THEN 1 END) as afternoon_deliveries,
                COUNT(CASE WHEN ds.time_slot = 'evening' THEN 1 END) as evening_deliveries,
                COUNT(CASE WHEN ds.delivery_type = 'express' THEN 1 END) as express_deliveries,
                COUNT(CASE WHEN ds.delivery_type = 'standard' THEN 1 END) as standard_deliveries
            FROM delivery_schedules ds
            ${whereClause}
        `;

        const performance = await db.get(performanceQuery, params);

        // Calculate rates
        const completionRate = performance.total_schedules > 0 ?
            (performance.completed_deliveries / performance.total_schedules) * 100 : 0;

        const missedRate = performance.total_schedules > 0 ?
            (performance.missed_deliveries / performance.total_schedules) * 100 : 0;

        const rescheduleRate = performance.total_schedules > 0 ?
            (performance.rescheduled_deliveries / performance.total_schedules) * 100 : 0;

        // Get top performing time slots
        const timeSlotPerformanceQuery = `
            SELECT 
                ds.time_slot,
                COUNT(*) as total_schedules,
                COUNT(CASE WHEN ds.status = 'delivered' THEN 1 END) as completed_deliveries,
                ROUND((COUNT(CASE WHEN ds.status = 'delivered' THEN 1 END) * 100.0 / COUNT(*)), 2) as completion_rate,
                AVG(ds.delivery_fee_eur) as avg_fee
            FROM delivery_schedules ds
            ${whereClause}
            GROUP BY ds.time_slot
            ORDER BY completion_rate DESC
        `;

        const timeSlotPerformance = await db.all(timeSlotPerformanceQuery, params);

        res.json({
            success: true,
            data: {
                period: {
                    from: dateFrom,
                    to: dateTo
                },
                filters: {
                    time_slot: time_slot || 'all',
                    delivery_type: delivery_type || 'all'
                },
                overall_performance: {
                    ...performance,
                    completion_rate: Math.round(completionRate * 100) / 100,
                    missed_rate: Math.round(missedRate * 100) / 100,
                    reschedule_rate: Math.round(rescheduleRate * 100) / 100
                },
                time_slot_performance: timeSlotPerformance
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب مقاييس الأداء',
            error: error.message
        });
    }
});

// ==============================================
// BULK OPERATIONS ROUTES
// ==============================================

// @desc    Bulk create delivery schedules
// @route   POST /api/delivery/schedules/bulk-create
// @access  Private (Admin/Manager only)
router.post('/schedules/bulk-create', protect, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { schedules_data } = req.body; // Array of schedule objects

        if (!Array.isArray(schedules_data) || schedules_data.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'بيانات الجدولة مطلوبة كمصفوفة'
            });
        }

        const results = {
            total_schedules: schedules_data.length,
            successful_schedules: 0,
            failed_schedules: 0,
            errors: []
        };

        // Process each schedule
        for (const scheduleData of schedules_data) {
            try {
                const tempReq = {
                    body: scheduleData,
                    user: req.user
                };

                const tempRes = {
                    json: (data) => data,
                    status: (code) => ({ json: (data) => ({ ...data, statusCode: code }) })
                };

                await DeliverySchedulingController.createDeliverySchedule(tempReq, tempRes);
                results.successful_schedules++;

            } catch (error) {
                results.errors.push(`الطلب ${scheduleData.order_id}: ${error.message}`);
                results.failed_schedules++;
            }
        }

        res.json({
            success: true,
            message: `تم إنشاء ${results.successful_schedules} من ${results.total_schedules} جدولة بنجاح`,
            data: results
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في الإنشاء المجمع للجدولة',
            error: error.message
        });
    }
});

// @desc    Bulk reschedule deliveries
// @route   POST /api/delivery/schedules/bulk-reschedule
// @access  Private (Admin/Manager only)
router.post('/schedules/bulk-reschedule', protect, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { schedule_updates } = req.body; // Array of {schedule_id, new_date, new_time_start, reason}

        if (!Array.isArray(schedule_updates) || schedule_updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'بيانات التحديث مطلوبة'
            });
        }

        const results = {
            total_updates: schedule_updates.length,
            successful_updates: 0,
            failed_updates: 0,
            errors: []
        };

        // Process each reschedule
        for (const update of schedule_updates) {
            try {
                const tempReq = {
                    params: { id: update.schedule_id },
                    body: {
                        new_scheduled_date: update.new_date,
                        new_scheduled_time_start: update.new_time_start,
                        new_scheduled_time_end: update.new_time_end,
                        reschedule_reason: update.reason
                    },
                    user: req.user
                };

                const tempRes = {
                    json: (data) => data,
                    status: (code) => ({ json: (data) => ({ ...data, statusCode: code }) })
                };

                await DeliverySchedulingController.rescheduleDelivery(tempReq, tempRes);
                results.successful_updates++;

            } catch (error) {
                results.errors.push(`الجدولة ${update.schedule_id}: ${error.message}`);
                results.failed_updates++;
            }
        }

        res.json({
            success: true,
            message: `تم تحديث ${results.successful_updates} من ${results.total_updates} جدولة بنجاح`,
            data: results
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في التحديث المجمع للجدولة',
            error: error.message
        });
    }
});

// ==============================================
// DELIVERY ROUTE OPTIMIZATION
// ==============================================

// @desc    Get optimized delivery routes for a date
// @route   GET /api/delivery/routes/optimize
// @access  Private
router.get('/routes/optimize', protect, async (req, res) => {
    try {
        const { date, distributor_id } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'تاريخ التسليم مطلوب'
            });
        }

        const { default: db } = await import('../config/database.js');

        let whereClause = 'WHERE ds.scheduled_date = ? AND ds.status IN ("scheduled", "confirmed")';
        const params = [date];

        if (distributor_id) {
            whereClause += ' AND da.distributor_id = ?';
            params.push(distributor_id);
        }

        // Get deliveries for the specified date
        const deliveriesQuery = `
            SELECT 
                ds.*,
                o.order_number,
                s.name as store_name,
                s.address as store_address,
                s.latitude,
                s.longitude,
                da.distributor_id,
                d.name as distributor_name
            FROM delivery_schedules ds
            LEFT JOIN orders o ON ds.order_id = o.id
            LEFT JOIN stores s ON o.store_id = s.id
            LEFT JOIN distributor_assignments da ON o.id = da.order_id AND da.status = 'assigned'
            LEFT JOIN users d ON da.distributor_id = d.id
            ${whereClause}
            ORDER BY ds.scheduled_time_start ASC
        `;

        const deliveries = await db.all(deliveriesQuery, params);

        // Basic route optimization (can be enhanced with actual routing algorithms)
        const optimizedRoutes = deliveries.reduce((routes, delivery) => {
            const distributorId = delivery.distributor_id || 'unassigned';

            if (!routes[distributorId]) {
                routes[distributorId] = {
                    distributor_id: distributorId,
                    distributor_name: delivery.distributor_name || 'غير معين',
                    deliveries: [],
                    total_deliveries: 0,
                    estimated_duration: 0
                };
            }

            routes[distributorId].deliveries.push(delivery);
            routes[distributorId].total_deliveries++;
            routes[distributorId].estimated_duration += 30; // Estimate 30 minutes per delivery

            return routes;
        }, {});

        res.json({
            success: true,
            data: {
                date,
                total_deliveries: deliveries.length,
                optimized_routes: Object.values(optimizedRoutes),
                unassigned_deliveries: optimizedRoutes.unassigned?.deliveries || []
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تحسين مسارات التسليم',
            error: error.message
        });
    }
});

export default router; 