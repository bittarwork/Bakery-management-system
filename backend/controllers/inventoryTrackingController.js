import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bakery_db'
});

// ==========================================
// 📦 INVENTORY TRACKING SYSTEM (نظام تتبع المخزون)
// ==========================================

/**
 * Load vehicle inventory for distributor
 * @param {number} distributorId - Distributor ID
 * @param {Object} inventoryData - Inventory data to load
 * @returns {Object} Loading result
 */
export const loadVehicleInventory = async (distributorId, inventoryData) => {
    try {
        const { products, loadingDate = new Date().toISOString().split('T')[0] } = inventoryData;

        // Start transaction
        await db.beginTransaction();

        // Clear existing inventory for the day
        await db.execute(`
            DELETE FROM vehicle_inventory 
            WHERE distributor_id = ? AND DATE(last_updated) = ?
        `, [distributorId, loadingDate]);

        const loadingResults = [];

        // Load each product
        for (const product of products) {
            const { productId, quantity, notes } = product;

            // Get product details
            const [productRows] = await db.execute(`
                SELECT name, category, unit FROM products WHERE id = ?
            `, [productId]);

            if (productRows.length === 0) {
                throw new Error(`المنتج غير موجود: ${productId}`);
            }

            // Insert/Update vehicle inventory
            await db.execute(`
                INSERT INTO vehicle_inventory 
                (distributor_id, product_id, quantity, loaded_quantity, delivered_quantity, returned_quantity, damaged_quantity, last_updated)
                VALUES (?, ?, ?, ?, 0, 0, 0, NOW())
                ON DUPLICATE KEY UPDATE
                quantity = VALUES(quantity),
                loaded_quantity = VALUES(loaded_quantity),
                last_updated = NOW()
            `, [distributorId, productId, quantity, quantity]);

            loadingResults.push({
                product_id: productId,
                product_name: productRows[0].name,
                category: productRows[0].category,
                loaded_quantity: quantity,
                notes: notes
            });
        }

        // Log the loading operation
        await db.execute(`
            INSERT INTO inventory_logs 
            (distributor_id, action, details, created_at)
            VALUES (?, 'vehicle_loaded', ?, NOW())
        `, [distributorId, JSON.stringify({ products: loadingResults, loading_date: loadingDate })]);

        await db.commit();

        return {
            distributor_id: distributorId,
            loading_date: loadingDate,
            total_products: products.length,
            total_quantity: products.reduce((sum, p) => sum + p.quantity, 0),
            loaded_products: loadingResults
        };

    } catch (error) {
        await db.rollback();
        console.error('Error loading vehicle inventory:', error);
        throw new Error('خطأ في تحميل مخزون السيارة: ' + error.message);
    }
};

/**
 * Update inventory after delivery
 * @param {number} distributorId - Distributor ID
 * @param {number} orderId - Order ID
 * @param {Object} deliveryData - Delivery data
 * @returns {Object} Update result
 */
