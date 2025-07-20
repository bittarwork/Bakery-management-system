/**
 * Enhanced Pricing Controller
 * Handles dynamic pricing, price history, and bulk price updates
 * Phase 6 - Complete Order Management
 */

import db from '../config/database.js';
import logger from '../config/logger.js';

class EnhancedPricingController {
    /**
     * Get pricing rules with pagination and filtering
     * GET /api/pricing/rules
     */
    static async getPricingRules(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                is_active,
                rule_type,
                search
            } = req.query;

            const offset = (page - 1) * limit;
            let whereClause = 'WHERE 1=1';
            const params = [];

            if (is_active !== undefined) {
                whereClause += ' AND is_active = ?';
                params.push(is_active === 'true');
            }

            if (rule_type) {
                whereClause += ' AND rule_type = ?';
                params.push(rule_type);
            }

            if (search) {
                whereClause += ' AND (name LIKE ? OR description LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }

            // Get total count
            const countQuery = `SELECT COUNT(*) as total FROM pricing_rules ${whereClause}`;
            const countResult = await db.get(countQuery, params);
            const totalItems = countResult.total;

            // Get rules
            const rulesQuery = `
                SELECT pr.*, u.name as created_by_name
                FROM pricing_rules pr
                LEFT JOIN users u ON pr.created_by = u.id
                ${whereClause}
                ORDER BY pr.priority DESC, pr.created_at DESC
                LIMIT ? OFFSET ?
            `;

            const rules = await db.all(rulesQuery, [...params, limit, offset]);

            // Parse JSON fields
            const formattedRules = rules.map(rule => ({
                ...rule,
                conditions: rule.conditions ? JSON.parse(rule.conditions) : {},
                action: rule.action ? JSON.parse(rule.action) : {},
                applicable_products: rule.applicable_products ? JSON.parse(rule.applicable_products) : null,
                applicable_stores: rule.applicable_stores ? JSON.parse(rule.applicable_stores) : null
            }));

            res.json({
                success: true,
                data: {
                    rules: formattedRules,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(totalItems / limit),
                        totalItems,
                        itemsPerPage: parseInt(limit)
                    }
                }
            });

        } catch (error) {
            logger.error('Error fetching pricing rules:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب قواعد التسعير',
                error: error.message
            });
        }
    }

    /**
     * Create new pricing rule
     * POST /api/pricing/rules
     */
    static async createPricingRule(req, res) {
        try {
            const {
                name,
                description,
                rule_type = 'percentage',
                conditions,
                action,
                priority = 1,
                applicable_products,
                applicable_stores,
                start_date,
                end_date
            } = req.body;

            // Validation
            if (!name || !conditions || !action) {
                return res.status(400).json({
                    success: false,
                    message: 'اسم القاعدة والشروط والإجراء مطلوبة'
                });
            }

            const query = `
                INSERT INTO pricing_rules 
                (name, description, rule_type, conditions, action, priority, 
                 applicable_products, applicable_stores, start_date, end_date, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const result = await db.run(query, [
                name,
                description,
                rule_type,
                JSON.stringify(conditions),
                JSON.stringify(action),
                priority,
                applicable_products ? JSON.stringify(applicable_products) : null,
                applicable_stores ? JSON.stringify(applicable_stores) : null,
                start_date,
                end_date,
                req.user?.id
            ]);

            // Get the created rule
            const createdRule = await db.get(
                'SELECT * FROM pricing_rules WHERE id = ?',
                [result.lastID]
            );

            res.status(201).json({
                success: true,
                message: 'تم إنشاء قاعدة التسعير بنجاح',
                data: {
                    ...createdRule,
                    conditions: JSON.parse(createdRule.conditions),
                    action: JSON.parse(createdRule.action),
                    applicable_products: createdRule.applicable_products ? JSON.parse(createdRule.applicable_products) : null,
                    applicable_stores: createdRule.applicable_stores ? JSON.parse(createdRule.applicable_stores) : null
                }
            });

        } catch (error) {
            logger.error('Error creating pricing rule:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في إنشاء قاعدة التسعير',
                error: error.message
            });
        }
    }

    /**
     * Calculate dynamic price for a product
     * POST /api/pricing/calculate
     */
    static async calculateDynamicPrice(req, res) {
        try {
            const {
                product_id,
                quantity = 1,
                store_id,
                customer_type,
                order_date = new Date().toISOString().split('T')[0]
            } = req.body;

            if (!product_id) {
                return res.status(400).json({
                    success: false,
                    message: 'معرف المنتج مطلوب'
                });
            }

            // Get product base price
            const product = await db.get('SELECT * FROM products WHERE id = ?', [product_id]);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'المنتج غير موجود'
                });
            }

            const basePrice = parseFloat(product.price_eur) || 0;
            let finalPrice = basePrice;
            const appliedRules = [];

            // Get applicable pricing rules
            const rulesQuery = `
                SELECT * FROM pricing_rules
                WHERE is_active = 1
                AND (start_date IS NULL OR start_date <= ?)
                AND (end_date IS NULL OR end_date >= ?)
                ORDER BY priority DESC
            `;

            const rules = await db.all(rulesQuery, [order_date, order_date]);

            for (const rule of rules) {
                const conditions = JSON.parse(rule.conditions);
                const action = JSON.parse(rule.action);

                // Check if rule applies
                if (this.checkRuleConditions(conditions, {
                    quantity,
                    store_id,
                    customer_type,
                    order_date,
                    product_id,
                    base_price: basePrice
                })) {

                    // Apply pricing rule
                    const ruleResult = this.applyPricingRule(finalPrice, action, rule.rule_type);
                    finalPrice = ruleResult.newPrice;

                    appliedRules.push({
                        rule_id: rule.id,
                        rule_name: rule.name,
                        rule_type: rule.rule_type,
                        original_price: ruleResult.originalPrice,
                        new_price: ruleResult.newPrice,
                        discount_amount: ruleResult.originalPrice - ruleResult.newPrice,
                        action: action
                    });

                    // If rule is exclusive, break
                    if (action.exclusive) break;
                }
            }

            res.json({
                success: true,
                data: {
                    product_id,
                    base_price: basePrice,
                    final_price: Math.max(finalPrice, 0), // Ensure non-negative
                    total_discount: basePrice - finalPrice,
                    discount_percentage: basePrice > 0 ? ((basePrice - finalPrice) / basePrice) * 100 : 0,
                    applied_rules: appliedRules,
                    calculation_context: {
                        quantity,
                        store_id,
                        customer_type,
                        order_date
                    }
                }
            });

        } catch (error) {
            logger.error('Error calculating dynamic price:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في حساب السعر الديناميكي',
                error: error.message
            });
        }
    }

    /**
     * Bulk update product prices
     * POST /api/pricing/bulk-update
     */
    static async bulkUpdatePrices(req, res) {
        const db_transaction = await db.beginTransaction();

        try {
            const {
                updates, // Array of {product_id, new_price, reason}
                update_type = 'manual',
                apply_percentage, // Optional: apply percentage to all
                category_filter, // Optional: filter by category
                price_range_filter // Optional: filter by price range
            } = req.body;

            let productsToUpdate = [];

            if (updates && Array.isArray(updates)) {
                // Individual product updates
                productsToUpdate = updates;
            } else if (apply_percentage) {
                // Percentage-based bulk update
                let whereClause = 'WHERE 1=1';
                const params = [];

                if (category_filter) {
                    whereClause += ' AND category = ?';
                    params.push(category_filter);
                }

                if (price_range_filter?.min) {
                    whereClause += ' AND price_eur >= ?';
                    params.push(price_range_filter.min);
                }

                if (price_range_filter?.max) {
                    whereClause += ' AND price_eur <= ?';
                    params.push(price_range_filter.max);
                }

                const products = await db.all(`SELECT id, price_eur FROM products ${whereClause}`, params);

                productsToUpdate = products.map(product => ({
                    product_id: product.id,
                    new_price: product.price_eur * (1 + apply_percentage / 100),
                    reason: `تحديث مجمع ${apply_percentage > 0 ? '+' : ''}${apply_percentage}%`
                }));
            }

            if (productsToUpdate.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'لا توجد منتجات للتحديث'
                });
            }

            const results = {
                total_updates: productsToUpdate.length,
                successful_updates: 0,
                failed_updates: 0,
                errors: []
            };

            // Log bulk operation start
            const bulkOpResult = await db.run(`
                INSERT INTO bulk_operations_log 
                (operation_type, total_items, executed_by, operation_data)
                VALUES (?, ?, ?, ?)
            `, [
                'price_update',
                productsToUpdate.length,
                req.user?.id,
                JSON.stringify({
                    update_type,
                    apply_percentage,
                    category_filter,
                    price_range_filter
                })
            ]);

            const bulkOpId = bulkOpResult.lastID;

            // Process each update
            for (const update of productsToUpdate) {
                try {
                    const { product_id, new_price, reason = 'تحديث مجمع' } = update;

                    // Get current price
                    const currentProduct = await db.get(
                        'SELECT price_eur FROM products WHERE id = ?',
                        [product_id]
                    );

                    if (!currentProduct) {
                        results.errors.push(`المنتج ${product_id} غير موجود`);
                        results.failed_updates++;
                        continue;
                    }

                    const oldPrice = parseFloat(currentProduct.price_eur);
                    const newPriceValue = parseFloat(new_price);

                    // Validate new price
                    if (isNaN(newPriceValue) || newPriceValue < 0) {
                        results.errors.push(`سعر غير صالح للمنتج ${product_id}`);
                        results.failed_updates++;
                        continue;
                    }

                    // Update product price
                    await db.run(
                        'UPDATE products SET price_eur = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                        [newPriceValue, product_id]
                    );

                    // Log price change
                    await db.run(`
                        INSERT INTO price_history 
                        (product_id, old_price_eur, new_price_eur, change_reason, change_type, changed_by)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `, [
                        product_id,
                        oldPrice,
                        newPriceValue,
                        reason,
                        update_type,
                        req.user?.id
                    ]);

                    results.successful_updates++;

                } catch (updateError) {
                    logger.error(`Error updating product ${update.product_id}:`, updateError);
                    results.errors.push(`خطأ في تحديث المنتج ${update.product_id}: ${updateError.message}`);
                    results.failed_updates++;
                }
            }

            // Update bulk operation log
            await db.run(`
                UPDATE bulk_operations_log 
                SET successful_items = ?, failed_items = ?, error_details = ?, completed_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [
                results.successful_updates,
                results.failed_updates,
                JSON.stringify(results.errors),
                bulkOpId
            ]);

            await db_transaction.commit();

            res.json({
                success: true,
                message: `تم تحديث ${results.successful_updates} من ${results.total_updates} منتج بنجاح`,
                data: results
            });

        } catch (error) {
            await db_transaction.rollback();
            logger.error('Error in bulk price update:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في التحديث المجمع للأسعار',
                error: error.message
            });
        }
    }

    /**
     * Get price history for a product or all products
     * GET /api/pricing/history
     */
    static async getPriceHistory(req, res) {
        try {
            const {
                product_id,
                page = 1,
                limit = 10,
                date_from,
                date_to,
                change_type
            } = req.query;

            const offset = (page - 1) * limit;
            let whereClause = 'WHERE 1=1';
            const params = [];

            if (product_id) {
                whereClause += ' AND ph.product_id = ?';
                params.push(product_id);
            }

            if (date_from) {
                whereClause += ' AND ph.created_at >= ?';
                params.push(date_from);
            }

            if (date_to) {
                whereClause += ' AND ph.created_at <= ?';
                params.push(date_to + ' 23:59:59');
            }

            if (change_type) {
                whereClause += ' AND ph.change_type = ?';
                params.push(change_type);
            }

            // Get total count
            const countQuery = `SELECT COUNT(*) as total FROM price_history ph ${whereClause}`;
            const countResult = await db.get(countQuery, params);
            const totalItems = countResult.total;

            // Get history
            const historyQuery = `
                SELECT 
                    ph.*,
                    p.name as product_name,
                    p.category as product_category,
                    u.name as changed_by_name,
                    (ph.new_price_eur - ph.old_price_eur) as price_difference,
                    CASE 
                        WHEN ph.new_price_eur > ph.old_price_eur THEN 'increase'
                        WHEN ph.new_price_eur < ph.old_price_eur THEN 'decrease'
                        ELSE 'no_change'
                    END as change_direction
                FROM price_history ph
                LEFT JOIN products p ON ph.product_id = p.id
                LEFT JOIN users u ON ph.changed_by = u.id
                ${whereClause}
                ORDER BY ph.created_at DESC
                LIMIT ? OFFSET ?
            `;

            const history = await db.all(historyQuery, [...params, limit, offset]);

            // Get price trend if product_id is specified
            let priceTrend = null;
            if (product_id) {
                const trendQuery = `
                    SELECT 
                        DATE(created_at) as date,
                        AVG(new_price_eur) as avg_price,
                        COUNT(*) as changes_count
                    FROM price_history 
                    WHERE product_id = ? 
                    AND created_at >= date('now', '-30 days')
                    GROUP BY DATE(created_at)
                    ORDER BY date DESC
                `;
                priceTrend = await db.all(trendQuery, [product_id]);
            }

            res.json({
                success: true,
                data: {
                    history,
                    price_trend: priceTrend,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(totalItems / limit),
                        totalItems,
                        itemsPerPage: parseInt(limit)
                    }
                }
            });

        } catch (error) {
            logger.error('Error fetching price history:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب تاريخ الأسعار',
                error: error.message
            });
        }
    }

    /**
     * Helper method to check if pricing rule conditions are met
     */
    static checkRuleConditions(conditions, context) {
        try {
            // Check quantity conditions
            if (conditions.min_quantity && context.quantity < conditions.min_quantity) {
                return false;
            }
            if (conditions.max_quantity && context.quantity > conditions.max_quantity) {
                return false;
            }

            // Check order amount conditions
            if (conditions.min_order_amount && (context.quantity * context.base_price) < conditions.min_order_amount) {
                return false;
            }

            // Check store conditions
            if (conditions.store_ids && !conditions.store_ids.includes(context.store_id)) {
                return false;
            }

            // Check customer type conditions
            if (conditions.customer_type && context.customer_type !== conditions.customer_type) {
                return false;
            }

            // Check date conditions
            if (conditions.weekdays) {
                const orderDate = new Date(context.order_date);
                const weekday = orderDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
                if (!conditions.weekdays.includes(weekday)) {
                    return false;
                }
            }

            // Check seasonal conditions
            if (conditions.season) {
                const orderDate = new Date(context.order_date);
                const month = orderDate.getMonth(); // 0 = January, 11 = December

                const seasons = {
                    spring: [2, 3, 4], // March, April, May
                    summer: [5, 6, 7], // June, July, August
                    autumn: [8, 9, 10], // September, October, November
                    winter: [11, 0, 1] // December, January, February
                };

                if (seasons[conditions.season] && !seasons[conditions.season].includes(month)) {
                    return false;
                }
            }

            return true;
        } catch (error) {
            logger.error('Error checking rule conditions:', error);
            return false;
        }
    }

    /**
     * Helper method to apply pricing rule
     */
    static applyPricingRule(currentPrice, action, ruleType) {
        const originalPrice = currentPrice;
        let newPrice = currentPrice;

        try {
            switch (ruleType) {
                case 'percentage':
                    if (action.discount_percentage) {
                        newPrice = currentPrice * (1 - action.discount_percentage / 100);
                    } else if (action.increase_percentage) {
                        newPrice = currentPrice * (1 + action.increase_percentage / 100);
                    }
                    break;

                case 'fixed':
                    if (action.discount_amount) {
                        newPrice = currentPrice - action.discount_amount;
                    } else if (action.increase_amount) {
                        newPrice = currentPrice + action.increase_amount;
                    } else if (action.fixed_price) {
                        newPrice = action.fixed_price;
                    }
                    break;

                case 'tiered':
                    if (action.tiers && Array.isArray(action.tiers)) {
                        // Find applicable tier based on current price or quantity
                        const applicableTier = action.tiers.find(tier =>
                            currentPrice >= (tier.min_price || 0) &&
                            currentPrice <= (tier.max_price || Infinity)
                        );
                        if (applicableTier) {
                            if (applicableTier.discount_percentage) {
                                newPrice = currentPrice * (1 - applicableTier.discount_percentage / 100);
                            } else if (applicableTier.fixed_price) {
                                newPrice = applicableTier.fixed_price;
                            }
                        }
                    }
                    break;
            }

            // Ensure minimum price if specified
            if (action.min_price && newPrice < action.min_price) {
                newPrice = action.min_price;
            }

            // Ensure maximum price if specified
            if (action.max_price && newPrice > action.max_price) {
                newPrice = action.max_price;
            }

        } catch (error) {
            logger.error('Error applying pricing rule:', error);
            newPrice = originalPrice; // Fallback to original price
        }

        return {
            originalPrice,
            newPrice: Math.round(newPrice * 100) / 100 // Round to 2 decimal places
        };
    }
}

export default EnhancedPricingController; 