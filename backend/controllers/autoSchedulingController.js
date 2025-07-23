import smartSchedulingService from '../services/smartSchedulingService.js';
import mysql from 'mysql2/promise';
import logger from '../config/logger.js';

// Database configuration for Railway production
const dbConfig = {
    host: 'shinkansen.proxy.rlwy.net',
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway',
    port: 24785
};

/**
 * Ensure scheduling_drafts table exists
 * Creates the table if it doesn't exist
 */
async function ensureSchedulingDraftsTable(connection) {
    try {
        // Check if table exists
        const [tables] = await connection.execute(`
            SHOW TABLES LIKE 'scheduling_drafts'
        `);

        if (tables.length === 0) {
            logger.info('Creating scheduling_drafts table...');
            
            const createTableQuery = `
                CREATE TABLE scheduling_drafts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    order_id INT NOT NULL,
                    suggested_distributor_id INT NOT NULL,
                    suggested_distributor_name VARCHAR(100) NOT NULL,
                    confidence_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
                    suggested_delivery_date DATE NOT NULL,
                    suggested_priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
                    reasoning JSON,
                    alternative_suggestions JSON,
                    route_optimization JSON,
                    estimated_delivery_time TIME,
                    estimated_duration INT COMMENT 'Duration in minutes',
                    status ENUM('pending_review', 'approved', 'rejected', 'modified') NOT NULL DEFAULT 'pending_review',
                    reviewed_by INT NULL,
                    reviewed_at TIMESTAMP NULL,
                    admin_notes TEXT,
                    modifications JSON,
                    approved_distributor_id INT NULL,
                    approved_delivery_date DATE NULL,
                    approved_priority ENUM('low', 'normal', 'high', 'urgent') NULL,
                    created_by INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    
                    INDEX idx_order_id (order_id),
                    INDEX idx_status (status),
                    INDEX idx_suggested_distributor_id (suggested_distributor_id),
                    INDEX idx_confidence_score (confidence_score),
                    INDEX idx_created_at (created_at),
                    INDEX idx_suggested_delivery_date (suggested_delivery_date),
                    
                    UNIQUE KEY unique_order_draft (order_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `;

            await connection.execute(createTableQuery);
            logger.info('scheduling_drafts table created successfully');
        }
    } catch (error) {
        logger.error('Error ensuring scheduling_drafts table:', error);
        throw error;
    }
}

class AutoSchedulingController {
    /**
     * Get pending scheduling drafts for admin review
     * @route GET /api/auto-scheduling/pending-reviews
     * @access Private (Admin/Manager)
     * @updated 2025-01-23 - Fixed parameter validation and added table creation
     */
    static async getPendingReviews(req, res) {
        let connection;
        try {
            const { page = 1, limit = 10, status = 'pending_review' } = req.query;

            // Ensure parameters are valid integers with proper validation
            const pageNum = Math.max(1, parseInt(page) || 1);
            const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
            const offset = Math.max(0, (pageNum - 1) * limitNum);

            // Validate that all parameters are proper numbers
            if (!Number.isInteger(pageNum) || !Number.isInteger(limitNum) || !Number.isInteger(offset)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid pagination parameters'
                });
            }

            connection = await mysql.createConnection(dbConfig);

            // Ensure table exists
            await ensureSchedulingDraftsTable(connection);

            // Get pending scheduling drafts with related data - Fixed parameter binding
            const query = `
                SELECT 
                    sd.*,
                    IFNULL(o.order_number, '') as order_number,
                    IFNULL(o.total_amount_eur, 0.00) as total_amount_eur,
                    IFNULL(o.total_amount_syp, 0.00) as total_amount_syp,
                    IFNULL(o.order_date, CURDATE()) as order_date,
                    IFNULL(s.name, 'Unknown Store') as store_name,
                    IFNULL(s.address, '') as store_address,
                    IFNULL(s.phone, '') as store_phone,
                    IFNULL(u.full_name, 'Unknown Distributor') as suggested_distributor_full_name,
                    IFNULL(u.phone, '') as distributor_phone,
                    COUNT(*) OVER() as total_count
                FROM scheduling_drafts sd
                LEFT JOIN orders o ON sd.order_id = o.id
                LEFT JOIN stores s ON o.store_id = s.id
                LEFT JOIN users u ON sd.suggested_distributor_id = u.id
                WHERE sd.status = ?
                ORDER BY sd.created_at ASC
                LIMIT ${limitNum} OFFSET ${offset}
            `;

