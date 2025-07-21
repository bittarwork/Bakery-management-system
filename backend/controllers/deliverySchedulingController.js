/**
 * Enhanced Delivery Scheduling Controller
 * Handles advanced delivery scheduling with calendar integration, real-time tracking, and capacity management
 */

import sequelize from '../config/database.js';
import { QueryTypes, Op } from 'sequelize';
import logger from '../config/logger.js';
import crypto from 'crypto';

// Import models
import TempDeliverySchedule from '../models/TempDeliverySchedule.js';
import Order from '../models/Order.js';
import Store from '../models/Store.js';
import User from '../models/User.js';

// Database helper functions for compatibility
const db = {
    async get(query, params = []) {
        const result = await sequelize.query(query, {
            replacements: params,
            type: QueryTypes.SELECT
        });
        return result[0] || null;
    },

    async all(query, params = []) {
        return await sequelize.query(query, {
            replacements: params,
            type: QueryTypes.SELECT
        });
    },

    async run(query, params = []) {
        const result = await sequelize.query(query, {
            replacements: params,
            type: QueryTypes.RAW
        });
        return { insertId: result[0]?.insertId || result[0] };
    },

    async beginTransaction() {
        return await sequelize.transaction();
    }
};

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
                distributor_id,
                view = 'list' // 'list' or 'calendar'
            } = req.query;

            const offset = (page - 1) * limit;
            const whereClause = {};

            // Build where conditions
            if (date_from && date_to) {
                whereClause.scheduled_date = {
                    [Op.between]: [date_from, date_to]
                };
            } else if (date_from) {
                whereClause.scheduled_date = {
                    [Op.gte]: date_from
                };
            } else if (date_to) {
                whereClause.scheduled_date = {
                    [Op.lte]: date_to
                };
            }

            if (status) {
                whereClause.status = status;
            }

            if (time_slot) {
                whereClause.time_slot = time_slot;
            }

            if (delivery_type) {
                whereClause.delivery_type = delivery_type;
            }

            if (distributor_id) {
                whereClause.distributor_id = distributor_id;
            }

            if (view === 'calendar') {
                // Calendar view - get schedules and format for calendar
                const schedules = await TempDeliverySchedule.findAll({
                    where: whereClause,
                    order: [['scheduled_date', 'ASC'], ['scheduled_time_start', 'ASC']]
                });

                // Group by date for calendar display
                const calendarData = {};
                schedules.forEach(schedule => {
                    const dateKey = schedule.scheduled_date;
                    if (!calendarData[dateKey]) {
                        calendarData[dateKey] = {
                            scheduled_date: dateKey,
                            total_deliveries: 0,
                            completed_deliveries: 0,
                            scheduled_deliveries: 0,
                            in_progress_deliveries: 0,
                            missed_deliveries: 0,
                            total_delivery_fees: 0,
                            deliveries: []
                        };
                    }

                    const dayData = calendarData[dateKey];
                    dayData.total_deliveries++;
                    dayData.total_delivery_fees += parseFloat(schedule.delivery_fee_eur || 0);

                    // Count by status
                    switch (schedule.status) {
                        case 'delivered':
                            dayData.completed_deliveries++;
                            break;
                        case 'scheduled':
                        case 'confirmed':
                            dayData.scheduled_deliveries++;
                            break;
                        case 'in_progress':
                            dayData.in_progress_deliveries++;
                            break;
                        case 'missed':
                            dayData.missed_deliveries++;
                            break;
                    }

                    dayData.deliveries.push({
                        id: schedule.id,
                        order_id: schedule.order_id,
                        order_number: schedule.order_number,
                        time_start: schedule.scheduled_time_start,
                        time_end: schedule.scheduled_time_end,
                        status: schedule.status,
                        delivery_type: schedule.delivery_type,
                        contact_person: schedule.contact_person,
                        delivery_fee: 0, // No delivery fee in temp model
                        store_name: schedule.store_name
                    });
                });

                const formattedCalendarData = Object.values(calendarData);

                res.json({
                    success: true,
                    data: {
                        calendar_data: formattedCalendarData,
                        view: 'calendar'
                    }
                });

            } else {
                // List view - detailed schedules
                const totalItems = await TempDeliverySchedule.count({ where: whereClause });

                const schedules = await TempDeliverySchedule.findAll({
                    where: whereClause,
                    limit: parseInt(limit),
                    offset: offset,
                    order: [['scheduled_date', 'DESC'], ['scheduled_time_start', 'ASC']]
                });

                res.json({
                    success: true,
                    data: {
                        schedules: schedules.map(schedule => ({
                            ...schedule.toJSON(),
                            // Data is already available in the temp model
                            order: {
                                order_number: schedule.order_number,
                                total_amount_eur: 0, // Not available in temp model
                                status: 'pending' // Default status
                            },
                            store: {
                                name: schedule.store_name,
                                address: null, // Not available
                                phone: null // Not available
                            }
                        })),
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
        const transaction = await sequelize.transaction();

        try {
            const {
                order_id,
                distributor_id,
                scheduled_date,
                scheduled_time_start,
                scheduled_time_end,
                time_slot = 'morning',
                delivery_type = 'standard',
                priority = 'normal',
                delivery_address,
                delivery_instructions,
                contact_person,
                contact_phone,
                contact_email,
                delivery_fee_eur = 0,
                delivery_fee_syp = 0,
                confirmation_required = false
            } = req.body;

            // Validation
            if (!order_id || !scheduled_date || !scheduled_time_start) {
                return res.status(400).json({
                    success: false,
                    message: 'معرف الطلب وتاريخ ووقت التسليم مطلوبان'
                });
            }

            // Check if order exists and can be scheduled
            const order = await Order.findOne({
                where: {
                    id: order_id,
                    status: ['confirmed', 'processing', 'ready', 'prepared']
                },
                include: [
                    {
                        model: Store,
                        as: 'store',
                        attributes: ['name', 'address', 'phone', 'gps_coordinates']
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'الطلب غير موجود أو لا يمكن جدولة تسليمه'
                });
            }

            // Check for existing active schedule
            const existingSchedule = await DeliverySchedule.findOne({
                where: {
                    order_id: order_id,
                    status: ['scheduled', 'confirmed', 'in_progress']
                }
            });

            if (existingSchedule) {
                return res.status(409).json({
                    success: false,
                    message: 'يوجد جدولة نشطة للطلب مسبقاً'
                });
            }

            // Validate time slot availability
            const conflictingSchedules = await DeliverySchedule.checkTimeSlotAvailability(
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

            // Create delivery schedule
            const scheduleData = {
                order_id,
                distributor_id,
                scheduled_date,
                scheduled_time_start,
                scheduled_time_end,
                time_slot,
                delivery_type,
                priority,
                delivery_address: delivery_address || order.store?.address,
                delivery_instructions,
                contact_person,
                contact_phone,
                contact_email,
                delivery_fee_eur,
                delivery_fee_syp,
                confirmation_required,
                created_by: req.user?.id
            };

            // Generate confirmation token if required
            if (confirmation_required) {
                scheduleData.confirmation_token = crypto.randomBytes(32).toString('hex');
            }

            const deliverySchedule = await DeliverySchedule.create(scheduleData, { transaction });

            // Update delivery capacity
            await DeliveryCapacity.updateCapacityForSchedule({
                capacity_date: scheduled_date,
                time_slot: time_slot
            }, 'increment');

            // Update order delivery date
            if (order.delivery_date !== scheduled_date) {
                await order.update({
                    delivery_date: scheduled_date
                }, { transaction });
            }

            // Create tracking record if distributor assigned
            if (distributor_id) {
                await DeliveryTracking.createFromSchedule(deliverySchedule, distributor_id);
            }

            await transaction.commit();

            // Fetch complete schedule data
            const createdSchedule = await DeliverySchedule.findByPk(deliverySchedule.id, {
                include: [
                    {
                        model: Order,
                        as: 'order',
                        include: [{ model: Store, as: 'store' }]
                    },
                    { model: User, as: 'distributor' }
                ]
            });

            res.status(201).json({
                success: true,
                message: 'تم إنشاء جدولة التسليم بنجاح',
                data: createdSchedule
            });

        } catch (error) {
            await transaction.rollback();
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

            // Get capacity data for the date range
            const capacityData = await DeliveryCapacity.getCapacityForDateRange(dateFrom, dateTo);

            // Get current bookings from delivery schedules
            const whereClause = {
                scheduled_date: {
                    [Op.between]: [dateFrom, dateTo]
                },
                status: {
                    [Op.ne]: 'rescheduled'
                }
            };

            if (time_slot) {
                whereClause.time_slot = time_slot;
            }

            const schedules = await DeliverySchedule.findAll({
                where: whereClause,
                attributes: [
                    'scheduled_date',
                    'time_slot',
                    'status',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['scheduled_date', 'time_slot', 'status']
            });

            // Build capacity summary
            const capacitySummary = {};

            // Initialize with existing capacity records
            capacityData.forEach(capacity => {
                const dateKey = capacity.capacity_date;
                if (!capacitySummary[dateKey]) {
                    capacitySummary[dateKey] = {};
                }
                capacitySummary[dateKey][capacity.time_slot] = {
                    scheduled_date: capacity.capacity_date,
                    time_slot: capacity.time_slot,
                    max_capacity: capacity.max_deliveries,
                    scheduled_deliveries: capacity.current_bookings,
                    completed_deliveries: 0,
                    pending_deliveries: 0,
                    available_slots: capacity.available_capacity,
                    capacity_percentage: capacity.capacity_percentage
                };
            });

            // Update with actual schedule counts
            schedules.forEach(schedule => {
                const dateKey = schedule.scheduled_date;
                const slot = schedule.time_slot;

                if (!capacitySummary[dateKey]) {
                    capacitySummary[dateKey] = {};
                }
                if (!capacitySummary[dateKey][slot]) {
                    capacitySummary[dateKey][slot] = {
                        scheduled_date: dateKey,
                        time_slot: slot,
                        max_capacity: parseInt(max_deliveries_per_slot),
                        scheduled_deliveries: 0,
                        completed_deliveries: 0,
                        pending_deliveries: 0,
                        available_slots: parseInt(max_deliveries_per_slot),
                        capacity_percentage: 0
                    };
                }

                const capacitySlot = capacitySummary[dateKey][slot];
                const count = parseInt(schedule.get('count'));

                if (schedule.status === 'delivered') {
                    capacitySlot.completed_deliveries += count;
                } else if (['scheduled', 'confirmed'].includes(schedule.status)) {
                    capacitySlot.pending_deliveries += count;
                }

                capacitySlot.scheduled_deliveries = capacitySlot.pending_deliveries + capacitySlot.completed_deliveries;
                capacitySlot.available_slots = capacitySlot.max_capacity - capacitySlot.scheduled_deliveries;
                capacitySlot.capacity_percentage = capacitySlot.max_capacity > 0
                    ? (capacitySlot.scheduled_deliveries / capacitySlot.max_capacity) * 100
                    : 0;
            });

            // Flatten the summary
            const flatCapacityData = [];
            Object.values(capacitySummary).forEach(dateSlots => {
                Object.values(dateSlots).forEach(slotData => {
                    flatCapacityData.push(slotData);
                });
            });

            // Get suggested available slots
            const suggestedSlots = [];
            const timeSlots = ['morning', 'afternoon', 'evening'];

            // Generate date range for suggestions
            const currentDate = new Date(dateFrom);
            const endDate = new Date(dateTo);

            while (currentDate <= endDate) {
                const dateString = currentDate.toISOString().split('T')[0];

                timeSlots.forEach(slot => {
                    const capacity = capacitySummary[dateString]?.[slot] || {
                        max_capacity: parseInt(max_deliveries_per_slot),
                        scheduled_deliveries: 0
                    };

                    const availableCapacity = capacity.max_capacity - capacity.scheduled_deliveries;

                    if (availableCapacity > 0) {
                        const timeSlotTimes = {
                            morning: { start: '09:00:00', end: '12:00:00' },
                            afternoon: { start: '14:00:00', end: '17:00:00' },
                            evening: { start: '18:00:00', end: '21:00:00' }
                        };

                        suggestedSlots.push({
                            suggested_date: dateString,
                            suggested_time_slot: slot,
                            start_time: timeSlotTimes[slot].start,
                            end_time: timeSlotTimes[slot].end,
                            current_bookings: capacity.scheduled_deliveries,
                            available_capacity: availableCapacity
                        });
                    }
                });

                currentDate.setDate(currentDate.getDate() + 1);
            }

            // Sort and limit suggestions
            suggestedSlots.sort((a, b) => {
                if (a.suggested_date !== b.suggested_date) {
                    return a.suggested_date.localeCompare(b.suggested_date);
                }
                const slotOrder = { morning: 1, afternoon: 2, evening: 3 };
                return slotOrder[a.suggested_time_slot] - slotOrder[b.suggested_time_slot];
            });

            res.json({
                success: true,
                data: {
                    period: {
                        from: dateFrom,
                        to: dateTo
                    },
                    capacity_data: flatCapacityData.sort((a, b) => {
                        if (a.scheduled_date !== b.scheduled_date) {
                            return a.scheduled_date.localeCompare(b.scheduled_date);
                        }
                        const slotOrder = { morning: 1, afternoon: 2, evening: 3 };
                        return slotOrder[a.time_slot] - slotOrder[b.time_slot];
                    }),
                    suggested_slots: suggestedSlots.slice(0, 20),
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
     * Get live delivery tracking
     * GET /api/delivery/tracking/live
     */
    static async getLiveDeliveryTracking(req, res) {
        try {
            const { date, distributor_id } = req.query;
            const trackingDate = date || new Date().toISOString().split('T')[0];

            const liveTracking = await DeliveryTracking.getLiveTracking(trackingDate, distributor_id);

            res.json({
                success: true,
                data: {
                    tracking_date: trackingDate,
                    active_deliveries: liveTracking,
                    summary: {
                        total_active: liveTracking.length,
                        en_route: liveTracking.filter(t => t.status === 'en_route').length,
                        arrived: liveTracking.filter(t => t.status === 'arrived').length,
                        delivering: liveTracking.filter(t => t.status === 'delivering').length,
                        avg_progress: liveTracking.length > 0
                            ? liveTracking.reduce((sum, t) => sum + t.progress_percentage, 0) / liveTracking.length
                            : 0
                    }
                }
            });

        } catch (error) {
            logger.error('Error fetching live delivery tracking:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب التتبع المباشر',
                error: error.message
            });
        }
    }

    /**
     * Update delivery tracking status
     * PUT /api/delivery/tracking/:id/status
     */
    static async updateDeliveryTrackingStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, location, notes, issues } = req.body;

            const tracking = await DeliveryTracking.findByPk(id);
            if (!tracking) {
                return res.status(404).json({
                    success: false,
                    message: 'سجل التتبع غير موجود'
                });
            }

            const updateData = {};
            if (notes) updateData.delivery_notes = notes;
            if (issues) updateData.issues_encountered = issues;

            await tracking.updateStatus(status, updateData);

            if (location) {
                await tracking.updateLocation(location);
            }

            res.json({
                success: true,
                message: 'تم تحديث حالة التتبع بنجاح',
                data: tracking
            });

        } catch (error) {
            logger.error('Error updating delivery tracking:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تحديث التتبع',
                error: error.message
            });
        }
    }

    /**
     * Get delivery schedule analytics
     * GET /api/delivery/schedules/analytics
     */
    static async getDeliveryAnalytics(req, res) {
        try {
            const { date_from, date_to, distributor_id } = req.query;

            const dateFrom = date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const dateTo = date_to || new Date().toISOString().split('T')[0];

            const whereClause = {
                scheduled_date: {
                    [Op.between]: [dateFrom, dateTo]
                }
            };

            if (distributor_id) {
                whereClause.distributor_id = distributor_id;
            }

            // Get overall stats
            const totalSchedules = await DeliverySchedule.count({ where: whereClause });
            const deliveredSchedules = await DeliverySchedule.count({
                where: { ...whereClause, status: 'delivered' }
            });
            const missedSchedules = await DeliverySchedule.count({
                where: { ...whereClause, status: 'missed' }
            });
            const rescheduledSchedules = await DeliverySchedule.count({
                where: { ...whereClause, status: 'rescheduled' }
            });

            const completionRate = totalSchedules > 0 ? (deliveredSchedules / totalSchedules) * 100 : 0;
            const missedRate = totalSchedules > 0 ? (missedSchedules / totalSchedules) * 100 : 0;
            const rescheduleRate = totalSchedules > 0 ? (rescheduledSchedules / totalSchedules) * 100 : 0;

            // Get revenue stats
            const revenueStats = await DeliverySchedule.findAll({
                where: whereClause,
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('delivery_fee_eur')), 'total_revenue_eur'],
                    [sequelize.fn('SUM', sequelize.col('delivery_fee_syp')), 'total_revenue_syp'],
                    [sequelize.fn('AVG', sequelize.col('delivery_fee_eur')), 'avg_fee_eur']
                ],
                raw: true
            });

            // Get time slot performance
            const timeSlotStats = await DeliverySchedule.findAll({
                where: whereClause,
                attributes: [
                    'time_slot',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'total_count'],
                    [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'delivered' THEN 1 END")), 'delivered_count']
                ],
                group: ['time_slot'],
                raw: true
            });

            // Get daily trend
            const dailyTrend = await DeliverySchedule.findAll({
                where: whereClause,
                attributes: [
                    'scheduled_date',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'total_schedules'],
                    [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'delivered' THEN 1 END")), 'delivered_schedules'],
                    [sequelize.fn('SUM', sequelize.col('delivery_fee_eur')), 'daily_revenue']
                ],
                group: ['scheduled_date'],
                order: [['scheduled_date', 'ASC']],
                raw: true
            });

            res.json({
                success: true,
                data: {
                    period: { from: dateFrom, to: dateTo },
                    overall_stats: {
                        total_schedules: totalSchedules,
                        delivered_schedules: deliveredSchedules,
                        missed_schedules: missedSchedules,
                        rescheduled_schedules: rescheduledSchedules,
                        completion_rate: Math.round(completionRate * 100) / 100,
                        missed_rate: Math.round(missedRate * 100) / 100,
                        reschedule_rate: Math.round(rescheduleRate * 100) / 100,
                        total_revenue_eur: parseFloat(revenueStats[0]?.total_revenue_eur || 0),
                        total_revenue_syp: parseFloat(revenueStats[0]?.total_revenue_syp || 0),
                        avg_fee_eur: parseFloat(revenueStats[0]?.avg_fee_eur || 0)
                    },
                    time_slot_performance: timeSlotStats.map(stat => ({
                        time_slot: stat.time_slot,
                        total_count: parseInt(stat.total_count),
                        delivered_count: parseInt(stat.delivered_count),
                        success_rate: stat.total_count > 0
                            ? Math.round((stat.delivered_count / stat.total_count) * 100 * 100) / 100
                            : 0
                    })),
                    daily_trend: dailyTrend.map(day => ({
                        date: day.scheduled_date,
                        total_schedules: parseInt(day.total_schedules),
                        delivered_schedules: parseInt(day.delivered_schedules),
                        daily_revenue: parseFloat(day.daily_revenue || 0),
                        success_rate: day.total_schedules > 0
                            ? Math.round((day.delivered_schedules / day.total_schedules) * 100 * 100) / 100
                            : 0
                    }))
                }
            });

        } catch (error) {
            logger.error('Error fetching delivery analytics:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب التحليلات',
                error: error.message
            });
        }
    }

    /**
     * Helper method to check time slot availability
     */
    static async checkTimeSlotAvailability(date, startTime, endTime, excludeId = null) {
        try {
            return await DeliverySchedule.checkTimeSlotAvailability(date, startTime, endTime, excludeId);
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