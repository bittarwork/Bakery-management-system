import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { Order, OrderItem, Store, Product, User, getSequelizeConnection } from '../models/index.js';
import { ORDER_STATUS, PAYMENT_STATUS } from '../constants/index.js';
import { CreateOrderRequest } from '../dto/request/CreateOrderRequest.js';
import { OrderResponse, OrdersListResponse } from '../dto/response/OrderResponse.js';

// Helper function to check if status update is allowed
const isStatusUpdateAllowed = (currentStatus, newStatus) => {
    // Define allowed status transitions
    const allowedTransitions = {
        [ORDER_STATUS.DRAFT]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.IN_PROGRESS]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.DELIVERED]: [], // Final state - no transitions allowed
        [ORDER_STATUS.CANCELLED]: [] // Final state - no transitions allowed
    };

    // Allow keeping the same status (for updates that don't change status)
    if (currentStatus === newStatus) {
        return true;
    }

    // Check if the transition is allowed
    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
};

// @desc    الحصول على جميع الطلبات مع التصفية
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Build where clause from query parameters
        const whereClause = {};
        const filters = {};

        // Search functionality
        if (req.query.search && req.query.search.trim()) {
            const searchTerm = req.query.search.trim();
            whereClause[Op.or] = [
                { order_number: { [Op.like]: `%${searchTerm}%` } },
                { notes: { [Op.like]: `%${searchTerm}%` } },
                { '$store.name$': { [Op.like]: `%${searchTerm}%` } }
            ];
            filters.search = searchTerm;
        }

        if (req.query.status && req.query.status.trim()) {
            whereClause.status = req.query.status.trim();
            filters.status = req.query.status.trim();
        }

        if (req.query.payment_status && req.query.payment_status.trim()) {
            whereClause.payment_status = req.query.payment_status.trim();
            filters.payment_status = req.query.payment_status.trim();
        }

        if (req.query.store_id && req.query.store_id.trim()) {
            const storeId = parseInt(req.query.store_id.trim());
            if (!isNaN(storeId) && storeId > 0) {
                whereClause.store_id = storeId;
                filters.store_id = storeId;
            }
        }

        if (req.query.priority) {
            whereClause.priority = req.query.priority;
            filters.priority = req.query.priority;
        }

        if (req.query.distributor_id) {
            const distributorId = parseInt(req.query.distributor_id);
            if (!isNaN(distributorId) && distributorId > 0) {
                whereClause.assigned_distributor_id = distributorId;
                filters.distributor_id = distributorId;
            }
        }

        if (req.query.date_from || req.query.date_to) {
            whereClause.order_date = {};
            if (req.query.date_from && req.query.date_from.trim()) {
                whereClause.order_date[Op.gte] = new Date(req.query.date_from.trim());
                filters.date_from = req.query.date_from.trim();
            }
            if (req.query.date_to && req.query.date_to.trim()) {
                whereClause.order_date[Op.lte] = new Date(req.query.date_to.trim());
                filters.date_to = req.query.date_to.trim();
            }
        }

        // Add user-based filtering
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            whereClause.created_by = req.user.id;
        }

        const { count, rows } = await Order.findAndCountAll({
            where: whereClause,
            include: [
                { model: Store, as: 'store' },
                { model: User, as: 'creator', attributes: ['id', 'full_name', 'username'] },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'unit'] }]
                }
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        const pagination = {
            page,
            limit,
            total: count
        };

        const ordersResponse = new OrdersListResponse(rows, pagination, filters);

        res.json({
            success: true,
            data: ordersResponse
        });

    } catch (error) {
        console.error('[ORDERS] Failed to fetch orders:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الطلبات',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    الحصول على طلب واحد
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);

        // التحقق من صحة orderId
        if (isNaN(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'معرف الطلب غير صحيح'
            });
        }

        const order = await Order.findByPk(orderId, {
            include: [
                { model: Store, as: 'store' },
                { model: User, as: 'creator', attributes: ['id', 'full_name', 'username'] },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'الطلب غير موجود'
            });
        }

        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && order.created_by !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بعرض هذا الطلب'
            });
        }

        const orderResponse = new OrderResponse(order, true, true, true);

        res.json({
            success: true,
            data: orderResponse
        });

    } catch (error) {
        console.error('[ORDERS] Failed to fetch order:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الطلب',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    إنشاء طلب جديد
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    const sequelize = await getSequelizeConnection();
    const transaction = await sequelize.transaction();

    try {
        // Create DTO and validate
        const createOrderRequest = new CreateOrderRequest(req.body);
        const validation = createOrderRequest.validate();

        if (!validation.isValid) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: validation.errors
            });
        }

        const { store_id, items, notes, priority = 'medium', scheduled_delivery_date } = req.body;

        // Verify store exists
        const store = await Store.findByPk(store_id);
        if (!store) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'المحل غير موجود'
            });
        }

        // Generate order number
        const orderNumber = await Order.generateOrderNumber();

        // Calculate totals
        let totalAmountEur = 0;
        let totalAmountSyp = 0;
        let totalCostEur = 0;
        let totalCostSyp = 0;

        // Validate items and calculate totals
        const validatedItems = [];
        for (const item of items) {
            const product = await Product.findByPk(item.product_id);
            if (!product) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: `المنتج ${item.product_id} غير موجود`
                });
            }

            const quantity = parseInt(item.quantity);
            if (quantity <= 0) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `الكمية يجب أن تكون أكبر من صفر للمنتج ${product.name}`
                });
            }

            const itemTotalEur = product.price_eur * quantity;
            const itemTotalSyp = product.price_syp * quantity;
            const itemCostEur = product.cost_eur * quantity;
            const itemCostSyp = product.cost_syp * quantity;

            totalAmountEur += itemTotalEur;
            totalAmountSyp += itemTotalSyp;
            totalCostEur += itemCostEur;
            totalCostSyp += itemCostSyp;

            validatedItems.push({
                product_id: item.product_id,
                quantity,
                unit_price_eur: product.price_eur,
                unit_price_syp: product.price_syp,
                total_price_eur: itemTotalEur,
                total_price_syp: itemTotalSyp,
                discount_amount_eur: 0.00, // No discounts for now
                discount_amount_syp: 0.00, // No discounts for now
                final_price_eur: itemTotalEur, // Same as total since no discounts
                final_price_syp: itemTotalSyp, // Same as total since no discounts
                // Legacy columns for backward compatibility
                unit_price: product.price_eur, // Legacy unit_price field
                total_price: itemTotalEur, // Legacy total_price field
                discount_amount: 0.00, // Legacy discount_amount field
                final_price: itemTotalEur, // Legacy final_price field
                // Product details
                product_name: product.name,
                product_unit: product.unit || 'piece',
                product_barcode: product.barcode || null,
                product_sku: product.sku || null,
                product_description: product.description || null,
                product_category: product.category || null,
                supplier_id: product.supplier_id || null,
                supplier_name: product.supplier_name || null,
                unit: product.unit || 'piece',
                // Delivery fields with defaults
                delivered_quantity: 0,
                returned_quantity: 0,
                damaged_quantity: 0,
                delivery_date: null,
                delivery_status: 'pending',
                delivery_notes: null,
                delivery_confirmed_by: null,
                delivery_confirmed_at: null,
                tracking_number: null,
                delivery_method: 'delivery',
                estimated_delivery_date: null,
                actual_delivery_date: null,
                // Gift fields
                gift_quantity: 0,
                gift_reason: null,
                // Notes
                notes: null
            });
        }

        // Create order
        const order = await Order.create({
            order_number: orderNumber,
            store_id,
            store_name: store.name, // Add store name
            total_amount_eur: totalAmountEur,
            total_amount_syp: totalAmountSyp,
            total_cost_eur: totalCostEur,
            total_cost_syp: totalCostSyp,
            commission_eur: (totalAmountEur - totalCostEur) * 0.1, // 10% commission
            commission_syp: (totalAmountSyp - totalCostSyp) * 0.1,
            status: ORDER_STATUS.DRAFT,
            payment_status: PAYMENT_STATUS.PENDING,
            priority: priority === 'medium' ? 'normal' : priority, // Map 'medium' to 'normal' for existing enum
            scheduled_delivery_date: scheduled_delivery_date || null,
            notes,
            created_by: req.user.id,
            created_by_name: req.user.full_name || req.user.username
        }, { transaction });

        // Create order items
        for (const item of validatedItems) {
            await OrderItem.create({
                order_id: order.id,
                ...item
            }, { transaction });
        }

        await transaction.commit();

        // Fetch complete order with relations
        const completeOrder = await Order.findByPk(order.id, {
            include: [
                { model: Store, as: 'store' },
                { model: User, as: 'creator', attributes: ['id', 'full_name', 'username'] },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });

        const orderResponse = new OrderResponse(completeOrder, true, true, true);

        res.status(201).json({
            success: true,
            data: orderResponse,
            message: 'تم إنشاء الطلب بنجاح'
        });

    } catch (error) {
        await transaction.rollback();
        console.error('[ORDERS] Failed to create order:', error.message);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }

        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الطلب',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    تحديث طلب
