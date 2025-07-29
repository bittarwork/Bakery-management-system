import mysql from 'mysql2/promise';
import logger from '../config/logger.js';
import aiDatabaseTools from './aiDatabaseTools.js';

/**
 * AI Action System
 * Allows the AI bot to perform actual system operations
 */
class AIActionSystem {
    constructor() {
        this.dbPool = null;
        this.initialized = false;
        this.actionHistory = new Map();

        // Define available actions with permissions
        this.availableActions = {
            // Data Retrieval Actions (All users)
            'get_business_analytics': {
                permission: 'all',
                description: 'Get comprehensive business analytics',
                parameters: ['period', 'storeId']
            },
            'get_product_analytics': {
                permission: 'all',
                description: 'Get product performance analysis',
                parameters: ['period', 'limit']
            },
            'get_store_performance': {
                permission: 'all',
                description: 'Get store performance comparison',
                parameters: ['period']
            },
            'get_inventory_alerts': {
                permission: 'all',
                description: 'Get inventory alerts and recommendations',
                parameters: []
            },
            'search_orders': {
                permission: 'all',
                description: 'Search orders with advanced filters',
                parameters: ['filters']
            },
            'get_financial_summary': {
                permission: 'manager',
                description: 'Get financial summary with payment analysis',
                parameters: ['period']
            },
            'get_trending_analysis': {
                permission: 'all',
                description: 'Get trending products and categories',
                parameters: ['period']
            },

            // System Actions (Admin/Manager only)
            'update_product_stock': {
                permission: 'manager',
                description: 'Update product stock levels',
                parameters: ['productId', 'newStock', 'reason']
            },
            'create_order_note': {
                permission: 'all',
                description: 'Add a note to an order',
                parameters: ['orderId', 'note']
            },
            'update_order_status': {
                permission: 'manager',
                description: 'Update order status',
                parameters: ['orderId', 'newStatus', 'reason']
            },
            'send_notification': {
                permission: 'manager',
                description: 'Send notification to users',
                parameters: ['recipients', 'message', 'type']
            },
            'generate_report': {
                permission: 'manager',
                description: 'Generate custom business report',
                parameters: ['reportType', 'parameters']
            },

            // Advanced Analytics Actions
            'predict_stock_needs': {
                permission: 'manager',
                description: 'Predict future stock requirements',
                parameters: ['productId', 'daysAhead']
            },
            'analyze_sales_patterns': {
                permission: 'manager',
                description: 'Analyze sales patterns and trends',
                parameters: ['period', 'groupBy']
            },
            'calculate_profit_margins': {
                permission: 'manager',
                description: 'Calculate profit margins by product/category',
                parameters: ['period', 'groupBy']
            }
        };
    }

