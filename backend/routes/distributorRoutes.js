/**
 * Distributor Assignment Routes
 * Routes for distributor management and order assignments
 */

import express from 'express';
import DistributorController from '../controllers/distributorController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// ==============================================
// DISTRIBUTOR MANAGEMENT ROUTES
// ==============================================

// @desc    Get all distributors
// @route   GET /api/distributors
// @access  Private
router.get('/', auth, DistributorController.getDistributors);

// @desc    Get distributor performance analytics
// @route   GET /api/distributors/:id/analytics
// @access  Private
router.get('/:id/analytics', auth, DistributorController.getDistributorAnalytics);

// ==============================================
// DISTRIBUTOR ASSIGNMENT ROUTES
// ==============================================

// @desc    Assign distributor to order(s)
// @route   POST /api/distributors/assign
// @access  Private (Admin/Manager only)
router.post('/assign', auth, authorize(['admin', 'manager']), DistributorController.assignDistributor);

// @desc    Get distributor assignments
// @route   GET /api/distributors/assignments
// @access  Private
router.get('/assignments', auth, DistributorController.getDistributorAssignments);

// @desc    Update assignment status
// @route   PUT /api/distributors/assignments/:id/status
// @access  Private
router.put('/assignments/:id/status', auth, DistributorController.updateAssignmentStatus);

// @desc    Cancel distributor assignment
// @route   DELETE /api/distributors/assignments/:id
// @access  Private (Admin/Manager only)
router.delete('/assignments/:id', auth, authorize(['admin', 'manager']), DistributorController.cancelAssignment);

// ==============================================
// ADDITIONAL DISTRIBUTOR ROUTES
// ==============================================

// @desc    Get available distributors for assignment
// @route   GET /api/distributors/available
// @access  Private
router.get('/available', auth, async (req, res) => {
    try {
        const { default: db } = await import('../config/database.js');
        const { date, exclude_order_id } = req.query;

        let whereClause = "WHERE role IN ('distributor', 'admin') AND status = 'active'";
        const params = [];

        // Get distributors with their current workload
        const query = `
            SELECT 
                u.*,
                COUNT(da.id) as current_assignments,
                COUNT(CASE WHEN da.status = 'in_progress' THEN 1 END) as active_deliveries,
                AVG(CASE 
                    WHEN da.actual_delivery IS NOT NULL AND da.estimated_delivery IS NOT NULL
                    THEN JULIANDAY(da.actual_delivery) - JULIANDAY(da.estimated_delivery)
                END) as avg_delay_days,
                CASE 
                    WHEN COUNT(da.id) < 5 THEN 'available'
                    WHEN COUNT(da.id) < 10 THEN 'busy'
                    ELSE 'overloaded'
                END as availability_status
            FROM users u
            LEFT JOIN distributor_assignments da ON u.id = da.distributor_id 
                AND da.status IN ('assigned', 'in_progress')
                ${date ? 'AND DATE(da.estimated_delivery) = ?' : ''}
            ${whereClause}
            GROUP BY u.id
            ORDER BY 
                CASE availability_status 
                    WHEN 'available' THEN 1
                    WHEN 'busy' THEN 2
                    ELSE 3
                END,
                current_assignments ASC,
                u.name ASC
        `;

        if (date) {
            params.push(date);
        }

        const distributors = await db.all(query, params);

        // Format performance metrics
        const formattedDistributors = distributors.map(distributor => ({
            id: distributor.id,
            name: distributor.name,
            email: distributor.email,
            phone: distributor.phone,
            availability: {
                status: distributor.availability_status,
                current_assignments: distributor.current_assignments || 0,
                active_deliveries: distributor.active_deliveries || 0,
                avg_delay_days: distributor.avg_delay_days || 0
            },
            performance_score: DistributorController.calculateEfficiencyScore(distributor)
        }));

        res.json({
            success: true,
            data: {
                distributors: formattedDistributors,
                date_filter: date || 'all',
                total_available: formattedDistributors.filter(d => d.availability.status === 'available').length
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الموزعين المتاحين',
            error: error.message
        });
    }
});

// @desc    Get distributor assignment history
// @route   GET /api/distributors/:id/history
// @access  Private
router.get('/:id/history', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10, status, date_from, date_to } = req.query;

        const { default: db } = await import('../config/database.js');
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE da.distributor_id = ?';
        const params = [id];

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

        // Get assignment history
        const historyQuery = `
            SELECT 
                da.*,
                o.order_number,
                o.total_amount_eur,
                s.name as store_name,
                s.address as store_address,
                CASE 
                    WHEN da.actual_delivery IS NOT NULL AND da.estimated_delivery IS NOT NULL
                    THEN ROUND(JULIANDAY(da.actual_delivery) - JULIANDAY(da.estimated_delivery), 1)
                    ELSE NULL
                END as delivery_delay_days,
                CASE 
                    WHEN da.status = 'completed' AND da.actual_delivery <= da.estimated_delivery THEN 'on_time'
                    WHEN da.status = 'completed' AND da.actual_delivery > da.estimated_delivery THEN 'delayed'
                    WHEN da.status = 'cancelled' THEN 'cancelled'
                    ELSE 'pending'
                END as performance_status
            FROM distributor_assignments da
            LEFT JOIN orders o ON da.order_id = o.id
            LEFT JOIN stores s ON o.store_id = s.id
            ${whereClause}
            ORDER BY da.assigned_at DESC
            LIMIT ? OFFSET ?
        `;

        const history = await db.all(historyQuery, [...params, limit, offset]);

        res.json({
            success: true,
            data: {
                history: history.map(item => ({
                    ...item,
                    vehicle_info: item.vehicle_info ? JSON.parse(item.vehicle_info) : null,
                    route_info: item.route_info ? JSON.parse(item.route_info) : null
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalItems / limit),
                    totalItems,
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب سجل التعيينات',
            error: error.message
        });
    }
});

// @desc    Bulk assign distributors to multiple orders
// @route   POST /api/distributors/assign-bulk
// @access  Private (Admin/Manager only)
router.post('/assign-bulk', auth, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { assignments } = req.body; // Array of {order_id, distributor_id, estimated_delivery, notes}

        if (!Array.isArray(assignments) || assignments.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'مصفوفة التعيينات مطلوبة'
            });
        }

        const results = {
            total_assignments: assignments.length,
            successful_assignments: 0,
            failed_assignments: 0,
            errors: []
        };

        // Process each assignment using the existing assign method
        for (const assignment of assignments) {
            try {
                const tempReq = {
                    body: {
                        order_ids: [assignment.order_id],
                        distributor_id: assignment.distributor_id,
                        estimated_delivery: assignment.estimated_delivery,
                        delivery_priority: assignment.delivery_priority || 'normal',
                        notes: assignment.notes,
                        vehicle_info: assignment.vehicle_info,
                        route_info: assignment.route_info
                    },
                    user: req.user
                };

                const tempRes = {
                    json: (data) => data,
                    status: (code) => ({ json: (data) => ({ ...data, statusCode: code }) })
                };

                await DistributorController.assignDistributor(tempReq, tempRes);
                results.successful_assignments++;

            } catch (error) {
                results.errors.push(`الطلب ${assignment.order_id}: ${error.message}`);
                results.failed_assignments++;
            }
        }

        res.json({
            success: true,
            message: `تم تعيين ${results.successful_assignments} من ${results.total_assignments} طلب بنجاح`,
            data: results
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في التعيين المجمع للموزعين',
            error: error.message
        });
    }
});

