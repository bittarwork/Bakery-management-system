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
        .optional()
        .isLength({ min: 1, max: 20 })
        .withMessage('وحدة القياس يجب أن تكون بين 1 و 20 حرف')
        .trim(),

    body('price_eur')
        .optional()
        .isNumeric()
        .withMessage('السعر باليورو يجب أن يكون رقماً')
        .isFloat({ min: 0 })
        .withMessage('السعر باليورو لا يمكن أن يكون سالباً')
        .toFloat(),

    body('price_syp')
        .optional()
        .isNumeric()
        .withMessage('السعر بالليرة يجب أن يكون رقماً')
        .isFloat({ min: 0 })
        .withMessage('السعر بالليرة لا يمكن أن يكون سالباً')
        .toFloat(),

    body('cost_eur')
        .optional()
        .isNumeric()
        .withMessage('التكلفة باليورو يجب أن تكون رقماً')
        .isFloat({ min: 0 })
        .withMessage('التكلفة باليورو لا يمكن أن تكون سالبة')
        .toFloat(),

    body('cost_syp')
        .optional()
        .isNumeric()
        .withMessage('التكلفة بالليرة يجب أن تكون رقماً')
        .isFloat({ min: 0 })
        .withMessage('التكلفة بالليرة لا يمكن أن تكون سالبة')
        .toFloat(),

    body('stock_quantity')
        .optional()
        .isInt({ min: 0 })
        .withMessage('الكمية في المخزون يجب أن تكون عدد صحيح غير سالب')
        .toInt(),

    body('minimum_stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('الحد الأدنى للمخزون يجب أن يكون عدد صحيح غير سالب')
        .toInt(),

    body('category')
        .optional()
        .isIn(['bread', 'pastry', 'cake', 'drink', 'snack', 'seasonal', 'other'])
        .withMessage('فئة المنتج غير صحيحة'),

    body('weight_grams')
        .optional()
        .isInt({ min: 0 })
        .withMessage('الوزن يجب أن يكون عدد صحيح غير سالب')
        .toInt(),

    body('shelf_life_days')
        .optional()
        .isInt({ min: 0 })
        .withMessage('مدة الصلاحية يجب أن تكون عدد صحيح غير سالب')
        .toInt(),

    body('is_featured')
        .optional()
        .isBoolean()
        .withMessage('حالة المنتج المميز يجب أن تكون true أو false')
        .toBoolean(),

    body('status')
        .optional()
        .isIn(['active', 'inactive', 'discontinued'])
        .withMessage('حالة المنتج يجب أن تكون active أو inactive أو discontinued'),

    // تحقق مخصص للتأكد من أن السعر أكبر من أو يساوي التكلفة
    body().custom((value, { req }) => {
        const { price_eur, cost_eur, price_syp, cost_syp } = req.body;

        if (price_eur !== undefined && cost_eur !== undefined && parseFloat(price_eur) < parseFloat(cost_eur)) {
            throw new Error('السعر باليورو لا يمكن أن يكون أقل من التكلفة');
        }

        if (price_syp !== undefined && cost_syp !== undefined && parseFloat(price_syp) < parseFloat(cost_syp)) {
            throw new Error('السعر بالليرة لا يمكن أن يكون أقل من التكلفة');
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

    body('price_eur')
        .optional()
        .isNumeric()
        .withMessage('السعر باليورو يجب أن يكون رقماً')
        .isFloat({ min: 0 })
        .withMessage('السعر باليورو لا يمكن أن يكون سالباً')
        .toFloat(),

    body('price_syp')
        .optional()
        .isNumeric()
        .withMessage('السعر بالليرة يجب أن يكون رقماً')
        .isFloat({ min: 0 })
        .withMessage('السعر بالليرة لا يمكن أن يكون سالباً')
        .toFloat(),

    body('cost_eur')
        .optional()
        .isNumeric()
        .withMessage('التكلفة باليورو يجب أن تكون رقماً')
        .isFloat({ min: 0 })
        .withMessage('التكلفة باليورو لا يمكن أن تكون سالبة')
        .toFloat(),

    body('cost_syp')
        .optional()
        .isNumeric()
        .withMessage('التكلفة بالليرة يجب أن تكون رقماً')
        .isFloat({ min: 0 })
        .withMessage('التكلفة بالليرة لا يمكن أن تكون سالبة')
        .toFloat(),

    body('stock_quantity')
        .optional()
        .isInt({ min: 0 })
        .withMessage('الكمية في المخزون يجب أن تكون عدد صحيح غير سالب')
        .toInt(),

    body('minimum_stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('الحد الأدنى للمخزون يجب أن يكون عدد صحيح غير سالب')
        .toInt(),

    body('category')
        .optional()
        .isIn(['bread', 'pastry', 'cake', 'drink', 'snack', 'seasonal', 'other'])
        .withMessage('فئة المنتج غير صحيحة'),

    body('weight_grams')
        .optional()
        .isInt({ min: 0 })
        .withMessage('الوزن يجب أن يكون عدد صحيح غير سالب')
        .toInt(),

    body('shelf_life_days')
        .optional()
        .isInt({ min: 0 })
        .withMessage('مدة الصلاحية يجب أن تكون عدد صحيح غير سالب')
        .toInt(),

    body('is_featured')
        .optional()
        .isBoolean()
        .withMessage('حالة المنتج المميز يجب أن تكون true أو false')
        .toBoolean(),

    body('status')
        .optional()
        .isIn(['active', 'inactive', 'discontinued'])
        .withMessage('حالة المنتج يجب أن تكون active أو inactive أو discontinued'),

    // تحقق مخصص للتأكد من أن السعر أكبر من أو يساوي التكلفة
    body().custom((value, { req }) => {
        const { price_eur, cost_eur, price_syp, cost_syp } = req.body;

        if (price_eur !== undefined && cost_eur !== undefined && parseFloat(price_eur) < parseFloat(cost_eur)) {
            throw new Error('السعر باليورو لا يمكن أن يكون أقل من التكلفة');
        }

        if (price_syp !== undefined && cost_syp !== undefined && parseFloat(price_syp) < parseFloat(cost_syp)) {
            throw new Error('السعر بالليرة لا يمكن أن يكون أقل من التكلفة');
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