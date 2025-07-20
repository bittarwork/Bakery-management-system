/**
 * Enhanced Pricing Routes
 * Routes for dynamic pricing, price history, and bulk price updates
 */

import express from 'express';
import EnhancedPricingController from '../controllers/enhancedPricingController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// ==============================================
// PRICING RULES ROUTES
// ==============================================

// @desc    Get all pricing rules
// @route   GET /api/pricing/rules
// @access  Private
router.get('/rules', auth, EnhancedPricingController.getPricingRules);

// @desc    Create new pricing rule  
// @route   POST /api/pricing/rules
// @access  Private (Admin/Manager only)
router.post('/rules', auth, authorize(['admin', 'manager']), EnhancedPricingController.createPricingRule);

// @desc    Update pricing rule
// @route   PUT /api/pricing/rules/:id
// @access  Private (Admin/Manager only)
router.put('/rules/:id', auth, authorize(['admin', 'manager']), async (req, res) => {
    // Implementation for updating pricing rule
    res.json({ success: true, message: 'Update pricing rule endpoint - to be implemented' });
});

// @desc    Delete pricing rule
// @route   DELETE /api/pricing/rules/:id
// @access  Private (Admin only)
router.delete('/rules/:id', auth, authorize(['admin']), async (req, res) => {
    // Implementation for deleting pricing rule
    res.json({ success: true, message: 'Delete pricing rule endpoint - to be implemented' });
});

// ==============================================
// DYNAMIC PRICING ROUTES
// ==============================================

// @desc    Calculate dynamic price for product
// @route   POST /api/pricing/calculate
// @access  Private
router.post('/calculate', auth, EnhancedPricingController.calculateDynamicPrice);

// @desc    Bulk calculate prices for multiple products
// @route   POST /api/pricing/calculate-bulk
// @access  Private
router.post('/calculate-bulk', auth, async (req, res) => {
    try {
        const { products_data } = req.body; // Array of {product_id, quantity, store_id, customer_type}

        if (!Array.isArray(products_data) || products_data.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'بيانات المنتجات مطلوبة كمصفوفة'
            });
        }

        const results = [];

        for (const productData of products_data) {
            // Create a temporary request object for each product
            const tempReq = {
                body: productData,
                user: req.user
            };

            const tempRes = {
                json: (data) => data,
                status: (code) => ({ json: (data) => ({ ...data, statusCode: code }) })
            };

            try {
                const result = await EnhancedPricingController.calculateDynamicPrice(tempReq, tempRes);
                results.push({
                    product_id: productData.product_id,
                    success: true,
                    data: result
                });
            } catch (error) {
                results.push({
                    product_id: productData.product_id,
                    success: false,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: 'تم حساب الأسعار للمنتجات المتعددة',
            data: results
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في الحساب المجمع للأسعار',
            error: error.message
        });
    }
});

// ==============================================
// BULK PRICE UPDATE ROUTES
// ==============================================

// @desc    Bulk update product prices
// @route   POST /api/pricing/bulk-update
// @access  Private (Admin/Manager only)
router.post('/bulk-update', auth, authorize(['admin', 'manager']), EnhancedPricingController.bulkUpdatePrices);

