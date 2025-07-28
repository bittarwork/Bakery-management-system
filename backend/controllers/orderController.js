import { validationResult } from 'express-validator';
import { Op, Transaction } from 'sequelize';
import { Order, OrderItem, Store, Product, User } from '../models/index.js';
import sequelize from '../config/database.js';
import { ORDER_STATUS, PAYMENT_STATUS } from '../constants/index.js';
import { CreateOrderRequest } from '../dto/request/CreateOrderRequest.js';
import { OrderResponse, OrdersListResponse } from '../dto/response/OrderResponse.js';
import logger from '../config/logger.js';

// Helper function to check if status update is allowed
const isStatusUpdateAllowed = (currentStatus, newStatus) => {
    // Define allowed status transitions
    const allowedTransitions = {
        [ORDER_STATUS.DRAFT]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.IN_PROGRESS]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.DELIVERED]: [], // Final state
        [ORDER_STATUS.CANCELLED]: [] // Final state
    };

    // Allow keeping the same status
    if (currentStatus === newStatus) {
        return true;
    }

    // Check if the transition is allowed
    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
};

// @desc    Get all orders with filtering
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
                { notes: { [Op.like]: `%${searchTerm}%` } }
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
            if (req.user.role === 'distributor') {
                // Distributors can only see their assigned orders
                whereClause.assigned_distributor_id = req.user.id;
            } else {
                // Other users can only see orders they created
                whereClause.created_by = req.user.id;
            }
        }

        // Simplified query without complex includes
        const { count, rows } = await Order.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        const pagination = {
            page,
            limit,
            total: count
        };

        // Create simple response without complex DTO
        const orders = rows.map(order => ({
            id: order.id,
            order_number: order.order_number,
            store_id: order.store_id,
            store_name: order.store_name,
            order_date: order.order_date,
            delivery_date: order.delivery_date,
            total_amount_eur: parseFloat(order.total_amount_eur || 0),
            total_amount_syp: parseFloat(order.total_amount_syp || 0),
            final_amount_eur: parseFloat(order.final_amount_eur || 0),
            final_amount_syp: parseFloat(order.final_amount_syp || 0),
            currency: order.currency,
            status: order.status,
            payment_status: order.payment_status,
            notes: order.notes,
            assigned_distributor_id: order.assigned_distributor_id,
            created_by: order.created_by,
            created_at: order.created_at,
            updated_at: order.updated_at
        }));

        res.json({
            success: true,
            data: {
                orders,
                pagination,
                filters,
                summary: {
                    total_orders: count,
                    total_amount_eur: orders.reduce((sum, order) => sum + order.final_amount_eur, 0),
                    total_amount_syp: orders.reduce((sum, order) => sum + order.final_amount_syp, 0)
                }
            }
        });

    } catch (error) {
        console.error('[ORDERS] Failed to fetch orders:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);

        if (isNaN(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID'
            });
        }

        // Simplified query without complex includes
        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            if (req.user.role === 'distributor' && order.assigned_distributor_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to view this order'
                });
            } else if (req.user.role !== 'distributor' && order.created_by !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to view this order'
                });
            }
        }

        // Get order items separately
        const orderItems = await OrderItem.findAll({
            where: { order_id: orderId },
            include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'unit'] }]
        });

        // Create simple response
        const orderData = {
            id: order.id,
            order_number: order.order_number,
            store_id: order.store_id,
            store_name: order.store_name,
            order_date: order.order_date,
            delivery_date: order.delivery_date,
            total_amount_eur: parseFloat(order.total_amount_eur || 0),
            total_amount_syp: parseFloat(order.total_amount_syp || 0),
            final_amount_eur: parseFloat(order.final_amount_eur || 0),
            final_amount_syp: parseFloat(order.final_amount_syp || 0),
            currency: order.currency,
            status: order.status,
            payment_status: order.payment_status,
            notes: order.notes,
            assigned_distributor_id: order.assigned_distributor_id,
            created_by: order.created_by,
            created_at: order.created_at,
            updated_at: order.updated_at,
            items: orderItems.map(item => ({
                id: item.id,
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                unit_price_eur: parseFloat(item.unit_price_eur || 0),
                unit_price_syp: parseFloat(item.unit_price_syp || 0),
                total_price_eur: parseFloat(item.total_price_eur || 0),
                total_price_syp: parseFloat(item.total_price_syp || 0),
                notes: item.notes,
                product: item.product ? {
                    id: item.product.id,
                    name: item.product.name,
                    unit: item.product.unit
                } : null
            }))
        };

        res.json({
            success: true,
            data: orderData
        });

    } catch (error) {
        console.error('[ORDERS] Failed to fetch order:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    const transaction = await sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        timeout: 30000
    });

    try {
        // Create DTO and validate
        const createOrderRequest = new CreateOrderRequest(req.body);
        const validation = createOrderRequest.validate();

        if (!validation.isValid) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Invalid data',
                errors: validation.errors
            });
        }

        const { store_id, items, notes, delivery_date, currency = 'EUR' } = req.body;

        // Verify store exists
        const store = await Store.findByPk(store_id);
        if (!store) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        // Generate order number
        const orderNumber = await Order.generateOrderNumber();

        // Calculate totals
        let totalAmountEur = 0;
        let totalAmountSyp = 0;

        // Validate items and calculate totals
        const validatedItems = [];
        for (const item of items) {
            const product = await Product.findByPk(item.product_id);
            if (!product) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.product_id} not found`
                });
            }

            // Check if product is active
            if (product.status === 'inactive') {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Product ${product.name} is not available`
                });
            }

            const quantity = parseInt(item.quantity);
            if (quantity <= 0) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Quantity must be greater than zero for product ${product.name}`
                });
            }

            // Check stock availability if stock tracking is enabled
            if (product.stock_quantity !== null && product.stock_quantity < quantity) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Required quantity (${quantity}) not available for product ${product.name}. Available: ${product.stock_quantity}`
                });
            }

            // Calculate prices - simple pricing
            const unitPriceEur = parseFloat(product.price_eur) || 0;
            const unitPriceSyp = parseFloat(product.price_syp) || 0;

            const itemTotalEur = unitPriceEur * quantity;
            const itemTotalSyp = unitPriceSyp * quantity;

            totalAmountEur += itemTotalEur;
            totalAmountSyp += itemTotalSyp;

            validatedItems.push({
                product_id: item.product_id,
                quantity,
                unit_price_eur: unitPriceEur,
                unit_price_syp: unitPriceSyp,
                total_price_eur: itemTotalEur,
                total_price_syp: itemTotalSyp,
                product_name: product.name,
                product_unit: product.unit || 'piece',
                notes: item.notes || null
            });
        }

        // Set final amounts based on currency
        let finalAmountEur = 0;
        let finalAmountSyp = 0;

        if (currency === 'EUR') {
            finalAmountEur = totalAmountEur;
        } else {
            finalAmountSyp = totalAmountSyp;
        }

        // Create order
        const order = await Order.create({
            order_number: orderNumber,
            store_id,
            store_name: store.name,
            total_amount_eur: totalAmountEur,
            total_amount_syp: totalAmountSyp,
            final_amount_eur: finalAmountEur,
            final_amount_syp: finalAmountSyp,
            currency,
            status: ORDER_STATUS.DRAFT,
            payment_status: PAYMENT_STATUS.PENDING,
            delivery_date: delivery_date || null,
            notes,
            created_by: req.user.id,
            created_by_name: req.user.full_name || req.user.username
        }, { transaction });

        // Add order items
        for (const item of validatedItems) {
            await OrderItem.create({
                order_id: order.id,
                ...item
            }, { transaction });
        }

        // Commit transaction
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
            message: 'Order created successfully'
        });

    } catch (error) {
        try {
            await transaction.rollback();
        } catch (rollbackError) {
            logger.error('[ORDERS] Error rolling back transaction:', rollbackError);
        }

        console.error('[ORDERS] Failed to create order:', error.message);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid data',
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
export const updateOrder = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const orderId = parseInt(req.params.id);
        const { items, notes, delivery_date } = req.body;

        const order = await Order.findByPk(orderId, {
            include: [{ model: OrderItem, as: 'items' }]
        });

        if (!order) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && order.created_by !== req.user.id) {
            await transaction.rollback();
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this order'
            });
        }

        // Can only update draft orders
        if (!order.canEdit()) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Cannot update order after confirmation'
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

            // Validate and create new items
            for (const item of items) {
                const product = await Product.findByPk(item.product_id);
                if (!product) {
                    await transaction.rollback();
                    return res.status(404).json({
                        success: false,
                        message: `Product ${item.product_id} not found`
                    });
                }

                const quantity = parseInt(item.quantity);
                if (quantity <= 0) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Quantity must be greater than zero for product ${product.name}`
                    });
                }

                const itemTotalEur = product.price_eur * quantity;
                const itemTotalSyp = product.price_syp * quantity;

                totalAmountEur += itemTotalEur;
                totalAmountSyp += itemTotalSyp;

                await OrderItem.create({
                    order_id: orderId,
                    product_id: item.product_id,
                    quantity,
                    unit_price_eur: product.price_eur,
                    unit_price_syp: product.price_syp,
                    total_price_eur: itemTotalEur,
                    total_price_syp: itemTotalSyp,
                    product_name: product.name,
                    product_unit: product.unit,
                    notes: item.notes || null
                }, { transaction });
            }

            // Update order totals
            const finalAmountEur = order.currency === 'EUR' ? totalAmountEur : 0;
            const finalAmountSyp = order.currency === 'SYP' ? totalAmountSyp : 0;

            await order.update({
                total_amount_eur: totalAmountEur,
                total_amount_syp: totalAmountSyp,
                final_amount_eur: finalAmountEur,
                final_amount_syp: finalAmountSyp
            }, { transaction });
        }

        // Update other order fields
        const updateData = {};
        if (notes !== undefined) updateData.notes = notes;
        if (delivery_date !== undefined) updateData.delivery_date = delivery_date;

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
            message: 'Order updated successfully'
        });

    } catch (error) {
        await transaction.rollback();
        console.error('[ORDERS] Failed to update order:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error updating order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
export const deleteOrder = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const orderId = parseInt(req.params.id);

        const order = await Order.findByPk(orderId);

        if (!order) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && order.created_by !== req.user.id) {
            await transaction.rollback();
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this order'
            });
        }

        // Can only delete draft orders
        if (!order.canEdit()) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Cannot delete order after confirmation'
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
            message: 'Order deleted successfully'
        });

    } catch (error) {
        await transaction.rollback();
        console.error('[ORDERS] Failed to delete order:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error deleting order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;

        if (!status || !Object.values(ORDER_STATUS).includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check permissions
        const canUpdate = req.user.role === 'admin' ||
            req.user.role === 'manager' ||
            (req.user.role === 'distributor' && order.assigned_distributor_id === req.user.id);

        if (!canUpdate) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update order status'
            });
        }

        // Check if status update is allowed
        if (!isStatusUpdateAllowed(order.status, status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change order status from ${order.status} to ${status}`
            });
        }

        // Update order status
        await order.updateStatus(status);

        res.json({
            success: true,
            data: { order_id: orderId, status },
            message: 'Order status updated successfully'
        });

    } catch (error) {
        console.error('[ORDERS] Failed to update order status:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update payment status
// @route   PATCH /api/orders/:id/payment-status
// @access  Private
export const updatePaymentStatus = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { payment_status } = req.body;

        if (!payment_status || !Object.values(PAYMENT_STATUS).includes(payment_status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment status'
            });
        }

        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check permissions - only admin, manager, or assigned distributor can update payment status
        const canUpdate = req.user.role === 'admin' ||
            req.user.role === 'manager' ||
            (req.user.role === 'distributor' && order.assigned_distributor_id === req.user.id);

        if (!canUpdate) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update payment status'
            });
        }

        // Update payment status
        await order.updatePaymentStatus(payment_status);

        res.json({
            success: true,
            data: { order_id: orderId, payment_status },
            message: 'Payment status updated successfully'
        });

    } catch (error) {
        console.error('[ORDERS] Failed to update payment status:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error updating payment status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Assign distributor to order (Manual assignment)
// @route   POST /api/orders/:id/assign-distributor
// @access  Private (Admin/Manager only)
export const assignDistributor = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { distributor_id } = req.body;

        // Check permissions - only admin and manager can assign distributors
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to assign distributors'
            });
        }

        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Verify distributor exists and has distributor role
        const distributor = await User.findByPk(distributor_id);
        if (!distributor || distributor.role !== 'distributor') {
            return res.status(404).json({
                success: false,
                message: 'Distributor not found'
            });
        }

        // Check if distributor is active
        if (distributor.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Distributor is not active'
            });
        }

        // Assign distributor
        await order.assignDistributor(distributor_id);

        // If order is still draft, move it to confirmed
        if (order.status === ORDER_STATUS.DRAFT) {
            await order.updateStatus(ORDER_STATUS.CONFIRMED);
        }

        res.json({
            success: true,
            data: {
                order_id: orderId,
                distributor_id,
                distributor_name: distributor.full_name,
                order_status: order.status
            },
            message: 'Distributor assigned successfully'
        });

    } catch (error) {
        console.error('[ORDERS] Failed to assign distributor:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error assigning distributor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Unassign distributor from order
// @route   DELETE /api/orders/:id/assign-distributor
// @access  Private (Admin/Manager only)
export const unassignDistributor = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);

        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to unassign distributors'
            });
        }

        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (!order.assigned_distributor_id) {
            return res.status(400).json({
                success: false,
                message: 'Order has no assigned distributor'
            });
        }

        // Cannot unassign if order is already in progress or delivered
        if (order.status === ORDER_STATUS.IN_PROGRESS || order.status === ORDER_STATUS.DELIVERED) {
            return res.status(400).json({
                success: false,
                message: 'Cannot unassign distributor from order in progress or delivered'
            });
        }

        // Unassign distributor
        await order.unassignDistributor();

        // Move order back to draft if it was confirmed
        if (order.status === ORDER_STATUS.CONFIRMED) {
            await order.updateStatus(ORDER_STATUS.DRAFT);
        }

        res.json({
            success: true,
            data: { order_id: orderId },
            message: 'Distributor unassigned successfully'
        });

    } catch (error) {
        console.error('[ORDERS] Failed to unassign distributor:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error unassigning distributor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get orders assigned to distributor
// @route   GET /api/orders/distributor/:distributorId
// @access  Private
export const getDistributorOrders = async (req, res) => {
    try {
        const distributorId = parseInt(req.params.distributorId);
        const status = req.query.status;

        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== distributorId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these orders'
            });
        }

        const options = { status };
        if (req.query.limit) {
            options.limit = parseInt(req.query.limit);
        }

        const orders = await Order.findByDistributor(distributorId, options);

        res.json({
            success: true,
            data: orders.map(order => new OrderResponse(order, true, false, false)),
            message: 'Distributor orders fetched successfully'
        });

    } catch (error) {
        console.error('[ORDERS] Failed to fetch distributor orders:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching distributor orders',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get today's orders
// @route   GET /api/orders/today
// @access  Private
export const getTodayOrders = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        const whereClause = {
            created_at: {
                [Op.between]: [startOfDay, endOfDay]
            }
        };

        // Add user-based filtering
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            if (req.user.role === 'distributor') {
                whereClause.assigned_distributor_id = req.user.id;
            } else {
                whereClause.created_by = req.user.id;
            }
        }

        const orders = await Order.findAll({
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
            order: [['created_at', 'DESC']]
        });

        const stats = {
            total_orders: orders.length,
            total_amount_eur: orders.reduce((sum, order) => sum + parseFloat(order.final_amount_eur || 0), 0),
            total_amount_syp: orders.reduce((sum, order) => sum + parseFloat(order.final_amount_syp || 0), 0),
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
            message: 'Error fetching today orders',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get order statistics
// @route   GET /api/orders/statistics
// @access  Private
export const getOrderStatistics = async (req, res) => {
    try {
        const stats = await Order.getStatistics();

        res.json({
            success: true,
            data: stats,
            message: 'Statistics fetched successfully'
        });

    } catch (error) {
        console.error('[ORDERS] Failed to fetch order statistics:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching order statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Export orders
// @route   GET /api/orders/export
// @access  Private
export const exportOrders = async (req, res) => {
    try {
        const { format = 'csv' } = req.query;

        const whereClause = {};

        // Add user-based filtering
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            if (req.user.role === 'distributor') {
                whereClause.assigned_distributor_id = req.user.id;
            } else {
                whereClause.created_by = req.user.id;
            }
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

        if (format === 'csv') {
            // Generate CSV content
            const csvContent = orders.map(order => ({
                order_number: order.order_number,
                store_name: order.store?.name || '',
                total_amount_eur: order.final_amount_eur,
                total_amount_syp: order.final_amount_syp,
                currency: order.currency,
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
            message: 'Error exporting orders',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 