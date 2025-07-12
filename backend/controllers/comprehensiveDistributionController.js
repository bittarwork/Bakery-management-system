import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bakery_db'
});

// ==========================================
// 🚚 DISTRIBUTOR FUNCTIONS (عامل التوزيع)
// ==========================================

/**
 * Get daily distribution schedule for distributor
 * @param {number} distributorId - Distributor ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Object} Daily schedule with stores, products, and routes
 */
export const getDistributorDailySchedule = async (distributorId, date) => {
    try {
        const scheduleDate = date || new Date().toISOString().split('T')[0];

        // Get distributor's daily schedule
        const [scheduleRows] = await db.execute(`
            SELECT 
                ds.id as schedule_id,
                ds.schedule_date,
                ds.status as schedule_status,
                ds.route_data,
                ds.notes as schedule_notes,
                u.full_name as distributor_name,
                u.phone as distributor_phone,
                u.vehicle_info
            FROM distribution_schedules ds
            JOIN users u ON ds.distributor_id = u.id
            WHERE ds.distributor_id = ? AND ds.schedule_date = ?
            ORDER BY ds.created_at DESC
            LIMIT 1
        `, [distributorId, scheduleDate]);

        if (scheduleRows.length === 0) {
            return {
                schedule_id: null,
                schedule_date: scheduleDate,
                status: 'not_found',
                stores: [],
                summary: {
                    total_stores: 0,
                    total_products: 0,
                    estimated_duration: 0
                }
            };
        }

        const schedule = scheduleRows[0];

        // Get stores and orders for this schedule
        const [storeRows] = await db.execute(`
            SELECT 
                s.id as store_id,
                s.name as store_name,
                s.address,
                s.phone,
                s.gps_coordinates,
                s.current_balance_eur,
                s.current_balance_syp,
                s.preferred_delivery_time,
                s.special_instructions,
                o.id as order_id,
                o.order_number,
                o.total_amount_eur,
                o.total_amount_syp,
                o.status as order_status,
                o.payment_status,
                o.notes as order_notes
            FROM stores s
            LEFT JOIN orders o ON s.id = o.store_id AND o.order_date = ?
            WHERE s.assigned_distributor_id = ? AND s.status = 'active'
            ORDER BY s.name
        `, [scheduleDate, distributorId]);

        // Get order items for each order
        const storeIds = storeRows.map(row => row.store_id);
        const [itemRows] = await db.execute(`
            SELECT 
                oi.order_id,
                oi.product_id,
                oi.product_name,
                oi.quantity,
                oi.unit_price_eur,
                oi.unit_price_syp,
                oi.total_price_eur,
                oi.total_price_syp,
                oi.notes,
                p.category,
                p.unit
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id IN (
                SELECT o.id FROM orders o 
                WHERE o.store_id IN (${storeIds.map(() => '?').join(',')}) 
                AND o.order_date = ?
            )
            ORDER BY oi.order_id, p.category, oi.product_name
        `, [...storeIds, scheduleDate]);

        // Group data by store
        const storesData = {};
        storeRows.forEach(row => {
            if (!storesData[row.store_id]) {
                storesData[row.store_id] = {
                    store_id: row.store_id,
                    store_name: row.store_name,
                    address: row.address,
                    phone: row.phone,
                    gps_coordinates: row.gps_coordinates ? JSON.parse(row.gps_coordinates) : null,
                    current_balance: {
                        eur: row.current_balance_eur,
                        syp: row.current_balance_syp
                    },
                    preferred_delivery_time: row.preferred_delivery_time,
                    special_instructions: row.special_instructions,
                    order: null,
                    products: [],
                    delivery_status: 'pending'
                };
            }

            if (row.order_id) {
                storesData[row.store_id].order = {
                    order_id: row.order_id,
                    order_number: row.order_number,
                    total_amount: {
                        eur: row.total_amount_eur,
                        syp: row.total_amount_syp
                    },
                    status: row.order_status,
                    payment_status: row.payment_status,
                    notes: row.order_notes
                };
            }
        });

        // Add products to stores
        itemRows.forEach(item => {
            const storeId = storeRows.find(s => s.order_id === item.order_id)?.store_id;
            if (storeId && storesData[storeId]) {
                storesData[storeId].products.push({
                    product_id: item.product_id,
                    product_name: item.product_name,
                    category: item.category,
                    unit: item.unit,
                    quantity: item.quantity,
                    unit_price: {
                        eur: item.unit_price_eur,
                        syp: item.unit_price_syp
                    },
                    total_price: {
                        eur: item.total_price_eur,
                        syp: item.total_price_syp
                    },
                    notes: item.notes,
                    actual_quantity: item.quantity, // Will be updated during delivery
                    gifts_quantity: 0 // Will be calculated during delivery
                });
            }
        });

        // Calculate summary
        const stores = Object.values(storesData);
        const totalProducts = stores.reduce((sum, store) => sum + store.products.length, 0);
        const totalQuantity = stores.reduce((sum, store) =>
            sum + store.products.reduce((pSum, product) => pSum + product.quantity, 0), 0);

        return {
            schedule_id: schedule.schedule_id,
            schedule_date: schedule.schedule_date,
            status: schedule.schedule_status,
            route_data: schedule.route_data ? JSON.parse(schedule.route_data) : null,
            notes: schedule.schedule_notes,
            distributor: {
                name: schedule.distributor_name,
                phone: schedule.distributor_phone,
                vehicle_info: schedule.vehicle_info ? JSON.parse(schedule.vehicle_info) : null
            },
            stores: stores,
            summary: {
                total_stores: stores.length,
                total_products: totalProducts,
                total_quantity: totalQuantity,
                estimated_duration: Math.ceil(stores.length * 15) // 15 minutes per store
            }
        };

    } catch (error) {
        console.error('Error getting distributor daily schedule:', error);
        throw new Error('خطأ في جلب جدول التوزيع اليومي');
    }
};