export const updateInventoryAfterDelivery = async (distributorId, orderId, deliveryData) => {
    try {
        const { deliveredItems, giftsGiven, damages, returnedItems } = deliveryData;

        // Start transaction
        await db.beginTransaction();

        const updateResults = [];

        // Process delivered items
        for (const item of deliveredItems) {
            const { productId, deliveredQuantity } = item;

            // Update vehicle inventory
            const [updateResult] = await db.execute(`
                UPDATE vehicle_inventory 
                SET quantity = quantity - ?,
                    delivered_quantity = delivered_quantity + ?,
                    last_updated = NOW()
                WHERE distributor_id = ? AND product_id = ?
            `, [deliveredQuantity, deliveredQuantity, distributorId, productId]);

            if (updateResult.affectedRows === 0) {
                throw new Error(`فشل في تحديث مخزون المنتج: ${productId}`);
            }

            updateResults.push({
                product_id: productId,
                action: 'delivered',
                quantity: deliveredQuantity
            });
        }

        // Process gifts given
        if (giftsGiven && giftsGiven.length > 0) {
            for (const gift of giftsGiven) {
                const { productId, giftQuantity } = gift;

                await db.execute(`
                    UPDATE vehicle_inventory 
                    SET quantity = quantity - ?,
                        last_updated = NOW()
                    WHERE distributor_id = ? AND product_id = ?
                `, [giftQuantity, distributorId, productId]);

                // Record gift in gift_transactions
                await db.execute(`
                    INSERT INTO gift_transactions 
                    (distributor_id, order_id, product_id, quantity, gift_date)
                    VALUES (?, ?, ?, ?, NOW())
                `, [distributorId, orderId, productId, giftQuantity]);

                updateResults.push({
                    product_id: productId,
                    action: 'gift_given',
                    quantity: giftQuantity
                });
            }
        }

        // Process damages
        if (damages && damages.length > 0) {
            for (const damage of damages) {
                const { productId, damagedQuantity, reason } = damage;

                await db.execute(`
                    UPDATE vehicle_inventory 
                    SET quantity = quantity - ?,
                        damaged_quantity = damaged_quantity + ?,
                        last_updated = NOW()
                    WHERE distributor_id = ? AND product_id = ?
                `, [damagedQuantity, damagedQuantity, distributorId, productId]);

                // Record damage
                await db.execute(`
                    INSERT INTO damage_records 
                    (distributor_id, product_id, quantity, reason, recorded_date)
                    VALUES (?, ?, ?, ?, NOW())
                `, [distributorId, productId, damagedQuantity, reason]);

                updateResults.push({
                    product_id: productId,
                    action: 'damaged',
                    quantity: damagedQuantity,
                    reason: reason
                });
            }
        }

        // Process returns
        if (returnedItems && returnedItems.length > 0) {
            for (const returned of returnedItems) {
                const { productId, returnedQuantity, reason } = returned;

                await db.execute(`
                    UPDATE vehicle_inventory 
                    SET returned_quantity = returned_quantity + ?,
                        last_updated = NOW()
                    WHERE distributor_id = ? AND product_id = ?
                `, [returnedQuantity, distributorId, productId]);

                updateResults.push({
                    product_id: productId,
                    action: 'returned',
                    quantity: returnedQuantity,
                    reason: reason
                });
            }
        }

        // Log the inventory update
        await db.execute(`
            INSERT INTO inventory_logs 
            (distributor_id, action, details, created_at)
            VALUES (?, 'delivery_update', ?, NOW())
        `, [distributorId, JSON.stringify({
            order_id: orderId,
            updates: updateResults
        })]);

        await db.commit();

        return {
            distributor_id: distributorId,
            order_id: orderId,
            updates: updateResults,
            updated_at: new Date().toISOString()
        };

    } catch (error) {
        await db.rollback();
        console.error('Error updating inventory after delivery:', error);
        throw new Error('خطأ في تحديث المخزون بعد التسليم: ' + error.message);
    }
};

/**
 * Calculate automatic gifts based on policies
 * @param {number} storeId - Store ID
 * @param {Array} orderItems - Order items
 * @returns {Object} Calculated gifts
 */
