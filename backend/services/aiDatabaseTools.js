import mysql from 'mysql2/promise';
import logger from '../config/logger.js';

/**
 * Advanced Database Tools for AI Bot
 * Provides intelligent database query capabilities
 */
class AIDatabaseTools {
    constructor() {
        this.dbPool = null;
        this.initialized = false;
        this.queryCache = new Map();
    }

    /**
     * Initialize database connection
     */
    async initialize() {
        if (this.initialized) return;

        try {
            this.dbPool = mysql.createPool({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 15,
                queueLimit: 0,
                timezone: 'Z'
            });

            this.initialized = true;
            logger.info('✅ AI Database Tools initialized successfully');
        } catch (error) {
            logger.error('❌ Failed to initialize AI Database Tools:', error);
            throw error;
        }
    }

    /**
     * Get comprehensive business analytics
     */
    async getBusinessAnalytics(period = 'today', storeId = null) {
        await this.initialize();

        try {
            const dateCondition = this.getDateCondition(period);
            const storeCondition = storeId ? `AND o.store_id = ${storeId}` : '';

            const query = `
                SELECT 
                    -- Sales Analytics
                    COUNT(DISTINCT o.id) as total_orders,
                    COALESCE(SUM(o.total_amount_eur), 0) as total_revenue_eur,
                    COALESCE(SUM(o.total_amount_syp), 0) as total_revenue_syp,
                    COALESCE(AVG(o.total_amount_eur), 0) as avg_order_value_eur,
                    
                    -- Order Status Breakdown
                    COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.id END) as pending_orders,
                    COUNT(DISTINCT CASE WHEN o.status = 'confirmed' THEN o.id END) as confirmed_orders,
                    COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as delivered_orders,
                    COUNT(DISTINCT CASE WHEN o.status = 'cancelled' THEN o.id END) as cancelled_orders,
                    
                    -- Store Performance
                    COUNT(DISTINCT o.store_id) as active_stores,
                    
                    -- Product Performance
                    COUNT(DISTINCT oi.product_id) as products_sold,
                    COALESCE(SUM(oi.quantity), 0) as total_quantity_sold,
                    
                    -- Customer Insights
                    COUNT(DISTINCT s.id) as unique_customers,
                    
                    -- Time-based Analytics
                    DATE(o.created_at) as order_date,
                    HOUR(o.created_at) as order_hour
                    
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                LEFT JOIN stores s ON o.store_id = s.id
                WHERE ${dateCondition} ${storeCondition}
                GROUP BY DATE(o.created_at), HOUR(o.created_at)
                ORDER BY o.created_at DESC
                LIMIT 100
            `;

            const [results] = await this.dbPool.execute(query);
            return this.aggregateResults(results);

        } catch (error) {
            logger.error('Error in getBusinessAnalytics:', error);
            return null;
        }
    }

    /**
     * Get detailed product performance analysis
     */
    async getProductAnalytics(period = 'week', limit = 10) {
        await this.initialize();

        try {
            const dateCondition = this.getDateCondition(period);

            const query = `
                SELECT 
                    p.id,
                    p.name,
                    p.category,
                    p.price_eur,
                    p.price_syp,
                    COUNT(oi.id) as order_count,
                    SUM(oi.quantity) as total_sold,
                    SUM(oi.quantity * p.price_eur) as revenue_eur,
                    AVG(oi.quantity) as avg_quantity_per_order,
                    
                    -- Inventory Status
                    p.current_stock,
                    p.minimum_stock,
                    CASE 
                        WHEN p.current_stock <= p.minimum_stock THEN 'low_stock'
                        WHEN p.current_stock <= p.minimum_stock * 2 THEN 'medium_stock'
                        ELSE 'good_stock'
                    END as stock_status,
                    
                    -- Performance Metrics
                    RANK() OVER (ORDER BY SUM(oi.quantity) DESC) as sales_rank,
                    RANK() OVER (ORDER BY SUM(oi.quantity * p.price_eur) DESC) as revenue_rank
                    
                FROM products p
                LEFT JOIN order_items oi ON p.id = oi.product_id 
                LEFT JOIN orders o ON oi.order_id = o.id
                WHERE ${dateCondition} AND p.status = 'active'
                GROUP BY p.id
                ORDER BY total_sold DESC
                LIMIT ${limit}
            `;

            const [results] = await this.dbPool.execute(query);
            return results;

        } catch (error) {
            logger.error('Error in getProductAnalytics:', error);
            return [];
        }
    }

