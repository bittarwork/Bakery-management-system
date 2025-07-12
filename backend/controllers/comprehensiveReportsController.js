import mysql from 'mysql2/promise';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Database connection factory
let db = null;

const getDBConnection = async () => {
    if (!db) {
        try {
            db = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'bakery_db',
                connectTimeout: 10000,
                acquireTimeout: 10000,
                timeout: 10000
            });
        } catch (error) {
            console.error('Database connection failed in comprehensiveReportsController:', error.message);
            throw new Error('Database connection unavailable');
        }
    }
    return db;
};

// ==========================================
// 📊 COMPREHENSIVE REPORTS SYSTEM (نظام التقارير الشامل)
// ==========================================

/**
 * Generate comprehensive daily report
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {Object} options - Report options
 * @returns {Object} Daily report data
 */
export const generateDailyReport = async (date, options = {}) => {
    try {
        const reportDate = date || new Date().toISOString().split('T')[0];
        const { distributorId, includeDetails = true, format = 'json' } = options;

        // Get orders summary
        const [ordersSummary] = await (await getDBConnection()).execute(`
            SELECT 
                COUNT(*) as total_orders,
                COUNT(DISTINCT store_id) as unique_stores,
                SUM(total_amount_eur) as total_sales_eur,
                SUM(total_amount_syp) as total_sales_syp,
                COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
                COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders,
                COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payment_orders
            FROM orders 
            WHERE order_date = ?
            ${distributorId ? 'AND store_id IN (SELECT id FROM stores WHERE assigned_distributor_id = ?)' : ''}
        `, distributorId ? [reportDate, distributorId] : [reportDate]);

        // Get payments summary
        const [paymentsSummary] = await (await getDBConnection()).execute(`
            SELECT 
                COUNT(*) as total_payments,
                SUM(amount_eur) as collected_eur,
                SUM(amount_syp) as collected_syp,
                COUNT(CASE WHEN payment_method = 'cash' THEN 1 END) as cash_payments,
                COUNT(CASE WHEN payment_method = 'bank' THEN 1 END) as bank_payments,
                COUNT(DISTINCT store_id) as paying_stores
            FROM payments 
            WHERE DATE(payment_date) = ?
            ${distributorId ? 'AND collected_by = ?' : ''}
        `, distributorId ? [reportDate, distributorId] : [reportDate]);

        // Get distributor performance
        const [distributorPerformance] = await (await getDBConnection()).execute(`
            SELECT 
                u.id as distributor_id,
                u.full_name as distributor_name,
                COUNT(DISTINCT dr.order_id) as deliveries_made,
                COUNT(DISTINCT p.id) as payments_collected,
                SUM(p.amount_eur) as collected_eur,
                SUM(p.amount_syp) as collected_syp,
                COUNT(DISTINCT s.id) as stores_visited,
                SUM(ve.amount_eur + ve.amount_syp) as expenses
            FROM users u
            LEFT JOIN delivery_records dr ON u.id = dr.distributor_id AND dr.delivery_date = ?
            LEFT JOIN payments p ON u.id = p.collected_by AND DATE(p.payment_date) = ?
            LEFT JOIN stores s ON dr.order_id IN (SELECT id FROM orders WHERE store_id = s.id)
            LEFT JOIN vehicle_expenses ve ON u.id = ve.distributor_id AND ve.expense_date = ?
            WHERE u.role = 'distributor'
            ${distributorId ? 'AND u.id = ?' : ''}
            GROUP BY u.id, u.full_name
            ORDER BY deliveries_made DESC
        `, distributorId ?
            [reportDate, reportDate, reportDate, distributorId] :
            [reportDate, reportDate, reportDate]);

        // Get top selling products
        const [topProducts] = await (await getDBConnection()).execute(`
            SELECT 
                p.id,
                p.name as product_name,
                p.category,
                SUM(oi.quantity) as total_quantity,
                SUM(oi.total_price_eur) as total_sales_eur,
                SUM(oi.total_price_syp) as total_sales_syp,
                COUNT(DISTINCT oi.order_id) as order_count
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.order_date = ?
            ${distributorId ? 'AND o.store_id IN (SELECT id FROM stores WHERE assigned_distributor_id = ?)' : ''}
            GROUP BY p.id, p.name, p.category
            ORDER BY total_quantity DESC
            LIMIT 10
        `, distributorId ? [reportDate, distributorId] : [reportDate]);

        // Get store performance
        const [storePerformance] = await (await getDBConnection()).execute(`
            SELECT 
                s.id,
                s.name as store_name,
                s.category,
                COUNT(o.id) as orders_count,
                SUM(o.total_amount_eur) as total_orders_eur,
                SUM(o.total_amount_syp) as total_orders_syp,
                COUNT(p.id) as payments_count,
                SUM(p.amount_eur) as payments_eur,
                SUM(p.amount_syp) as payments_syp,
                s.current_balance_eur,
                s.current_balance_syp
            FROM stores s
            LEFT JOIN orders o ON s.id = o.store_id AND o.order_date = ?
            LEFT JOIN payments p ON s.id = p.store_id AND DATE(p.payment_date) = ?
            WHERE s.status = 'active'
            ${distributorId ? 'AND s.assigned_distributor_id = ?' : ''}
            GROUP BY s.id, s.name, s.category, s.current_balance_eur, s.current_balance_syp
            ORDER BY total_orders_eur DESC
            LIMIT 20
        `, distributorId ? [reportDate, reportDate, distributorId] : [reportDate, reportDate]);

        // Get inventory status
        const [inventoryStatus] = await (await getDBConnection()).execute(`
            SELECT 
                p.id,
                p.name as product_name,
                p.category,
                SUM(vi.quantity) as total_inventory,
                SUM(vi.delivered_quantity) as delivered_today,
                SUM(vi.returned_quantity) as returned_today,
                SUM(vi.damaged_quantity) as damaged_today
            FROM products p
            LEFT JOIN vehicle_inventory vi ON p.id = vi.product_id
            ${distributorId ? 'WHERE vi.distributor_id = ?' : ''}
            GROUP BY p.id, p.name, p.category
            ORDER BY total_inventory DESC
        `, distributorId ? [distributorId] : []);

        const reportData = {
            date: reportDate,
            distributor_filter: distributorId,
            summary: {
                orders: ordersSummary[0],
                payments: paymentsSummary[0],
                performance_metrics: {
                    delivery_rate: ordersSummary[0].total_orders > 0 ?
                        (ordersSummary[0].delivered_orders / ordersSummary[0].total_orders * 100).toFixed(2) : 0,
                    payment_rate: ordersSummary[0].total_orders > 0 ?
                        (ordersSummary[0].paid_orders / ordersSummary[0].total_orders * 100).toFixed(2) : 0,
                    collection_efficiency: ordersSummary[0].total_sales_eur > 0 ?
                        (paymentsSummary[0].collected_eur / ordersSummary[0].total_sales_eur * 100).toFixed(2) : 0
                }
            },
            distributor_performance: distributorPerformance,
            top_products: topProducts,
            store_performance: includeDetails ? storePerformance : storePerformance.slice(0, 10),
            inventory_status: includeDetails ? inventoryStatus : inventoryStatus.slice(0, 10),
            generated_at: new Date().toISOString(),
            format: format
        };

        return reportData;

    } catch (error) {
        console.error('Error generating daily report:', error);
        throw new Error('خطأ في توليد التقرير اليومي: ' + error.message);
    }
};

