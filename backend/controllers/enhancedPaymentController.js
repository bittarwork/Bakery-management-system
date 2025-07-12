
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

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
            console.error('Database connection failed in enhancedPaymentController:', error.message);
            throw new Error('Database connection unavailable');
        }
    }
    return db;
};

// ==========================================
// 💰 ENHANCED PAYMENT SYSTEM (نظام الدفعات المحسن)
// ==========================================

/**
 * Record flexible payment (cash, bank, mixed, debt)
 * @param {Object} paymentData - Payment data
 * @returns {Object} Payment record
 */
const recordFlexiblePayment = async (paymentData) => {
    try {
        const {
            storeId,
            orderId,
            amounts, // { eur: 0, syp: 0 }
            paymentMethod, // 'cash', 'bank', 'mixed'
            paymentType, // 'current_order', 'old_debt', 'mixed', 'advance'
            distribution, // For mixed payments
            bankDetails,
            notes,
            collectedBy,
            receiptNumber
        } = paymentData;

        // Start transaction
        await db.beginTransaction();

        // Validate store
        const [storeRows] = await db.execute(`
            SELECT 
                id, name, current_balance_eur, current_balance_syp,
                credit_limit_eur, credit_limit_syp
            FROM stores WHERE id = ?
        `, [storeId]);

        if (storeRows.length === 0) {
            throw new Error('المحل غير موجود');
        }

        const store = storeRows[0];

        // Get current exchange rate if needed
        const exchangeRate = await getCurrentExchangeRate();

        // Insert main payment record
        const [paymentResult] = await db.execute(`
            INSERT INTO payments 
            (store_id, order_id, amount_eur, amount_syp, currency, payment_method, 
             payment_type, distribution_data, bank_details, notes, collected_by, 
             receipt_number, exchange_rate, payment_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'completed')
        `, [
            storeId,
            orderId,
            amounts.eur || 0,
            amounts.syp || 0,
            amounts.eur > 0 && amounts.syp > 0 ? 'MIXED' : (amounts.eur > 0 ? 'EUR' : 'SYP'),
            paymentMethod,
            paymentType,
            JSON.stringify(distribution),
            JSON.stringify(bankDetails),
            notes,
            collectedBy,
            receiptNumber,
            exchangeRate
        ]);

        const paymentId = paymentResult.insertId;

        // Process payment based on type
        let balanceUpdate = { eur: 0, syp: 0 };

        switch (paymentType) {
            case 'current_order':
                await processCurrentOrderPayment(orderId, amounts, paymentId);
                balanceUpdate = amounts;
                break;

            case 'old_debt':
                balanceUpdate = amounts;
                break;

            case 'mixed':
                const mixedResult = await processMixedPayment(orderId, amounts, distribution, paymentId);
                balanceUpdate = mixedResult;
                break;

            case 'advance':
                // Advance payment - negative balance
                balanceUpdate = { eur: -amounts.eur, syp: -amounts.syp };
                break;
        }

        // Update store balance
        await db.execute(`
            UPDATE stores 
            SET current_balance_eur = current_balance_eur - ?,
                current_balance_syp = current_balance_syp - ?,
                total_payments_eur = total_payments_eur + ?,
                total_payments_syp = total_payments_syp + ?,
                last_payment_date = CURDATE(),
                updated_at = NOW()
            WHERE id = ?
        `, [
            balanceUpdate.eur,
            balanceUpdate.syp,
            amounts.eur || 0,
            amounts.syp || 0,
            storeId
        ]);

        // Log payment activity
        await db.execute(`
            INSERT INTO delivery_logs 
            (order_id, distributor_id, action, details, created_at)
            VALUES (?, ?, 'payment_record', ?, NOW())
        `, [
            orderId || 0,
            collectedBy,
            JSON.stringify({
                payment_id: paymentId,
                amounts: amounts,
                method: paymentMethod,
                type: paymentType
            })
        ]);

        await db.commit();

        // Get updated store balance
        const [updatedStore] = await db.execute(`
            SELECT current_balance_eur, current_balance_syp FROM stores WHERE id = ?
        `, [storeId]);

        return {
            payment_id: paymentId,
            store_id: storeId,
            order_id: orderId,
            amounts: amounts,
            payment_method: paymentMethod,
            payment_type: paymentType,
            updated_balance: {
                eur: updatedStore[0].current_balance_eur,
                syp: updatedStore[0].current_balance_syp
            },
            payment_date: new Date().toISOString(),
            receipt_number: receiptNumber
        };

    } catch (error) {
        await db.rollback();
        console.error('Error recording flexible payment:', error);
        throw new Error('خطأ في تسجيل الدفعة: ' + error.message);
    }
};