    /**
     * Initialize the action system
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
                connectionLimit: 10,
                queueLimit: 0
            });

            await aiDatabaseTools.initialize();
            this.initialized = true;
            logger.info('✅ AI Action System initialized successfully');
        } catch (error) {
            logger.error('❌ Failed to initialize AI Action System:', error);
            throw error;
        }
    }

    /**
     * Execute an action based on user intent and parameters
     */
    async executeAction(actionName, parameters = {}, userId, userRole) {
        await this.initialize();

        try {
            // Validate action exists
            if (!this.availableActions[actionName]) {
                throw new Error(`Action '${actionName}' not found`);
            }

            // Check permissions
            const action = this.availableActions[actionName];
            if (!this.hasPermission(userRole, action.permission)) {
                throw new Error(`Insufficient permissions for action '${actionName}'`);
            }

            // Log action attempt
            logger.info(`🤖 AI Action: ${actionName} by user ${userId} (${userRole})`);

            // Execute the action
            let result;
            switch (actionName) {
                // Data Retrieval Actions
                case 'get_business_analytics':
                    result = await aiDatabaseTools.getBusinessAnalytics(
                        parameters.period || 'today',
                        parameters.storeId
                    );
                    break;

                case 'get_product_analytics':
                    result = await aiDatabaseTools.getProductAnalytics(
                        parameters.period || 'week',
                        parameters.limit || 10
                    );
                    break;

                case 'get_store_performance':
                    result = await aiDatabaseTools.getStorePerformance(
                        parameters.period || 'month'
                    );
                    break;

                case 'get_inventory_alerts':
                    result = await aiDatabaseTools.getInventoryAlerts();
                    break;

                case 'search_orders':
                    result = await aiDatabaseTools.searchOrders(parameters.filters || {});
                    break;

                case 'get_financial_summary':
                    result = await aiDatabaseTools.getFinancialSummary(
                        parameters.period || 'month'
                    );
                    break;

                case 'get_trending_analysis':
                    result = await aiDatabaseTools.getTrendingAnalysis(
                        parameters.period || 'week'
                    );
                    break;

                // System Actions
                case 'update_product_stock':
                    result = await this.updateProductStock(
                        parameters.productId,
                        parameters.newStock,
                        parameters.reason,
                        userId
                    );
                    break;

                case 'create_order_note':
                    result = await this.createOrderNote(
                        parameters.orderId,
                        parameters.note,
                        userId
                    );
                    break;

                case 'update_order_status':
                    result = await this.updateOrderStatus(
                        parameters.orderId,
                        parameters.newStatus,
                        parameters.reason,
                        userId
                    );
                    break;

                case 'send_notification':
                    result = await this.sendNotification(
                        parameters.recipients,
                        parameters.message,
                        parameters.type,
                        userId
                    );
                    break;

                case 'generate_report':
                    result = await this.generateReport(
                        parameters.reportType,
                        parameters.parameters,
                        userId
                    );
                    break;

                // Advanced Analytics Actions
                case 'predict_stock_needs':
                    result = await this.predictStockNeeds(
                        parameters.productId,
                        parameters.daysAhead || 7
                    );
                    break;

                case 'analyze_sales_patterns':
                    result = await this.analyzeSalesPatterns(
                        parameters.period || 'month',
                        parameters.groupBy || 'day'
                    );
                    break;

                case 'calculate_profit_margins':
                    result = await this.calculateProfitMargins(
                        parameters.period || 'month',
                        parameters.groupBy || 'product'
                    );
                    break;

                default:
                    throw new Error(`Action handler not implemented: ${actionName}`);
            }

            // Log successful action
            this.logActionExecution(actionName, parameters, userId, userRole, true, result);

            return {
                success: true,
                action: actionName,
                result,
                timestamp: new Date().toISOString(),
                executedBy: userId
            };

        } catch (error) {
            logger.error(`❌ AI Action failed: ${actionName}`, error);
            this.logActionExecution(actionName, parameters, userId, userRole, false, error.message);

            return {
                success: false,
                action: actionName,
                error: error.message,
                timestamp: new Date().toISOString(),
                executedBy: userId
            };
        }
    }

    /**
     * Check if user has permission for action
     */
    hasPermission(userRole, requiredPermission) {
        const roleHierarchy = {
            'admin': ['admin', 'manager', 'all'],
            'manager': ['manager', 'all'],
            'user': ['all']
        };

        return roleHierarchy[userRole]?.includes(requiredPermission) || false;
    }

    /**
     * Update product stock levels
     */
    async updateProductStock(productId, newStock, reason, userId) {
        try {
            const [product] = await this.dbPool.execute(
                'SELECT * FROM products WHERE id = ?',
                [productId]
            );

            if (product.length === 0) {
                throw new Error('Product not found');
            }

            const oldStock = product[0].current_stock;

            await this.dbPool.execute(
                'UPDATE products SET current_stock = ?, updated_at = NOW() WHERE id = ?',
                [newStock, productId]
            );

            // Log stock change
            await this.dbPool.execute(`
                INSERT INTO stock_adjustments (product_id, old_stock, new_stock, adjustment_reason, adjusted_by, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            `, [productId, oldStock, newStock, reason, userId]);

            return {
                productId,
                productName: product[0].name,
                oldStock,
                newStock,
                change: newStock - oldStock,
                reason
            };
        } catch (error) {
            logger.error('Error updating product stock:', error);
            throw error;
        }
    }