/**
 * Get comprehensive store details for delivery
 * @param {number} storeId - Store ID
 * @returns {Object} Store details with balance, history, and delivery info
 */
export const getStoreDeliveryDetails = async (storeId) => {
    try {
        // Get store basic info
        const [storeRows] = await db.execute(`
            SELECT 
                s.*,
                u.full_name as distributor_name,
                u.phone as distributor_phone
            FROM stores s
            LEFT JOIN users u ON s.assigned_distributor_id = u.id
            WHERE s.id = ?
        `, [storeId]);

        if (storeRows.length === 0) {
            throw new Error('المحل غير موجود');
        }

        const store = storeRows[0];

        // Get recent payment history
        const [paymentHistory] = await db.execute(`
            SELECT 
                p.id,
                p.amount_eur,
                p.amount_syp,
                p.payment_method,
                p.payment_date,
                p.notes,
                p.status
            FROM payments p
            WHERE p.store_id = ?
            ORDER BY p.payment_date DESC
            LIMIT 10
        `, [storeId]);

        // Get recent orders
        const [orderHistory] = await db.execute(`
            SELECT 
                o.id,
                o.order_number,
                o.order_date,
                o.total_amount_eur,
                o.total_amount_syp,
                o.status,
                o.payment_status
            FROM orders o
            WHERE o.store_id = ?
            ORDER BY o.order_date DESC
            LIMIT 10
        `, [storeId]);

        // Get gift policy for this store
        const [giftPolicies] = await db.execute(`
            SELECT 
                gp.product_id,
                gp.buy_quantity,
                gp.gift_quantity,
                gp.is_active,
                p.name as product_name
            FROM gift_policies gp
            JOIN products p ON gp.product_id = p.id
            WHERE gp.store_id = ? AND gp.is_active = 1
        `, [storeId]);

        return {
            store: {
                id: store.id,
                name: store.name,
                owner_name: store.owner_name,
                phone: store.phone,
                email: store.email,
                address: store.address,
                gps_coordinates: store.gps_coordinates ? JSON.parse(store.gps_coordinates) : null,
                store_type: store.store_type,
                category: store.category,
                opening_hours: store.opening_hours ? JSON.parse(store.opening_hours) : null,
                current_balance: {
                    eur: store.current_balance_eur,
                    syp: store.current_balance_syp
                },
                credit_limit: {
                    eur: store.credit_limit_eur,
                    syp: store.credit_limit_syp
                },
                payment_terms: store.payment_terms,
                preferred_delivery_time: store.preferred_delivery_time,
                special_instructions: store.special_instructions,
                performance_rating: store.performance_rating,
                last_order_date: store.last_order_date,
                last_payment_date: store.last_payment_date,
                assigned_distributor: {
                    name: store.distributor_name,
                    phone: store.distributor_phone
                }
            },
            payment_history: paymentHistory,
            order_history: orderHistory,
            gift_policies: giftPolicies,
            delivery_notes: []
        };

    } catch (error) {
        console.error('Error getting store delivery details:', error);
        throw new Error('خطأ في جلب تفاصيل المحل');
    }
};