/**
 * Generate comprehensive weekly report
 * @param {string} weekStart - Week start date
 * @param {string} weekEnd - Week end date
 * @param {Object} options - Report options
 * @returns {Object} Weekly report data
 */
export const generateWeeklyReport = async (weekStart, weekEnd, options = {}) => {
    try {
        const { distributorId, format = 'json' } = options;

        // Get weekly trends
        const [weeklyTrends] = await (await getDBConnection()).execute(`
            SELECT 
                DATE(o.order_date) as order_date,
                DAYNAME(o.order_date) as day_name,
                COUNT(o.id) as daily_orders,
                COUNT(DISTINCT o.store_id) as daily_stores,
                SUM(o.total_amount_eur) as daily_sales_eur,
                SUM(o.total_amount_syp) as daily_sales_syp,
                COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as delivered_orders
            FROM orders o
            WHERE o.order_date BETWEEN ? AND ?
            ${distributorId ? 'AND o.store_id IN (SELECT id FROM stores WHERE assigned_distributor_id = ?)' : ''}
            GROUP BY DATE(o.order_date), DAYNAME(o.order_date)
            ORDER BY o.order_date
        `, distributorId ? [weekStart, weekEnd, distributorId] : [weekStart, weekEnd]);

        // Get payment trends
        const [paymentTrends] = await (await getDBConnection()).execute(`
            SELECT 
                DATE(p.payment_date) as payment_date,
                COUNT(p.id) as daily_payments,
                SUM(p.amount_eur) as daily_collected_eur,
                SUM(p.amount_syp) as daily_collected_syp,
                COUNT(DISTINCT p.store_id) as paying_stores
            FROM payments p
            WHERE p.payment_date BETWEEN ? AND ?
            ${distributorId ? 'AND p.collected_by = ?' : ''}
            GROUP BY DATE(p.payment_date)
            ORDER BY p.payment_date
        `, distributorId ? [weekStart, weekEnd, distributorId] : [weekStart, weekEnd]);

        // Get distributor weekly performance
        const [distributorWeekly] = await (await getDBConnection()).execute(`
            SELECT 
                u.id as distributor_id,
                u.full_name as distributor_name,
                COUNT(DISTINCT dr.order_id) as total_deliveries,
                COUNT(DISTINCT DATE(dr.delivery_date)) as active_days,
                COUNT(DISTINCT p.id) as total_payments,
                SUM(p.amount_eur) as total_collected_eur,
                SUM(p.amount_syp) as total_collected_syp,
                COUNT(DISTINCT s.id) as unique_stores_served,
                SUM(ve.amount_eur + ve.amount_syp) as total_expenses,
                AVG(CASE WHEN dr.delivery_date IS NOT NULL THEN 1 ELSE 0 END) as efficiency_rate
            FROM users u
            LEFT JOIN delivery_records dr ON u.id = dr.distributor_id 
                AND dr.delivery_date BETWEEN ? AND ?
            LEFT JOIN payments p ON u.id = p.collected_by 
                AND p.payment_date BETWEEN ? AND ?
            LEFT JOIN stores s ON dr.order_id IN (SELECT id FROM orders WHERE store_id = s.id)
            LEFT JOIN vehicle_expenses ve ON u.id = ve.distributor_id 
                AND ve.expense_date BETWEEN ? AND ?
            WHERE u.role = 'distributor'
            ${distributorId ? 'AND u.id = ?' : ''}
            GROUP BY u.id, u.full_name
            ORDER BY total_deliveries DESC
        `, distributorId ?
            [weekStart, weekEnd, weekStart, weekEnd, weekStart, weekEnd, distributorId] :
            [weekStart, weekEnd, weekStart, weekEnd, weekStart, weekEnd]);

        // Get category performance
        const [categoryPerformance] = await (await getDBConnection()).execute(`
            SELECT 
                p.category,
                COUNT(DISTINCT p.id) as products_sold,
                SUM(oi.quantity) as total_quantity,
                SUM(oi.total_price_eur) as total_sales_eur,
                SUM(oi.total_price_syp) as total_sales_syp,
                COUNT(DISTINCT oi.order_id) as orders_with_category
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.order_date BETWEEN ? AND ?
            ${distributorId ? 'AND o.store_id IN (SELECT id FROM stores WHERE assigned_distributor_id = ?)' : ''}
            GROUP BY p.category
            ORDER BY total_sales_eur DESC
        `, distributorId ? [weekStart, weekEnd, distributorId] : [weekStart, weekEnd]);

        // Get store loyalty analysis
        const [storeLoyalty] = await (await getDBConnection()).execute(`
            SELECT 
                s.id,
                s.name as store_name,
                s.category,
                COUNT(DISTINCT o.order_date) as ordering_days,
                COUNT(o.id) as total_orders,
                SUM(o.total_amount_eur) as total_spent_eur,
                SUM(o.total_amount_syp) as total_spent_syp,
                AVG(o.total_amount_eur) as avg_order_eur,
                MAX(o.order_date) as last_order_date,
                CASE 
                    WHEN COUNT(DISTINCT o.order_date) >= 5 THEN 'Loyal'
                    WHEN COUNT(DISTINCT o.order_date) >= 3 THEN 'Regular'
                    WHEN COUNT(DISTINCT o.order_date) >= 1 THEN 'Occasional'
                    ELSE 'Inactive'
                END as loyalty_category
            FROM stores s
            LEFT JOIN orders o ON s.id = o.store_id 
                AND o.order_date BETWEEN ? AND ?
            WHERE s.status = 'active'
            ${distributorId ? 'AND s.assigned_distributor_id = ?' : ''}
            GROUP BY s.id, s.name, s.category
            ORDER BY total_spent_eur DESC
        `, distributorId ? [weekStart, weekEnd, distributorId] : [weekStart, weekEnd]);

        // Calculate weekly totals
        const weeklyTotals = weeklyTrends.reduce((acc, day) => ({
            total_orders: acc.total_orders + day.daily_orders,
            total_sales_eur: acc.total_sales_eur + parseFloat(day.daily_sales_eur || 0),
            total_sales_syp: acc.total_sales_syp + parseFloat(day.daily_sales_syp || 0),
            delivered_orders: acc.delivered_orders + day.delivered_orders,
            unique_stores: Math.max(acc.unique_stores, day.daily_stores)
        }), { total_orders: 0, total_sales_eur: 0, total_sales_syp: 0, delivered_orders: 0, unique_stores: 0 });

        const paymentTotals = paymentTrends.reduce((acc, day) => ({
            total_payments: acc.total_payments + day.daily_payments,
            total_collected_eur: acc.total_collected_eur + parseFloat(day.daily_collected_eur || 0),
            total_collected_syp: acc.total_collected_syp + parseFloat(day.daily_collected_syp || 0)
        }), { total_payments: 0, total_collected_eur: 0, total_collected_syp: 0 });

        return {
            period: { start: weekStart, end: weekEnd },
            distributor_filter: distributorId,
            summary: {
                weekly_totals: weeklyTotals,
                payment_totals: paymentTotals,
                performance_metrics: {
                    delivery_rate: weeklyTotals.total_orders > 0 ?
                        (weeklyTotals.delivered_orders / weeklyTotals.total_orders * 100).toFixed(2) : 0,
                    collection_rate: weeklyTotals.total_sales_eur > 0 ?
                        (paymentTotals.total_collected_eur / weeklyTotals.total_sales_eur * 100).toFixed(2) : 0,
                    avg_daily_orders: (weeklyTotals.total_orders / 7).toFixed(1),
                    avg_daily_sales_eur: (weeklyTotals.total_sales_eur / 7).toFixed(2)
                }
            },
            daily_trends: weeklyTrends,
            payment_trends: paymentTrends,
            distributor_performance: distributorWeekly,
            category_performance: categoryPerformance,
            store_loyalty: storeLoyalty,
            generated_at: new Date().toISOString(),
            format: format
        };

    } catch (error) {
        console.error('Error generating weekly report:', error);
        throw new Error('خطأ في توليد التقرير الأسبوعي: ' + error.message);
    }
};

