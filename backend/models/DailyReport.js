import db from '../config/database.js';

/**
 * Daily Report Model
 * Handles distributor daily reports and statistics
 */
class DailyReport {

    /**
     * Create a new daily report
     * @param {Object} reportData - Report data
     * @returns {Promise<Object>} Created report
     */
    static async create(reportData) {
        try {
            const {
                distributor_id,
                report_date,
                schedule_id,
                total_stores_visited,
                total_amount_delivered,
                total_amount_collected,
                total_gifts_given,
                vehicle_expenses,
                notes,
                expenses
            } = reportData;

            const [result] = await db.execute(`
                INSERT INTO daily_reports (
                    distributor_id,
                    report_date,
                    schedule_id,
                    total_stores_visited,
                    total_amount_delivered,
                    total_amount_collected,
                    total_gifts_given,
                    vehicle_expenses,
                    notes,
                    expenses,
                    status,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', NOW(), NOW())
            `, [
                distributor_id,
                report_date,
                schedule_id,
                total_stores_visited,
                total_amount_delivered,
                total_amount_collected,
                total_gifts_given,
                vehicle_expenses,
                notes,
                JSON.stringify(expenses || {})
            ]);

            return this.findById(result.insertId);
        } catch (error) {
            console.error('Error creating daily report:', error);
            throw new Error('خطأ في إنشاء التقرير اليومي');
        }
    }

