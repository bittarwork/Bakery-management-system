/**
 * Delivery Scheduling Controller
 * Handles advanced delivery scheduling with calendar integration
 * Phase 6 - Complete Order Management
 */

import db from '../config/database.js';
import logger from '../config/logger.js';
import crypto from 'crypto';

class DeliverySchedulingController {
    /**
     * Get delivery schedules with filtering and calendar view
     * GET /api/delivery/schedules
     */
    static async getDeliverySchedules(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                date_from,
                date_to,
                status,
                time_slot,
                delivery_type,
                view = 'list' // 'list' or 'calendar'
            } = req.query;

            const offset = (page - 1) * limit;
            let whereClause = 'WHERE 1=1';
            const params = [];

            if (date_from) {
                whereClause += ' AND ds.scheduled_date >= ?';
                params.push(date_from);
            }

            if (date_to) {
                whereClause += ' AND ds.scheduled_date <= ?';
                params.push(date_to);
            }

            if (status) {
                whereClause += ' AND ds.status = ?';
                params.push(status);
            }

            if (time_slot) {
                whereClause += ' AND ds.time_slot = ?';
                params.push(time_slot);
            }

            if (delivery_type) {
                whereClause += ' AND ds.delivery_type = ?';
                params.push(delivery_type);
            }