/**
 * Generate monthly report
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @param {Object} options - Report options
 * @returns {Object} Monthly report data
 */
export const generateMonthlyReport = async (month, year, options = {}) => {
    try {
        const { distributorId, format = 'json' } = options;
        const monthStart = `${year}-${month.toString().padStart(2, '0')}-01`;
        const monthEnd = new Date(year, month, 0).toISOString().split('T')[0];

        // Get monthly overview
        const [monthlyOverview] = await (await getDBConnection()).execute(`
            SELECT 
                COUNT(DISTINCT o.id) as total_orders,
                COUNT(DISTINCT o.store_id) as active_stores,
                COUNT(DISTINCT DATE(o.order_date)) as active_days,
                SUM(o.total_amount_eur) as total_sales_eur,
                SUM(o.total_amount_syp) as total_sales_syp,
                AVG(o.total_amount_eur) as avg_order_eur,
                COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as delivered_orders,
                COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) as cancelled_orders
            FROM orders o
            WHERE o.order_date BETWEEN ? AND ?
            ${distributorId ? 'AND o.store_id IN (SELECT id FROM stores WHERE assigned_distributor_id = ?)' : ''}
        `, distributorId ? [monthStart, monthEnd, distributorId] : [monthStart, monthEnd]);

        // Get weekly breakdown within month
        const [weeklyBreakdown] = await (await getDBConnection()).execute(`
            SELECT 
                WEEK(o.order_date) - WEEK(?) + 1 as week_number,
                COUNT(o.id) as weekly_orders,
                SUM(o.total_amount_eur) as weekly_sales_eur,
                SUM(o.total_amount_syp) as weekly_sales_syp,
                COUNT(DISTINCT o.store_id) as weekly_stores
            FROM orders o
            WHERE o.order_date BETWEEN ? AND ?
            ${distributorId ? 'AND o.store_id IN (SELECT id FROM stores WHERE assigned_distributor_id = ?)' : ''}
            GROUP BY WEEK(o.order_date)
            ORDER BY week_number
        `, distributorId ? [monthStart, monthStart, monthEnd, distributorId] : [monthStart, monthStart, monthEnd]);

        // Get distributor monthly performance
        const [distributorMonthly] = await (await getDBConnection()).execute(`
            SELECT 
                u.id as distributor_id,
                u.full_name as distributor_name,
                COUNT(DISTINCT dr.order_id) as monthly_deliveries,
                COUNT(DISTINCT DATE(dr.delivery_date)) as working_days,
                SUM(p.amount_eur) as monthly_collections_eur,
                SUM(p.amount_syp) as monthly_collections_syp,
                COUNT(DISTINCT s.id) as stores_served,
                SUM(ve.amount_eur + ve.amount_syp) as monthly_expenses,
                (COUNT(DISTINCT dr.order_id) / COUNT(DISTINCT DATE(dr.delivery_date))) as avg_deliveries_per_day
            FROM users u
            LEFT JOIN delivery_records dr ON u.id = dr.distributor_id 
                AND dr.delivery_date BETWEEN ? AND ?
            LEFT JOIN payments p ON u.id = p.collected_by 
                AND p.payment_date BETWEEN ? AND ?
            LEFT JOIN stores s ON dr.order_id IN (SELECT id FROM orders WHERE store_id = s.id)
            LEFT JOIN vehicle_expenses ve ON u.id = ve.distributor_id 
                AND ve.expense_date BETWEEN ? AND ?
            WHERE u.role = 'distributor'
            ${distributorId ? 'AND u.id = ?' : ''}
            GROUP BY u.id, u.full_name
            ORDER BY monthly_deliveries DESC
        `, distributorId ?
            [monthStart, monthEnd, monthStart, monthEnd, monthStart, monthEnd, distributorId] :
            [monthStart, monthEnd, monthStart, monthEnd, monthStart, monthEnd]);

        // Get product insights
        const [productInsights] = await (await getDBConnection()).execute(`
            SELECT 
                p.id,
                p.name as product_name,
                p.category,
                SUM(oi.quantity) as monthly_quantity,
                SUM(oi.total_price_eur) as monthly_revenue_eur,
                SUM(oi.total_price_syp) as monthly_revenue_syp,
                COUNT(DISTINCT oi.order_id) as orders_containing,
                COUNT(DISTINCT o.store_id) as stores_purchasing,
                (SUM(oi.total_price_eur) / SUM(oi.quantity)) as avg_unit_price_eur
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.order_date BETWEEN ? AND ?
            ${distributorId ? 'AND o.store_id IN (SELECT id FROM stores WHERE assigned_distributor_id = ?)' : ''}
            GROUP BY p.id, p.name, p.category
            ORDER BY monthly_revenue_eur DESC
            LIMIT 20
        `, distributorId ? [monthStart, monthEnd, distributorId] : [monthStart, monthEnd]);

        // Get growth metrics (comparison with previous month)
        const prevMonthStart = month === 1 ? `${year - 1}-12-01` : `${year}-${(month - 1).toString().padStart(2, '0')}-01`;
        const prevMonthEnd = month === 1 ? `${year - 1}-12-31` : new Date(year, month - 1, 0).toISOString().split('T')[0];

        const [growthMetrics] = await (await getDBConnection()).execute(`
            SELECT 
                COUNT(DISTINCT o.id) as prev_orders,
                SUM(o.total_amount_eur) as prev_sales_eur,
                SUM(o.total_amount_syp) as prev_sales_syp,
                COUNT(DISTINCT o.store_id) as prev_stores
            FROM orders o
            WHERE o.order_date BETWEEN ? AND ?
            ${distributorId ? 'AND o.store_id IN (SELECT id FROM stores WHERE assigned_distributor_id = ?)' : ''}
        `, distributorId ? [prevMonthStart, prevMonthEnd, distributorId] : [prevMonthStart, prevMonthEnd]);

        // Calculate growth percentages
        const currentMetrics = monthlyOverview[0];
        const previousMetrics = growthMetrics[0];

        const growth = {
            orders: previousMetrics.prev_orders > 0 ?
                ((currentMetrics.total_orders - previousMetrics.prev_orders) / previousMetrics.prev_orders * 100).toFixed(2) : 0,
            sales_eur: previousMetrics.prev_sales_eur > 0 ?
                ((currentMetrics.total_sales_eur - previousMetrics.prev_sales_eur) / previousMetrics.prev_sales_eur * 100).toFixed(2) : 0,
            stores: previousMetrics.prev_stores > 0 ?
                ((currentMetrics.active_stores - previousMetrics.prev_stores) / previousMetrics.prev_stores * 100).toFixed(2) : 0
        };

        return {
            month: month,
            year: year,
            period: { start: monthStart, end: monthEnd },
            distributor_filter: distributorId,
            overview: currentMetrics,
            growth_metrics: {
                current_month: currentMetrics,
                previous_month: previousMetrics,
                growth_percentages: growth
            },
            weekly_breakdown: weeklyBreakdown,
            distributor_performance: distributorMonthly,
            product_insights: productInsights,
            generated_at: new Date().toISOString(),
            format: format
        };

    } catch (error) {
        console.error('Error generating monthly report:', error);
        throw new Error('خطأ في توليد التقرير الشهري: ' + error.message);
    }
};

