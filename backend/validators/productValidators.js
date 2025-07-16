import { body } from 'express-validator';

// Helper function to validate optional numeric values
const validateOptionalNumeric = (field, min = 0) => {
    return body(field)
        .optional()
        .custom((value) => {
            // Allow empty values
            if (value === '' || value === null || value === undefined) {
                return true;
            }

            // Check if it's a valid number
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                throw new Error(`${getFieldName(field)} يجب أن يكون رقماً`);
            }

            // Check minimum value
            if (numValue < min) {
                throw new Error(`${getFieldName(field)} لا يمكن أن يكون ${min === 0 ? 'سالباً' : 'أقل من ' + min}`);
            }

            return true;
        })
        .toFloat();
};

// Helper function to validate optional integer values
const validateOptionalInteger = (field, min = 0) => {
    return body(field)
        .optional()
        .custom((value) => {
            // Allow empty values
            if (value === '' || value === null || value === undefined) {
                return true;
            }

            // Check if it's a valid integer
            const numValue = parseInt(value);
            if (isNaN(numValue)) {
                throw new Error(`${getFieldName(field)} يجب أن يكون عدد صحيح`);
            }

            // Check minimum value
            if (numValue < min) {
                throw new Error(`${getFieldName(field)} يجب أن يكون عدد صحيح ${min === 0 ? 'غير سالب' : 'أكبر من أو يساوي ' + min}`);
            }

            return true;
        })
        .toInt();
};

// Helper function to get field display name
const getFieldName = (field) => {
    const fieldNames = {
        'price_eur': 'السعر باليورو',
        'price_syp': 'السعر بالليرة',
        'cost_eur': 'التكلفة باليورو',
        'cost_syp': 'التكلفة بالليرة',
        'stock_quantity': 'الكمية في المخزون',
        'minimum_stock': 'الحد الأدنى للمخزون',
        'weight_grams': 'الوزن',
        'shelf_life_days': 'مدة الصلاحية'
    };
    return fieldNames[field] || field;
};

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

    validateOptionalNumeric('price_eur'),
    validateOptionalNumeric('price_syp'),
    validateOptionalNumeric('cost_eur'),
    validateOptionalNumeric('cost_syp'),
    validateOptionalInteger('stock_quantity'),
    validateOptionalInteger('minimum_stock'),
    validateOptionalInteger('weight_grams'),
    validateOptionalInteger('shelf_life_days'),

    body('category')
        .optional()
        .isIn(['bread', 'pastry', 'cake', 'drink', 'snack', 'seasonal', 'other'])
        .withMessage('فئة المنتج غير صحيحة'),

    body('is_featured')
        .optional()
        .isBoolean()
        .withMessage('حالة المنتج المميز يجب أن تكون true أو false')
        .toBoolean(),

    body('status')
        .optional()
        .isIn(['active', 'inactive', 'discontinued'])
        .withMessage('حالة المنتج يجب أن تكون active أو inactive أو discontinued'),

    body('image_url')
        .optional()
        .custom((value) => {
            // Allow empty values
            if (value === '' || value === null || value === undefined) {
                return true;
            }

            // Simple URL validation
            const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlPattern.test(value)) {
                throw new Error('رابط الصورة غير صحيح');
            }

            return true;
        }),

    // تحقق مخصص للتأكد من أن السعر أكبر من أو يساوي التكلفة
    body().custom((value, { req }) => {
        const { price_eur, cost_eur, price_syp, cost_syp } = req.body;

        // Only check if both values are provided and not empty
        if (price_eur && cost_eur && price_eur !== '' && cost_eur !== '') {
            const priceEur = parseFloat(price_eur);
            const costEur = parseFloat(cost_eur);
            if (!isNaN(priceEur) && !isNaN(costEur) && priceEur < costEur) {
                throw new Error('السعر باليورو لا يمكن أن يكون أقل من التكلفة');
            }
        }

        if (price_syp && cost_syp && price_syp !== '' && cost_syp !== '') {
            const priceSyp = parseFloat(price_syp);
            const costSyp = parseFloat(cost_syp);
            if (!isNaN(priceSyp) && !isNaN(costSyp) && priceSyp < costSyp) {
                throw new Error('السعر بالليرة لا يمكن أن يكون أقل من التكلفة');
            }
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
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            if (value.length < 1 || value.length > 20) {
                throw new Error('وحدة القياس يجب أن تكون بين 1 و 20 حرف');
            }
            return true;
        })
        .trim(),

    validateOptionalNumeric('price_eur'),
    validateOptionalNumeric('price_syp'),
    validateOptionalNumeric('cost_eur'),
    validateOptionalNumeric('cost_syp'),
    validateOptionalInteger('stock_quantity'),
    validateOptionalInteger('minimum_stock'),
    validateOptionalInteger('weight_grams'),
    validateOptionalInteger('shelf_life_days'),

    body('category')
        .optional()
        .isIn(['bread', 'pastry', 'cake', 'drink', 'snack', 'seasonal', 'other'])
        .withMessage('فئة المنتج غير صحيحة'),

    body('is_featured')
        .optional()
        .isBoolean()
        .withMessage('حالة المنتج المميز يجب أن تكون true أو false')
        .toBoolean(),

    body('status')
        .optional()
        .isIn(['active', 'inactive', 'discontinued'])
        .withMessage('حالة المنتج يجب أن تكون active أو inactive أو discontinued'),

    body('image_url')
        .optional()
        .custom((value) => {
            // Allow empty values
            if (value === '' || value === null || value === undefined) {
                return true;
            }

            // Simple URL validation
            const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlPattern.test(value)) {
                throw new Error('رابط الصورة غير صحيح');
            }

            return true;
        }),

    // تحقق مخصص للتأكد من أن السعر أكبر من أو يساوي التكلفة
    body().custom((value, { req }) => {
        const { price_eur, cost_eur, price_syp, cost_syp } = req.body;

        // Only check if both values are provided and not empty
        if (price_eur && cost_eur && price_eur !== '' && cost_eur !== '') {
            const priceEur = parseFloat(price_eur);
            const costEur = parseFloat(cost_eur);
            if (!isNaN(priceEur) && !isNaN(costEur) && priceEur < costEur) {
                throw new Error('السعر باليورو لا يمكن أن يكون أقل من التكلفة');
            }
        }

        if (price_syp && cost_syp && price_syp !== '' && cost_syp !== '') {
            const priceSyp = parseFloat(price_syp);
            const costSyp = parseFloat(cost_syp);
            if (!isNaN(priceSyp) && !isNaN(costSyp) && priceSyp < costSyp) {
                throw new Error('السعر بالليرة لا يمكن أن يكون أقل من التكلفة');
            }
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