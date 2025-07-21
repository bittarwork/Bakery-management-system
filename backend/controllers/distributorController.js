/**
 * Distributor Assignment Controller
 * Handles distributor management and order assignments
 * Phase 6 - Complete Order Management
 */

import sequelize, { QueryTypes } from '../config/database.js';
import logger from '../config/logger.js';

// Database helper functions to convert SQLite calls to Sequelize
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

class DistributorController {
    /**
     * Get all available distributors
     * GET /api/distributors
     */
    static async getDistributors(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                status = 'active',
                search
            } = req.query;

            const offset = (page - 1) * limit;
            let whereClause = "WHERE role IN ('distributor', 'admin')";
            const params = [];

            if (status) {
                whereClause += ' AND status = ?';
                params.push(status);
            }

            if (search) {
                whereClause += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            // Get total count
            const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
            const countResult = await db.get(countQuery, params);
            const totalItems = countResult.total;

            // Get distributors with their current assignments
            const distributorsQuery = `
                SELECT 
                    u.*,
                    COUNT(da.id) as active_assignments,
                    COUNT(CASE WHEN da.status = 'completed' THEN 1 END) as completed_deliveries,
                    AVG(CASE 
                        WHEN da.actual_delivery IS NOT NULL AND da.estimated_delivery IS NOT NULL
                        THEN JULIANDAY(da.actual_delivery) - JULIANDAY(da.estimated_delivery)
                    END) as avg_delivery_delay_days
                FROM users u
                LEFT JOIN distributor_assignments da ON u.id = da.distributor_id 
                    AND da.created_at >= date('now', '-30 days')
                ${whereClause}
                GROUP BY u.id
                ORDER BY u.name
                LIMIT ? OFFSET ?
            `;

            const distributors = await db.all(distributorsQuery, [...params, limit, offset]);

            // Format the results
            const formattedDistributors = distributors.map(distributor => ({
                ...distributor,
                performance_metrics: {
                    active_assignments: distributor.active_assignments || 0,
                    completed_deliveries: distributor.completed_deliveries || 0,
                    avg_delivery_delay_days: distributor.avg_delivery_delay_days || 0,
                    efficiency_score: DistributorController.calculateEfficiencyScore(distributor)
                }
            }));

            res.json({
                success: true,
                data: {
                    distributors: formattedDistributors,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(totalItems / limit),
                        totalItems,
                        itemsPerPage: parseInt(limit)
                    }
                }
            });

        } catch (error) {
            logger.error('Error fetching distributors:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب الموزعين',
                error: error.message
            });
        }
    }

    /**
     * Assign distributor to order(s)
     * POST /api/distributors/assign
     */
    static async assignDistributor(req, res) {
        const db_transaction = await db.beginTransaction();

        try {
            const {
                order_ids, // Array of order IDs or single order ID
                distributor_id,
                estimated_delivery,
                delivery_priority = 'normal',
                notes,
                vehicle_info,
                route_info
            } = req.body;

            // Validation
            if (!order_ids || !distributor_id) {
                return res.status(400).json({
                    success: false,
                    message: 'معرف الطلب والموزع مطلوبان'
                });
            }

            // Ensure order_ids is an array
            const orderIds = Array.isArray(order_ids) ? order_ids : [order_ids];

            // Validate distributor exists and has correct role
            const distributor = await db.get(
                "SELECT * FROM users WHERE id = ? AND role IN ('distributor', 'admin')",
                [distributor_id]
            );

            if (!distributor) {
                return res.status(404).json({
                    success: false,
                    message: 'الموزع غير موجود أو غير مخول للتوزيع'
                });
            }

            const results = {
                total_assignments: orderIds.length,
                successful_assignments: 0,
                failed_assignments: 0,
                errors: []
            };

            for (const order_id of orderIds) {
                try {
                    // Check if order exists and can be assigned
                    const order = await db.get(
                        "SELECT * FROM orders WHERE id = ? AND status IN ('confirmed', 'processing')",
                        [order_id]
                    );

                    if (!order) {
                        results.errors.push(`الطلب ${order_id} غير موجود أو لا يمكن تعيين موزع له`);
                        results.failed_assignments++;
                        continue;
                    }

                    // Check if order is already assigned
                    const existingAssignment = await db.get(
                        'SELECT * FROM distributor_assignments WHERE order_id = ? AND status IN ("assigned", "in_progress")',
                        [order_id]
                    );

                    if (existingAssignment) {
                        // Update existing assignment
                        await db.run(`
                            UPDATE distributor_assignments 
                            SET distributor_id = ?, 
                                estimated_delivery = ?,
                                delivery_priority = ?,
                                notes = ?,
                                vehicle_info = ?,
                                route_info = ?,
                                assigned_by = ?,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = ?
                        `, [
                            distributor_id,
                            estimated_delivery,
                            delivery_priority,
                            notes,
                            vehicle_info ? JSON.stringify(vehicle_info) : null,
                            route_info ? JSON.stringify(route_info) : null,
                            req.user?.id,
                            existingAssignment.id
                        ]);
                    } else {
                        // Create new assignment
                        await db.run(`
                            INSERT INTO distributor_assignments 
                            (order_id, distributor_id, estimated_delivery, delivery_priority, 
                             notes, vehicle_info, route_info, assigned_by)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        `, [
                            order_id,
                            distributor_id,
                            estimated_delivery,
                            delivery_priority,
                            notes,
                            vehicle_info ? JSON.stringify(vehicle_info) : null,
                            route_info ? JSON.stringify(route_info) : null,
                            req.user?.id
                        ]);
                    }

                    // Update order status if needed
                    await db.run(
                        "UPDATE orders SET status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'confirmed'",
                        [order_id]
                    );

                    results.successful_assignments++;

                } catch (assignmentError) {
                    logger.error(`Error assigning distributor to order ${order_id}:`, assignmentError);
                    results.errors.push(`خطأ في تعيين الموزع للطلب ${order_id}: ${assignmentError.message}`);
                    results.failed_assignments++;
                }
            }

            await db_transaction.commit();

            res.json({
                success: true,
                message: `تم تعيين الموزع لـ ${results.successful_assignments} من ${results.total_assignments} طلب بنجاح`,
                data: results
            });

        } catch (error) {
            await db_transaction.rollback();
            logger.error('Error assigning distributor:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تعيين الموزع',
                error: error.message
            });
        }
    }

    /**
     * Get distributor assignments
     * GET /api/distributors/assignments
     */
    static async getDistributorAssignments(req, res) {
        try {
            const {
                distributor_id,
                order_id,
                status,
                date_from,
                date_to,
                page = 1,
                limit = 10
            } = req.query;

            const offset = (page - 1) * limit;
            let whereClause = 'WHERE 1=1';
            const params = [];

            if (distributor_id) {
                whereClause += ' AND da.distributor_id = ?';
                params.push(distributor_id);
            }

            if (order_id) {
                whereClause += ' AND da.order_id = ?';
                params.push(order_id);
            }

            if (status) {
                whereClause += ' AND da.status = ?';
                params.push(status);
            }

            if (date_from) {
                whereClause += ' AND da.assigned_at >= ?';
                params.push(date_from);
            }

            if (date_to) {
                whereClause += ' AND da.assigned_at <= ?';
                params.push(date_to + ' 23:59:59');
            }

            // Get total count
            const countQuery = `SELECT COUNT(*) as total FROM distributor_assignments da ${whereClause}`;
            const countResult = await db.get(countQuery, params);
            const totalItems = countResult.total;

            // Get assignments with related data
            const assignmentsQuery = `
                SELECT 
                    da.*,
                    o.order_number,
                    o.total_amount_eur,
                    o.status as order_status,
                    o.delivery_date as order_delivery_date,
                    d.name as distributor_name,
                    d.phone as distributor_phone,
                    d.email as distributor_email,
                    s.name as store_name,
                    s.address as store_address,
                    ab.name as assigned_by_name,
                    CASE 
                        WHEN da.actual_delivery IS NOT NULL AND da.estimated_delivery IS NOT NULL
                        THEN ROUND(JULIANDAY(da.actual_delivery) - JULIANDAY(da.estimated_delivery), 1)
                        ELSE NULL
                    END as delivery_delay_days
                FROM distributor_assignments da
                LEFT JOIN orders o ON da.order_id = o.id
                LEFT JOIN users d ON da.distributor_id = d.id
                LEFT JOIN stores s ON o.store_id = s.id
                LEFT JOIN users ab ON da.assigned_by = ab.id
                ${whereClause}
                ORDER BY da.assigned_at DESC
                LIMIT ? OFFSET ?
            `;

            const assignments = await db.all(assignmentsQuery, [...params, limit, offset]);

            // Parse JSON fields and format data
            const formattedAssignments = assignments.map(assignment => ({
                ...assignment,
                vehicle_info: assignment.vehicle_info ? JSON.parse(assignment.vehicle_info) : null,
                route_info: assignment.route_info ? JSON.parse(assignment.route_info) : null,
                performance: {
                    is_delayed: assignment.delivery_delay_days > 0,
                    delay_days: assignment.delivery_delay_days || 0,
                    status_label: DistributorController.getAssignmentStatusLabel(assignment.status)
                }
            }));

            res.json({
                success: true,
                data: {
                    assignments: formattedAssignments,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(totalItems / limit),
                        totalItems,
                        itemsPerPage: parseInt(limit)
                    }
                }
            });

        } catch (error) {
            logger.error('Error fetching distributor assignments:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب تعيينات الموزعين',
                error: error.message
            });
        }
    }

    /**
     * Update assignment status
     * PUT /api/distributors/assignments/:id/status
     */
    static async updateAssignmentStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, actual_delivery, notes } = req.body;

            const validStatuses = ['assigned', 'in_progress', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'حالة التعيين غير صالحة'
                });
            }

            // Get current assignment
            const assignment = await db.get(
                'SELECT * FROM distributor_assignments WHERE id = ?',
                [id]
            );

            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: 'التعيين غير موجود'
                });
            }

            // Update assignment
            const updateFields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
            const updateParams = [status];

            if (actual_delivery) {
                updateFields.push('actual_delivery = ?');
                updateParams.push(actual_delivery);
            }

            if (notes) {
                updateFields.push('notes = ?');
                updateParams.push(notes);
            }

            updateParams.push(id);

            await db.run(
                `UPDATE distributor_assignments SET ${updateFields.join(', ')} WHERE id = ?`,
                updateParams
            );

            // Update order status based on assignment status
            if (status === 'completed') {
                await db.run(
                    "UPDATE orders SET status = 'delivered', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    [assignment.order_id]
                );
            } else if (status === 'in_progress') {
                await db.run(
                    "UPDATE orders SET status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    [assignment.order_id]
                );
            }

            // Get updated assignment
            const updatedAssignment = await db.get(
                `SELECT da.*, o.order_number, d.name as distributor_name
                 FROM distributor_assignments da
                 LEFT JOIN orders o ON da.order_id = o.id
                 LEFT JOIN users d ON da.distributor_id = d.id
                 WHERE da.id = ?`,
                [id]
            );

            res.json({
                success: true,
                message: 'تم تحديث حالة التعيين بنجاح',
                data: updatedAssignment
            });

        } catch (error) {
            logger.error('Error updating assignment status:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تحديث حالة التعيين',
                error: error.message
            });
        }
    }

    /**
     * Get distributor performance analytics
     * GET /api/distributors/:id/analytics
     */
    static async getDistributorAnalytics(req, res) {
        try {
            const { id } = req.params;
            const { date_from, date_to } = req.query;

            // Set default date range (last 30 days)
            const dateFrom = date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const dateTo = date_to || new Date().toISOString().split('T')[0];

            // Get distributor info
            const distributor = await db.get(
                "SELECT * FROM users WHERE id = ? AND role IN ('distributor', 'admin')",
                [id]
            );

            if (!distributor) {
                return res.status(404).json({
                    success: false,
                    message: 'الموزع غير موجود'
                });
            }

            // Get performance metrics
            const metricsQuery = `
                SELECT 
                    COUNT(*) as total_assignments,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_assignments,
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_assignments,
                    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_assignments,
                    AVG(CASE 
                        WHEN actual_delivery IS NOT NULL AND estimated_delivery IS NOT NULL
                        THEN JULIANDAY(actual_delivery) - JULIANDAY(estimated_delivery)
                    END) as avg_delivery_delay_days,
                    COUNT(CASE 
                        WHEN actual_delivery IS NOT NULL AND estimated_delivery IS NOT NULL
                        AND JULIANDAY(actual_delivery) <= JULIANDAY(estimated_delivery)
                        THEN 1 
                    END) as on_time_deliveries
                FROM distributor_assignments
                WHERE distributor_id = ? AND assigned_at BETWEEN ? AND ?
            `;

            const metrics = await db.get(metricsQuery, [id, dateFrom, dateTo + ' 23:59:59']);

            // Get daily performance
            const dailyPerformanceQuery = `
                SELECT 
                    DATE(assigned_at) as date,
                    COUNT(*) as assignments_count,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
                FROM distributor_assignments
                WHERE distributor_id = ? AND assigned_at BETWEEN ? AND ?
                GROUP BY DATE(assigned_at)
                ORDER BY date DESC
            `;

            const dailyPerformance = await db.all(dailyPerformanceQuery, [id, dateFrom, dateTo + ' 23:59:59']);

            // Get recent assignments
            const recentAssignmentsQuery = `
                SELECT 
                    da.*, o.order_number, o.total_amount_eur, s.name as store_name
                FROM distributor_assignments da
                LEFT JOIN orders o ON da.order_id = o.id
                LEFT JOIN stores s ON o.store_id = s.id
                WHERE da.distributor_id = ? AND da.assigned_at BETWEEN ? AND ?
                ORDER BY da.assigned_at DESC
                LIMIT 10
            `;

            const recentAssignments = await db.all(recentAssignmentsQuery, [id, dateFrom, dateTo + ' 23:59:59']);

            // Calculate performance score
            const completionRate = metrics.total_assignments > 0 ?
                (metrics.completed_assignments / metrics.total_assignments) * 100 : 0;

            const onTimeRate = metrics.completed_assignments > 0 ?
                (metrics.on_time_deliveries / metrics.completed_assignments) * 100 : 0;

            const performanceScore = Math.round((completionRate * 0.6) + (onTimeRate * 0.4));

            res.json({
                success: true,
                data: {
                    distributor: {
                        id: distributor.id,
                        name: distributor.name,
                        email: distributor.email,
                        phone: distributor.phone
                    },
                    period: {
                        from: dateFrom,
                        to: dateTo
                    },
                    metrics: {
                        ...metrics,
                        completion_rate: completionRate,
                        on_time_rate: onTimeRate,
                        performance_score: performanceScore,
                        avg_delivery_delay_days: metrics.avg_delivery_delay_days || 0
                    },
                    daily_performance: dailyPerformance,
                    recent_assignments: recentAssignments.map(assignment => ({
                        ...assignment,
                        vehicle_info: assignment.vehicle_info ? JSON.parse(assignment.vehicle_info) : null,
                        route_info: assignment.route_info ? JSON.parse(assignment.route_info) : null
                    }))
                }
            });

        } catch (error) {
            logger.error('Error fetching distributor analytics:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب تحليلات الموزع',
                error: error.message
            });
        }
    }

    /**
     * Cancel distributor assignment
     * DELETE /api/distributors/assignments/:id
     */
    static async cancelAssignment(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const assignment = await db.get(
                'SELECT * FROM distributor_assignments WHERE id = ?',
                [id]
            );

            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: 'التعيين غير موجود'
                });
            }

            if (assignment.status === 'completed') {
                return res.status(400).json({
                    success: false,
                    message: 'لا يمكن إلغاء تعيين مكتمل'
                });
            }

            // Update assignment status to cancelled
            await db.run(
                'UPDATE distributor_assignments SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                ['cancelled', reason || 'تم إلغاء التعيين', id]
            );

            // Reset order status if needed
            await db.run(
                "UPDATE orders SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'processing'",
                [assignment.order_id]
            );

            res.json({
                success: true,
                message: 'تم إلغاء التعيين بنجاح'
            });

        } catch (error) {
            logger.error('Error cancelling assignment:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في إلغاء التعيين',
                error: error.message
            });
        }
    }

    /**
     * Helper method to calculate efficiency score
     */
    static calculateEfficiencyScore(distributor) {
        const completionRate = distributor.active_assignments > 0 ?
            (distributor.completed_deliveries / distributor.active_assignments) * 100 : 100;

        const timelinessScore = distributor.avg_delivery_delay_days <= 0 ? 100 :
            Math.max(0, 100 - (distributor.avg_delivery_delay_days * 10));

        return Math.round((completionRate * 0.6) + (timelinessScore * 0.4));
    }

    /**
     * Helper method to get assignment status label
     */
    static getAssignmentStatusLabel(status) {
        const labels = {
            'assigned': 'معين',
            'in_progress': 'قيد التنفيذ',
            'completed': 'مكتمل',
            'cancelled': 'ملغي'
        };
        return labels[status] || status;
    }
}

export default DistributorController; 