// @desc    Get distributor workload calendar
// @route   GET /api/distributors/:id/calendar
// @access  Private
router.get('/:id/calendar', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { month, year } = req.query;

        const { default: db } = await import('../config/database.js');

        // Set default month/year if not provided
        const currentDate = new Date();
        const targetMonth = month || (currentDate.getMonth() + 1);
        const targetYear = year || currentDate.getFullYear();

        // Get calendar data for the specified month
        const calendarQuery = `
            SELECT 
                DATE(da.estimated_delivery) as date,
                COUNT(*) as total_assignments,
                COUNT(CASE WHEN da.status = 'assigned' THEN 1 END) as scheduled_assignments,
                COUNT(CASE WHEN da.status = 'in_progress' THEN 1 END) as in_progress_assignments,
                COUNT(CASE WHEN da.status = 'completed' THEN 1 END) as completed_assignments,
                GROUP_CONCAT(
                    json_object(
                        'id', da.id,
                        'order_id', da.order_id,
                        'order_number', o.order_number,
                        'estimated_delivery', da.estimated_delivery,
                        'status', da.status,
                        'store_name', s.name,
                        'total_amount', o.total_amount_eur
                    )
                ) as assignments_data
            FROM distributor_assignments da
            LEFT JOIN orders o ON da.order_id = o.id
            LEFT JOIN stores s ON o.store_id = s.id
            WHERE da.distributor_id = ?
                AND strftime('%Y', da.estimated_delivery) = ?
                AND strftime('%m', da.estimated_delivery) = ?
            GROUP BY DATE(da.estimated_delivery)
            ORDER BY date ASC
        `;

        const calendarData = await db.all(calendarQuery, [
            id,
            targetYear.toString(),
            targetMonth.toString().padStart(2, '0')
        ]);

        // Parse assignments data for each date
        const formattedCalendarData = calendarData.map(item => ({
            ...item,
            assignments: item.assignments_data ?
                item.assignments_data.split(',').map(assignment => JSON.parse(assignment)) : []
        }));

        res.json({
            success: true,
            data: {
                distributor_id: id,
                month: parseInt(targetMonth),
                year: parseInt(targetYear),
                calendar_data: formattedCalendarData
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب تقويم الموزع',
            error: error.message
        });
    }
});

export default router; 