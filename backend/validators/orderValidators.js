import { body, param, query, validationResult } from 'express-validator';
import { ORDER_STATUS, PAYMENT_STATUS } from '../constants/index.js';

// Helper function to handle validation results
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'بيانات غير صحيحة',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }
    next();
};

// Create order validation
export const validateCreateOrder = [
    body('store_id')
        .isInt({ min: 1 })
        .withMessage('معرف المتجر يجب أن يكون رقماً صحيحاً موجباً'),

    body('order_date')
        .optional()
        .isISO8601()
        .withMessage('تاريخ الطلب غير صحيح')
        .toDate(),

    body('delivery_date')
        .optional()
        .isISO8601()
        .withMessage('تاريخ التسليم غير صحيح')
        .toDate()
        .custom((value, { req }) => {
            if (value && req.body.order_date) {
                const orderDate = new Date(req.body.order_date);
                const deliveryDate = new Date(value);
                if (deliveryDate < orderDate) {
                    throw new Error('تاريخ التسليم لا يمكن أن يكون قبل تاريخ الطلب');
                }
            }
            return true;
        }),

    body('total_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('إجمالي المبلغ يجب أن يكون رقماً موجباً'),

    body('discount_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('مبلغ الخصم يجب أن يكون رقماً موجباً'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('الملاحظات يجب أن تكون أقل من 1000 حرف'),

    body('items')
        .optional()
        .isArray({ min: 1 })
        .withMessage('يجب أن تحتوي على عنصر واحد على الأقل'),

    body('items.*.product_id')
        .if(body('items').exists())
        .isInt({ min: 1 })
        .withMessage('معرف المنتج يجب أن يكون رقماً صحيحاً موجباً'),

    body('items.*.quantity')
        .if(body('items').exists())
        .isInt({ min: 1 })
        .withMessage('الكمية يجب أن تكون رقماً صحيحاً موجباً'),

    body('items.*.unit_price')
        .if(body('items').exists())
        .isFloat({ min: 0 })
        .withMessage('سعر الوحدة يجب أن يكون رقماً موجباً'),

    handleValidationErrors
];

// Update order validation
export const validateUpdateOrder = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('معرف الطلب يجب أن يكون رقماً صحيحاً موجباً'),

    body('delivery_date')
        .optional()
        .isISO8601()
        .withMessage('تاريخ التسليم غير صحيح')
        .toDate(),

    body('discount_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('مبلغ الخصم يجب أن يكون رقماً موجباً'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('الملاحظات يجب أن تكون أقل من 1000 حرف'),

    handleValidationErrors
];

// Update order status validation
export const validateUpdateOrderStatus = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('معرف الطلب يجب أن يكون رقماً صحيحاً موجباً'),

    body('status')
        .isIn(Object.values(ORDER_STATUS))
        .withMessage('حالة الطلب غير صحيحة'),

    handleValidationErrors
];

// Update payment status validation
export const validateUpdatePaymentStatus = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('معرف الطلب يجب أن يكون رقماً صحيحاً موجباً'),

    body('payment_status')
        .isIn(Object.values(PAYMENT_STATUS))
        .withMessage('حالة الدفع غير صحيحة'),

    handleValidationErrors
];

// Get orders validation (query parameters)
export const validateGetOrders = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('رقم الصفحة يجب أن يكون رقماً صحيحاً موجباً'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('حد النتائج يجب أن يكون بين 1 و 100'),

    query('search')
        .optional()
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('نص البحث يجب أن يكون بين 1 و 255 حرف'),

    query('status')
        .optional()
        .custom((value) => {
            if (value && value !== '' && !Object.values(ORDER_STATUS).includes(value)) {
                throw new Error('حالة الطلب غير صحيحة');
            }
            return true;
        }),

    query('payment_status')
        .optional()
        .custom((value) => {
            if (value && value !== '' && !Object.values(PAYMENT_STATUS).includes(value)) {
                throw new Error('حالة الدفع غير صحيحة');
            }
            return true;
        }),

    query('store_id')
        .optional()
        .custom((value) => {
            if (value && value !== '') {
                const intValue = parseInt(value);
                if (isNaN(intValue) || intValue < 1) {
                    throw new Error('معرف المتجر يجب أن يكون رقماً صحيحاً موجباً');
                }
            }
            return true;
        }),

    query('date_from')
        .optional()
        .custom((value) => {
            if (value && value !== '' && !new Date(value).getTime()) {
                throw new Error('تاريخ البداية غير صحيح');
            }
            return true;
        }),

    query('date_to')
        .optional()
        .custom((value) => {
            if (value && value !== '' && !new Date(value).getTime()) {
                throw new Error('تاريخ النهاية غير صحيح');
            }
            return true;
        }),

    handleValidationErrors
];

// Order item validation
export const validateOrderItem = [
    body('product_id')
        .isInt({ min: 1 })
        .withMessage('معرف المنتج يجب أن يكون رقماً صحيحاً موجباً'),

    body('quantity')
        .isInt({ min: 1 })
        .withMessage('الكمية يجب أن تكون رقماً صحيحاً موجباً'),

    body('unit_price')
        .isFloat({ min: 0 })
        .withMessage('سعر الوحدة يجب أن يكون رقماً موجباً'),

    body('discount_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('مبلغ الخصم يجب أن يكون رقماً موجباً'),

    body('gift_quantity')
        .optional()
        .isInt({ min: 0 })
        .withMessage('كمية الهدية يجب أن تكون رقماً صحيحاً غير سالب'),

    body('gift_reason')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('سبب الهدية يجب أن يكون أقل من 255 حرف'),

    handleValidationErrors
];

// Parameter validation for order ID
export const validateOrderId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('معرف الطلب يجب أن يكون رقماً صحيحاً موجباً'),

    handleValidationErrors
]; 