    /**
     * Get store performance comparison
     */
    async getStorePerformance(period = 'month') {
        await this.initialize();

        try {
            const dateCondition = this.getDateCondition(period);

            const query = `
                SELECT 
                    s.id,
                    s.name,
                    s.area,
                    s.phone,
                    s.status,
                    
                    -- Financial Metrics
                    s.current_balance_eur,
                    s.current_balance_syp,
                    s.credit_limit_eur,
                    s.credit_limit_syp,
                    
                    -- Order Statistics
                    COUNT(DISTINCT o.id) as total_orders,
                    COALESCE(SUM(o.total_amount_eur), 0) as total_revenue_eur,
                    COALESCE(AVG(o.total_amount_eur), 0) as avg_order_value,
                    
                    -- Performance Indicators
                    COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as delivered_orders,
                    COUNT(DISTINCT CASE WHEN o.status = 'cancelled' THEN o.id END) as cancelled_orders,
                    
                    -- Calculate Performance Score
                    CASE 
                        WHEN COUNT(o.id) = 0 THEN 0
                        ELSE (COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) * 100.0 / COUNT(o.id))
                    END as delivery_success_rate,
                    
                    -- Credit Usage
                    CASE 
                        WHEN s.credit_limit_eur > 0 THEN (ABS(s.current_balance_eur) * 100.0 / s.credit_limit_eur)
                        ELSE 0
                    END as credit_utilization_percent
                    
                FROM stores s
                LEFT JOIN orders o ON s.id = o.store_id AND ${dateCondition}
                WHERE s.status = 'active'
                GROUP BY s.id
                ORDER BY total_revenue_eur DESC
            `;

            const [results] = await this.dbPool.execute(query);
            return results;

        } catch (error) {
            logger.error('Error in getStorePerformance:', error);
            return [];
        }
    }

    /**
     * Get inventory alerts and recommendations
     */
    async getInventoryAlerts() {
        await this.initialize();

        try {
            const query = `
                SELECT 
                    p.id,
                    p.name,
                    p.category,
                    p.current_stock,
                    p.minimum_stock,
                    p.price_eur,
                    
                    -- Calculate days of stock remaining based on average daily sales
                    CASE 
                        WHEN avg_daily_sales.daily_avg > 0 
                        THEN FLOOR(p.current_stock / avg_daily_sales.daily_avg)
                        ELSE 999
                    END as days_stock_remaining,
                    
                    -- Alert Level
                    CASE 
                        WHEN p.current_stock = 0 THEN 'out_of_stock'
                        WHEN p.current_stock <= p.minimum_stock THEN 'critical'
                        WHEN p.current_stock <= p.minimum_stock * 1.5 THEN 'low'
                        WHEN p.current_stock <= p.minimum_stock * 2 THEN 'medium'
                        ELSE 'good'
                    END as alert_level,
                    
                    avg_daily_sales.daily_avg as avg_daily_sales
                    
                FROM products p
                LEFT JOIN (
                    SELECT 
                        oi.product_id,
                        AVG(daily_sales.daily_total) as daily_avg
                    FROM (
                        SELECT 
                            oi.product_id,
                            DATE(o.created_at) as sale_date,
                            SUM(oi.quantity) as daily_total
                        FROM order_items oi
                        JOIN orders o ON oi.order_id = o.id
                        WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                        AND o.status IN ('confirmed', 'delivered')
                        GROUP BY oi.product_id, DATE(o.created_at)
                    ) daily_sales
                    GROUP BY daily_sales.product_id
                ) avg_daily_sales ON p.id = avg_daily_sales.product_id
                
                WHERE p.status = 'active'
                AND (p.current_stock <= p.minimum_stock * 2 OR p.current_stock = 0)
                ORDER BY 
                    CASE 
                        WHEN p.current_stock = 0 THEN 1
                        WHEN p.current_stock <= p.minimum_stock THEN 2
                        WHEN p.current_stock <= p.minimum_stock * 1.5 THEN 3
                        ELSE 4
                    END,
                    days_stock_remaining ASC
            `;

            const [results] = await this.dbPool.execute(query);
            return results;

        } catch (error) {
            logger.error('Error in getInventoryAlerts:', error);
            return [];
        }
    }