            const [drafts] = await connection.execute(query, [status]);

            // Handle empty result
            if (!drafts || drafts.length === 0) {
                await connection.end();
                return res.json({
                    success: true,
                    data: {
                        drafts: [],
                        pagination: {
                            currentPage: pageNum,
                            totalPages: 0,
                            totalItems: 0,
                            itemsPerPage: limitNum
                        }
                    },
                    message: 'No pending scheduling drafts found'
                });
            }

            // Parse JSON fields safely
            const formattedDrafts = drafts.map(draft => {
                try {
                    return {
                        ...draft,
                        reasoning: draft.reasoning ? (typeof draft.reasoning === 'string' ? JSON.parse(draft.reasoning) : draft.reasoning) : null,
                        alternative_suggestions: draft.alternative_suggestions ?
                            (typeof draft.alternative_suggestions === 'string' ? JSON.parse(draft.alternative_suggestions) : draft.alternative_suggestions) : [],
                        route_optimization: draft.route_optimization ?
                            (typeof draft.route_optimization === 'string' ? JSON.parse(draft.route_optimization) : draft.route_optimization) : null,
                        modifications: draft.modifications ?
                            (typeof draft.modifications === 'string' ? JSON.parse(draft.modifications) : draft.modifications) : null
                    };
                } catch (parseError) {
                    logger.error('Error parsing JSON fields for draft:', parseError);
                    return {
                        ...draft,
                        reasoning: null,
                        alternative_suggestions: [],
                        route_optimization: null,
                        modifications: null
                    };
                }
            });

            const totalCount = drafts.length > 0 ? (drafts[0].total_count || 0) : 0;

            await connection.end();