/**
 * Update delivery quantities during delivery
 * @param {number} deliveryId - Delivery ID
 * @param {Array} quantities - Updated quantities
 * @param {string} notes - Delivery notes
 * @param {number} distributorId - Distributor ID
 * @returns {Object} Updated delivery info
 */
export const updateDeliveryQuantities = async (deliveryId, quantities, notes, distributorId) => {
    try {
        // Start transaction
        await db.beginTransaction();

        // Update order items with new quantities
        for (const item of quantities) {
            await db.execute(`
                UPDATE order_items 
                SET quantity = ?, 
                    total_price_eur = quantity * unit_price_eur,
                    total_price_syp = quantity * unit_price_syp,
                    notes = ?
                WHERE order_id = ? AND product_id = ?
            `, [item.quantity, item.notes || '', deliveryId, item.product_id]);
        }

        // Update order total
        const [orderItems] = await db.execute(`
            SELECT 
                SUM(total_price_eur) as total_eur,
                SUM(total_price_syp) as total_syp
            FROM order_items
            WHERE order_id = ?
        `, [deliveryId]);

        await db.execute(`
            UPDATE orders 
            SET total_amount_eur = ?,
                total_amount_syp = ?,
                final_amount_eur = ?,
                final_amount_syp = ?,
                updated_at = NOW()
            WHERE id = ?
        `, [
            orderItems[0].total_eur,
            orderItems[0].total_syp,
            orderItems[0].total_eur,
            orderItems[0].total_syp,
            deliveryId
        ]);

        // Log the change
        await db.execute(`
            INSERT INTO delivery_logs 
            (order_id, distributor_id, action, details, created_at)
            VALUES (?, ?, 'quantity_update', ?, NOW())
        `, [deliveryId, distributorId, JSON.stringify({ quantities, notes })]);

        await db.commit();

        return {
            delivery_id: deliveryId,
            updated_quantities: quantities,
            notes: notes,
            updated_at: new Date().toISOString()
        };

    } catch (error) {
        await db.rollback();
        console.error('Error updating delivery quantities:', error);
        throw new Error('خطأ في تحديث كميات التسليم');
    }
};

/**
 * Complete delivery and update inventory
 * @param {number} deliveryId - Delivery ID
 * @param {Object} data - Delivery completion data
 * @returns {Object} Completed delivery info
 */