    /**
     * Search orders with advanced filters
     */
    async searchOrders(filters = {}) {
        await this.initialize();

        try {
            let whereConditions = ['1=1'];
            let params = [];

            // Build dynamic where conditions
            if (filters.storeId) {
                whereConditions.push('o.store_id = ?');
                params.push(filters.storeId);
            }

            if (filters.status) {
                whereConditions.push('o.status = ?');
                params.push(filters.status);
            }

            if (filters.dateFrom) {
                whereConditions.push('DATE(o.created_at) >= ?');
                params.push(filters.dateFrom);
            }

            if (filters.dateTo) {
                whereConditions.push('DATE(o.created_at) <= ?');
                params.push(filters.dateTo);
            }

            if (filters.minAmount) {
                whereConditions.push('o.total_amount_eur >= ?');
                params.push(filters.minAmount);
            }

            if (filters.customerName) {
                whereConditions.push('s.name LIKE ?');
                params.push(`%${filters.customerName}%`);
            }

            const query = `
                SELECT 
                    o.id,
                    o.order_number,
                    o.status,
                    o.total_amount_eur,
                    o.total_amount_syp,
                    o.created_at,
                    o.delivery_date,
                    
                    -- Store Information
                    s.name as store_name,
                    s.phone as store_phone,
                    s.area as store_area,
                    
                    -- Order Items Count
                    COUNT(oi.id) as items_count,
                    
                    -- Payment Status
                    CASE 
                        WHEN o.total_amount_eur <= 0 THEN 'paid'
                        WHEN ABS(s.current_balance_eur) >= o.total_amount_eur THEN 'credit'
                        ELSE 'pending'
                    END as payment_status
                    
                FROM orders o
                JOIN stores s ON o.store_id = s.id
                LEFT JOIN order_items oi ON o.id = oi.order_id
                WHERE ${whereConditions.join(' AND ')}
                GROUP BY o.id
                ORDER BY o.created_at DESC
                LIMIT ${filters.limit || 50}
            `;

            const [results] = await this.dbPool.execute(query, params);
            return results;

        } catch (error) {
            logger.error('Error in searchOrders:', error);
            return [];
        }
    }