    /**
     * Create order note
     */
    async createOrderNote(orderId, note, userId) {
        try {
            const [order] = await this.dbPool.execute(
                'SELECT * FROM orders WHERE id = ?',
                [orderId]
            );

            if (order.length === 0) {
                throw new Error('Order not found');
            }

            await this.dbPool.execute(`
                INSERT INTO order_notes (order_id, note, created_by, created_at)
                VALUES (?, ?, ?, NOW())
            `, [orderId, note, userId]);

            return {
                orderId,
                orderNumber: order[0].order_number,
                note,
                createdBy: userId
            };
        } catch (error) {
            logger.error('Error creating order note:', error);
            throw error;
        }
    }

    /**
     * Update order status
     */
    async updateOrderStatus(orderId, newStatus, reason, userId) {
        try {
            const [order] = await this.dbPool.execute(
                'SELECT * FROM orders WHERE id = ?',
                [orderId]
            );

            if (order.length === 0) {
                throw new Error('Order not found');
            }

            const oldStatus = order[0].status;

            await this.dbPool.execute(
                'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
                [newStatus, orderId]
            );

            // Log status change
            await this.dbPool.execute(`
                INSERT INTO order_status_history (order_id, old_status, new_status, change_reason, changed_by, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            `, [orderId, oldStatus, newStatus, reason, userId]);

            return {
                orderId,
                orderNumber: order[0].order_number,
                oldStatus,
                newStatus,
                reason
            };
        } catch (error) {
            logger.error('Error updating order status:', error);
            throw error;
        }
    }

    /**
     * Send notification to users
     */
    async sendNotification(recipients, message, type, userId) {
        try {
            // This would integrate with your notification system
            // For now, we'll log it and return success

            logger.info(`📢 Notification sent by AI (user ${userId}):`, {
                recipients,
                message,
                type
            });

            return {
                recipients: Array.isArray(recipients) ? recipients : [recipients],
                message,
                type,
                sentBy: userId,
                sentAt: new Date().toISOString()
            };
        } catch (error) {
            logger.error('Error sending notification:', error);
            throw error;
        }
    }

    /**
     * Generate custom business report
     */
    async generateReport(reportType, parameters, userId) {
        try {
            let reportData;

            switch (reportType) {
                case 'sales_summary':
                    reportData = await aiDatabaseTools.getBusinessAnalytics(
                        parameters.period || 'month'
                    );
                    break;

                case 'inventory_report':
                    reportData = await aiDatabaseTools.getInventoryAlerts();
                    break;

                case 'store_performance':
                    reportData = await aiDatabaseTools.getStorePerformance(
                        parameters.period || 'month'
                    );
                    break;

                case 'financial_analysis':
                    reportData = await aiDatabaseTools.getFinancialSummary(
                        parameters.period || 'month'
                    );
                    break;

                default:
                    throw new Error(`Unknown report type: ${reportType}`);
            }

            return {
                reportType,
                parameters,
                data: reportData,
                generatedBy: userId,
                generatedAt: new Date().toISOString()
            };
        } catch (error) {
            logger.error('Error generating report:', error);
            throw error;
        }
    }

    /**
     * Predict stock needs based on sales patterns
     */
    async predictStockNeeds(productId, daysAhead) {
        try {
            const [salesData] = await this.dbPool.execute(`
                SELECT 
                    p.id,
                    p.name,
                    p.current_stock,
                    p.minimum_stock,
                    AVG(daily_sales.daily_total) as avg_daily_sales,
                    MAX(daily_sales.daily_total) as max_daily_sales,
                    MIN(daily_sales.daily_total) as min_daily_sales,
                    COUNT(daily_sales.sale_date) as days_with_sales
                FROM products p
                LEFT JOIN (
                    SELECT 
                        oi.product_id,
                        DATE(o.created_at) as sale_date,
                        SUM(oi.quantity) as daily_total
                    FROM order_items oi
                    JOIN orders o ON oi.order_id = o.id
                    WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                    AND o.status IN ('confirmed', 'delivered')
                    AND oi.product_id = ?
                    GROUP BY oi.product_id, DATE(o.created_at)
                ) daily_sales ON p.id = daily_sales.product_id
                WHERE p.id = ?
                GROUP BY p.id
            `, [productId, productId]);

            if (salesData.length === 0) {
                throw new Error('Product not found or no sales data available');
            }

            const product = salesData[0];
            const avgDailySales = parseFloat(product.avg_daily_sales) || 0;
            const maxDailySales = parseFloat(product.max_daily_sales) || 0;

            const projectedNeed = avgDailySales * daysAhead;
            const worstCaseNeed = maxDailySales * daysAhead;
            const currentStock = parseInt(product.current_stock) || 0;

            const recommendedOrder = Math.max(0, Math.ceil(projectedNeed - currentStock));
            const safetyStock = Math.max(0, Math.ceil(worstCaseNeed - currentStock));

            return {
                productId,
                productName: product.name,
                currentStock,
                avgDailySales,
                maxDailySales,
                daysAhead,
                projectedNeed,
                worstCaseNeed,
                recommendedOrder,
                safetyStock,
                daysUntilStockOut: avgDailySales > 0 ? Math.floor(currentStock / avgDailySales) : 999,
                prediction: {
                    status: currentStock >= projectedNeed ? 'sufficient' : 'needs_restock',
                    urgency: currentStock < avgDailySales * 3 ? 'high' : 'normal'
                }
            };
        } catch (error) {
            logger.error('Error predicting stock needs:', error);
            throw error;
        }
    }

