import { body } from 'express-validator';

// تحقق من صحة بيانات إنشاء منتج جديد
export const validateCreateProduct = [
    body('name')
        .notEmpty()
        .withMessage('اسم المنتج مطلوب')
        .isLength({ min: 2, max: 100 })
        .withMessage('اسم المنتج يجب أن يكون بين 2 و 100 حرف')
        .trim(),

    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('وصف المنتج لا يمكن أن يتجاوز 1000 حرف')
        .trim(),

    body('unit')
        .notEmpty()
        .withMessage('وحدة القياس مطلوبة')
        .isLength({ min: 1, max: 20 })
        .withMessage('وحدة القياس يجب أن تكون بين 1 و 20 حرف')
        .trim(),

    body('price')
        .isNumeric()
        .withMessage('السعر يجب أن يكون رقماً')
        .isFloat({ min: 0 })
        .withMessage('السعر لا يمكن أن يكون سالباً')
        .toFloat(),

    body('cost')
        .optional()
        .isNumeric()
        .withMessage('التكلفة يجب أن تكون رقماً')
        .isFloat({ min: 0 })
        .withMessage('التكلفة لا يمكن أن تكون سالبة')
        .toFloat(),

    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('حالة المنتج يجب أن تكون true أو false')
        .toBoolean(),

    // تحقق مخصص للتأكد من أن السعر أكبر من أو يساوي التكلفة
    body().custom((value, { req }) => {
        const { price, cost } = req.body;
        if (cost !== undefined && parseFloat(price) < parseFloat(cost)) {
            throw new Error('السعر لا يمكن أن يكون أقل من التكلفة');
        }
        return true;
    })
];

// تحقق من صحة بيانات تحديث منتج
export const validateUpdateProduct = [
    body('name')
        .optional()
        .notEmpty()
        .withMessage('اسم المنتج لا يمكن أن يكون فارغاً')
        .isLength({ min: 2, max: 100 })
        .withMessage('اسم المنتج يجب أن يكون بين 2 و 100 حرف')
        .trim(),

    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('وصف المنتج لا يمكن أن يتجاوز 1000 حرف')
        .trim(),

    body('unit')
        .optional()
        .notEmpty()
        .withMessage('وحدة القياس لا يمكن أن تكون فارغة')
        .isLength({ min: 1, max: 20 })
        .withMessage('وحدة القياس يجب أن تكون بين 1 و 20 حرف')
        .trim(),

    body('price')
        .optional()
        .isNumeric()
        .withMessage('السعر يجب أن يكون رقماً')
        .isFloat({ min: 0 })
        .withMessage('السعر لا يمكن أن يكون سالباً')
        .toFloat(),

    body('cost')
        .optional()
        .isNumeric()
        .withMessage('التكلفة يجب أن تكون رقماً')
        .isFloat({ min: 0 })
        .withMessage('التكلفة لا يمكن أن تكون سالبة')
        .toFloat(),

    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('حالة المنتج يجب أن تكون true أو false')
        .toBoolean(),

    // تحقق مخصص للتأكد من أن السعر أكبر من أو يساوي التكلفة
    body().custom((value, { req }) => {
        const { price, cost } = req.body;
        if (price !== undefined && cost !== undefined && parseFloat(price) < parseFloat(cost)) {
            throw new Error('السعر لا يمكن أن يكون أقل من التكلفة');
        }
        return true;
    })
];

// تحقق من صحة معاملات البحث والتصفية
export const validateProductQuery = [
    body('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('رقم الصفحة يجب أن يكون رقماً صحيحاً أكبر من 0')
        .toInt(),

    body('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('حد النتائج يجب أن يكون بين 1 و 100')
        .toInt(),

    body('search')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('نص البحث يجب أن يكون بين 2 و 100 حرف')
        .trim(),

    body('is_active')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('حالة المنتج يجب أن تكون true أو false'),

    body('sortBy')
        .optional()
        .isIn(['name', 'price', 'cost', 'created_at', 'updated_at'])
        .withMessage('حقل الترتيب غير صحيح'),

    body('sortOrder')
        .optional()
        .isIn(['ASC', 'DESC', 'asc', 'desc'])
        .withMessage('اتجاه الترتيب يجب أن يكون ASC أو DESC')
]; 