export const completeDelivery = async (deliveryId, data) => {
    try {
        const { actualQuantities, gifts, damages, notes, distributorId } = data;

        // Start transaction
        await db.beginTransaction();

        // Update order status
        await db.execute(`
            UPDATE orders 
            SET status = 'delivered',
                updated_at = NOW()
            WHERE id = ?
        `, [deliveryId]);

        // Record actual delivery quantities
        await db.execute(`
            INSERT INTO delivery_records 
            (order_id, distributor_id, actual_quantities, gifts_given, damages_recorded, notes, delivery_date)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [
            deliveryId,
            distributorId,
            JSON.stringify(actualQuantities),
            JSON.stringify(gifts),
            JSON.stringify(damages),
            notes
        ]);

        // Update vehicle inventory
        for (const item of actualQuantities) {
            await db.execute(`
                UPDATE vehicle_inventory 
                SET quantity = quantity - ?,
                    updated_at = NOW()
                WHERE distributor_id = ? AND product_id = ?
            `, [item.quantity, distributorId, item.product_id]);
        }

        // Record gifts in inventory
        for (const gift of gifts) {
            await db.execute(`
                UPDATE vehicle_inventory 
                SET quantity = quantity - ?,
                    updated_at = NOW()
                WHERE distributor_id = ? AND product_id = ?
            `, [gift.quantity, distributorId, gift.product_id]);
        }

        // Update store statistics
        const [orderInfo] = await db.execute(`
            SELECT store_id, total_amount_eur, total_amount_syp
            FROM orders
            WHERE id = ?
        `, [deliveryId]);

        const order = orderInfo[0];

        await db.execute(`
            UPDATE stores 
            SET completed_orders = completed_orders + 1,
                total_purchases_eur = total_purchases_eur + ?,
                total_purchases_syp = total_purchases_syp + ?,
                last_order_date = CURDATE(),
                updated_at = NOW()
            WHERE id = ?
        `, [order.total_amount_eur, order.total_amount_syp, order.store_id]);

        await db.commit();

        return {
            delivery_id: deliveryId,
            status: 'completed',
            actual_quantities: actualQuantities,
            gifts_given: gifts,
            damages_recorded: damages,
            notes: notes,
            completed_at: new Date().toISOString()
        };

    } catch (error) {
        await db.rollback();
        console.error('Error completing delivery:', error);
        throw new Error('خطأ في إكمال التسليم');
    }
};

/**
 * Record payment from store
 * @param {Object} paymentData - Payment data
 * @returns {Object} Payment record
 */
export const recordPayment = async (paymentData) => {
    try {
        const {
            storeId,
            orderId,
            amount,
            currency,
            paymentMethod,
            paymentType,
            distribution,
            bankDetails,
            notes,
            collectedBy
        } = paymentData;

        // Start transaction
        await db.beginTransaction();

        // Insert payment record
        const [paymentResult] = await db.execute(`
            INSERT INTO payments 
            (store_id, order_id, amount_eur, amount_syp, currency, payment_method, 
             payment_type, distribution_data, bank_details, notes, collected_by, payment_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            storeId,
            orderId,
            currency === 'EUR' ? amount : 0,
            currency === 'SYP' ? amount : 0,
            currency,
            paymentMethod,
            paymentType,
            JSON.stringify(distribution),
            JSON.stringify(bankDetails),
            notes,
            collectedBy
        ]);

        const paymentId = paymentResult.insertId;

        // Update store balance
        if (currency === 'EUR') {
            await db.execute(`
                UPDATE stores 
                SET current_balance_eur = current_balance_eur - ?,
                    total_payments_eur = total_payments_eur + ?,
                    last_payment_date = CURDATE(),
                    updated_at = NOW()
                WHERE id = ?
            `, [amount, amount, storeId]);
        } else {
            await db.execute(`
                UPDATE stores 
                SET current_balance_syp = current_balance_syp - ?,
                    total_payments_syp = total_payments_syp + ?,
                    last_payment_date = CURDATE(),
                    updated_at = NOW()
                WHERE id = ?
            `, [amount, amount, storeId]);
        }

        // Update order payment status if applicable
        if (orderId) {
            await db.execute(`
                UPDATE orders 
                SET payment_status = 'paid',
                    updated_at = NOW()
                WHERE id = ?
            `, [orderId]);
        }

        await db.commit();

        return {
            payment_id: paymentId,
            store_id: storeId,
            order_id: orderId,
            amount: amount,
            currency: currency,
            payment_method: paymentMethod,
            payment_type: paymentType,
            collected_by: collectedBy,
            payment_date: new Date().toISOString()
        };

    } catch (error) {
        await db.rollback();
        console.error('Error recording payment:', error);
        throw new Error('خطأ في تسجيل الدفعة');
    }
};

/**
 * Get current vehicle inventory
 * @param {number} distributorId - Distributor ID
 * @returns {Object} Vehicle inventory
 */