export const calculateAutomaticGifts = async (storeId, orderItems) => {
    try {
        // Get gift policies for the store
        const [giftPolicies] = await db.execute(`
            SELECT 
                gp.id,
                gp.product_id,
                gp.buy_quantity,
                gp.gift_quantity,
                p.name as product_name,
                p.category
            FROM gift_policies gp
            JOIN products p ON gp.product_id = p.id
            WHERE (gp.store_id = ? OR gp.store_id IS NULL)
            AND gp.is_active = 1
            AND (gp.start_date IS NULL OR gp.start_date <= CURDATE())
            AND (gp.end_date IS NULL OR gp.end_date >= CURDATE())
            ORDER BY gp.store_id DESC -- Store-specific policies take precedence
        `, [storeId]);

        // Also get category-based policies
        const [store] = await db.execute(`
            SELECT category FROM stores WHERE id = ?
        `, [storeId]);

        const [categoryPolicies] = await db.execute(`
            SELECT 
                gp.id,
                gp.product_id,
                gp.buy_quantity,
                gp.gift_quantity,
                p.name as product_name,
                p.category
            FROM gift_policies gp
            JOIN products p ON gp.product_id = p.id
            WHERE gp.store_category = ?
            AND gp.is_active = 1
            AND (gp.start_date IS NULL OR gp.start_date <= CURDATE())
            AND (gp.end_date IS NULL OR gp.end_date >= CURDATE())
        `, [store[0]?.category]);

        // Combine policies
        const allPolicies = [...giftPolicies, ...categoryPolicies];
        const calculatedGifts = [];

        // Calculate gifts for each order item
        for (const item of orderItems) {
            const applicablePolicies = allPolicies.filter(policy =>
                policy.product_id === item.product_id
            );

            for (const policy of applicablePolicies) {
                const eligibleSets = Math.floor(item.quantity / policy.buy_quantity);
                const giftQuantity = eligibleSets * policy.gift_quantity;

                if (giftQuantity > 0) {
                    calculatedGifts.push({
                        policy_id: policy.id,
                        product_id: policy.product_id,
                        product_name: policy.product_name,
                        category: policy.category,
                        buy_quantity: policy.buy_quantity,
                        gift_quantity_per_set: policy.gift_quantity,
                        eligible_sets: eligibleSets,
                        total_gift_quantity: giftQuantity,
                        based_on_quantity: item.quantity
                    });
                }
            }
        }

        return {
            store_id: storeId,
            calculated_gifts: calculatedGifts,
            total_gift_items: calculatedGifts.length,
            total_gift_quantity: calculatedGifts.reduce((sum, gift) => sum + gift.total_gift_quantity, 0)
        };

    } catch (error) {
        console.error('Error calculating automatic gifts:', error);
        throw new Error('خطأ في حساب الهدايا التلقائية: ' + error.message);
    }
};

/**
 * Get inventory status report
 * @param {number} distributorId - Distributor ID (optional)
 * @param {Object} filters - Report filters
 * @returns {Object} Inventory status report
 */
