import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/errorHandler.js';
import { PAYMENT_STATUS } from '../constants/index.js';

// Create payment validation
export const validateCreatePayment = [
    body('store_id')
        .isInt({ min: 1 })
        .withMessage('معرف المتجر يجب أن يكون رقماً صحيحاً موجباً'),

    body('order_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('معرف الطلب يجب أن يكون رقماً صحيحاً موجباً'),

    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('المبلغ يجب أن يكون رقماً موجباً أكبر من صفر'),

    body('payment_method')
        .isIn(['cash', 'bank', 'mixed'])
        .withMessage('طريقة الدفع غير صحيحة'),

    body('payment_type')
        .isIn(['full', 'partial', 'refund'])
        .withMessage('نوع الدفع غير صحيح'),

    body('payment_date')
        .isISO8601()
        .withMessage('تاريخ الدفع غير صحيح'),

    body('status')
        .optional()
        .isIn(Object.values(PAYMENT_STATUS))
        .withMessage('حالة الدفع غير صحيحة'),

    body('reference_number')
        .optional()
        .isLength({ max: 100 })
        .withMessage('رقم المرجع لا يجب أن يتجاوز 100 حرف'),

    body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('الملاحظات لا يجب أن تتجاوز 1000 حرف'),

    handleValidationErrors
];

// Update payment validation
export const validateUpdatePayment = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('معرف الدفعة يجب أن يكون رقماً صحيحاً موجباً'),

    body('store_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('معرف المتجر يجب أن يكون رقماً صحيحاً موجباً'),

    body('order_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('معرف الطلب يجب أن يكون رقماً صحيحاً موجباً'),

    body('amount')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('المبلغ يجب أن يكون رقماً موجباً أكبر من صفر'),

    body('payment_method')
        .optional()
        .isIn(['cash', 'bank', 'mixed'])
        .withMessage('طريقة الدفع غير صحيحة'),

    body('payment_type')
        .optional()
        .isIn(['full', 'partial', 'refund'])
        .withMessage('نوع الدفع غير صحيح'),

    body('payment_date')
        .optional()
        .isISO8601()
        .withMessage('تاريخ الدفع غير صحيح'),

    body('status')
        .optional()
        .isIn(Object.values(PAYMENT_STATUS))
        .withMessage('حالة الدفع غير صحيحة'),

    body('reference_number')
        .optional()
        .isLength({ max: 100 })
        .withMessage('رقم المرجع لا يجب أن يتجاوز 100 حرف'),

    body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('الملاحظات لا يجب أن تتجاوز 1000 حرف'),

    handleValidationErrors
];

// Get payments validation
export const validateGetPayments = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('رقم الصفحة يجب أن يكون رقماً صحيحاً موجباً'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('عدد العناصر يجب أن يكون بين 1 و 100'),

    query('store_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('معرف المتجر يجب أن يكون رقماً صحيحاً موجباً'),

    query('status')
        .optional()
        .isIn(Object.values(PAYMENT_STATUS))
        .withMessage('حالة الدفع غير صحيحة'),

    query('payment_method')
        .optional()
        .isIn(['cash', 'bank', 'mixed'])
        .withMessage('طريقة الدفع غير صحيحة'),

    query('date_from')
        .optional()
        .isISO8601()
        .withMessage('تاريخ البداية غير صحيح'),

    query('date_to')
        .optional()
        .isISO8601()
        .withMessage('تاريخ النهاية غير صحيح'),

    query('amount_from')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('المبلغ الأدنى يجب أن يكون رقماً موجباً'),

    query('amount_to')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('المبلغ الأقصى يجب أن يكون رقماً موجباً'),

    query('sort_by')
        .optional()
        .isIn(['id', 'amount', 'payment_date', 'created_at', 'status'])
        .withMessage('حقل الترتيب غير صحيح'),

    query('sort_order')
        .optional()
        .isIn(['ASC', 'DESC'])
        .withMessage('ترتيب الترتيب غير صحيح'),

    handleValidationErrors
];

// Get payment by ID validation
export const validateGetPayment = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('معرف الدفعة يجب أن يكون رقماً صحيحاً موجباً'),

    handleValidationErrors
];

// Delete payment validation
export const validateDeletePayment = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('معرف الدفعة يجب أن يكون رقماً صحيحاً موجباً'),

    handleValidationErrors
];

// Update payment status validation
export const validateUpdatePaymentStatus = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('معرف الدفعة يجب أن يكون رقماً صحيحاً موجباً'),

    body('status')
        .isIn(Object.values(PAYMENT_STATUS))
        .withMessage('حالة الدفع غير صحيحة'),

    handleValidationErrors
];

// Get payment statistics validation
export const validateGetPaymentStatistics = [
    query('period')
        .optional()
        .isIn(['today', 'week', 'month', 'year'])
        .withMessage('الفترة غير صحيحة'),

    handleValidationErrors
];

// Export payments validation
export const validateExportPayments = [
    query('format')
        .optional()
        .isIn(['excel', 'pdf'])
        .withMessage('صيغة التصدير غير صحيحة'),

    query('store_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('معرف المتجر يجب أن يكون رقماً صحيحاً موجباً'),

    query('status')
        .optional()
        .isIn(Object.values(PAYMENT_STATUS))
        .withMessage('حالة الدفع غير صحيحة'),

    query('payment_method')
        .optional()
        .isIn(['cash', 'bank', 'mixed'])
        .withMessage('طريقة الدفع غير صحيحة'),

    query('date_from')
        .optional()
        .isISO8601()
        .withMessage('تاريخ البداية غير صحيح'),

    query('date_to')
        .optional()
        .isISO8601()
        .withMessage('تاريخ النهاية غير صحيح'),

    handleValidationErrors
]; 