    /**
     * Get financial summary with payment analysis
     */
    async getFinancialSummary(period = 'month') {
        await this.initialize();

        try {
            const dateCondition = this.getDateCondition(period);

            const query = `
                SELECT 
                    -- Revenue Analysis
                    COALESCE(SUM(CASE WHEN o.status IN ('confirmed', 'delivered') THEN o.total_amount_eur END), 0) as confirmed_revenue_eur,
                    COALESCE(SUM(CASE WHEN o.status IN ('confirmed', 'delivered') THEN o.total_amount_syp END), 0) as confirmed_revenue_syp,
                    COALESCE(SUM(CASE WHEN o.status = 'pending' THEN o.total_amount_eur END), 0) as pending_revenue_eur,
                    
                    -- Payment Analysis
                    COUNT(DISTINCT CASE WHEN p.payment_method = 'cash' THEN p.id END) as cash_payments,
                    COUNT(DISTINCT CASE WHEN p.payment_method = 'bank' THEN p.id END) as bank_payments,
                    COUNT(DISTINCT CASE WHEN p.payment_method = 'mixed' THEN p.id END) as mixed_payments,
                    
                    COALESCE(SUM(CASE WHEN p.payment_method = 'cash' THEN p.amount_eur END), 0) as cash_amount_eur,
                    COALESCE(SUM(CASE WHEN p.payment_method = 'bank' THEN p.amount_eur END), 0) as bank_amount_eur,
                    
                    -- Outstanding Debts
                    COALESCE(SUM(CASE WHEN s.current_balance_eur < 0 THEN ABS(s.current_balance_eur) END), 0) as total_debt_eur,
                    COUNT(CASE WHEN s.current_balance_eur < -100 THEN 1 END) as high_debt_stores,
                    
                    -- Performance Indicators
                    COUNT(DISTINCT o.id) as total_orders,
                    COUNT(DISTINCT s.id) as active_customers,
                    COALESCE(AVG(o.total_amount_eur), 0) as avg_order_value
                    
                FROM orders o
                LEFT JOIN payments p ON o.id = p.order_id AND ${dateCondition.replace('o.created_at', 'p.created_at')}
                LEFT JOIN stores s ON o.store_id = s.id
                WHERE ${dateCondition}
            `;

            const [results] = await this.dbPool.execute(query);
            return results[0] || {};

        } catch (error) {
            logger.error('Error in getFinancialSummary:', error);
            return {};
        }
    }

    /**
     * Get trending products and categories
     */
    async getTrendingAnalysis(period = 'week') {
        await this.initialize();

        try {
            const dateCondition = this.getDateCondition(period);

            const query = `
                WITH ProductTrends AS (
                    SELECT 
                        p.id,
                        p.name,
                        p.category,
                        SUM(oi.quantity) as current_sales,
                        
                        -- Compare with previous period
                        (SELECT COALESCE(SUM(oi2.quantity), 0)
                         FROM order_items oi2 
                         JOIN orders o2 ON oi2.order_id = o2.id
                         WHERE oi2.product_id = p.id 
                         AND o2.created_at BETWEEN DATE_SUB(DATE_SUB(CURDATE(), INTERVAL 7 DAY), INTERVAL 7 DAY) 
                                                AND DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                        ) as previous_sales
                        
                    FROM products p
                    JOIN order_items oi ON p.id = oi.product_id
                    JOIN orders o ON oi.order_id = o.id
                    WHERE ${dateCondition}
                    GROUP BY p.id
                ),
                CategoryTrends AS (
                    SELECT 
                        category,
                        SUM(current_sales) as category_sales,
                        AVG(CASE WHEN previous_sales > 0 
                            THEN ((current_sales - previous_sales) * 100.0 / previous_sales) 
                            ELSE 0 
                        END) as avg_growth_rate
                    FROM ProductTrends
                    GROUP BY category
                )
                
                SELECT 
                    'product' as type,
                    pt.name as item_name,
                    pt.category,
                    pt.current_sales,
                    pt.previous_sales,
                    CASE 
                        WHEN pt.previous_sales > 0 
                        THEN ((pt.current_sales - pt.previous_sales) * 100.0 / pt.previous_sales)
                        ELSE 0
                    END as growth_percentage,
                    
                    CASE 
                        WHEN pt.current_sales > pt.previous_sales * 1.2 THEN 'trending_up'
                        WHEN pt.current_sales < pt.previous_sales * 0.8 THEN 'trending_down'
                        ELSE 'stable'
                    END as trend_status
                    
                FROM ProductTrends pt
                WHERE pt.current_sales > 0
                
                UNION ALL
                
                SELECT 
                    'category' as type,
                    ct.category as item_name,
                    ct.category,
                    ct.category_sales as current_sales,
                    0 as previous_sales,
                    ct.avg_growth_rate as growth_percentage,
                    
                    CASE 
                        WHEN ct.avg_growth_rate > 20 THEN 'trending_up'
                        WHEN ct.avg_growth_rate < -20 THEN 'trending_down'
                        ELSE 'stable'
                    END as trend_status
                    
                FROM CategoryTrends ct
                
                ORDER BY growth_percentage DESC, current_sales DESC
                LIMIT 20
            `;

            const [results] = await this.dbPool.execute(query);
            return results;

        } catch (error) {
            logger.error('Error in getTrendingAnalysis:', error);
            return [];
        }
    }