    /**
     * Find report by ID
     * @param {number} id - Report ID
     * @returns {Promise<Object|null>} Report data
     */
    static async findById(id) {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    dr.*,
                    u.full_name as distributor_name,
                    u.email as distributor_email
                FROM daily_reports dr
                JOIN users u ON dr.distributor_id = u.id
                WHERE dr.id = ?
            `, [id]);

            if (rows.length === 0) return null;

            const report = rows[0];
            report.expenses = JSON.parse(report.expenses || '{}');

            return report;
        } catch (error) {
            console.error('Error finding daily report:', error);
            throw new Error('خطأ في البحث عن التقرير');
        }
    }

    /**
     * Get reports by distributor
     * @param {number} distributorId - Distributor ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Reports array
     */
    static async findByDistributor(distributorId, options = {}) {
        try {
            const { date, limit = 10, offset = 0 } = options;

            let whereClause = 'WHERE dr.distributor_id = ?';
            const params = [distributorId];

            if (date) {
                whereClause += ' AND DATE(dr.report_date) = ?';
                params.push(date);
            }

            const [rows] = await db.execute(`
                SELECT 
                    dr.*,
                    u.full_name as distributor_name,
                    u.email as distributor_email
                FROM daily_reports dr
                JOIN users u ON dr.distributor_id = u.id
                ${whereClause}
                ORDER BY dr.report_date DESC, dr.created_at DESC
                LIMIT ? OFFSET ?
            `, [...params, limit, offset]);

            return rows.map(report => ({
                ...report,
                expenses: JSON.parse(report.expenses || '{}')
            }));
        } catch (error) {
            console.error('Error finding reports by distributor:', error);
            throw new Error('خطأ في البحث عن تقارير الموزع');
        }
    }

    /**
     * Update daily report
     * @param {number} id - Report ID
     * @param {number} distributorId - Distributor ID (for ownership check)
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated report
     */
    static async update(id, distributorId, updateData) {
        try {
            // Check ownership
            const existingReport = await this.findById(id);
            if (!existingReport) {
                throw new Error('التقرير غير موجود');
            }

            if (existingReport.distributor_id !== distributorId) {
                throw new Error('غير مصرح لك بتحديث هذا التقرير');
            }

            const {
                total_stores_visited,
                total_amount_delivered,
                total_amount_collected,
                total_gifts_given,
                vehicle_expenses,
                notes,
                expenses
            } = updateData;

            const [result] = await db.execute(`
                UPDATE daily_reports SET
                    total_stores_visited = ?,
                    total_amount_delivered = ?,
                    total_amount_collected = ?,
                    total_gifts_given = ?,
                    vehicle_expenses = ?,
                    notes = ?,
                    expenses = ?,
                    updated_at = NOW()
                WHERE id = ? AND distributor_id = ?
            `, [
                total_stores_visited,
                total_amount_delivered,
                total_amount_collected,
                total_gifts_given,
                vehicle_expenses,
                notes,
                JSON.stringify(expenses || {}),
                id,
                distributorId
            ]);

            if (result.affectedRows === 0) {
                throw new Error('فشل في تحديث التقرير');
            }

            return this.findById(id);
        } catch (error) {
            console.error('Error updating daily report:', error);
            throw error;
        }
    }

    /**
     * Get distributor statistics
     * @param {number} distributorId - Distributor ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Statistics data
     */
    static async getDistributorStatistics(distributorId, options = {}) {
        try {
            const { date_from, date_to } = options;

            let whereClause = 'WHERE dr.distributor_id = ?';
            const params = [distributorId];

            if (date_from && date_to) {
                whereClause += ' AND dr.report_date BETWEEN ? AND ?';
                params.push(date_from, date_to);
            }

            // Get basic statistics
            const [statsRows] = await db.execute(`
                SELECT 
                    COUNT(*) as total_deliveries,
                    COALESCE(SUM(total_amount_delivered), 0) as total_amount_delivered,
                    COALESCE(SUM(total_amount_collected), 0) as total_amount_collected,
                    COALESCE(SUM(vehicle_expenses), 0) as total_expenses,
                    COALESCE(AVG(total_stores_visited), 0) as average_daily_deliveries,
                    COUNT(CASE WHEN total_amount_collected > 0 THEN 1 END) as successful_collections,
                    COUNT(*) as total_reports
                FROM daily_reports dr
                ${whereClause}
            `, params);

            const stats = statsRows[0];

            // Calculate completion rate
            const completionRate = stats.total_reports > 0
                ? (stats.successful_collections / stats.total_reports * 100).toFixed(1)
                : 0;

            // Get recent activity
            const [recentActivity] = await db.execute(`
                SELECT 
                    report_date,
                    total_stores_visited,
                    total_amount_delivered,
                    total_amount_collected
                FROM daily_reports dr
                ${whereClause}
                ORDER BY report_date DESC
                LIMIT 7
            `, params);

            return {
                total_deliveries: stats.total_deliveries,
                total_amount_delivered: parseFloat(stats.total_amount_delivered),
                total_amount_collected: parseFloat(stats.total_amount_collected),
                total_expenses: parseFloat(stats.total_expenses),
                average_daily_deliveries: Math.round(stats.average_daily_deliveries),
                completion_rate: parseFloat(completionRate),
                recent_activity: recentActivity,
                date_range: {
                    from: date_from,
                    to: date_to
                }
            };
        } catch (error) {
            console.error('Error getting distributor statistics:', error);
            throw new Error('خطأ في جلب إحصائيات الموزع');
        }
    }

    /**
     * Get all reports with pagination
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Reports with pagination
     */
    static async getAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                distributor_id,
                date_from,
                date_to,
                status
            } = options;

            const offset = (page - 1) * limit;
            let whereClause = 'WHERE 1=1';
            const params = [];

            if (distributor_id) {
                whereClause += ' AND dr.distributor_id = ?';
                params.push(distributor_id);
            }

            if (date_from && date_to) {
                whereClause += ' AND dr.report_date BETWEEN ? AND ?';
                params.push(date_from, date_to);
            }

            if (status) {
                whereClause += ' AND dr.status = ?';
                params.push(status);
            }

            // Get total count
            const [countRows] = await db.execute(`
                SELECT COUNT(*) as total
                FROM daily_reports dr
                ${whereClause}
            `, params);

            const total = countRows[0].total;

            // Get reports
            const [rows] = await db.execute(`
                SELECT 
                    dr.*,
                    u.full_name as distributor_name,
                    u.email as distributor_email
                FROM daily_reports dr
                JOIN users u ON dr.distributor_id = u.id
                ${whereClause}
                ORDER BY dr.report_date DESC, dr.created_at DESC
                LIMIT ? OFFSET ?
            `, [...params, limit, offset]);

            const reports = rows.map(report => ({
                ...report,
                expenses: JSON.parse(report.expenses || '{}')
            }));

            return {
                reports,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            console.error('Error getting all reports:', error);
            throw new Error('خطأ في جلب التقارير');
        }
    }
}

export default DailyReport; 