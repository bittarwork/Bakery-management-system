import { body } from 'express-validator';

// Helper function to get field display name
const getFieldName = (field) => {
    const fieldNames = {
        'price_eur': 'Price in EUR',
        'price_syp': 'Price in SYP',
        'cost_eur': 'Cost in EUR',
        'cost_syp': 'Cost in SYP',
        'stock_quantity': 'Stock quantity',
        'minimum_stock': 'Minimum stock',
        'weight_grams': 'Weight',
        'shelf_life_days': 'Shelf life'
    };
    return fieldNames[field] || field;
};

// Validate product creation
export const validateCreateProduct = [
    body('name')
        .notEmpty()
        .withMessage('Product name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Product name must be between 2 and 100 characters')
        .trim(),

    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Product description cannot exceed 1000 characters')
        .trim(),

    body('unit')
        .optional()
        .isLength({ min: 1, max: 20 })
        .withMessage('Unit must be between 1 and 20 characters')
        .trim(),

    // Validate price_eur - required and must be positive
    body('price_eur')
        .notEmpty()
        .withMessage('Price in EUR is required')
        .custom((value) => {
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue <= 0) {
                throw new Error('Price in EUR must be a positive number');
            }
            return true;
        })
        .toFloat(),

    // Validate other numeric fields as optional but positive when provided
    body('price_syp')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue <= 0) {
                throw new Error('Price in SYP must be a positive number');
            }
            return true;
        }),

    body('cost_eur')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue < 0) {
                throw new Error('Cost in EUR cannot be negative');
            }
            return true;
        }),

    body('cost_syp')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue < 0) {
                throw new Error('Cost in SYP cannot be negative');
            }
            return true;
        }),

    body('stock_quantity')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            const numValue = parseInt(value);
            if (isNaN(numValue) || numValue < 0) {
                throw new Error('Stock quantity cannot be negative');
            }
            return true;
        }),

    body('minimum_stock')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            const numValue = parseInt(value);
            if (isNaN(numValue) || numValue < 0) {
                throw new Error('Minimum stock cannot be negative');
            }
            return true;
        }),

    body('weight_grams')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue <= 0) {
                throw new Error('Weight must be a positive number');
            }
            return true;
        }),

    body('shelf_life_days')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            const numValue = parseInt(value);
            if (isNaN(numValue) || numValue <= 0) {
                throw new Error('Shelf life must be a positive number');
            }
            return true;
        }),

    body('category')
        .optional()
        .isIn(['bread', 'pastry', 'cake', 'drink', 'snack', 'seasonal', 'other'])
        .withMessage('Invalid product category'),

    body('is_featured')
        .optional()
        .isBoolean()
        .withMessage('Featured status must be true or false')
        .toBoolean(),

    body('status')
        .optional()
        .isIn(['active', 'inactive', 'discontinued'])
        .withMessage('Product status must be active, inactive, or discontinued'),

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
                throw new Error('Invalid image URL format');
            }

            return true;
        }),

    // Custom validation to ensure price is not less than cost
    body().custom((value, { req }) => {
        const { price_eur, cost_eur, price_syp, cost_syp } = req.body;

        // Only check if both values are provided and not empty
        if (price_eur && cost_eur && price_eur !== '' && cost_eur !== '') {
            const priceEur = parseFloat(price_eur);
            const costEur = parseFloat(cost_eur);
            if (!isNaN(priceEur) && !isNaN(costEur) && priceEur < costEur) {
                throw new Error('Price in EUR cannot be less than cost');
            }
        }

        if (price_syp && cost_syp && price_syp !== '' && cost_syp !== '') {
            const priceSyp = parseFloat(price_syp);
            const costSyp = parseFloat(cost_syp);
            if (!isNaN(priceSyp) && !isNaN(costSyp) && priceSyp < costSyp) {
                throw new Error('Price in SYP cannot be less than cost');
            }
        }

        return true;
    })
];