            res.json({
                success: true,
                data: {
                    drafts: formattedDrafts,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(totalCount / limitNum),
                        totalItems: totalCount,
                        itemsPerPage: limitNum
                    }
                },
                message: `تم جلب ${formattedDrafts.length} مسودة جدولة معلقة`
            });

        } catch (error) {
            logger.error('Error getting pending reviews:', error);

            // Ensure connection is closed even on error
            if (connection) {
                try {
                    await connection.end();
                } catch (closeError) {
                    logger.error('Error closing database connection:', closeError);
                }
            }

            res.status(500).json({
                success: false,
                message: 'خطأ في جلب المسودات المعلقة',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
            });
        }
    }

    /**
     * Get scheduling draft details by ID
     * @route GET /api/auto-scheduling/drafts/:id
     * @access Private (Admin/Manager)
     * @updated 2025-01-23 - Enhanced error handling and fixed ID validation
     */
    static async getSchedulingDraft(req, res) {
        let connection;
        try {
            const { id } = req.params;

            // Validate ID parameter
            const draftId = parseInt(id);
            if (!draftId || draftId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid draft ID provided'
                });
            }

            connection = await mysql.createConnection(dbConfig);

            // Ensure table exists
            await ensureSchedulingDraftsTable(connection);

            // Enhanced query with better error handling for missing data
            const query = `
                SELECT 
                    sd.*,
                    COALESCE(o.order_number, CONCAT('ORDER-', sd.order_id)) as order_number,
                    COALESCE(o.total_amount_eur, 0.00) as total_amount_eur,
                    COALESCE(o.total_amount_syp, 0.00) as total_amount_syp,
                    COALESCE(o.order_date, CURDATE()) as order_date,
                    COALESCE(o.delivery_date, CURDATE()) as requested_delivery_date,
                    COALESCE(o.notes, '') as order_notes,
                    COALESCE(s.name, 'Unknown Store') as store_name,
                    COALESCE(s.address, '') as store_address,
                    COALESCE(s.phone, '') as store_phone,
                    s.gps_coordinates,
                    s.preferred_delivery_time,
                    COALESCE(suggested_dist.full_name, 'Unknown Distributor') as suggested_distributor_name,
                    COALESCE(suggested_dist.phone, '') as suggested_distributor_phone,
                    COALESCE(suggested_dist.email, '') as suggested_distributor_email,
                    COALESCE(suggested_dist.performance_rating, 85) as performance_rating,
                    reviewer.full_name as reviewer_name
                FROM scheduling_drafts sd
                LEFT JOIN orders o ON sd.order_id = o.id
                LEFT JOIN stores s ON o.store_id = s.id
                LEFT JOIN users suggested_dist ON sd.suggested_distributor_id = suggested_dist.id AND suggested_dist.role = 'distributor'
                LEFT JOIN users reviewer ON sd.reviewed_by = reviewer.id
                WHERE sd.id = ?
                LIMIT 1
            `;

            const [results] = await connection.execute(query, [draftId]);

            if (results.length === 0) {
                await connection.end();
                return res.status(404).json({
                    success: false,
                    message: 'مسودة الجدولة غير موجودة'
                });
            }

            const draft = results[0];

            // Parse JSON fields safely with enhanced error handling
            const formattedDraft = {
                ...draft,
                reasoning: this.safeJSONParse(draft.reasoning) || {
                    main_factors: ['تحليل النظام الذكي'],
                    zone_match: true,
                    capacity_available: true,
                    performance_score: 85
                },
                alternative_suggestions: this.safeJSONParse(draft.alternative_suggestions) || [],
                route_optimization: this.safeJSONParse(draft.route_optimization) || {
                    estimated_distance: 'غير محدد',
                    estimated_travel_time: 'غير محدد',
                    suggested_route: 'سيتم تحديده لاحقاً'
                },
                modifications: this.safeJSONParse(draft.modifications) || null,
                gps_coordinates: this.safeJSONParse(draft.gps_coordinates) || null
            };

            // Get alternative distributors details if available
            if (formattedDraft.alternative_suggestions && formattedDraft.alternative_suggestions.length > 0) {
                try {
                    const altIds = formattedDraft.alternative_suggestions
                        .map(alt => alt.distributor_id)
                        .filter(id => id && !isNaN(id));

                    if (altIds.length > 0) {
                        const placeholders = altIds.map(() => '?').join(',');

                        const [altDistributors] = await connection.execute(`
                            SELECT id, full_name, phone, email, 
                                   COALESCE(performance_rating, 85) as performance_rating, 
                                   COALESCE(current_workload, 0) as current_workload
                            FROM users 
                            WHERE id IN (${placeholders}) AND role = 'distributor'
                        `, altIds);

                        // Enhance alternatives with distributor details
                        formattedDraft.alternative_suggestions = formattedDraft.alternative_suggestions.map(alt => {
                            const distributorDetails = altDistributors.find(d => d.id === alt.distributor_id);
                            return {
                                ...alt,
                                distributor_details: distributorDetails || {
                                    id: alt.distributor_id,
                                    full_name: 'Unknown Distributor',
                                    phone: '',
                                    email: '',
                                    performance_rating: 85,
                                    current_workload: 0
                                }
                            };
                        });
                    }
                } catch (altError) {
                    logger.warn('Error loading alternative distributors:', altError);
                    // Continue without alternative details
                }
            }

            await connection.end();

            res.json({
                success: true,
                data: formattedDraft,
                message: 'تم جلب تفاصيل مسودة الجدولة بنجاح'
            });

        } catch (error) {
            logger.error('Error getting scheduling draft:', error);
            
            if (connection) {
                try {
                    await connection.end();
                } catch (closeError) {
                    logger.error('Error closing database connection:', closeError);
                }
            }

            res.status(500).json({
                success: false,
                message: 'خطأ في جلب تفاصيل مسودة الجدولة',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
            });
        }
    }

    /**
     * Approve scheduling draft (with or without modifications)
     * @route POST /api/auto-scheduling/drafts/:id/approve
     * @access Private (Admin/Manager)
     */
    static async approveSchedulingDraft(req, res) {
        try {
            const { id } = req.params;
            const {
                modifications = null,
                admin_notes = '',
                create_distribution_trip = true
            } = req.body;
            const adminId = req.user.id;

            const connection = await mysql.createConnection(dbConfig);
            await connection.beginTransaction();

            try {
                // Get the draft
                const [draftResults] = await connection.execute(`
                    SELECT * FROM scheduling_drafts WHERE id = ?
                `, [id]);

                if (draftResults.length === 0) {
                    await connection.rollback();
                    await connection.end();
                    return res.status(404).json({
                        success: false,
                        message: 'مسودة الجدولة غير موجودة'
                    });
                }

                const draft = draftResults[0];

                // Update draft status
                const status = modifications ? 'modified' : 'approved';
                const finalDistributorId = modifications?.distributor_id || draft.suggested_distributor_id;
                const finalDeliveryDate = modifications?.delivery_date || draft.suggested_delivery_date;
                const finalPriority = modifications?.priority || draft.suggested_priority;

                await connection.execute(`
                    UPDATE scheduling_drafts 
                    SET status = ?, 
                        reviewed_by = ?, 
                        reviewed_at = NOW(),
                        admin_notes = ?,
                        modifications = ?,
                        approved_distributor_id = ?,
                        approved_delivery_date = ?,
                        approved_priority = ?
                    WHERE id = ?
                `, [
                    status,
                    adminId,
                    admin_notes,
                    modifications ? JSON.stringify(modifications) : null,
                    finalDistributorId,
                    finalDeliveryDate,
                    finalPriority,
                    id
                ]);

                // Update the original order with scheduling info
                await connection.execute(`
                    UPDATE orders 
                    SET assigned_distributor_id = ?,
                        delivery_date = ?,
                        priority = ?,
                        status = 'scheduled',
                        updated_at = NOW()
                    WHERE id = ?
                `, [finalDistributorId, finalDeliveryDate, finalPriority, draft.order_id]);

                // Optionally create distribution trip
                if (create_distribution_trip) {
                    await this.createDistributionTripFromDraft(connection, draft, {
                        distributor_id: finalDistributorId,
                        delivery_date: finalDeliveryDate,
                        priority: finalPriority,
                        admin_notes: admin_notes
                    });
                }

                await connection.commit();
                await connection.end();

                logger.info(`Scheduling draft ${id} approved by admin ${adminId}`);

                res.json({
                    success: true,
                    data: {
                        draft_id: id,
                        status: status,
                        final_distributor_id: finalDistributorId,
                        final_delivery_date: finalDeliveryDate,
                        has_modifications: !!modifications
                    },
                    message: status === 'modified'
                        ? 'تم تعديل وإعتماد الجدولة بنجاح'
                        : 'تم إعتماد الجدولة بنجاح'
                });

            } catch (error) {
                await connection.rollback();
                throw error;
            }

        } catch (error) {
            logger.error('Error approving scheduling draft:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في إعتماد مسودة الجدولة',
                error: error.message
            });
        }
    }

    /**
     * Reject scheduling draft
     * @route POST /api/auto-scheduling/drafts/:id/reject
     * @access Private (Admin/Manager)
     */
    static async rejectSchedulingDraft(req, res) {
        try {
            const { id } = req.params;
            const { reason, reassign_to_manual = false } = req.body;
            const adminId = req.user.id;

            if (!reason) {
                return res.status(400).json({
                    success: false,
                    message: 'سبب الرفض مطلوب'
                });
            }

            const connection = await mysql.createConnection(dbConfig);

            // Update draft status to rejected
            await connection.execute(`
                UPDATE scheduling_drafts 
                SET status = 'rejected',
                    reviewed_by = ?,
                    reviewed_at = NOW(),
                    admin_notes = ?
                WHERE id = ?
            `, [adminId, reason, id]);

            // Optionally reassign to manual scheduling
            if (reassign_to_manual) {
                const [draftResults] = await connection.execute(`
                    SELECT order_id FROM scheduling_drafts WHERE id = ?
                `, [id]);

                if (draftResults.length > 0) {
                    await connection.execute(`
                        UPDATE orders 
                        SET status = 'pending_manual_scheduling',
                            updated_at = NOW()
                        WHERE id = ?
                    `, [draftResults[0].order_id]);
                }
            }

            await connection.end();

            logger.info(`Scheduling draft ${id} rejected by admin ${adminId}: ${reason}`);

            res.json({
                success: true,
                data: {
                    draft_id: id,
                    status: 'rejected',
                    reason: reason,
                    reassigned_to_manual: reassign_to_manual
                },
                message: 'تم رفض مسودة الجدولة'
            });

        } catch (error) {
            logger.error('Error rejecting scheduling draft:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في رفض مسودة الجدولة',
                error: error.message
            });
        }
    }

    /**
     * Get scheduling statistics for dashboard
     * @route GET /api/auto-scheduling/statistics
     * @access Private (Admin/Manager)
     */
    static async getSchedulingStatistics(req, res) {
        try {
            const { period = 'month' } = req.query;
            const connection = await mysql.createConnection(dbConfig);

            // Build date filter
            let dateFilter = '';
            const now = new Date();

            switch (period) {
                case 'today':
                    dateFilter = `AND DATE(sd.created_at) = CURDATE()`;
                    break;
                case 'week':
                    dateFilter = `AND sd.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
                    break;
                case 'month':
                    dateFilter = `AND sd.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
                    break;
            }

            // Get draft statistics
            const [draftStats] = await connection.execute(`
                SELECT 
                    sd.status,
                    COUNT(*) as count,
                    AVG(sd.confidence_score) as avg_confidence,
                    MIN(sd.confidence_score) as min_confidence,
                    MAX(sd.confidence_score) as max_confidence
                FROM scheduling_drafts sd
                WHERE 1=1 ${dateFilter}
                GROUP BY sd.status
            `);

            // Get distributor suggestion accuracy
            const [accuracyStats] = await connection.execute(`
                SELECT 
                    COUNT(*) as total_suggestions,
                    SUM(CASE WHEN sd.status = 'approved' THEN 1 ELSE 0 END) as approved_without_changes,
                    SUM(CASE WHEN sd.status = 'modified' THEN 1 ELSE 0 END) as modified_approvals,
                    SUM(CASE WHEN sd.status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                    AVG(sd.confidence_score) as overall_avg_confidence
                FROM scheduling_drafts sd
                WHERE 1=1 ${dateFilter}
            `);

            // Get top performing distributors (most suggested)
            const [topDistributors] = await connection.execute(`
                SELECT 
                    u.id,
                    u.full_name,
                    COUNT(*) as times_suggested,
                    SUM(CASE WHEN sd.status IN ('approved', 'modified') THEN 1 ELSE 0 END) as times_approved,
                    AVG(sd.confidence_score) as avg_confidence_when_suggested
                FROM scheduling_drafts sd
                JOIN users u ON sd.suggested_distributor_id = u.id
                WHERE 1=1 ${dateFilter}
                GROUP BY u.id, u.full_name
                ORDER BY times_suggested DESC
                LIMIT 5
            `);

            await connection.end();

            // Calculate metrics
            const accuracy = accuracyStats[0];
            const approvalRate = accuracy.total_suggestions > 0
                ? ((accuracy.approved_without_changes + accuracy.modified_approvals) / accuracy.total_suggestions) * 100
                : 0;
            const perfectAccuracyRate = accuracy.total_suggestions > 0
                ? (accuracy.approved_without_changes / accuracy.total_suggestions) * 100
                : 0;

            res.json({
                success: true,
                data: {
                    period: period,
                    draft_statistics: draftStats,
                    accuracy_metrics: {
                        total_suggestions: accuracy.total_suggestions,
                        approval_rate: Math.round(approvalRate * 100) / 100,
                        perfect_accuracy_rate: Math.round(perfectAccuracyRate * 100) / 100,
                        average_confidence: Math.round(accuracy.overall_avg_confidence * 100) / 100,
                        approved_without_changes: accuracy.approved_without_changes,
                        modified_approvals: accuracy.modified_approvals,
                        rejected: accuracy.rejected
                    },
                    top_suggested_distributors: topDistributors
                },
                message: 'تم جلب إحصائيات الجدولة التلقائية بنجاح'
            });

        } catch (error) {
            logger.error('Error getting scheduling statistics:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب إحصائيات الجدولة',
                error: error.message
            });
        }
    }

    /**
     * Trigger manual scheduling for an order
     * @route POST /api/auto-scheduling/manual-schedule
     * @access Private (Admin/Manager)
     */
    static async triggerManualScheduling(req, res) {
        try {
            const { order_id } = req.body;
            const createdBy = req.user.id;

            if (!order_id) {
                return res.status(400).json({
                    success: false,
                    message: 'معرف الطلب مطلوب'
                });
            }

            const connection = await mysql.createConnection(dbConfig);

            // Get order details
            const [orderResults] = await connection.execute(`
                SELECT * FROM orders WHERE id = ?
            `, [order_id]);

            if (orderResults.length === 0) {
                await connection.end();
                return res.status(404).json({
                    success: false,
                    message: 'الطلب غير موجود'
                });
            }

            await connection.end();

            // Create scheduling draft using smart service
            const schedulingResult = await smartSchedulingService.createSchedulingDraft(
                orderResults[0],
                createdBy
            );

            res.json({
                success: true,
                data: schedulingResult,
                message: 'تم إنشاء اقتراح جدولة جديد بنجاح'
            });

        } catch (error) {
            logger.error('Error triggering manual scheduling:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في إنشاء الجدولة اليدوية',
                error: error.message
            });
        }
    }

    /**
     * Helper method to create distribution trip from approved draft
     */
    static async createDistributionTripFromDraft(connection, draft, approvalData) {
        try {
            // Generate trip number
            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const random = Math.random().toString(36).substr(2, 4).toUpperCase();
            const tripNumber = `TRIP-${today}-${random}`;

            // Insert distribution trip
            const [tripResult] = await connection.execute(`
                INSERT INTO distribution_trips (
                    trip_number, trip_date, distributor_id, distributor_name,
                    planned_start_time, total_orders, total_stores,
                    total_amount_eur, total_amount_syp, status,
                    notes, created_by, created_by_name, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, 1, 1, ?, ?, 'pending', ?, ?, 
                         (SELECT full_name FROM users WHERE id = ?), NOW(), NOW())
            `, [
                tripNumber,
                approvalData.delivery_date,
                approvalData.distributor_id,
                'سيتم تحديثه', // Will be updated by trigger
                '08:00:00', // Default start time
                draft.total_amount_eur || 0,
                draft.total_amount_syp || 0,
                approvalData.admin_notes,
                draft.created_by,
                draft.created_by
            ]);

            logger.info(`Distribution trip created: ${tripNumber} for draft ${draft.id}`);
            return tripResult.insertId;

        } catch (error) {
            logger.error('Error creating distribution trip from draft:', error);
            throw error;
        }
    }

    /**
     * Safe JSON parsing helper
     */
    static safeJSONParse(jsonString) {
        try {
            if (typeof jsonString === 'string') {
                return JSON.parse(jsonString);
            }
            return jsonString;
        } catch (error) {
            logger.warn('Failed to parse JSON:', error);
            return null;
        }
    }
}

export default AutoSchedulingController; 