/**
 * Process current order payment
 * @param {number} orderId - Order ID
 * @param {Object} amounts - Payment amounts
 * @param {number} paymentId - Payment ID
 */
const processCurrentOrderPayment = async (orderId, amounts, paymentId) => {
    if (!orderId) return;

    // Get order details
    const [orderRows] = await db.execute(`
        SELECT total_amount_eur, total_amount_syp, payment_status 
        FROM orders WHERE id = ?
    `, [orderId]);

    if (orderRows.length === 0) return;

    const order = orderRows[0];
    const totalPaid = (amounts.eur || 0) + (amounts.syp || 0);
    const orderTotal = parseFloat(order.total_amount_eur) + parseFloat(order.total_amount_syp);

    let newPaymentStatus = 'partial';
    if (totalPaid >= orderTotal) {
        newPaymentStatus = 'paid';
    }

    // Update order payment status
    await db.execute(`
        UPDATE orders 
        SET payment_status = ?,
            updated_at = NOW()
        WHERE id = ?
    `, [newPaymentStatus, orderId]);
};

/**
 * Process mixed payment (current order + old debt)
 * @param {number} orderId - Order ID
 * @param {Object} amounts - Total payment amounts
 * @param {Object} distribution - How to distribute the payment
 * @param {number} paymentId - Payment ID
 * @returns {Object} Balance update amounts
 */
const processMixedPayment = async (orderId, amounts, distribution, paymentId) => {
    const orderAmount = distribution.current_order || { eur: 0, syp: 0 };
    const debtAmount = distribution.old_debt || { eur: 0, syp: 0 };

    // Process order payment if any
    if (orderId && (orderAmount.eur > 0 || orderAmount.syp > 0)) {
        await processCurrentOrderPayment(orderId, orderAmount, paymentId);
    }

    // Return total amount for balance update
    return {
        eur: orderAmount.eur + debtAmount.eur,
        syp: orderAmount.syp + debtAmount.syp
    };
};

/**
 * Get payment history for store
 * @param {number} storeId - Store ID
 * @param {Object} options - Query options
 * @returns {Object} Payment history
 */