export const getVehicleInventory = async (distributorId) => {
    try {
        const [inventoryRows] = await db.execute(`
            SELECT 
                vi.product_id,
                vi.quantity,
                vi.loaded_quantity,
                vi.delivered_quantity,
                vi.returned_quantity,
                vi.last_updated,
                p.name as product_name,
                p.category,
                p.unit,
                p.price_eur,
                p.price_syp
            FROM vehicle_inventory vi
            JOIN products p ON vi.product_id = p.id
            WHERE vi.distributor_id = ?
            ORDER BY p.category, p.name
        `, [distributorId]);

        const totalValue = inventoryRows.reduce((sum, item) => ({
            eur: sum.eur + (item.quantity * item.price_eur),
            syp: sum.syp + (item.quantity * item.price_syp)
        }), { eur: 0, syp: 0 });

        return {
            distributor_id: distributorId,
            inventory: inventoryRows,
            summary: {
                total_products: inventoryRows.length,
                total_quantity: inventoryRows.reduce((sum, item) => sum + item.quantity, 0),
                total_value: totalValue
            },
            last_updated: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error getting vehicle inventory:', error);
        throw new Error('خطأ في جلب مخزون السيارة');
    }
};

/**
 * Record vehicle expense
 * @param {Object} expenseData - Expense data
 * @returns {Object} Expense record
 */
export const recordVehicleExpense = async (expenseData) => {
    try {
        const { type, amount, currency, description, receiptImage, distributorId } = expenseData;

        const [expenseResult] = await db.execute(`
            INSERT INTO vehicle_expenses 
            (distributor_id, expense_type, amount_eur, amount_syp, currency, description, receipt_image, expense_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            distributorId,
            type,
            currency === 'EUR' ? amount : 0,
            currency === 'SYP' ? amount : 0,
            currency,
            description,
            receiptImage
        ]);

        return {
            expense_id: expenseResult.insertId,
            distributor_id: distributorId,
            type: type,
            amount: amount,
            currency: currency,
            description: description,
            expense_date: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error recording vehicle expense:', error);
        throw new Error('خطأ في تسجيل مصروف السيارة');
    }
};

/**
 * Submit daily report
 * @param {Object} reportData - Report data
 * @returns {Object} Report record
 */
export const submitDailyReport = async (reportData) => {
    try {
        const { date, summary, signature, distributorId } = reportData;

        const [reportResult] = await db.execute(`
            INSERT INTO daily_reports 
            (distributor_id, report_date, summary_data, signature, status, submitted_at)
            VALUES (?, ?, ?, ?, 'submitted', NOW())
        `, [distributorId, date, JSON.stringify(summary), signature]);

        return {
            report_id: reportResult.insertId,
            distributor_id: distributorId,
            report_date: date,
            summary: summary,
            status: 'submitted',
            submitted_at: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error submitting daily report:', error);
        throw new Error('خطأ في رفع التقرير اليومي');
    }
};

/**
 * Get distributor history
 * @param {number} distributorId - Distributor ID
 * @param {Object} options - Query options
 * @returns {Object} Distributor history
 */
export const getDistributorHistory = async (distributorId, options) => {
    try {
        const { dateFrom, dateTo, page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;

        let whereConditions = 'WHERE dr.distributor_id = ?';
        const params = [distributorId];

        if (dateFrom) {
            whereConditions += ' AND dr.report_date >= ?';
            params.push(dateFrom);
        }

        if (dateTo) {
            whereConditions += ' AND dr.report_date <= ?';
            params.push(dateTo);
        }

        const [historyRows] = await db.execute(`
            SELECT 
                dr.id,
                dr.report_date,
                dr.summary_data,
                dr.status,
                dr.submitted_at,
                dr.approved_at,
                dr.approved_by,
                u.full_name as approved_by_name
            FROM daily_reports dr
            LEFT JOIN users u ON dr.approved_by = u.id
            ${whereConditions}
            ORDER BY dr.report_date DESC
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);

        const [countResult] = await db.execute(`
            SELECT COUNT(*) as total
            FROM daily_reports dr
            ${whereConditions}
        `, params);

        return {
            reports: historyRows.map(row => ({
                ...row,
                summary_data: JSON.parse(row.summary_data)
            })),
            pagination: {
                current_page: page,
                total_pages: Math.ceil(countResult[0].total / limit),
                total_items: countResult[0].total,
                items_per_page: limit
            }
        };

    } catch (error) {
        console.error('Error getting distributor history:', error);
        throw new Error('خطأ في جلب تاريخ الموزع');
    }
};

// All exports are already individual exports above 