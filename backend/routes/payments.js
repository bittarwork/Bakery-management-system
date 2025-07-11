import express from 'express';
import {
    getPayments,
    getPaymentStatistics,
    getPayment,
    createPayment,
    updatePayment,
    deletePayment,
    updatePaymentStatus,
    exportPayments
} from '../controllers/paymentController.js';
import {
    validateGetPayments,
    validateGetPaymentStatistics,
    validateGetPayment,
    validateCreatePayment,
    validateUpdatePayment,
    validateDeletePayment,
    validateUpdatePaymentStatus,
    validateExportPayments
} from '../validators/paymentValidators.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// @desc    الحصول على جميع المدفوعات
// @route   GET /api/payments
// @access  Private
router.get('/', validateGetPayments, getPayments);

// @desc    الحصول على إحصائيات المدفوعات
// @route   GET /api/payments/statistics
// @access  Private
router.get('/statistics', validateGetPaymentStatistics, getPaymentStatistics);

// @desc    تصدير المدفوعات
// @route   GET /api/payments/export
// @access  Private
router.get('/export', validateExportPayments, exportPayments);

// @desc    الحصول على دفعة واحدة
// @route   GET /api/payments/:id
// @access  Private
router.get('/:id', validateGetPayment, getPayment);

// @desc    إنشاء دفعة جديدة
// @route   POST /api/payments
// @access  Private
router.post('/', validateCreatePayment, createPayment);

// @desc    تحديث دفعة
// @route   PUT /api/payments/:id
// @access  Private
router.put('/:id', validateUpdatePayment, updatePayment);

// @desc    حذف دفعة
// @route   DELETE /api/payments/:id
// @access  Private
router.delete('/:id', validateDeletePayment, deletePayment);

// @desc    تحديث حالة الدفع
// @route   PATCH /api/payments/:id/status
// @access  Private
router.patch('/:id/status', validateUpdatePaymentStatus, updatePaymentStatus);

export default router; 