    /**
     * Analyze sales patterns
     */
    async analyzeSalesPatterns(period, groupBy) {
        try {
            let groupByClause, dateFormat;

            switch (groupBy) {
                case 'hour':
                    groupByClause = 'HOUR(o.created_at)';
                    dateFormat = 'HOUR(o.created_at)';
                    break;
                case 'day':
                    groupByClause = 'DATE(o.created_at)';
                    dateFormat = 'DATE(o.created_at)';
                    break;
                case 'week':
                    groupByClause = 'YEARWEEK(o.created_at)';
                    dateFormat = 'YEARWEEK(o.created_at)';
                    break;
                case 'month':
                    groupByClause = 'YEAR(o.created_at), MONTH(o.created_at)';
                    dateFormat = 'DATE_FORMAT(o.created_at, "%Y-%m")';
                    break;
                default:
                    groupByClause = 'DATE(o.created_at)';
                    dateFormat = 'DATE(o.created_at)';
            }

            const dateCondition = aiDatabaseTools.getDateCondition(period);

            const [results] = await this.dbPool.execute(`
                SELECT 
                    ${dateFormat} as period,
                    COUNT(DISTINCT o.id) as order_count,
                    SUM(o.total_amount_eur) as total_revenue,
                    AVG(o.total_amount_eur) as avg_order_value,
                    COUNT(DISTINCT o.store_id) as unique_customers,
                    SUM(oi.quantity) as total_items_sold
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                WHERE ${dateCondition}
                GROUP BY ${groupByClause}
                ORDER BY period
            `);

            // Calculate patterns and trends
            const patterns = this.calculateSalesPatterns(results);

            return {
                period,
                groupBy,
                data: results,
                patterns,
                analysis: {
                    totalPeriods: results.length,
                    avgOrdersPerPeriod: patterns.avgOrdersPerPeriod,
                    avgRevenuePerPeriod: patterns.avgRevenuePerPeriod,
                    trend: patterns.trend,
                    bestPeriod: patterns.bestPeriod,
                    worstPeriod: patterns.worstPeriod
                }
            };
        } catch (error) {
            logger.error('Error analyzing sales patterns:', error);
            throw error;
        }
    }