export const getInventoryStatusReport = async (distributorId = null, filters = {}) => {
    try {
        const { date = new Date().toISOString().split('T')[0], category, productName } = filters;

        let whereConditions = 'WHERE 1=1';
        const params = [];

        if (distributorId) {
            whereConditions += ' AND vi.distributor_id = ?';
            params.push(distributorId);
        }

        if (category) {
            whereConditions += ' AND p.category = ?';
            params.push(category);
        }

        if (productName) {
            whereConditions += ' AND p.name LIKE ?';
            params.push(`%${productName}%`);
        }

        // Add date filter for last_updated
        whereConditions += ' AND DATE(vi.last_updated) = ?';
        params.push(date);

        // Get current inventory status
        const [inventoryStatus] = await db.execute(`
            SELECT 
                vi.distributor_id,
                u.full_name as distributor_name,
                vi.product_id,
                p.name as product_name,
                p.category,
                p.unit,
                vi.quantity as current_quantity,
                vi.loaded_quantity,
                vi.delivered_quantity,
                vi.returned_quantity,
                vi.damaged_quantity,
                vi.last_updated,
                (vi.loaded_quantity - vi.delivered_quantity - vi.damaged_quantity) as expected_remaining,
                CASE 
                    WHEN vi.quantity < 0 THEN 'Negative Stock'
                    WHEN vi.quantity = 0 THEN 'Empty'
                    WHEN vi.quantity < (vi.loaded_quantity * 0.1) THEN 'Low Stock'
                    ELSE 'Normal'
                END as stock_status
            FROM vehicle_inventory vi
            JOIN users u ON vi.distributor_id = u.id
            JOIN products p ON vi.product_id = p.id
            ${whereConditions}
            ORDER BY u.full_name, p.category, p.name
        `, params);

        // Get summary statistics
        const [summaryStats] = await db.execute(`
            SELECT 
                COUNT(DISTINCT vi.distributor_id) as active_distributors,
                COUNT(DISTINCT vi.product_id) as products_in_stock,
                SUM(vi.quantity) as total_current_quantity,
                SUM(vi.loaded_quantity) as total_loaded_quantity,
                SUM(vi.delivered_quantity) as total_delivered_quantity,
                SUM(vi.returned_quantity) as total_returned_quantity,
                SUM(vi.damaged_quantity) as total_damaged_quantity,
                AVG(vi.quantity) as avg_quantity_per_product
            FROM vehicle_inventory vi
            JOIN products p ON vi.product_id = p.id
            ${whereConditions}
        `, params);

        // Group by distributor for summary
        const distributorSummary = {};
        inventoryStatus.forEach(item => {
            if (!distributorSummary[item.distributor_id]) {
                distributorSummary[item.distributor_id] = {
                    distributor_id: item.distributor_id,
                    distributor_name: item.distributor_name,
                    total_products: 0,
                    total_quantity: 0,
                    total_delivered: 0,
                    total_damaged: 0,
                    low_stock_items: 0,
                    empty_items: 0
                };
            }

            const summary = distributorSummary[item.distributor_id];
            summary.total_products++;
            summary.total_quantity += item.current_quantity;
            summary.total_delivered += item.delivered_quantity;
            summary.total_damaged += item.damaged_quantity;

            if (item.stock_status === 'Low Stock') summary.low_stock_items++;
            if (item.stock_status === 'Empty') summary.empty_items++;
        });

        return {
            date: date,
            filters: filters,
            summary: summaryStats[0],
            distributor_summary: Object.values(distributorSummary),
            detailed_inventory: inventoryStatus,
            generated_at: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error getting inventory status report:', error);
        throw new Error('خطأ في جلب تقرير حالة المخزون: ' + error.message);
    }
};

/**
 * Get gift transactions report
 * @param {Object} filters - Report filters
 * @returns {Object} Gift transactions report
 */
export const getGiftTransactionsReport = async (filters = {}) => {
    try {
        const {
            distributorId,
            storeId,
            dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dateTo = new Date().toISOString().split('T')[0],
            productCategory
        } = filters;

        let whereConditions = 'WHERE gt.gift_date BETWEEN ? AND ?';
        const params = [dateFrom, dateTo];

        if (distributorId) {
            whereConditions += ' AND gt.distributor_id = ?';
            params.push(distributorId);
        }

        if (storeId) {
            whereConditions += ' AND o.store_id = ?';
            params.push(storeId);
        }

        if (productCategory) {
            whereConditions += ' AND p.category = ?';
            params.push(productCategory);
        }

        // Get gift transactions
        const [giftTransactions] = await db.execute(`
            SELECT 
                gt.id,
                gt.gift_date,
                gt.quantity as gift_quantity,
                u.full_name as distributor_name,
                s.name as store_name,
                s.category as store_category,
                p.name as product_name,
                p.category as product_category,
                p.unit,
                o.order_number,
                o.total_amount_eur as order_value_eur,
                o.total_amount_syp as order_value_syp
            FROM gift_transactions gt
            JOIN users u ON gt.distributor_id = u.id
            JOIN orders o ON gt.order_id = o.id
            JOIN stores s ON o.store_id = s.id
            JOIN products p ON gt.product_id = p.id
            ${whereConditions}
            ORDER BY gt.gift_date DESC, gt.id DESC
        `, params);

        // Get summary statistics
        const [summaryStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_transactions,
                COUNT(DISTINCT gt.distributor_id) as distributors_giving_gifts,
                COUNT(DISTINCT o.store_id) as stores_receiving_gifts,
                COUNT(DISTINCT gt.product_id) as different_products_gifted,
                SUM(gt.quantity) as total_gift_quantity,
                AVG(gt.quantity) as avg_gift_per_transaction
            FROM gift_transactions gt
            JOIN orders o ON gt.order_id = o.id
            JOIN products p ON gt.product_id = p.id
            ${whereConditions}
        `, params);

        // Get top distributors by gifts given
        const [topDistributors] = await db.execute(`
            SELECT 
                u.id,
                u.full_name as distributor_name,
                COUNT(gt.id) as gift_transactions,
                SUM(gt.quantity) as total_gifts_given,
                COUNT(DISTINCT o.store_id) as stores_gifted,
                COUNT(DISTINCT gt.product_id) as products_gifted
            FROM gift_transactions gt
            JOIN users u ON gt.distributor_id = u.id
            JOIN orders o ON gt.order_id = o.id
            JOIN products p ON gt.product_id = p.id
            ${whereConditions}
            GROUP BY u.id, u.full_name
            ORDER BY total_gifts_given DESC
            LIMIT 10
        `, params);

        // Get top stores by gifts received
        const [topStores] = await db.execute(`
            SELECT 
                s.id,
                s.name as store_name,
                s.category,
                COUNT(gt.id) as gift_transactions,
                SUM(gt.quantity) as total_gifts_received,
                COUNT(DISTINCT gt.product_id) as different_products
            FROM gift_transactions gt
            JOIN orders o ON gt.order_id = o.id
            JOIN stores s ON o.store_id = s.id
            JOIN products p ON gt.product_id = p.id
            ${whereConditions}
            GROUP BY s.id, s.name, s.category
            ORDER BY total_gifts_received DESC
            LIMIT 10
        `, params);

        // Get product breakdown
        const [productBreakdown] = await db.execute(`
            SELECT 
                p.id,
                p.name as product_name,
                p.category,
                COUNT(gt.id) as gift_transactions,
                SUM(gt.quantity) as total_quantity_gifted,
                COUNT(DISTINCT gt.distributor_id) as distributors_gifting,
                COUNT(DISTINCT o.store_id) as stores_receiving
            FROM gift_transactions gt
            JOIN orders o ON gt.order_id = o.id
            JOIN products p ON gt.product_id = p.id
            ${whereConditions}
            GROUP BY p.id, p.name, p.category
            ORDER BY total_quantity_gifted DESC
        `, params);

        return {
            period: { from: dateFrom, to: dateTo },
            filters: filters,
            summary: summaryStats[0],
            transactions: giftTransactions,
            top_performers: {
                distributors: topDistributors,
                stores: topStores
            },
            product_breakdown: productBreakdown,
            generated_at: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error getting gift transactions report:', error);
        throw new Error('خطأ في جلب تقرير معاملات الهدايا: ' + error.message);
    }
};

/**
 * Get damage and loss report
 * @param {Object} filters - Report filters
 * @returns {Object} Damage and loss report
 */
export const getDamageAndLossReport = async (filters = {}) => {
    try {
        const {
            distributorId,
            dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dateTo = new Date().toISOString().split('T')[0],
            productCategory,
            damageReason
        } = filters;

        let whereConditions = 'WHERE dr.recorded_date BETWEEN ? AND ?';
        const params = [dateFrom, dateTo];

        if (distributorId) {
            whereConditions += ' AND dr.distributor_id = ?';
            params.push(distributorId);
        }

        if (productCategory) {
            whereConditions += ' AND p.category = ?';
            params.push(productCategory);
        }

        if (damageReason) {
            whereConditions += ' AND dr.reason LIKE ?';
            params.push(`%${damageReason}%`);
        }

        // Get damage records
        const [damageRecords] = await db.execute(`
            SELECT 
                dr.id,
                dr.recorded_date,
                dr.quantity as damaged_quantity,
                dr.reason,
                u.full_name as distributor_name,
                p.name as product_name,
                p.category as product_category,
                p.unit,
                p.cost_eur,
                p.cost_syp,
                (dr.quantity * p.cost_eur) as loss_value_eur,
                (dr.quantity * p.cost_syp) as loss_value_syp
            FROM damage_records dr
            JOIN users u ON dr.distributor_id = u.id
            JOIN products p ON dr.product_id = p.id
            ${whereConditions}
            ORDER BY dr.recorded_date DESC, dr.id DESC
        `, params);

        // Get summary statistics
        const [summaryStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_damage_incidents,
                COUNT(DISTINCT dr.distributor_id) as distributors_with_damages,
                COUNT(DISTINCT dr.product_id) as products_damaged,
                SUM(dr.quantity) as total_damaged_quantity,
                SUM(dr.quantity * p.cost_eur) as total_loss_eur,
                SUM(dr.quantity * p.cost_syp) as total_loss_syp,
                AVG(dr.quantity) as avg_damage_per_incident
            FROM damage_records dr
            JOIN products p ON dr.product_id = p.id
            ${whereConditions}
        `, params);

        // Get damage reasons breakdown
        const [reasonBreakdown] = await db.execute(`
            SELECT 
                dr.reason,
                COUNT(*) as incident_count,
                SUM(dr.quantity) as total_quantity,
                SUM(dr.quantity * p.cost_eur) as total_loss_eur,
                SUM(dr.quantity * p.cost_syp) as total_loss_syp
            FROM damage_records dr
            JOIN products p ON dr.product_id = p.id
            ${whereConditions}
            GROUP BY dr.reason
            ORDER BY incident_count DESC
        `, params);

        // Get distributor damage analysis
        const [distributorAnalysis] = await db.execute(`
            SELECT 
                u.id,
                u.full_name as distributor_name,
                COUNT(dr.id) as damage_incidents,
                SUM(dr.quantity) as total_damaged_quantity,
                SUM(dr.quantity * p.cost_eur) as total_loss_eur,
                COUNT(DISTINCT dr.product_id) as products_damaged,
                AVG(dr.quantity) as avg_damage_per_incident
            FROM damage_records dr
            JOIN users u ON dr.distributor_id = u.id
            JOIN products p ON dr.product_id = p.id
            ${whereConditions}
            GROUP BY u.id, u.full_name
            ORDER BY total_loss_eur DESC
        `, params);

        return {
            period: { from: dateFrom, to: dateTo },
            filters: filters,
            summary: summaryStats[0],
            damage_records: damageRecords,
            reason_breakdown: reasonBreakdown,
            distributor_analysis: distributorAnalysis,
            generated_at: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error getting damage and loss report:', error);
        throw new Error('خطأ في جلب تقرير الأضرار والخسائر: ' + error.message);
    }
};

/**
 * Manage gift policies
 * @param {string} action - Action to perform (create, update, delete, activate, deactivate)
 * @param {Object} policyData - Policy data
 * @returns {Object} Policy management result
 */
export const manageGiftPolicy = async (action, policyData) => {
    try {
        const {
            policyId,
            storeId,
            storeCategory,
            productId,
            buyQuantity,
            giftQuantity,
            startDate,
            endDate,
            createdBy
        } = policyData;

        switch (action) {
            case 'create':
                const [createResult] = await db.execute(`
                    INSERT INTO gift_policies 
                    (store_id, store_category, product_id, buy_quantity, gift_quantity, 
                     start_date, end_date, is_active, created_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
                `, [storeId, storeCategory, productId, buyQuantity, giftQuantity,
                    startDate, endDate, createdBy]);

                return {
                    action: 'created',
                    policy_id: createResult.insertId,
                    message: 'تم إنشاء سياسة الهدايا بنجاح'
                };

            case 'update':
                await db.execute(`
                    UPDATE gift_policies 
                    SET store_id = ?, store_category = ?, buy_quantity = ?, 
                        gift_quantity = ?, start_date = ?, end_date = ?,
                        updated_at = NOW()
                    WHERE id = ?
                `, [storeId, storeCategory, buyQuantity, giftQuantity,
                    startDate, endDate, policyId]);

                return {
                    action: 'updated',
                    policy_id: policyId,
                    message: 'تم تحديث سياسة الهدايا بنجاح'
                };

            case 'delete':
                await db.execute(`
                    DELETE FROM gift_policies WHERE id = ?
                `, [policyId]);

                return {
                    action: 'deleted',
                    policy_id: policyId,
                    message: 'تم حذف سياسة الهدايا بنجاح'
                };

            case 'activate':
            case 'deactivate':
                const isActive = action === 'activate' ? 1 : 0;
                await db.execute(`
                    UPDATE gift_policies 
                    SET is_active = ?, updated_at = NOW()
                    WHERE id = ?
                `, [isActive, policyId]);

                return {
                    action: action + 'd',
                    policy_id: policyId,
                    message: `تم ${action === 'activate' ? 'تفعيل' : 'إلغاء'} سياسة الهدايا بنجاح`
                };

            default:
                throw new Error('إجراء غير صالح');
        }

    } catch (error) {
        console.error('Error managing gift policy:', error);
        throw new Error('خطأ في إدارة سياسة الهدايا: ' + error.message);
    }
};

export {
    loadVehicleInventory,
    updateInventoryAfterDelivery,
    calculateAutomaticGifts,
    getInventoryStatusReport,
    getGiftTransactionsReport,
    getDamageAndLossReport,
    manageGiftPolicy
}; 