            if (view === 'calendar') {
                // Calendar view - group by date
                const calendarQuery = `
                    SELECT 
                        ds.scheduled_date,
                        COUNT(*) as total_deliveries,
                        COUNT(CASE WHEN ds.status = 'delivered' THEN 1 END) as completed_deliveries,
                        COUNT(CASE WHEN ds.status = 'scheduled' THEN 1 END) as scheduled_deliveries,
                        COUNT(CASE WHEN ds.status = 'in_progress' THEN 1 END) as in_progress_deliveries,
                        COUNT(CASE WHEN ds.status = 'missed' THEN 1 END) as missed_deliveries,
                        SUM(ds.delivery_fee_eur) as total_delivery_fees,
                        GROUP_CONCAT(
                            json_object(
                                'id', ds.id,
                                'order_id', ds.order_id,
                                'order_number', o.order_number,
                                'time_start', ds.scheduled_time_start,
                                'time_end', ds.scheduled_time_end,
                                'status', ds.status,
                                'delivery_type', ds.delivery_type,
                                'contact_person', ds.contact_person,
                                'delivery_fee', ds.delivery_fee_eur
                            )
                        ) as deliveries_data
                    FROM delivery_schedules ds
                    LEFT JOIN orders o ON ds.order_id = o.id
                    ${whereClause}
                    GROUP BY ds.scheduled_date
                    ORDER BY ds.scheduled_date ASC
                `;

                const calendarData = await db.all(calendarQuery, params);

                // Parse deliveries data for each date
                const formattedCalendarData = calendarData.map(item => ({
                    ...item,
                    deliveries: item.deliveries_data ?
                        item.deliveries_data.split(',').map(delivery => JSON.parse(delivery)) : []
                }));

                res.json({
                    success: true,
                    data: {
                        calendar_data: formattedCalendarData,
                        view: 'calendar'
                    }
                });

            } else {
                // List view - detailed schedules
                const countQuery = `SELECT COUNT(*) as total FROM delivery_schedules ds ${whereClause}`;
                const countResult = await db.get(countQuery, params);
                const totalItems = countResult.total;

                const schedulesQuery = `
                    SELECT 
                        ds.*,
                        o.order_number,
                        o.total_amount_eur,
                        o.status as order_status,
                        s.name as store_name,
                        s.address as store_address,
                        s.phone as store_phone,
                        da.distributor_id,
                        d.name as distributor_name,
                        d.phone as distributor_phone,
                        cb.name as created_by_name,
                        prev_ds.id as rescheduled_from_id
                    FROM delivery_schedules ds
                    LEFT JOIN orders o ON ds.order_id = o.id
                    LEFT JOIN stores s ON o.store_id = s.id
                    LEFT JOIN distributor_assignments da ON o.id = da.order_id AND da.status = 'assigned'
                    LEFT JOIN users d ON da.distributor_id = d.id
                    LEFT JOIN users cb ON ds.created_by = cb.id
                    LEFT JOIN delivery_schedules prev_ds ON ds.rescheduled_from = prev_ds.id
                    ${whereClause}
                    ORDER BY ds.scheduled_date DESC, ds.scheduled_time_start ASC
                    LIMIT ? OFFSET ?
                `;

                const schedules = await db.all(schedulesQuery, [...params, limit, offset]);

                res.json({
                    success: true,
                    data: {
                        schedules,
                        pagination: {
                            currentPage: parseInt(page),
                            totalPages: Math.ceil(totalItems / limit),
                            totalItems,
                            itemsPerPage: parseInt(limit)
                        },
                        view: 'list'
                    }
                });
            }

        } catch (error) {
            logger.error('Error fetching delivery schedules:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب جداول التسليم',
                error: error.message
            });
        }
    }

    /**
     * Create delivery schedule
     * POST /api/delivery/schedules
     */
    static async createDeliverySchedule(req, res) {
        const db_transaction = await db.beginTransaction();

        try {
            const {
                order_id,
                scheduled_date,
                scheduled_time_start,
                scheduled_time_end,
                time_slot = 'morning',
                delivery_type = 'standard',
                delivery_address,
                delivery_instructions,
                contact_person,
                contact_phone,
                delivery_fee_eur = 0
            } = req.body;

            // Validation
            if (!order_id || !scheduled_date || !scheduled_time_start) {
                return res.status(400).json({
                    success: false,
                    message: 'معرف الطلب وتاريخ ووقت التسليم مطلوبان'
                });
            }

            // Check if order exists and can be scheduled
            const order = await db.get(
                "SELECT * FROM orders WHERE id = ? AND status IN ('confirmed', 'processing', 'ready')",
                [order_id]
            );

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'الطلب غير موجود أو لا يمكن جدولة تسليمه'
                });
            }

            // Check for existing active schedule
            const existingSchedule = await db.get(
                "SELECT * FROM delivery_schedules WHERE order_id = ? AND status IN ('scheduled', 'confirmed', 'in_progress')",
                [order_id]
            );

            if (existingSchedule) {
                return res.status(409).json({
                    success: false,
                    message: 'يوجد جدولة نشطة للطلب مسبقاً'
                });
            }

            // Validate time slot availability
            const conflictingSchedules = await this.checkTimeSlotAvailability(
                scheduled_date,
                scheduled_time_start,
                scheduled_time_end
            );

            if (conflictingSchedules.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'الوقت المحدد محجوز مسبقاً',
                    data: { conflicting_schedules: conflictingSchedules }
                });
            }

            // Generate confirmation token
            const confirmationToken = crypto.randomBytes(16).toString('hex');

            // Create delivery schedule
            const result = await db.run(`
                INSERT INTO delivery_schedules 
                (order_id, scheduled_date, scheduled_time_start, scheduled_time_end, 
                 time_slot, delivery_type, delivery_address, delivery_instructions,
                 contact_person, contact_phone, delivery_fee_eur, confirmation_token, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                order_id,
                scheduled_date,
                scheduled_time_start,
                scheduled_time_end,
                time_slot,
                delivery_type,
                delivery_address,
                delivery_instructions,
                contact_person,
                contact_phone,
                delivery_fee_eur,
                confirmationToken,
                req.user?.id
            ]);

            // Update order delivery date if different
            if (order.delivery_date !== scheduled_date) {
                await db.run(
                    'UPDATE orders SET delivery_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [scheduled_date, order_id]
                );
            }

            // Get created schedule with full details
            const createdSchedule = await db.get(`
                SELECT 
                    ds.*,
                    o.order_number,
                    o.total_amount_eur,
                    s.name as store_name
                FROM delivery_schedules ds
                LEFT JOIN orders o ON ds.order_id = o.id
                LEFT JOIN stores s ON o.store_id = s.id
                WHERE ds.id = ?
            `, [result.lastID]);

            await db_transaction.commit();

            res.status(201).json({
                success: true,
                message: 'تم إنشاء جدولة التسليم بنجاح',
                data: createdSchedule
            });

        } catch (error) {
            await db_transaction.rollback();
            logger.error('Error creating delivery schedule:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في إنشاء جدولة التسليم',
                error: error.message
            });
        }
    }

    /**
     * Update delivery schedule
     * PUT /api/delivery/schedules/:id
     */
    static async updateDeliverySchedule(req, res) {
        try {
            const { id } = req.params;
            const {
                scheduled_date,
                scheduled_time_start,
                scheduled_time_end,
                time_slot,
                delivery_type,
                delivery_address,
                delivery_instructions,
                contact_person,
                contact_phone,
                delivery_fee_eur,
                status
            } = req.body;

            // Get current schedule
            const currentSchedule = await db.get(
                'SELECT * FROM delivery_schedules WHERE id = ?',
                [id]
            );

            if (!currentSchedule) {
                return res.status(404).json({
                    success: false,
                    message: 'جدولة التسليم غير موجودة'
                });
            }

            // Check if schedule can be updated
            if (currentSchedule.status === 'delivered') {
                return res.status(400).json({
                    success: false,
                    message: 'لا يمكن تعديل جدولة مكتملة'
                });
            }

            // Validate time slot availability if time is being changed
            if (scheduled_date || scheduled_time_start || scheduled_time_end) {
                const newDate = scheduled_date || currentSchedule.scheduled_date;
                const newStartTime = scheduled_time_start || currentSchedule.scheduled_time_start;
                const newEndTime = scheduled_time_end || currentSchedule.scheduled_time_end;

                const conflictingSchedules = await this.checkTimeSlotAvailability(
                    newDate, newStartTime, newEndTime, id
                );

                if (conflictingSchedules.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: 'الوقت المحدد محجوز مسبقاً',
                        data: { conflicting_schedules: conflictingSchedules }
                    });
                }
            }

            // Build update query dynamically
            const updateFields = [];
            const updateParams = [];

            if (scheduled_date) {
                updateFields.push('scheduled_date = ?');
                updateParams.push(scheduled_date);
            }
            if (scheduled_time_start) {
                updateFields.push('scheduled_time_start = ?');
                updateParams.push(scheduled_time_start);
            }
            if (scheduled_time_end) {
                updateFields.push('scheduled_time_end = ?');
                updateParams.push(scheduled_time_end);
            }
            if (time_slot) {
                updateFields.push('time_slot = ?');
                updateParams.push(time_slot);
            }
            if (delivery_type) {
                updateFields.push('delivery_type = ?');
                updateParams.push(delivery_type);
            }
            if (delivery_address) {
                updateFields.push('delivery_address = ?');
                updateParams.push(delivery_address);
            }
            if (delivery_instructions) {
                updateFields.push('delivery_instructions = ?');
                updateParams.push(delivery_instructions);
            }
            if (contact_person) {
                updateFields.push('contact_person = ?');
                updateParams.push(contact_person);
            }
            if (contact_phone) {
                updateFields.push('contact_phone = ?');
                updateParams.push(contact_phone);
            }
            if (delivery_fee_eur !== undefined) {
                updateFields.push('delivery_fee_eur = ?');
                updateParams.push(delivery_fee_eur);
            }
            if (status) {
                updateFields.push('status = ?');
                updateParams.push(status);
            }

            if (updateFields.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'لا توجد بيانات للتحديث'
                });
            }

            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            updateParams.push(id);

            // Update schedule
            await db.run(
                `UPDATE delivery_schedules SET ${updateFields.join(', ')} WHERE id = ?`,
                updateParams
            );

            // Update order delivery date if changed
            if (scheduled_date) {
                await db.run(
                    'UPDATE orders SET delivery_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [scheduled_date, currentSchedule.order_id]
                );
            }

            // Get updated schedule
            const updatedSchedule = await db.get(`
                SELECT 
                    ds.*,
                    o.order_number,
                    o.total_amount_eur,
                    s.name as store_name
                FROM delivery_schedules ds
                LEFT JOIN orders o ON ds.order_id = o.id
                LEFT JOIN stores s ON o.store_id = s.id
                WHERE ds.id = ?
            `, [id]);

            res.json({
                success: true,
                message: 'تم تحديث جدولة التسليم بنجاح',
                data: updatedSchedule
            });

        } catch (error) {
            logger.error('Error updating delivery schedule:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تحديث جدولة التسليم',
                error: error.message
            });
        }
    }

    /**
     * Reschedule delivery
     * POST /api/delivery/schedules/:id/reschedule
     */
    static async rescheduleDelivery(req, res) {
        const db_transaction = await db.beginTransaction();

        try {
            const { id } = req.params;
            const {
                new_scheduled_date,
                new_scheduled_time_start,
                new_scheduled_time_end,
                reschedule_reason,
                time_slot = 'morning'
            } = req.body;

            // Get current schedule
            const currentSchedule = await db.get(
                'SELECT * FROM delivery_schedules WHERE id = ?',
                [id]
            );

            if (!currentSchedule) {
                return res.status(404).json({
                    success: false,
                    message: 'جدولة التسليم غير موجودة'
                });
            }

            // Check if can be rescheduled
            if (currentSchedule.status === 'delivered') {
                return res.status(400).json({
                    success: false,
                    message: 'لا يمكن إعادة جدولة تسليم مكتمل'
                });
            }

            // Validate new time slot
            const conflictingSchedules = await this.checkTimeSlotAvailability(
                new_scheduled_date,
                new_scheduled_time_start,
                new_scheduled_time_end,
                id
            );

            if (conflictingSchedules.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'الوقت الجديد محجوز مسبقاً',
                    data: { conflicting_schedules: conflictingSchedules }
                });
            }

            // Mark current schedule as rescheduled
            await db.run(
                'UPDATE delivery_schedules SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                ['rescheduled', id]
            );

            // Create new schedule
            const newConfirmationToken = crypto.randomBytes(16).toString('hex');

            const result = await db.run(`
                INSERT INTO delivery_schedules 
                (order_id, scheduled_date, scheduled_time_start, scheduled_time_end, 
                 time_slot, delivery_type, delivery_address, delivery_instructions,
                 contact_person, contact_phone, delivery_fee_eur, 
                 confirmation_token, created_by, rescheduled_from)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                currentSchedule.order_id,
                new_scheduled_date,
                new_scheduled_time_start,
                new_scheduled_time_end,
                time_slot,
                currentSchedule.delivery_type,
                currentSchedule.delivery_address,
                currentSchedule.delivery_instructions,
                currentSchedule.contact_person,
                currentSchedule.contact_phone,
                currentSchedule.delivery_fee_eur,
                newConfirmationToken,
                req.user?.id,
                id
            ]);

            // Update order delivery date
            await db.run(
                'UPDATE orders SET delivery_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [new_scheduled_date, currentSchedule.order_id]
            );

            // Get new schedule details
            const newSchedule = await db.get(`
                SELECT 
                    ds.*,
                    o.order_number,
                    o.total_amount_eur,
                    s.name as store_name
                FROM delivery_schedules ds
                LEFT JOIN orders o ON ds.order_id = o.id
                LEFT JOIN stores s ON o.store_id = s.id
                WHERE ds.id = ?
            `, [result.lastID]);

            await db_transaction.commit();

            res.json({
                success: true,
                message: 'تم إعادة جدولة التسليم بنجاح',
                data: {
                    old_schedule: currentSchedule,
                    new_schedule: newSchedule,
                    reschedule_reason
                }
            });

        } catch (error) {
            await db_transaction.rollback();
            logger.error('Error rescheduling delivery:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في إعادة جدولة التسليم',
                error: error.message
            });
        }
    }

    /**
     * Get delivery capacity and availability
     * GET /api/delivery/capacity
     */
    static async getDeliveryCapacity(req, res) {
        try {
            const {
                date_from,
                date_to,
                time_slot,
                max_deliveries_per_slot = 10
            } = req.query;

            // Set default date range if not provided
            const dateFrom = date_from || new Date().toISOString().split('T')[0];
            const dateTo = date_to || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            let whereClause = 'WHERE ds.scheduled_date BETWEEN ? AND ?';
            const params = [dateFrom, dateTo];

            if (time_slot) {
                whereClause += ' AND ds.time_slot = ?';
                params.push(time_slot);
            }

            // Get capacity data
            const capacityQuery = `
                SELECT 
                    ds.scheduled_date,
                    ds.time_slot,
                    COUNT(*) as scheduled_deliveries,
                    COUNT(CASE WHEN ds.status = 'delivered' THEN 1 END) as completed_deliveries,
                    COUNT(CASE WHEN ds.status IN ('scheduled', 'confirmed') THEN 1 END) as pending_deliveries,
                    ? as max_capacity,
                    (? - COUNT(*)) as available_slots,
                    ROUND((COUNT(*) * 100.0 / ?), 2) as capacity_percentage
                FROM delivery_schedules ds
                ${whereClause}
                AND ds.status != 'rescheduled'
                GROUP BY ds.scheduled_date, ds.time_slot
                ORDER BY ds.scheduled_date ASC, 
                    CASE ds.time_slot 
                        WHEN 'morning' THEN 1 
                        WHEN 'afternoon' THEN 2 
                        WHEN 'evening' THEN 3 
                        ELSE 4 
                    END
            `;

            const capacityData = await db.all(capacityQuery, [
                max_deliveries_per_slot,
                max_deliveries_per_slot,
                max_deliveries_per_slot,
                ...params
            ]);

            // Get suggested time slots for next available deliveries
            const suggestedSlotsQuery = `
                WITH date_series AS (
                    SELECT date(?) as date_val
                    UNION ALL
                    SELECT date(date_val, '+1 day')
                    FROM date_series
                    WHERE date_val < ?
                    LIMIT 30
                ),
                time_slots AS (
                    SELECT 'morning' as slot_name, '09:00:00' as start_time, '12:00:00' as end_time
                    UNION ALL
                    SELECT 'afternoon', '14:00:00', '17:00:00'
                    UNION ALL
                    SELECT 'evening', '18:00:00', '21:00:00'
                ),
                available_slots AS (
                    SELECT 
                        ds.date_val as suggested_date,
                        ts.slot_name as suggested_time_slot,
                        ts.start_time,
                        ts.end_time,
                        COALESCE(scheduled.count, 0) as current_bookings,
                        (? - COALESCE(scheduled.count, 0)) as available_capacity
                    FROM date_series ds
                    CROSS JOIN time_slots ts
                    LEFT JOIN (
                        SELECT 
                            scheduled_date,
                            time_slot,
                            COUNT(*) as count
                        FROM delivery_schedules 
                        WHERE status != 'rescheduled'
                        GROUP BY scheduled_date, time_slot
                    ) scheduled ON ds.date_val = scheduled.scheduled_date 
                                AND ts.slot_name = scheduled.time_slot
                    WHERE ds.date_val >= date('now')
                    AND (? - COALESCE(scheduled.count, 0)) > 0
                )
                SELECT * FROM available_slots
                ORDER BY suggested_date ASC, 
                    CASE suggested_time_slot 
                        WHEN 'morning' THEN 1 
                        WHEN 'afternoon' THEN 2 
                        WHEN 'evening' THEN 3 
                    END
                LIMIT 20
            `;

            const suggestedSlots = await db.all(suggestedSlotsQuery, [
                dateFrom,
                dateTo,
                max_deliveries_per_slot,
                max_deliveries_per_slot
            ]);

            res.json({
                success: true,
                data: {
                    period: {
                        from: dateFrom,
                        to: dateTo
                    },
                    capacity_data: capacityData,
                    suggested_slots: suggestedSlots,
                    settings: {
                        max_deliveries_per_slot: parseInt(max_deliveries_per_slot)
                    }
                }
            });

        } catch (error) {
            logger.error('Error fetching delivery capacity:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب سعة التسليم',
                error: error.message
            });
        }
    }

    /**
     * Confirm delivery schedule (by customer)
     * POST /api/delivery/schedules/confirm/:token
     */
    static async confirmDeliverySchedule(req, res) {
        try {
            const { token } = req.params;
            const { customer_notes } = req.body;

            const schedule = await db.get(
                'SELECT * FROM delivery_schedules WHERE confirmation_token = ? AND status = "scheduled"',
                [token]
            );

            if (!schedule) {
                return res.status(404).json({
                    success: false,
                    message: 'رابط التأكيد غير صالح أو منتهي الصلاحية'
                });
            }

            // Update schedule status to confirmed
            await db.run(`
                UPDATE delivery_schedules 
                SET status = 'confirmed', 
                    delivery_instructions = CASE 
                        WHEN ? IS NOT NULL AND ? != '' 
                        THEN COALESCE(delivery_instructions, '') || '\nملاحظات العميل: ' || ?
                        ELSE delivery_instructions 
                    END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [customer_notes, customer_notes, customer_notes, schedule.id]);

            res.json({
                success: true,
                message: 'تم تأكيد موعد التسليم بنجاح',
                data: {
                    schedule_id: schedule.id,
                    order_id: schedule.order_id,
                    scheduled_date: schedule.scheduled_date,
                    scheduled_time: schedule.scheduled_time_start
                }
            });

        } catch (error) {
            logger.error('Error confirming delivery schedule:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تأكيد موعد التسليم',
                error: error.message
            });
        }
    }

    /**
     * Cancel delivery schedule
     * DELETE /api/delivery/schedules/:id
     */
    static async cancelDeliverySchedule(req, res) {
        try {
            const { id } = req.params;
            const { cancellation_reason } = req.body;

            const schedule = await db.get(
                'SELECT * FROM delivery_schedules WHERE id = ?',
                [id]
            );

            if (!schedule) {
                return res.status(404).json({
                    success: false,
                    message: 'جدولة التسليم غير موجودة'
                });
            }

            if (schedule.status === 'delivered') {
                return res.status(400).json({
                    success: false,
                    message: 'لا يمكن إلغاء جدولة مكتملة'
                });
            }

            // Update schedule status to cancelled
            await db.run(
                'UPDATE delivery_schedules SET status = ?, delivery_instructions = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                ['cancelled', `ملغي: ${cancellation_reason || 'لم يتم تحديد السبب'}`, id]
            );

            // Reset order delivery date
            await db.run(
                'UPDATE orders SET delivery_date = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [schedule.order_id]
            );

            res.json({
                success: true,
                message: 'تم إلغاء جدولة التسليم بنجاح'
            });

        } catch (error) {
            logger.error('Error cancelling delivery schedule:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في إلغاء جدولة التسليم',
                error: error.message
            });
        }
    }

    /**
     * Helper method to check time slot availability
     */
    static async checkTimeSlotAvailability(date, startTime, endTime, excludeId = null) {
        try {
            let query = `
                SELECT id, scheduled_time_start, scheduled_time_end, contact_person
                FROM delivery_schedules 
                WHERE scheduled_date = ? 
                AND status IN ('scheduled', 'confirmed', 'in_progress')
                AND (
                    (scheduled_time_start <= ? AND scheduled_time_end > ?) OR
                    (scheduled_time_start < ? AND scheduled_time_end >= ?) OR
                    (scheduled_time_start >= ? AND scheduled_time_end <= ?)
                )
            `;

            const params = [date, startTime, startTime, endTime, endTime, startTime, endTime];

            if (excludeId) {
                query += ' AND id != ?';
                params.push(excludeId);
            }

            return await db.all(query, params);
        } catch (error) {
            logger.error('Error checking time slot availability:', error);
            return [];
        }
    }

    /**
     * Get delivery schedule statistics
     * GET /api/delivery/schedules/statistics
     */
    static async getDeliveryStatistics(req, res) {
        try {
            const { date_from, date_to } = req.query;

            // Set default date range (last 30 days)
            const dateFrom = date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const dateTo = date_to || new Date().toISOString().split('T')[0];

            // Get overall statistics
            const overallStatsQuery = `
                SELECT 
                    COUNT(*) as total_schedules,
                    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_deliveries,
                    COUNT(CASE WHEN status = 'missed' THEN 1 END) as missed_deliveries,
                    COUNT(CASE WHEN status = 'rescheduled' THEN 1 END) as rescheduled_deliveries,
                    COUNT(CASE WHEN status IN ('scheduled', 'confirmed') THEN 1 END) as pending_deliveries,
                    AVG(delivery_fee_eur) as avg_delivery_fee,
                    SUM(delivery_fee_eur) as total_delivery_fees
                FROM delivery_schedules
                WHERE scheduled_date BETWEEN ? AND ?
            `;

            const overallStats = await db.get(overallStatsQuery, [dateFrom, dateTo]);

            // Get statistics by time slot
            const timeSlotStatsQuery = `
                SELECT 
                    time_slot,
                    COUNT(*) as total_schedules,
                    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_deliveries,
                    ROUND((COUNT(CASE WHEN status = 'delivered' THEN 1 END) * 100.0 / COUNT(*)), 2) as completion_rate
                FROM delivery_schedules
                WHERE scheduled_date BETWEEN ? AND ?
                GROUP BY time_slot
                ORDER BY 
                    CASE time_slot 
                        WHEN 'morning' THEN 1 
                        WHEN 'afternoon' THEN 2 
                        WHEN 'evening' THEN 3 
                        ELSE 4 
                    END
            `;

            const timeSlotStats = await db.all(timeSlotStatsQuery, [dateFrom, dateTo]);

            // Get daily delivery trend
            const dailyTrendQuery = `
                SELECT 
                    scheduled_date,
                    COUNT(*) as schedules_count,
                    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_count,
                    SUM(delivery_fee_eur) as daily_fees
                FROM delivery_schedules
                WHERE scheduled_date BETWEEN ? AND ?
                GROUP BY scheduled_date
                ORDER BY scheduled_date ASC
            `;

            const dailyTrend = await db.all(dailyTrendQuery, [dateFrom, dateTo]);

            res.json({
                success: true,
                data: {
                    period: {
                        from: dateFrom,
                        to: dateTo
                    },
                    overall_stats: {
                        ...overallStats,
                        completion_rate: overallStats.total_schedules > 0 ?
                            Math.round((overallStats.completed_deliveries / overallStats.total_schedules) * 100) : 0
                    },
                    time_slot_stats: timeSlotStats,
                    daily_trend: dailyTrend
                }
            });

        } catch (error) {
            logger.error('Error fetching delivery statistics:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب إحصائيات التسليم',
                error: error.message
            });
        }
    }
}

export default DeliverySchedulingController; 