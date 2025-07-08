import express from 'express';
import {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder,
    exportOrders
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import {
    validateCreateOrder,
    validateUpdateOrderStatus,
    validateUpdatePaymentStatus,
    validateGetOrders,
    validateOrderId
} from '../validators/orderValidators.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @route   GET /api/orders/export
// @desc    Export orders to CSV
// @access  Private
router.get('/export', validateGetOrders, exportOrders);

// @route   GET /api/orders
// @desc    Get all orders with pagination and filters
// @access  Private
router.get('/', validateGetOrders, getOrders);

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', validateOrderId, getOrder);

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', validateCreateOrder, createOrder);

// @route   PUT /api/orders/:id
// @desc    Update order
// @access  Private
router.put('/:id', validateOrderId, updateOrder);

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.patch('/:id/status', validateUpdateOrderStatus, updateOrderStatus);

// @route   PATCH /api/orders/:id/payment-status
// @desc    Update payment status
// @access  Private (Admin/Manager only)
router.patch('/:id/payment-status', validateUpdatePaymentStatus, updatePaymentStatus);

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private
router.delete('/:id', validateOrderId, deleteOrder);

export default router; 