// @route   PUT /api/orders/:id
// @access  Private
export const updateOrder = async (req, res) => {
    const sequelize = await getSequelizeConnection();
    const transaction = await sequelize.transaction();

    try {
        const orderId = parseInt(req.params.id);
        const { items, notes, priority, scheduled_delivery_date } = req.body;

        const order = await Order.findByPk(orderId, {
            include: [
                { model: OrderItem, as: 'items' }
            ]
        });

        if (!order) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'الطلب غير موجود'
            });
        }

        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && order.created_by !== req.user.id) {
            await transaction.rollback();
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بتحديث هذا الطلب'
            });
        }

        // Can only update draft orders
        if (order.status !== ORDER_STATUS.DRAFT) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'لا يمكن تحديث الطلب بعد تأكيده'
            });
        }

        // Update order items if provided
        if (items && items.length > 0) {
            // Delete existing items
            await OrderItem.destroy({
                where: { order_id: orderId },
                transaction
            });

            // Calculate new totals
            let totalAmountEur = 0;
            let totalAmountSyp = 0;
            let totalCostEur = 0;
            let totalCostSyp = 0;

            // Validate and create new items
            for (const item of items) {
                const product = await Product.findByPk(item.product_id);
                if (!product) {
                    await transaction.rollback();
                    return res.status(404).json({
                        success: false,
                        message: `المنتج ${item.product_id} غير موجود`
                    });
                }

                const quantity = parseInt(item.quantity);
                if (quantity <= 0) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `الكمية يجب أن تكون أكبر من صفر للمنتج ${product.name}`
                    });
                }

                const itemTotalEur = product.price_eur * quantity;
                const itemTotalSyp = product.price_syp * quantity;
                const itemCostEur = product.cost_eur * quantity;
                const itemCostSyp = product.cost_syp * quantity;

                totalAmountEur += itemTotalEur;
                totalAmountSyp += itemTotalSyp;
                totalCostEur += itemCostEur;
                totalCostSyp += itemCostSyp;

                await OrderItem.create({
                    order_id: orderId,
                    product_id: item.product_id,
                    quantity,
                    unit_price_eur: product.price_eur,
                    unit_price_syp: product.price_syp,
                    total_price_eur: itemTotalEur,
                    total_price_syp: itemTotalSyp,
                    product_name: product.name,
                    product_unit: product.unit
                }, { transaction });
            }

            // Update order totals
            await order.update({
                total_amount_eur: totalAmountEur,
                total_amount_syp: totalAmountSyp,
                total_cost_eur: totalCostEur,
                total_cost_syp: totalCostSyp,
                commission_eur: (totalAmountEur - totalCostEur) * 0.1,
                commission_syp: (totalAmountSyp - totalCostSyp) * 0.1
            }, { transaction });
        }

        // Update other order fields
        const updateData = {};
        if (notes !== undefined) updateData.notes = notes;
        if (priority !== undefined) updateData.priority = priority;
        if (scheduled_delivery_date !== undefined) updateData.scheduled_delivery_date = scheduled_delivery_date;

        if (Object.keys(updateData).length > 0) {
            await order.update(updateData, { transaction });
        }

        await transaction.commit();

        // Fetch updated order with relations
        const updatedOrder = await Order.findByPk(orderId, {
            include: [
                { model: Store, as: 'store' },
                { model: User, as: 'creator', attributes: ['id', 'full_name', 'username'] },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });

        const orderResponse = new OrderResponse(updatedOrder, true, true, true);

        res.json({
            success: true,
            data: orderResponse,
            message: 'تم تحديث الطلب بنجاح'
        });

    } catch (error) {
        await transaction.rollback();
        console.error('[ORDERS] Failed to update order:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث الطلب',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    حذف طلب
// @route   DELETE /api/orders/:id
// @access  Private
export const deleteOrder = async (req, res) => {
    const sequelize = await getSequelizeConnection();
    const transaction = await sequelize.transaction();

    try {
        const orderId = parseInt(req.params.id);

        const order = await Order.findByPk(orderId);

        if (!order) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'الطلب غير موجود'
            });
        }

        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && order.created_by !== req.user.id) {
            await transaction.rollback();
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بحذف هذا الطلب'
            });
        }

        // Can only delete draft orders
        if (order.status !== ORDER_STATUS.DRAFT) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'لا يمكن حذف الطلب بعد تأكيده'
            });
        }

        // Delete order items first
        await OrderItem.destroy({
            where: { order_id: orderId },
            transaction
        });

        // Delete order
        await order.destroy({ transaction });

        await transaction.commit();

        res.json({
            success: true,
            message: 'تم حذف الطلب بنجاح'
        });

    } catch (error) {
        await transaction.rollback();
        console.error('[ORDERS] Failed to delete order:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف الطلب',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    تحديث حالة الطلب
// @route   PATCH /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;

        if (!status || !Object.values(ORDER_STATUS).includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'حالة الطلب غير صحيحة'
            });
        }

        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'الطلب غير موجود'
            });
        }

        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بتحديث حالة الطلب'
            });
        }

        // Check if status update is allowed
        if (!isStatusUpdateAllowed(order.status, status)) {
            return res.status(400).json({
                success: false,
                message: `لا يمكن تغيير حالة الطلب من ${order.status} إلى ${status}`
            });
        }

        // Update order status
        await order.update({ status });

        res.json({
            success: true,
            data: { order_id: orderId, status },
            message: 'تم تحديث حالة الطلب بنجاح'
        });

    } catch (error) {
        console.error('[ORDERS] Failed to update order status:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث حالة الطلب',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    تحديث حالة الدفع
// @route   PATCH /api/orders/:id/payment-status
// @access  Private
export const updatePaymentStatus = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { payment_status } = req.body;

        if (!payment_status || !Object.values(PAYMENT_STATUS).includes(payment_status)) {
            return res.status(400).json({
                success: false,
                message: 'حالة الدفع غير صحيحة'
            });
        }

        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'الطلب غير موجود'
            });
        }

        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بتحديث حالة الدفع'
            });
        }

        // Update payment status
        await order.update({ payment_status });

        res.json({
            success: true,
            data: { order_id: orderId, payment_status },
            message: 'تم تحديث حالة الدفع بنجاح'
        });

    } catch (error) {
        console.error('[ORDERS] Failed to update payment status:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث حالة الدفع',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    الحصول على طلبات اليوم
// @route   GET /api/orders/today
// @access  Private
export const getTodayOrders = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        const orders = await Order.findAll({
            where: {
                created_at: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            },
            include: [
                { model: Store, as: 'store' },
                { model: User, as: 'creator', attributes: ['id', 'full_name', 'username'] },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'unit'] }]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        const stats = {
            total_orders: orders.length,
            total_amount_eur: orders.reduce((sum, order) => sum + parseFloat(order.total_amount_eur || 0), 0),
            total_amount_syp: orders.reduce((sum, order) => sum + parseFloat(order.total_amount_syp || 0), 0),
            by_status: {}
        };

        // Group by status
        orders.forEach(order => {
            if (!stats.by_status[order.status]) {
                stats.by_status[order.status] = 0;
            }
            stats.by_status[order.status]++;
        });

        res.json({
            success: true,
            data: {
                orders: orders.map(order => new OrderResponse(order, true, false, false)),
                stats
            }
        });

    } catch (error) {
        console.error('[ORDERS] Failed to fetch today orders:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب طلبات اليوم',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    الحصول على إحصائيات الطلبات
// @route   GET /api/orders/statistics
// @access  Private
export const getOrderStatistics = async (req, res) => {
    try {
        const stats = await Order.getOrderStatistics();

        res.json({
            success: true,
            data: stats,
            message: 'تم جلب الإحصائيات بنجاح'
        });

    } catch (error) {
        console.error('[ORDERS] Failed to fetch order statistics:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب إحصائيات الطلبات',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    تصدير الطلبات
// @route   GET /api/orders/export
// @access  Private
export const exportOrders = async (req, res) => {
    try {
        const { format = 'csv' } = req.query;

        const orders = await Order.findAll({
            include: [
                { model: Store, as: 'store' },
                { model: User, as: 'creator', attributes: ['id', 'full_name', 'username'] },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        if (format === 'csv') {
            // Generate CSV content
            const csvContent = orders.map(order => ({
                order_number: order.order_number,
                store_name: order.store?.name || '',
                total_amount_eur: order.total_amount_eur,
                total_amount_syp: order.total_amount_syp,
                status: order.status,
                payment_status: order.payment_status,
                created_at: order.created_at,
                created_by: order.creator?.full_name || order.creator?.username || ''
            }));

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');

            // Simple CSV conversion
            const csvHeader = Object.keys(csvContent[0] || {}).join(',') + '\n';
            const csvRows = csvContent.map(row => Object.values(row).join(',')).join('\n');

            res.send(csvHeader + csvRows);
        } else {
            res.json({
                success: true,
                data: orders.map(order => new OrderResponse(order, true, true, true))
            });
        }

    } catch (error) {
        console.error('[ORDERS] Failed to export orders:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في تصدير الطلبات',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 