import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { Order, OrderItem, Store, Product, User, sequelize } from '../models/index.js';
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
        console.error('Error fetching orders:', error);
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
        console.error('Error fetching order:', error);
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

        // Check if store exists
        const store = await Store.findByPk(createOrderRequest.store_id);
        if (!store) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'المتجر غير موجود'
            });
        }

        // Generate order number
        const orderNumber = Order.generateOrderNumber(createOrderRequest.store_id, createOrderRequest.order_date);

        // Calculate totals from items first
        let calculatedTotalAmount = 0;
        let orderItemsData = [];

        if (createOrderRequest.items && createOrderRequest.items.length > 0) {
            // Validate products exist
            const productIds = createOrderRequest.items.map(item => item.product_id);
            const products = await Product.findAll({
                where: { id: productIds },
                transaction
            });

            if (products.length !== productIds.length) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'بعض المنتجات غير موجودة'
                });
            }

            // Calculate totals from items
            orderItemsData = createOrderRequest.getOrderItems();
            calculatedTotalAmount = orderItemsData.reduce((sum, item) => sum + item.final_price, 0);
        }

        // Use calculated total or ensure minimum value
        const finalTotalAmount = Math.max(calculatedTotalAmount, 0.01); // Minimum 0.01 to avoid validation error
        const discountAmount = Math.min(createOrderRequest.discount_amount, finalTotalAmount); // Ensure discount doesn't exceed total
        const finalAmount = Math.max(finalTotalAmount - discountAmount, 0.01); // Minimum 0.01

        // Create order with calculated values
        const orderData = {
            store_id: createOrderRequest.store_id,
            order_date: createOrderRequest.order_date,
            delivery_date: createOrderRequest.delivery_date,
            total_amount: finalTotalAmount,
            discount_amount: discountAmount,
            final_amount: finalAmount,
            notes: createOrderRequest.notes,
            order_number: orderNumber,
            status: ORDER_STATUS.DRAFT,
            payment_status: PAYMENT_STATUS.PENDING,
            created_by: req.user.id
        };

        const order = await Order.create(orderData, { transaction });

        // Create order items if provided
        if (orderItemsData.length > 0) {
            const orderItemsWithOrderId = orderItemsData.map(item => ({
                ...item,
                order_id: order.id
            }));

            await OrderItem.bulkCreate(orderItemsWithOrderId, { transaction });
        }

        await transaction.commit();

        // Fetch complete order with relations
        const completeOrder = await Order.findByPk(order.id, {
            include: [
                { model: Store, as: 'store' },
                { model: User, as: 'creator' },
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
            message: 'تم إنشاء الطلب بنجاح',
            data: orderResponse
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error creating order:', error);
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
    try {
        const { id } = req.params;
        const {
            store_id,
            order_date,
            delivery_date,
            items,
            discount_amount,
            notes,
            status
        } = req.body;

        const transaction = await sequelize.transaction();

        try {
            // البحث عن الطلب
            const order = await Order.findByPk(id, {
                include: [{
                    model: OrderItem,
                    as: 'items'
                }]
            });

            if (!order) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'الطلب غير موجود'
                });
            }

            // التحقق من إمكانية التعديل
            if (!order.canBeModified()) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'لا يمكن تعديل هذا الطلب في الحالة الحالية'
                });
            }

            // حذف عناصر الطلب القديمة
            await OrderItem.destroy({
                where: { order_id: id },
                transaction
            });

            // إعادة حساب المبلغ الإجمالي
            let totalAmount = 0;
            const orderItemsData = [];

            if (items && items.length > 0) {
                const productIds = items.map(item => item.product_id);
                const products = await Product.findAll({
                    where: {
                        id: { [Op.in]: productIds },
                        is_active: true
                    }
                });

                for (const item of items) {
                    const product = products.find(p => p.id === item.product_id);
                    const unitPrice = item.unit_price || product.price;
                    const totalPrice = parseFloat(item.quantity) * parseFloat(unitPrice);
                    const itemDiscountAmount = parseFloat(item.discount_amount) || 0;
                    const finalPrice = totalPrice - itemDiscountAmount;

                    totalAmount += finalPrice;

                    orderItemsData.push({
                        order_id: id,
                        product_id: item.product_id,
                        quantity: item.quantity,
                        unit_price: unitPrice,
                        total_price: totalPrice,
                        discount_amount: itemDiscountAmount,
                        final_price: finalPrice,
                        gift_quantity: item.gift_quantity || 0,
                        gift_reason: item.gift_reason || null,
                        notes: item.notes || null
                    });
                }

                // إنشاء عناصر الطلب الجديدة
                await OrderItem.bulkCreate(orderItemsData, { transaction });
            }

            const finalAmount = totalAmount - parseFloat(discount_amount || 0);

            // تحديث الطلب
            await order.update({
                store_id: store_id || order.store_id,
                order_date: order_date || order.order_date,
                delivery_date: delivery_date || order.delivery_date,
                total_amount: totalAmount,
                discount_amount: parseFloat(discount_amount || 0),
                final_amount: finalAmount,
                notes: notes !== undefined ? notes : order.notes,
                status: status || order.status
            }, { transaction });

            await transaction.commit();

            // جلب الطلب المحدث مع العلاقات
            const updatedOrder = await Order.findByPk(id, {
                include: [
                    {
                        model: Store,
                        as: 'store',
                        attributes: ['id', 'name', 'phone', 'address']
                    },
                    {
                        model: OrderItem,
                        as: 'items',
                        include: [{
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'unit']
                        }]
                    }
                ]
            });

            res.json({
                success: true,
                data: updatedOrder,
                message: 'تم تحديث الطلب بنجاح'
            });

        } catch (error) {
            await transaction.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error in updateOrder:', error);
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
    const transaction = await sequelize.transaction();

    try {
        const orderId = parseInt(req.params.id);

        const order = await Order.findByPk(orderId, { transaction });

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

        // Check if order can be deleted
        if (!order.canBeCancelled()) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'لا يمكن حذف هذا الطلب'
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
        console.error('Error deleting order:', error);
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

        // التحقق من صحة orderId
        if (isNaN(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'معرف الطلب غير صحيح'
            });
        }

        // التحقق من صحة الحالة
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
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && order.created_by !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بتعديل هذا الطلب'
            });
        }

        // Check if status update is allowed
        if (!isStatusUpdateAllowed(order.status, status)) {
            return res.status(400).json({
                success: false,
                message: 'لا يمكن تحديث الحالة من ' + order.status + ' إلى ' + status
            });
        }

        // تحديث الحالة
        order.status = status;
        order.updated_at = new Date();
        await order.save();

        // جلب الطلب مع العلاقات
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
            message: 'تم تحديث حالة الطلب بنجاح',
            data: orderResponse
        });

    } catch (error) {
        console.error('Error updating order status:', error);
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

        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'الطلب غير موجود'
            });
        }

        // Check permissions (only admin and manager can update payment status)
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بتعديل حالة الدفع'
            });
        }

        await order.updatePaymentStatus(payment_status);

        const orderResponse = new OrderResponse(order);

        res.json({
            success: true,
            message: 'تم تحديث حالة الدفع بنجاح',
            data: orderResponse
        });

    } catch (error) {
        console.error('Error updating payment status:', error);
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
        const today = new Date().toISOString().split('T')[0];

        const orders = await Order.findAll({
            where: {
                order_date: today
            },
            include: [
                {
                    model: Store,
                    as: 'store',
                    attributes: ['id', 'name', 'phone', 'address']
                },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name', 'unit']
                    }]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        const statistics = {
            total_orders: orders.length,
            total_amount: orders.reduce((sum, order) => sum + parseFloat(order.final_amount), 0),
            by_status: {
                draft: orders.filter(o => o.status === 'draft').length,
                confirmed: orders.filter(o => o.status === 'confirmed').length,
                in_progress: orders.filter(o => o.status === 'in_progress').length,
                delivered: orders.filter(o => o.status === 'delivered').length,
                cancelled: orders.filter(o => o.status === 'cancelled').length
            }
        };

        res.json({
            success: true,
            data: {
                orders,
                statistics
            },
            message: 'تم جلب طلبات اليوم بنجاح'
        });

    } catch (error) {
        console.error('Error in getTodayOrders:', error);
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
        const { date_from, date_to } = req.query;

        const dateFrom = date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const dateTo = date_to || new Date().toISOString().split('T')[0];

        const totalsByDate = await Order.getTotalsByDate(dateFrom, dateTo);

        const overallStats = await Order.findOne({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'total_orders'],
                [sequelize.fn('SUM', sequelize.col('final_amount')), 'total_amount'],
                [sequelize.fn('AVG', sequelize.col('final_amount')), 'avg_amount']
            ],
            where: {
                order_date: {
                    [Op.between]: [dateFrom, dateTo]
                },
                status: {
                    [Op.ne]: 'cancelled'
                }
            }
        });

        const statusDistribution = await Order.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('final_amount')), 'amount']
            ],
            where: {
                order_date: {
                    [Op.between]: [dateFrom, dateTo]
                }
            },
            group: ['status']
        });

        res.json({
            success: true,
            data: {
                overall: {
                    total_orders: parseInt(overallStats?.dataValues?.total_orders) || 0,
                    total_amount: parseFloat(overallStats?.dataValues?.total_amount) || 0,
                    avg_amount: Math.round(parseFloat(overallStats?.dataValues?.avg_amount) * 100) / 100 || 0
                },
                daily_totals: totalsByDate,
                status_distribution: statusDistribution.reduce((acc, item) => {
                    acc[item.status] = {
                        count: parseInt(item.dataValues.count),
                        amount: parseFloat(item.dataValues.amount) || 0
                    };
                    return acc;
                }, {}),
                date_range: {
                    from: dateFrom,
                    to: dateTo
                }
            },
            message: 'تم جلب إحصائيات الطلبات بنجاح'
        });

    } catch (error) {
        console.error('Error in getOrderStatistics:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب إحصائيات الطلبات',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    تصدير الطلبات إلى Excel
// @route   GET /api/orders/export
// @access  Private
export const exportOrders = async (req, res) => {
    try {
        // Build where clause from query parameters (exclude page and limit)
        const whereClause = {};

        if (req.query.status) {
            whereClause.status = req.query.status;
        }

        if (req.query.payment_status) {
            whereClause.payment_status = req.query.payment_status;
        }

        if (req.query.store_id) {
            const storeId = parseInt(req.query.store_id);
            if (!isNaN(storeId) && storeId > 0) {
                whereClause.store_id = storeId;
            }
        }

        if (req.query.date_from || req.query.date_to) {
            whereClause.order_date = {};
            if (req.query.date_from) {
                whereClause.order_date[Op.gte] = req.query.date_from;
            }
            if (req.query.date_to) {
                whereClause.order_date[Op.lte] = req.query.date_to;
            }
        }

        // Add user-based filtering
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            whereClause.created_by = req.user.id;
        }

        const orders = await Order.findAll({
            where: whereClause,
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

        // التحقق من وجود بيانات
        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'لا توجد طلبات للتصدير'
            });
        }

        // Prepare data for CSV export (simple format)
        const csvData = orders.map(order => {
            const orderDate = new Date(order.order_date);
            const deliveryDate = order.delivery_date ? new Date(order.delivery_date) : null;
            const createdDate = new Date(order.created_at);

            return {
                'رقم الطلب': order.order_number,
                'المتجر': order.store?.name || '',
                'تاريخ الطلب': orderDate.toLocaleDateString('en-GB'), // DD/MM/YYYY format
                'تاريخ التسليم': deliveryDate ? deliveryDate.toLocaleDateString('en-GB') : '',
                'الحالة': order.status,
                'حالة الدفع': order.payment_status,
                'المبلغ الإجمالي': order.total_amount,
                'الخصم': order.discount_amount,
                'المبلغ النهائي': order.final_amount,
                'عدد المنتجات': order.items?.length || 0,
                'الكمية الإجمالية': order.items?.reduce((sum, item) => sum + parseInt(item.quantity), 0) || 0,
                'ملاحظات': order.notes || '',
                'منشئ الطلب': order.creator?.full_name || '',
                'تاريخ الإنشاء': createdDate.toLocaleDateString('en-GB')
            };
        });

        // Convert to CSV format
        const headers = Object.keys(csvData[0]);
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');

        // Set response headers for file download
        const today = new Date();
        const filename = `orders_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Add BOM for proper Arabic display in Excel
        res.write('\ufeff');
        res.end(csvContent);

    } catch (error) {
        console.error('Error exporting orders:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تصدير الطلبات',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 