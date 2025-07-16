import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    createRefund,
    getRefunds,
    getRefund,
    processRefund,
    completeRefund,
    getRefundStatistics,
    calculateRefundAmount,
    exportRefunds
} from '../controllers/refundController.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get refund statistics
// @route   GET /api/refunds/statistics
// @access  Private
router.get('/statistics', getRefundStatistics);

// @desc    Calculate refund amount
// @route   POST /api/refunds/calculate
// @access  Private
router.post('/calculate', calculateRefundAmount);

// @desc    Export refunds
// @route   GET /api/refunds/export
// @access  Private (Admin/Manager only)
router.get('/export', authorize('admin', 'manager'), exportRefunds);

// @desc    Get all refunds
// @route   GET /api/refunds
// @access  Private
router.get('/', getRefunds);

// @desc    Create refund request
// @route   POST /api/refunds
// @access  Private
router.post('/', createRefund);

// @desc    Get refund by ID
// @route   GET /api/refunds/:id
// @access  Private
router.get('/:id', getRefund);

// @desc    Process refund (approve/reject)
// @route   PATCH /api/refunds/:id/process
// @access  Private (Admin/Manager only)
router.patch('/:id/process', authorize('admin', 'manager'), processRefund);

// @desc    Complete refund payment
// @route   PATCH /api/refunds/:id/complete
// @access  Private (Admin/Manager only)
router.patch('/:id/complete', authorize('admin', 'manager'), completeRefund);

export default router; 