    /**
     * Calculate profit margins
     */
    async calculateProfitMargins(period, groupBy) {
        try {
            const dateCondition = aiDatabaseTools.getDateCondition(period);
            let groupByClause;

            switch (groupBy) {
                case 'product':
                    groupByClause = 'p.id, p.name, p.category';
                    break;
                case 'category':
                    groupByClause = 'p.category';
                    break;
                case 'store':
                    groupByClause = 's.id, s.name';
                    break;
                default:
                    groupByClause = 'p.id, p.name, p.category';
            }

            const [results] = await this.dbPool.execute(`
                SELECT 
                    ${groupByClause},
                    SUM(oi.quantity) as units_sold,
                    SUM(oi.quantity * p.price_eur) as gross_revenue,
                    SUM(oi.quantity * p.cost_price_eur) as total_cost,
                    SUM(oi.quantity * (p.price_eur - p.cost_price_eur)) as gross_profit,
                    AVG(p.price_eur) as avg_selling_price,
                    AVG(p.cost_price_eur) as avg_cost_price,
                    (SUM(oi.quantity * (p.price_eur - p.cost_price_eur)) / SUM(oi.quantity * p.price_eur)) * 100 as profit_margin_percent
                FROM products p
                JOIN order_items oi ON p.id = oi.product_id
                JOIN orders o ON oi.order_id = o.id
                LEFT JOIN stores s ON o.store_id = s.id
                WHERE ${dateCondition} AND p.cost_price_eur IS NOT NULL AND p.cost_price_eur > 0
                GROUP BY ${groupByClause}
                HAVING units_sold > 0
                ORDER BY profit_margin_percent DESC
            `);

            return {
                period,
                groupBy,
                data: results,
                summary: {
                    totalItems: results.length,
                    avgProfitMargin: results.reduce((sum, item) => sum + parseFloat(item.profit_margin_percent || 0), 0) / results.length,
                    totalGrossProfit: results.reduce((sum, item) => sum + parseFloat(item.gross_profit || 0), 0),
                    totalGrossRevenue: results.reduce((sum, item) => sum + parseFloat(item.gross_revenue || 0), 0)
                }
            };
        } catch (error) {
            logger.error('Error calculating profit margins:', error);
            throw error;
        }
    }

    /**
     * Calculate sales patterns from data
     */
    calculateSalesPatterns(data) {
        if (!data || data.length === 0) {
            return {
                avgOrdersPerPeriod: 0,
                avgRevenuePerPeriod: 0,
                trend: 'no_data',
                bestPeriod: null,
                worstPeriod: null
            };
        }

        const totalOrders = data.reduce((sum, item) => sum + parseInt(item.order_count || 0), 0);
        const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0);

        const avgOrdersPerPeriod = totalOrders / data.length;
        const avgRevenuePerPeriod = totalRevenue / data.length;

        // Find best and worst periods
        const bestPeriod = data.reduce((best, current) =>
            parseFloat(current.total_revenue || 0) > parseFloat(best.total_revenue || 0) ? current : best
        );

        const worstPeriod = data.reduce((worst, current) =>
            parseFloat(current.total_revenue || 0) < parseFloat(worst.total_revenue || 0) ? current : worst
        );

        // Calculate trend (simple linear regression on revenue)
        let trend = 'stable';
        if (data.length >= 3) {
            const firstHalf = data.slice(0, Math.floor(data.length / 2));
            const secondHalf = data.slice(Math.floor(data.length / 2));

            const firstHalfAvg = firstHalf.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0) / firstHalf.length;
            const secondHalfAvg = secondHalf.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0) / secondHalf.length;

            if (secondHalfAvg > firstHalfAvg * 1.1) {
                trend = 'increasing';
            } else if (secondHalfAvg < firstHalfAvg * 0.9) {
                trend = 'decreasing';
            }
        }

        return {
            avgOrdersPerPeriod,
            avgRevenuePerPeriod,
            trend,
            bestPeriod,
            worstPeriod
        };
    }

    /**
     * Log action execution
     */
    logActionExecution(actionName, parameters, userId, userRole, success, result) {
        const logEntry = {
            actionName,
            parameters,
            userId,
            userRole,
            success,
            result: success ? 'Success' : result,
            timestamp: new Date().toISOString()
        };

        // Store in memory (in production, you'd want to store in database)
        const userHistory = this.actionHistory.get(userId) || [];
        userHistory.push(logEntry);
        this.actionHistory.set(userId, userHistory.slice(-50)); // Keep last 50 actions

        logger.info(`📝 Action logged: ${actionName} - ${success ? 'SUCCESS' : 'FAILED'}`);
    }

    /**
     * Get available actions for user role
     */
    getAvailableActions(userRole) {
        return Object.entries(this.availableActions)
            .filter(([_, action]) => this.hasPermission(userRole, action.permission))
            .reduce((available, [name, action]) => {
                available[name] = {
                    description: action.description,
                    parameters: action.parameters
                };
                return available;
            }, {});
    }

    /**
     * Get user action history
     */
    getUserActionHistory(userId, limit = 10) {
        const history = this.actionHistory.get(userId) || [];
        return history.slice(-limit).reverse();
    }
}

export default new AIActionSystem();