// Validate product updates
export const validateUpdateProduct = [
    body('name')
        .optional()
        .notEmpty()
        .withMessage('Product name cannot be empty')
        .isLength({ min: 2, max: 100 })
        .withMessage('Product name must be between 2 and 100 characters')
        .trim(),

    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Product description cannot exceed 1000 characters')
        .trim(),

    body('unit')
        .optional()
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            if (value.length < 1 || value.length > 20) {
                throw new Error('Unit must be between 1 and 20 characters');
            }
            return true;
        })
        .trim(),

    // Validate price_eur - if provided, must be positive
    body('price_eur')
        .optional()
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue <= 0) {
                throw new Error('Price in EUR must be a positive number');
            }
            return true;
        }),

    // Validate other numeric fields as optional but positive when provided
    body('price_syp')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue <= 0) {
                throw new Error('Price in SYP must be a positive number');
            }
            return true;
        }),

    body('cost_eur')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue < 0) {
                throw new Error('Cost in EUR cannot be negative');
            }
            return true;
        }),

    body('cost_syp')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue < 0) {
                throw new Error('Cost in SYP cannot be negative');
            }
            return true;
        }),

    body('stock_quantity')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            const numValue = parseInt(value);
            if (isNaN(numValue) || numValue < 0) {
                throw new Error('Stock quantity cannot be negative');
            }
            return true;
        }),

    body('minimum_stock')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            const numValue = parseInt(value);
            if (isNaN(numValue) || numValue < 0) {
                throw new Error('Minimum stock cannot be negative');
            }
            return true;
        }),

    body('weight_grams')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue <= 0) {
                throw new Error('Weight must be a positive number');
            }
            return true;
        }),

    body('shelf_life_days')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            const numValue = parseInt(value);
            if (isNaN(numValue) || numValue <= 0) {
                throw new Error('Shelf life must be a positive number');
            }
            return true;
        }),

    body('category')
        .optional()
        .isIn(['bread', 'pastry', 'cake', 'drink', 'snack', 'seasonal', 'other'])
        .withMessage('Invalid product category'),

    body('is_featured')
        .optional()
        .isBoolean()
        .withMessage('Featured status must be true or false')
        .toBoolean(),

    body('status')
        .optional()
        .isIn(['active', 'inactive', 'discontinued'])
        .withMessage('Product status must be active, inactive, or discontinued'),

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
                throw new Error('Invalid image URL format');
            }

            return true;
        }),

    // Custom validation to ensure price is not less than cost
    body().custom((value, { req }) => {
        const { price_eur, cost_eur, price_syp, cost_syp } = req.body;

        // Only check if both values are provided and not empty
        if (price_eur && cost_eur && price_eur !== '' && cost_eur !== '') {
            const priceEur = parseFloat(price_eur);
            const costEur = parseFloat(cost_eur);
            if (!isNaN(priceEur) && !isNaN(costEur) && priceEur < costEur) {
                throw new Error('Price in EUR cannot be less than cost');
            }
        }

        if (price_syp && cost_syp && price_syp !== '' && cost_syp !== '') {
            const priceSyp = parseFloat(price_syp);
            const costSyp = parseFloat(cost_syp);
            if (!isNaN(priceSyp) && !isNaN(costSyp) && priceSyp < costSyp) {
                throw new Error('Price in SYP cannot be less than cost');
            }
        }

        return true;
    })
];

// Validate product ID parameter
export const validateProductId = [
    body('id')
        .isInt({ min: 1 })
        .withMessage('Product ID must be a positive integer')
];

// Validate product search query
export const validateProductSearch = [
    body('query')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search query must be between 1 and 100 characters')
        .trim(),

    body('category')
        .optional()
        .isIn(['bread', 'pastry', 'cake', 'drink', 'snack', 'seasonal', 'other'])
        .withMessage('Invalid product category'),

    body('status')
        .optional()
        .isIn(['active', 'inactive', 'discontinued'])
        .withMessage('Invalid product status'),

    body('min_price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum price must be a positive number'),

    body('max_price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum price must be a positive number'),

    body('is_featured')
        .optional()
        .isBoolean()
        .withMessage('Featured filter must be true or false')
];

// Validate bulk product operations
export const validateBulkProductOperation = [
    body('product_ids')
        .isArray({ min: 1 })
        .withMessage('Product IDs array is required with at least one ID'),

    body('product_ids.*')
        .isInt({ min: 1 })
        .withMessage('Each product ID must be a positive integer'),

    body('operation')
        .isIn(['activate', 'deactivate', 'discontinue', 'delete'])
        .withMessage('Invalid bulk operation')
];

// Validate product stock update
export const validateProductStockUpdate = [
    body('stock_quantity')
        .isInt({ min: 0 })
        .withMessage('Stock quantity must be a non-negative integer'),

    body('minimum_stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Minimum stock must be a non-negative integer'),

    body('reason')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Reason cannot exceed 255 characters')
        .trim()
];

// Validate product price update
export const validateProductPriceUpdate = [
    body('price_eur')
        .isFloat({ min: 0.01 })
        .withMessage('Price in EUR must be a positive number'),

    body('price_syp')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('Price in SYP must be a positive number'),

    body('reason')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Reason cannot exceed 255 characters')
        .trim()
]; 