import db from '../config/database.js';

/**
 * Dashboard API Service
 * Provides comprehensive dashboard statistics and analytics
 */
class DashboardAPI {

    /**
     * Get comprehensive dashboard statistics
     * @param {Object} options - Query options
     * @returns {Object} Dashboard statistics
     */
    static async getDashboardStats(options = {}) {
        try {
            const {
                dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                dateTo = new Date().toISOString().split('T')[0],
                currency = 'EUR'
            } = options;

            // Get daily overview
            const dailyStats = await this.getDailyOverview(dateFrom, dateTo, currency);

            // Get sales metrics
            const salesMetrics = await this.getSalesMetrics(dateFrom, dateTo, currency);

            // Get distribution metrics
            const distributionMetrics = await this.getDistributionMetrics(dateFrom, dateTo);

            // Get payment metrics
            const paymentMetrics = await this.getPaymentMetrics(dateFrom, dateTo, currency);

            // Get top performers
            const topPerformers = await this.getTopPerformers(dateFrom, dateTo, currency);

            // Get system health
            const systemHealth = await this.getSystemHealth();

            return {
                period: { from: dateFrom, to: dateTo },
                currency: currency,
                daily_overview: dailyStats,
                sales_metrics: salesMetrics,
                distribution_metrics: distributionMetrics,
                payment_metrics: paymentMetrics,
                top_performers: topPerformers,
                system_health: systemHealth,
                last_updated: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            throw new Error('خطأ في جلب إحصائيات اللوحة الرئيسية');
        }
    }

    /**
     * Get daily overview statistics
     */
    static async getDailyOverview(dateFrom, dateTo, currency) {
        try {
            const amountField = currency === 'EUR' ? 'total_amount_eur' : 'total_amount_syp';
            const paymentField = currency === 'EUR' ? 'amount_eur' : 'amount_syp';

            const [overviewData] = await db.execute(`
                SELECT 
                    COUNT(DISTINCT o.id) as total_orders,
                    COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as delivered_orders,
                    COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.id END) as pending_orders,
                    COUNT(DISTINCT CASE WHEN o.status = 'cancelled' THEN o.id END) as cancelled_orders,
                    COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.${amountField} END), 0) as total_sales,
                    COALESCE(SUM(CASE WHEN o.status = 'pending' THEN o.${amountField} END), 0) as pending_sales,
                    COUNT(DISTINCT s.id) as active_stores,
                    COUNT(DISTINCT u.id) as active_distributors,
                    (
                        SELECT COALESCE(SUM(p.${paymentField}), 0)
                        FROM payments p
                        WHERE p.payment_date BETWEEN ? AND ?
                    ) as total_payments,
                    (
                        SELECT COUNT(DISTINCT p.id)
                        FROM payments p
                        WHERE p.payment_date BETWEEN ? AND ?
                    ) as total_payment_transactions
                FROM orders o
                JOIN stores s ON o.store_id = s.id
                JOIN users u ON o.distributor_id = u.id
                WHERE o.order_date BETWEEN ? AND ?
            `, [dateFrom, dateTo, dateFrom, dateTo, dateFrom, dateTo]);

            return overviewData[0] || {};

        } catch (error) {
            console.error('Error getting daily overview:', error);
            throw error;
        }
    }

    /**
     * Get sales metrics and trends
     */
    static async getSalesMetrics(dateFrom, dateTo, currency) {
        try {
            const amountField = currency === 'EUR' ? 'total_amount_eur' : 'total_amount_syp';

            // Sales trends by day
            const [salesTrends] = await db.execute(`
                SELECT 
                    DATE(o.order_date) as date,
                    COUNT(o.id) as orders_count,
                    COALESCE(SUM(o.${amountField}), 0) as total_sales,
                    COUNT(DISTINCT o.store_id) as unique_stores,
                    COUNT(DISTINCT o.distributor_id) as active_distributors
                FROM orders o
                WHERE o.order_date BETWEEN ? AND ?
                    AND o.status = 'delivered'
                GROUP BY DATE(o.order_date)
                ORDER BY DATE(o.order_date)
            `, [dateFrom, dateTo]);

            // Sales by product category
            const [categoryBreakdown] = await db.execute(`
                SELECT 
                    p.category,
                    COUNT(DISTINCT o.id) as orders_count,
                    SUM(oi.quantity) as total_quantity,
                    COALESCE(SUM(oi.quantity * oi.unit_price_eur), 0) as total_amount_eur,
                    COALESCE(SUM(oi.quantity * oi.unit_price_syp), 0) as total_amount_syp
                FROM orders o
                JOIN order_items oi ON o.id = oi.order_id
                JOIN products p ON oi.product_id = p.id
                WHERE o.order_date BETWEEN ? AND ?
                    AND o.status = 'delivered'
                GROUP BY p.category
                ORDER BY ${currency === 'EUR' ? 'total_amount_eur' : 'total_amount_syp'} DESC
            `, [dateFrom, dateTo]);

            return {
                trends: salesTrends,
                category_breakdown: categoryBreakdown,
                growth_rate: this.calculateGrowthRate(salesTrends)
            };

        } catch (error) {
            console.error('Error getting sales metrics:', error);
            throw error;
        }
    }

    /**
     * Get distribution metrics
     */
    static async getDistributionMetrics(dateFrom, dateTo) {
        try {
            // Distribution performance by distributor
            const [distributorPerformance] = await db.execute(`
                SELECT 
                    u.id as distributor_id,
                    u.full_name as distributor_name,
                    COUNT(DISTINCT o.id) as total_orders,
                    COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as delivered_orders,
                    COUNT(DISTINCT o.store_id) as unique_stores_served,
                    COALESCE(AVG(TIMESTAMPDIFF(MINUTE, o.created_at, o.updated_at)), 0) as avg_delivery_time_minutes
                FROM orders o
                JOIN users u ON o.distributor_id = u.id
                WHERE o.order_date BETWEEN ? AND ?
                GROUP BY u.id, u.full_name
                ORDER BY delivered_orders DESC
            `, [dateFrom, dateTo]);

            // Distribution efficiency metrics
            const [efficiencyMetrics] = await db.execute(`
                SELECT 
                    COUNT(DISTINCT o.id) as total_orders,
                    COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as delivered_orders,
                    COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.id END) as pending_orders,
                    COUNT(DISTINCT CASE WHEN o.status = 'cancelled' THEN o.id END) as cancelled_orders,
                    ROUND(
                        COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) * 100.0 / 
                        COUNT(DISTINCT o.id), 2
                    ) as delivery_success_rate
                FROM orders o
                WHERE o.order_date BETWEEN ? AND ?
            `, [dateFrom, dateTo]);

            return {
                distributor_performance: distributorPerformance,
                efficiency_metrics: efficiencyMetrics[0] || {},
                delivery_success_rate: efficiencyMetrics[0]?.delivery_success_rate || 0
            };

        } catch (error) {
            console.error('Error getting distribution metrics:', error);
            throw error;
        }
    }

    /**
     * Get payment metrics
     */
    static async getPaymentMetrics(dateFrom, dateTo, currency) {
        try {
            const amountField = currency === 'EUR' ? 'amount_eur' : 'amount_syp';

            // Payment method breakdown
            const [paymentMethods] = await db.execute(`
                SELECT 
                    p.payment_method,
                    COUNT(p.id) as transaction_count,
                    COALESCE(SUM(p.${amountField}), 0) as total_amount
                FROM payments p
                WHERE p.payment_date BETWEEN ? AND ?
                GROUP BY p.payment_method
                ORDER BY total_amount DESC
            `, [dateFrom, dateTo]);

            // Outstanding debts
            const [outstandingDebts] = await db.execute(`
                SELECT 
                    COUNT(s.id) as stores_with_debt,
                    COALESCE(SUM(s.current_balance_eur), 0) as total_debt_eur,
                    COALESCE(SUM(s.current_balance_syp), 0) as total_debt_syp,
                    COALESCE(AVG(s.current_balance_eur), 0) as avg_debt_eur,
                    COALESCE(AVG(s.current_balance_syp), 0) as avg_debt_syp
                FROM stores s
                WHERE s.current_balance_eur > 0 OR s.current_balance_syp > 0
            `);

            return {
                payment_methods: paymentMethods,
                outstanding_debts: outstandingDebts[0] || {},
                collection_rate: this.calculateCollectionRate(dateFrom, dateTo)
            };

        } catch (error) {
            console.error('Error getting payment metrics:', error);
            throw error;
        }
    }

    /**
     * Get top performers
     */
    static async getTopPerformers(dateFrom, dateTo, currency) {
        try {
            const amountField = currency === 'EUR' ? 'total_amount_eur' : 'total_amount_syp';

            // Top stores by sales
            const [topStores] = await db.execute(`
                SELECT 
                    s.id,
                    s.name,
                    s.category,
                    COUNT(DISTINCT o.id) as order_count,
                    COALESCE(SUM(o.${amountField}), 0) as total_sales,
                    COALESCE(AVG(o.${amountField}), 0) as avg_order_value
                FROM stores s
                JOIN orders o ON s.id = o.store_id
                WHERE o.order_date BETWEEN ? AND ?
                    AND o.status = 'delivered'
                GROUP BY s.id, s.name, s.category
                ORDER BY total_sales DESC
                LIMIT 10
            `, [dateFrom, dateTo]);

            // Top distributors by performance
            const [topDistributors] = await db.execute(`
                SELECT 
                    u.id,
                    u.full_name,
                    COUNT(DISTINCT o.id) as total_orders,
                    COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as delivered_orders,
                    COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.${amountField} END), 0) as total_sales,
                    ROUND(
                        COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) * 100.0 / 
                        COUNT(DISTINCT o.id), 2
                    ) as success_rate
                FROM users u
                JOIN orders o ON u.id = o.distributor_id
                WHERE o.order_date BETWEEN ? AND ?
                    AND u.role = 'distributor'
                GROUP BY u.id, u.full_name
                ORDER BY success_rate DESC, total_sales DESC
                LIMIT 10
            `, [dateFrom, dateTo]);

            // Top products by sales
            const [topProducts] = await db.execute(`
                SELECT 
                    p.id,
                    p.name,
                    p.category,
                    SUM(oi.quantity) as total_quantity,
                    COUNT(DISTINCT o.id) as order_count,
                    COALESCE(SUM(oi.quantity * oi.unit_price_eur), 0) as total_amount_eur,
                    COALESCE(SUM(oi.quantity * oi.unit_price_syp), 0) as total_amount_syp
                FROM products p
                JOIN order_items oi ON p.id = oi.product_id
                JOIN orders o ON oi.order_id = o.id
                WHERE o.order_date BETWEEN ? AND ?
                    AND o.status = 'delivered'
                GROUP BY p.id, p.name, p.category
                ORDER BY ${currency === 'EUR' ? 'total_amount_eur' : 'total_amount_syp'} DESC
                LIMIT 10
            `, [dateFrom, dateTo]);

            return {
                top_stores: topStores,
                top_distributors: topDistributors,
                top_products: topProducts
            };

        } catch (error) {
            console.error('Error getting top performers:', error);
            throw error;
        }
    }

    /**
     * Get system health metrics
     */
    static async getSystemHealth() {
        try {
            // Database health
            const [dbHealth] = await db.execute('SELECT COUNT(*) as total_records FROM users');

            // Recent activity
            const [recentActivity] = await db.execute(`
                SELECT 
                    COUNT(DISTINCT o.id) as orders_today,
                    COUNT(DISTINCT p.id) as payments_today,
                    COUNT(DISTINCT s.id) as active_stores_today
                FROM orders o
                LEFT JOIN payments p ON DATE(p.payment_date) = CURDATE()
                LEFT JOIN stores s ON s.last_order_date = CURDATE()
                WHERE DATE(o.order_date) = CURDATE()
            `);

            return {
                database_status: 'healthy',
                total_records: dbHealth[0]?.total_records || 0,
                recent_activity: recentActivity[0] || {},
                uptime: process.uptime(),
                memory_usage: process.memoryUsage(),
                last_check: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error getting system health:', error);
            return {
                database_status: 'error',
                error: error.message,
                last_check: new Date().toISOString()
            };
        }
    }

    /**
     * Calculate growth rate from trends data
     */
    static calculateGrowthRate(trendsData) {
        if (!trendsData || trendsData.length < 2) return 0;

        const firstPeriod = trendsData[0]?.total_sales || 0;
        const lastPeriod = trendsData[trendsData.length - 1]?.total_sales || 0;

        if (firstPeriod === 0) return 0;

        return ((lastPeriod - firstPeriod) / firstPeriod * 100).toFixed(2);
    }

    /**
     * Calculate collection rate
     */
    static async calculateCollectionRate(dateFrom, dateTo) {
        try {
            const [collectionData] = await db.execute(`
                SELECT 
                    COALESCE(SUM(o.total_amount_eur), 0) as total_sales_eur,
                    COALESCE(SUM(o.total_amount_syp), 0) as total_sales_syp,
                    (
                        SELECT COALESCE(SUM(p.amount_eur), 0)
                        FROM payments p
                        WHERE p.payment_date BETWEEN ? AND ?
                    ) as total_payments_eur,
                    (
                        SELECT COALESCE(SUM(p.amount_syp), 0)
                        FROM payments p
                        WHERE p.payment_date BETWEEN ? AND ?
                    ) as total_payments_syp
                FROM orders o
                WHERE o.order_date BETWEEN ? AND ?
                    AND o.status = 'delivered'
            `, [dateFrom, dateTo, dateFrom, dateTo, dateFrom, dateTo]);

            const data = collectionData[0];
            const collectionRateEUR = data.total_sales_eur > 0 ?
                (data.total_payments_eur / data.total_sales_eur * 100).toFixed(2) : 0;
            const collectionRateSYP = data.total_sales_syp > 0 ?
                (data.total_payments_syp / data.total_sales_syp * 100).toFixed(2) : 0;

            return {
                eur: collectionRateEUR,
                syp: collectionRateSYP,
                total_sales: {
                    eur: data.total_sales_eur,
                    syp: data.total_sales_syp
                },
                total_payments: {
                    eur: data.total_payments_eur,
                    syp: data.total_payments_syp
                }
            };

        } catch (error) {
            console.error('Error calculating collection rate:', error);
            return { eur: 0, syp: 0 };
        }
    }
}

export default DashboardAPI; 