/**
 * Generate custom analytics report
 * @param {Object} filters - Report filters
 * @returns {Object} Analytics report
 */
export const generateAnalyticsReport = async (filters) => {
    try {
        const {
            dateFrom,
            dateTo,
            distributorId,
            storeCategory,
            productCategory,
            reportType = 'comprehensive'
        } = filters;

        const baseQuery = `
            FROM orders o
            JOIN stores s ON o.store_id = s.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.order_date BETWEEN ? AND ?
        `;

        let whereConditions = '';
        const params = [dateFrom, dateTo];

        if (distributorId) {
            whereConditions += ' AND s.assigned_distributor_id = ?';
            params.push(distributorId);
        }

        if (storeCategory) {
            whereConditions += ' AND s.category = ?';
            params.push(storeCategory);
        }

        if (productCategory) {
            whereConditions += ' AND p.category = ?';
            params.push(productCategory);
        }

        // Sales trend analysis
        const [salesTrend] = await (await getDBConnection()).execute(`
            SELECT 
                DATE(o.order_date) as date,
                COUNT(DISTINCT o.id) as orders,
                SUM(o.total_amount_eur) as sales_eur,
                SUM(o.total_amount_syp) as sales_syp,
                COUNT(DISTINCT o.store_id) as stores,
                AVG(o.total_amount_eur) as avg_order_eur
            ${baseQuery}
            ${whereConditions}
            GROUP BY DATE(o.order_date)
            ORDER BY date
        `, params);

        // Store performance analysis
        const [storeAnalysis] = await (await getDBConnection()).execute(`
            SELECT 
                s.id,
                s.name as store_name,
                s.category,
                COUNT(DISTINCT o.id) as order_count,
                SUM(o.total_amount_eur) as total_sales_eur,
                SUM(o.total_amount_syp) as total_sales_syp,
                AVG(o.total_amount_eur) as avg_order_eur,
                COUNT(DISTINCT o.order_date) as ordering_days,
                MAX(o.order_date) as last_order_date
            ${baseQuery}
            ${whereConditions}
            GROUP BY s.id, s.name, s.category
            ORDER BY total_sales_eur DESC
            LIMIT 50
        `, params);

        // Product performance analysis
        const [productAnalysis] = await (await getDBConnection()).execute(`
            SELECT 
                p.id,
                p.name as product_name,
                p.category,
                SUM(oi.quantity) as total_quantity,
                SUM(oi.total_price_eur) as total_revenue_eur,
                SUM(oi.total_price_syp) as total_revenue_syp,
                COUNT(DISTINCT oi.order_id) as orders_containing,
                COUNT(DISTINCT o.store_id) as stores_buying,
                AVG(oi.unit_price_eur) as avg_unit_price
            ${baseQuery}
            ${whereConditions}
            AND p.id IS NOT NULL
            GROUP BY p.id, p.name, p.category
            ORDER BY total_revenue_eur DESC
            LIMIT 30
        `, params);

        // Time-based patterns
        const [hourlyPattern] = await (await getDBConnection()).execute(`
            SELECT 
                HOUR(o.created_at) as hour,
                COUNT(o.id) as order_count,
                SUM(o.total_amount_eur) as hourly_sales
            ${baseQuery}
            ${whereConditions}
            GROUP BY HOUR(o.created_at)
            ORDER BY hour
        `, params);

        const [dayPattern] = await (await getDBConnection()).execute(`
            SELECT 
                DAYNAME(o.order_date) as day_name,
                DAYOFWEEK(o.order_date) as day_number,
                COUNT(o.id) as order_count,
                SUM(o.total_amount_eur) as daily_sales,
                AVG(o.total_amount_eur) as avg_order_value
            ${baseQuery}
            ${whereConditions}
            GROUP BY DAYNAME(o.order_date), DAYOFWEEK(o.order_date)
            ORDER BY day_number
        `, params);

        // Summary statistics
        const [summary] = await (await getDBConnection()).execute(`
            SELECT 
                COUNT(DISTINCT o.id) as total_orders,
                COUNT(DISTINCT o.store_id) as unique_stores,
                COUNT(DISTINCT s.assigned_distributor_id) as active_distributors,
                SUM(o.total_amount_eur) as total_revenue_eur,
                SUM(o.total_amount_syp) as total_revenue_syp,
                AVG(o.total_amount_eur) as avg_order_value,
                MAX(o.total_amount_eur) as max_order_value,
                MIN(o.total_amount_eur) as min_order_value
            ${baseQuery}
            ${whereConditions}
        `, params);

        return {
            filters: filters,
            period: { from: dateFrom, to: dateTo },
            summary: summary[0],
            trends: {
                sales_trend: salesTrend,
                hourly_pattern: hourlyPattern,
                daily_pattern: dayPattern
            },
            performance: {
                stores: storeAnalysis,
                products: productAnalysis
            },
            generated_at: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error generating analytics report:', error);
        throw new Error('خطأ في توليد تقرير التحليلات: ' + error.message);
    }
};

/**
 * Export report to Excel
 * @param {Object} reportData - Report data
 * @param {string} reportType - Type of report
 * @returns {string} File path
 */
export const exportToExcel = async (reportData, reportType) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const fileName = `${reportType}_report_${Date.now()}.xlsx`;
        const filePath = path.join('storage', 'reports', fileName);

        // Summary sheet
        const summarySheet = workbook.addWorksheet('Summary');
        summarySheet.columns = [
            { header: 'Metric', key: 'metric', width: 30 },
            { header: 'Value', key: 'value', width: 20 },
            { header: 'Currency', key: 'currency', width: 10 }
        ];

        // Add summary data based on report type
        if (reportData.summary) {
            Object.entries(reportData.summary).forEach(([key, value]) => {
                summarySheet.addRow({
                    metric: key.replace(/_/g, ' ').toUpperCase(),
                    value: value,
                    currency: key.includes('eur') ? 'EUR' : key.includes('syp') ? 'SYP' : ''
                });
            });
        }

        // Data sheets based on report type
        if (reportData.distributor_performance) {
            const distributorSheet = workbook.addWorksheet('Distributor Performance');
            distributorSheet.columns = [
                { header: 'Distributor Name', key: 'distributor_name', width: 25 },
                { header: 'Deliveries', key: 'deliveries', width: 15 },
                { header: 'Collections EUR', key: 'collections_eur', width: 15 },
                { header: 'Collections SYP', key: 'collections_syp', width: 15 },
                { header: 'Stores Served', key: 'stores_served', width: 15 }
            ];

            reportData.distributor_performance.forEach(distributor => {
                distributorSheet.addRow(distributor);
            });
        }

        if (reportData.store_performance) {
            const storeSheet = workbook.addWorksheet('Store Performance');
            storeSheet.columns = [
                { header: 'Store Name', key: 'store_name', width: 25 },
                { header: 'Category', key: 'category', width: 15 },
                { header: 'Orders', key: 'orders_count', width: 10 },
                { header: 'Sales EUR', key: 'total_orders_eur', width: 15 },
                { header: 'Sales SYP', key: 'total_orders_syp', width: 15 }
            ];

            reportData.store_performance.forEach(store => {
                storeSheet.addRow(store);
            });
        }

        // Save file
        await workbook.xlsx.writeFile(filePath);

        return filePath;

    } catch (error) {
        console.error('Error exporting to Excel:', error);
        throw new Error('خطأ في تصدير Excel: ' + error.message);
    }
};