// @desc    Get bulk operation history
// @route   GET /api/pricing/bulk-operations
// @access  Private
router.get('/bulk-operations', auth, async (req, res) => {
    try {
        const { default: db } = await import('../config/database.js');

        const {
            page = 1,
            limit = 10,
            operation_type,
            date_from,
            date_to
        } = req.query;

        const offset = (page - 1) * limit;
        let whereClause = 'WHERE 1=1';
        const params = [];

        if (operation_type) {
            whereClause += ' AND operation_type = ?';
            params.push(operation_type);
        }

        if (date_from) {
            whereClause += ' AND started_at >= ?';
            params.push(date_from);
        }

        if (date_to) {
            whereClause += ' AND started_at <= ?';
            params.push(date_to + ' 23:59:59');
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM bulk_operations_log ${whereClause}`;
        const countResult = await db.get(countQuery, params);
        const totalItems = countResult.total;

        // Get operations
        const operationsQuery = `
            SELECT 
                bol.*,
                u.name as executed_by_name,
                ROUND((bol.successful_items * 100.0 / bol.total_items), 2) as success_rate
            FROM bulk_operations_log bol
            LEFT JOIN users u ON bol.executed_by = u.id
            ${whereClause}
            ORDER BY bol.started_at DESC
            LIMIT ? OFFSET ?
        `;

        const operations = await db.all(operationsQuery, [...params, limit, offset]);

        // Parse JSON fields
        const formattedOperations = operations.map(op => ({
            ...op,
            operation_data: op.operation_data ? JSON.parse(op.operation_data) : null,
            error_details: op.error_details ? JSON.parse(op.error_details) : null
        }));

        res.json({
            success: true,
            data: {
                operations: formattedOperations,
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
            message: 'خطأ في جلب سجل العمليات المجمعة',
            error: error.message
        });
    }
});

// ==============================================
// PRICE HISTORY ROUTES
// ==============================================

// @desc    Get price history
// @route   GET /api/pricing/history
// @access  Private
router.get('/history', auth, EnhancedPricingController.getPriceHistory);

// @desc    Get price statistics
// @route   GET /api/pricing/statistics
// @access  Private
router.get('/statistics', auth, async (req, res) => {
    try {
        const { default: db } = await import('../config/database.js');
        const { date_from, date_to } = req.query;

        // Set default date range (last 30 days)
        const dateFrom = date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const dateTo = date_to || new Date().toISOString().split('T')[0];

        // Get overall price statistics
        const overallStatsQuery = `
            SELECT 
                COUNT(*) as total_price_changes,
                COUNT(DISTINCT product_id) as affected_products,
                COUNT(CASE WHEN change_type = 'manual' THEN 1 END) as manual_changes,
                COUNT(CASE WHEN change_type = 'bulk' THEN 1 END) as bulk_changes,
                COUNT(CASE WHEN change_type = 'dynamic' THEN 1 END) as dynamic_changes,
                AVG(new_price_eur - old_price_eur) as avg_price_change,
                COUNT(CASE WHEN new_price_eur > old_price_eur THEN 1 END) as price_increases,
                COUNT(CASE WHEN new_price_eur < old_price_eur THEN 1 END) as price_decreases
            FROM price_history
            WHERE created_at BETWEEN ? AND ?
        `;

        const overallStats = await db.get(overallStatsQuery, [dateFrom, dateTo + ' 23:59:59']);

        // Get most changed products
        const topChangedProductsQuery = `
            SELECT 
                p.id,
                p.name,
                p.category,
                p.price_eur as current_price,
                COUNT(ph.id) as change_count,
                MIN(ph.old_price_eur) as lowest_price,
                MAX(ph.new_price_eur) as highest_price
            FROM products p
            JOIN price_history ph ON p.id = ph.product_id
            WHERE ph.created_at BETWEEN ? AND ?
            GROUP BY p.id, p.name, p.category, p.price_eur
            ORDER BY COUNT(ph.id) DESC
            LIMIT 10
        `;

        const topChangedProducts = await db.all(topChangedProductsQuery, [dateFrom, dateTo + ' 23:59:59']);

        // Get daily price change trend
        const dailyTrendQuery = `
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as changes_count,
                COUNT(CASE WHEN new_price_eur > old_price_eur THEN 1 END) as increases_count,
                COUNT(CASE WHEN new_price_eur < old_price_eur THEN 1 END) as decreases_count,
                AVG(new_price_eur - old_price_eur) as avg_daily_change
            FROM price_history
            WHERE created_at BETWEEN ? AND ?
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;

        const dailyTrend = await db.all(dailyTrendQuery, [dateFrom, dateTo + ' 23:59:59']);

        res.json({
            success: true,
            data: {
                period: {
                    from: dateFrom,
                    to: dateTo
                },
                overall_stats: overallStats,
                top_changed_products: topChangedProducts,
                daily_trend: dailyTrend
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب إحصائيات الأسعار',
            error: error.message
        });
    }
});

// ==============================================
// PRODUCT PRICING ROUTES
// ==============================================

// @desc    Get product pricing overview
// @route   GET /api/pricing/products-overview
// @access  Private
router.get('/products-overview', auth, async (req, res) => {
    try {
        const { default: db } = await import('../config/database.js');
        const { category, price_range, search } = req.query;

        let whereClause = 'WHERE 1=1';
        const params = [];

        if (category) {
            whereClause += ' AND p.category = ?';
            params.push(category);
        }

        if (price_range) {
            const [min, max] = price_range.split('-').map(Number);
            if (!isNaN(min)) {
                whereClause += ' AND p.price_eur >= ?';
                params.push(min);
            }
            if (!isNaN(max)) {
                whereClause += ' AND p.price_eur <= ?';
                params.push(max);
            }
        }

        if (search) {
            whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        const query = `
            SELECT 
                p.id,
                p.name,
                p.category,
                p.price_eur as current_price_eur,
                p.description,
                ph.old_price_eur as previous_price_eur,
                ph.created_at as last_price_change,
                ph.change_reason as last_change_reason,
                (p.price_eur - COALESCE(ph.old_price_eur, p.price_eur)) as price_difference,
                CASE 
                    WHEN p.price_eur > COALESCE(ph.old_price_eur, p.price_eur) THEN 'increase'
                    WHEN p.price_eur < COALESCE(ph.old_price_eur, p.price_eur) THEN 'decrease'
                    ELSE 'no_change'
                END as price_trend
            FROM products p
            LEFT JOIN price_history ph ON p.id = ph.product_id
                AND ph.id = (
                    SELECT MAX(id) FROM price_history 
                    WHERE product_id = p.id
                )
            ${whereClause}
            ORDER BY p.name ASC
        `;

        const products = await db.all(query, params);

        res.json({
            success: true,
            data: {
                products,
                total_products: products.length
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب نظرة عامة على أسعار المنتجات',
            error: error.message
        });
    }
});

export default router; 