    /**
     * Helper method to generate date conditions
     */
    getDateCondition(period) {
        const conditions = {
            'today': "DATE(o.created_at) = CURDATE()",
            'yesterday': "DATE(o.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)",
            'week': "DATE(o.created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)",
            'month': "DATE(o.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)",
            'quarter': "DATE(o.created_at) >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)",
            'year': "DATE(o.created_at) >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)"
        };

        return conditions[period] || conditions['today'];
    }

    /**
     * Aggregate analytics results for better insights
     */
    aggregateResults(results) {
        if (!results || results.length === 0) {
            return {
                summary: {},
                hourlyBreakdown: [],
                dailyBreakdown: []
            };
        }

        // Aggregate by hour and day
        const hourlyData = {};
        const dailyData = {};
        let totals = {
            total_orders: 0,
            total_revenue_eur: 0,
            total_revenue_syp: 0,
            pending_orders: 0,
            confirmed_orders: 0,
            delivered_orders: 0,
            cancelled_orders: 0
        };

        results.forEach(row => {
            // Aggregate totals
            Object.keys(totals).forEach(key => {
                totals[key] += (parseFloat(row[key]) || 0);
            });

            // Hourly breakdown
            const hour = row.order_hour;
            if (!hourlyData[hour]) {
                hourlyData[hour] = { hour, orders: 0, revenue: 0 };
            }
            hourlyData[hour].orders += (parseInt(row.total_orders) || 0);
            hourlyData[hour].revenue += (parseFloat(row.total_revenue_eur) || 0);

            // Daily breakdown
            const date = row.order_date;
            if (date && !dailyData[date]) {
                dailyData[date] = { date, orders: 0, revenue: 0 };
            }
            if (date) {
                dailyData[date].orders += (parseInt(row.total_orders) || 0);
                dailyData[date].revenue += (parseFloat(row.total_revenue_eur) || 0);
            }
        });

        return {
            summary: {
                ...totals,
                avg_order_value: totals.total_orders > 0 ? totals.total_revenue_eur / totals.total_orders : 0,
                success_rate: totals.total_orders > 0 ? (totals.delivered_orders / totals.total_orders) * 100 : 0
            },
            hourlyBreakdown: Object.values(hourlyData).sort((a, b) => a.hour - b.hour),
            dailyBreakdown: Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date))
        };
    }

    /**
     * Execute custom SQL query safely (admin only)
     */
    async executeCustomQuery(query, params = [], userId) {
        await this.initialize();

        try {
            // Security check - only allow SELECT queries
            const sanitizedQuery = query.trim().toLowerCase();
            if (!sanitizedQuery.startsWith('select')) {
                throw new Error('Only SELECT queries are allowed');
            }

            // Additional security checks
            const dangerousKeywords = ['drop', 'delete', 'update', 'insert', 'alter', 'create', 'truncate'];
            if (dangerousKeywords.some(keyword => sanitizedQuery.includes(keyword))) {
                throw new Error('Query contains forbidden keywords');
            }

            const [results] = await this.dbPool.execute(query, params);
            
            logger.info(`Custom query executed by user ${userId}:`, {
                query: query.substring(0, 100),
                resultCount: results.length
            });

            return results;

        } catch (error) {
            logger.error('Error in executeCustomQuery:', error);
            throw error;
        }
    }

    /**
     * Clear query cache
     */
    clearCache() {
        this.queryCache.clear();
        logger.info('🧹 AI Database Tools cache cleared');
    }
}

export default new AIDatabaseTools();