/**
 * Export report to PDF
 * @param {Object} reportData - Report data
 * @param {string} reportType - Type of report
 * @returns {string} File path
 */
export const exportToPDF = async (reportData, reportType) => {
    try {
        const fileName = `${reportType}_report_${Date.now()}.pdf`;
        const filePath = path.join('storage', 'reports', fileName);

        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(createWriteStream(filePath));

        // Header
        doc.fontSize(20).text(`${reportType.toUpperCase()} REPORT`, { align: 'center' });
        doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Summary section
        if (reportData.summary) {
            doc.fontSize(16).text('Summary', { underline: true });
            doc.moveDown();

            Object.entries(reportData.summary).forEach(([key, value]) => {
                doc.fontSize(10).text(`${key.replace(/_/g, ' ').toUpperCase()}: ${value}`);
            });
            doc.moveDown(2);
        }

        // Performance sections
        if (reportData.distributor_performance && reportData.distributor_performance.length > 0) {
            doc.fontSize(16).text('Distributor Performance', { underline: true });
            doc.moveDown();

            reportData.distributor_performance.slice(0, 10).forEach(distributor => {
                doc.fontSize(10).text(`${distributor.distributor_name}: ${distributor.total_deliveries || distributor.deliveries_made || 0} deliveries`);
            });
            doc.moveDown(2);
        }

        doc.end();

        return filePath;

    } catch (error) {
        console.error('Error exporting to PDF:', error);
        throw new Error('خطأ في تصدير PDF: ' + error.message);
    }
};

/**
 * Save report to database
 * @param {Object} reportData - Report data
 * @param {string} reportType - Type of report
 * @param {number} generatedBy - User ID who generated the report
 * @returns {number} Report ID
 */
export const saveReportToDatabase = async (reportData, reportType, generatedBy) => {
    try {
        const [result] = await (await getDBConnection()).execute(`
            INSERT INTO saved_reports 
            (report_type, report_data, filters, generated_by, generated_at)
            VALUES (?, ?, ?, ?, NOW())
        `, [
            reportType,
            JSON.stringify(reportData),
            JSON.stringify(reportData.filters || {}),
            generatedBy
        ]);

        return result.insertId;

    } catch (error) {
        console.error('Error saving report to database:', error);
        throw new Error('خطأ في حفظ التقرير: ' + error.message);
    }
};

export {
    generateDailyReport,
    generateWeeklyReport,
    generateMonthlyReport,
    generateAnalyticsReport,
    exportToExcel,
    exportToPDF,
    saveReportToDatabase
}; 