const getStorePaymentHistory = async (storeId, options = {}) => {
    try {
        const {
            dateFrom,
            dateTo,
            paymentMethod,
            paymentType,
            page = 1,
            limit = 20
        } = options;

        const offset = (page - 1) * limit;

        let whereConditions = 'WHERE p.store_id = ?';
        const params = [storeId];

        if (dateFrom) {
            whereConditions += ' AND p.payment_date >= ?';
            params.push(dateFrom);
        }

        if (dateTo) {
            whereConditions += ' AND p.payment_date <= ?';
            params.push(dateTo);
        }

        if (paymentMethod) {
            whereConditions += ' AND p.payment_method = ?';
            params.push(paymentMethod);
        }

        if (paymentType) {
            whereConditions += ' AND p.payment_type = ?';
            params.push(paymentType);
        }

        // Get payment history
        const [paymentRows] = await db.execute(`
            SELECT 
                p.id,
                p.order_id,
                p.amount_eur,
                p.amount_syp,
                p.currency,
                p.payment_method,
                p.payment_type,
                p.distribution_data,
                p.bank_details,
                p.notes,
                p.receipt_number,
                p.payment_date,
                p.exchange_rate,
                o.order_number,
                u.full_name as collected_by_name
            FROM payments p
            LEFT JOIN orders o ON p.order_id = o.id
            LEFT JOIN users u ON p.collected_by = u.id
            ${whereConditions}
            ORDER BY p.payment_date DESC, p.id DESC
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);

        // Get total count
        const [countResult] = await db.execute(`
            SELECT COUNT(*) as total
            FROM payments p
            ${whereConditions}
        `, params);

        // Calculate totals
        const [totalsResult] = await db.execute(`
            SELECT 
                SUM(amount_eur) as total_eur,
                SUM(amount_syp) as total_syp,
                COUNT(*) as total_payments
            FROM payments p
            ${whereConditions}
        `, params);

        const payments = paymentRows.map(payment => ({
            ...payment,
            distribution_data: payment.distribution_data ? JSON.parse(payment.distribution_data) : null,
            bank_details: payment.bank_details ? JSON.parse(payment.bank_details) : null
        }));

        return {
            payments: payments,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(countResult[0].total / limit),
                total_items: countResult[0].total,
                items_per_page: limit
            },
            totals: {
                total_eur: totalsResult[0].total_eur || 0,
                total_syp: totalsResult[0].total_syp || 0,
                total_payments: totalsResult[0].total_payments || 0
            }
        };

    } catch (error) {
        console.error('Error getting store payment history:', error);
        throw new Error('خطأ في جلب تاريخ المدفوعات');
    }
};

/**
 * Get payment analytics
 * @param {Object} filters - Analytics filters
 * @returns {Object} Payment analytics
 */
const getPaymentAnalytics = async (filters = {}) => {
    try {
        const {
            dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dateTo = new Date().toISOString().split('T')[0],
            distributorId,
            storeCategory,
            paymentMethod
        } = filters;

        let whereConditions = 'WHERE p.payment_date BETWEEN ? AND ?';
        const params = [dateFrom, dateTo];

        if (distributorId) {
            whereConditions += ' AND p.collected_by = ?';
            params.push(distributorId);
        }

        if (storeCategory) {
            whereConditions += ' AND s.category = ?';
            params.push(storeCategory);
        }

        if (paymentMethod) {
            whereConditions += ' AND p.payment_method = ?';
            params.push(paymentMethod);
        }

        // Get daily payment trends
        const [dailyTrends] = await db.execute(`
            SELECT 
                DATE(p.payment_date) as payment_date,
                COUNT(*) as total_payments,
                SUM(p.amount_eur) as daily_eur,
                SUM(p.amount_syp) as daily_syp,
                COUNT(DISTINCT p.store_id) as unique_stores,
                COUNT(DISTINCT p.collected_by) as active_distributors
            FROM payments p
            JOIN stores s ON p.store_id = s.id
            ${whereConditions}
            GROUP BY DATE(p.payment_date)
            ORDER BY payment_date
        `, params);

        // Get payment method breakdown
        const [methodBreakdown] = await db.execute(`
            SELECT 
                p.payment_method,
                COUNT(*) as payment_count,
                SUM(p.amount_eur) as total_eur,
                SUM(p.amount_syp) as total_syp,
                AVG(p.amount_eur) as avg_eur,
                AVG(p.amount_syp) as avg_syp
            FROM payments p
            JOIN stores s ON p.store_id = s.id
            ${whereConditions}
            GROUP BY p.payment_method
            ORDER BY payment_count DESC
        `, params);

        // Get payment type breakdown
        const [typeBreakdown] = await db.execute(`
            SELECT 
                p.payment_type,
                COUNT(*) as payment_count,
                SUM(p.amount_eur) as total_eur,
                SUM(p.amount_syp) as total_syp
            FROM payments p
            JOIN stores s ON p.store_id = s.id
            ${whereConditions}
            GROUP BY p.payment_type
            ORDER BY payment_count DESC
        `, params);

        // Get top paying stores
        const [topStores] = await db.execute(`
            SELECT 
                s.id,
                s.name as store_name,
                s.category,
                COUNT(p.id) as payment_count,
                SUM(p.amount_eur) as total_eur,
                SUM(p.amount_syp) as total_syp,
                MAX(p.payment_date) as last_payment
            FROM payments p
            JOIN stores s ON p.store_id = s.id
            ${whereConditions}
            GROUP BY s.id, s.name, s.category
            ORDER BY (SUM(p.amount_eur) + SUM(p.amount_syp)) DESC
            LIMIT 10
        `, params);

        // Get distributor performance
        const [distributorPerformance] = await db.execute(`
            SELECT 
                u.id,
                u.full_name as distributor_name,
                COUNT(p.id) as payments_collected,
                SUM(p.amount_eur) as collected_eur,
                SUM(p.amount_syp) as collected_syp,
                COUNT(DISTINCT p.store_id) as unique_stores,
                AVG(p.amount_eur) as avg_payment_eur
            FROM payments p
            JOIN stores s ON p.store_id = s.id
            JOIN users u ON p.collected_by = u.id
            ${whereConditions}
            GROUP BY u.id, u.full_name
            ORDER BY (SUM(p.amount_eur) + SUM(p.amount_syp)) DESC
        `, params);

        // Calculate overall totals
        const totalEUR = dailyTrends.reduce((sum, day) => sum + parseFloat(day.daily_eur || 0), 0);
        const totalSYP = dailyTrends.reduce((sum, day) => sum + parseFloat(day.daily_syp || 0), 0);
        const totalPayments = dailyTrends.reduce((sum, day) => sum + day.total_payments, 0);

        return {
            period: { from: dateFrom, to: dateTo },
            filters: filters,
            summary: {
                total_payments: totalPayments,
                total_amount: { eur: totalEUR, syp: totalSYP },
                avg_payment: {
                    eur: totalPayments > 0 ? totalEUR / totalPayments : 0,
                    syp: totalPayments > 0 ? totalSYP / totalPayments : 0
                },
                unique_stores: new Set(dailyTrends.map(d => d.unique_stores)).size,
                active_distributors: new Set(dailyTrends.map(d => d.active_distributors)).size
            },
            daily_trends: dailyTrends,
            method_breakdown: methodBreakdown,
            type_breakdown: typeBreakdown,
            top_stores: topStores,
            distributor_performance: distributorPerformance
        };

    } catch (error) {
        console.error('Error getting payment analytics:', error);
        throw new Error('خطأ في جلب تحليلات المدفوعات');
    }
};

/**
 * Get outstanding debts report
 * @param {Object} filters - Report filters
 * @returns {Object} Outstanding debts
 */
const getOutstandingDebtsReport = async (filters = {}) => {
    try {
        const { storeCategory, distributorId, minAmount = 0, currency = 'EUR' } = filters;

        let whereConditions = 'WHERE s.status = "active"';
        const params = [];

        if (storeCategory) {
            whereConditions += ' AND s.category = ?';
            params.push(storeCategory);
        }

        if (distributorId) {
            whereConditions += ' AND s.assigned_distributor_id = ?';
            params.push(distributorId);
        }

        const balanceField = currency === 'EUR' ? 'current_balance_eur' : 'current_balance_syp';
        whereConditions += ` AND s.${balanceField} > ?`;
        params.push(minAmount);

        // Get stores with outstanding debts
        const [debtorStores] = await db.execute(`
            SELECT 
                s.id,
                s.name as store_name,
                s.owner_name,
                s.phone,
                s.category,
                s.current_balance_eur,
                s.current_balance_syp,
                s.credit_limit_eur,
                s.credit_limit_syp,
                s.last_order_date,
                s.last_payment_date,
                u.full_name as distributor_name,
                DATEDIFF(CURDATE(), s.last_payment_date) as days_since_payment,
                (SELECT COUNT(*) FROM orders o WHERE o.store_id = s.id AND o.payment_status != 'paid') as unpaid_orders
            FROM stores s
            LEFT JOIN users u ON s.assigned_distributor_id = u.id
            ${whereConditions}
            ORDER BY s.${balanceField} DESC
        `, params);

        // Calculate aging analysis
        const agingAnalysis = {
            current: debtorStores.filter(s => s.days_since_payment <= 30),
            days_30_60: debtorStores.filter(s => s.days_since_payment > 30 && s.days_since_payment <= 60),
            days_60_90: debtorStores.filter(s => s.days_since_payment > 60 && s.days_since_payment <= 90),
            over_90_days: debtorStores.filter(s => s.days_since_payment > 90)
        };

        // Calculate totals
        const totalDebt = {
            eur: debtorStores.reduce((sum, store) => sum + parseFloat(store.current_balance_eur), 0),
            syp: debtorStores.reduce((sum, store) => sum + parseFloat(store.current_balance_syp), 0)
        };

        return {
            filters: filters,
            summary: {
                total_debtor_stores: debtorStores.length,
                total_debt: totalDebt,
                avg_debt: {
                    eur: debtorStores.length > 0 ? totalDebt.eur / debtorStores.length : 0,
                    syp: debtorStores.length > 0 ? totalDebt.syp / debtorStores.length : 0
                }
            },
            debtor_stores: debtorStores,
            aging_analysis: {
                current: { count: agingAnalysis.current.length, stores: agingAnalysis.current },
                days_30_60: { count: agingAnalysis.days_30_60.length, stores: agingAnalysis.days_30_60 },
                days_60_90: { count: agingAnalysis.days_60_90.length, stores: agingAnalysis.days_60_90 },
                over_90_days: { count: agingAnalysis.over_90_days.length, stores: agingAnalysis.over_90_days }
            }
        };

    } catch (error) {
        console.error('Error getting outstanding debts report:', error);
        throw new Error('خطأ في جلب تقرير الديون المستحقة');
    }
};

/**
 * Export payments to Excel/CSV
 * @param {Object} filters - Export filters
 * @param {string} format - Export format (excel/csv)
 * @returns {Object} Export result
 */
const exportPayments = async (filters = {}, format = 'excel') => {
    try {
        const {
            dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dateTo = new Date().toISOString().split('T')[0],
            storeId,
            distributorId,
            paymentMethod
        } = filters;

        let whereConditions = 'WHERE p.payment_date BETWEEN ? AND ?';
        const params = [dateFrom, dateTo];

        if (storeId) {
            whereConditions += ' AND p.store_id = ?';
            params.push(storeId);
        }

        if (distributorId) {
            whereConditions += ' AND p.collected_by = ?';
            params.push(distributorId);
        }

        if (paymentMethod) {
            whereConditions += ' AND p.payment_method = ?';
            params.push(paymentMethod);
        }

        // Get export data
        const [exportData] = await db.execute(`
            SELECT 
                p.id as payment_id,
                p.payment_date,
                s.name as store_name,
                s.category as store_category,
                o.order_number,
                p.amount_eur,
                p.amount_syp,
                p.currency,
                p.payment_method,
                p.payment_type,
                p.receipt_number,
                p.notes,
                u.full_name as collected_by,
                p.exchange_rate
            FROM payments p
            JOIN stores s ON p.store_id = s.id
            LEFT JOIN orders o ON p.order_id = o.id
            LEFT JOIN users u ON p.collected_by = u.id
            ${whereConditions}
            ORDER BY p.payment_date DESC, p.id DESC
        `, params);

        return {
            data: exportData,
            format: format,
            filters: filters,
            total_records: exportData.length,
            export_date: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error exporting payments:', error);
        throw new Error('خطأ في تصدير المدفوعات');
    }
};

/**
 * Get current exchange rate
 * @returns {number} Current EUR to SYP exchange rate
 */
const getCurrentExchangeRate = async () => {
    try {
        // You can implement API call to get real exchange rate
        // For now, using a default rate
        return 15000; // 1 EUR = 15000 SYP (example)
    } catch (error) {
        console.error('Error getting exchange rate:', error);
        return 15000; // Default fallback
    }
};

export {
    recordFlexiblePayment,
    getStorePaymentHistory,
    getPaymentAnalytics,
    getOutstandingDebtsReport
}; 