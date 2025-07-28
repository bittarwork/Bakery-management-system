import Product from '../models/Product.js';
import { validationResult } from 'express-validator';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    الحصول على جميع المنتجات مع التصفية والبحث
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            status = null,
            category = null,
            is_featured = null,
            sortBy = 'name',
            sortOrder = 'ASC'
        } = req.query;

        const whereClause = {};

        // تطبيق فلتر البحث
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { barcode: { [Op.like]: `%${search}%` } }
            ];
        }

        // تطبيق فلتر الحالة
        if (status !== null && status !== undefined && status !== '') {
            whereClause.status = status;
        }

        // تطبيق فلتر الفئة
        if (category !== null && category !== undefined && category !== '') {
            whereClause.category = category;
        }

        // تطبيق فلتر المنتجات المميزة
        if (is_featured !== null && is_featured !== undefined && is_featured !== '') {
            whereClause.is_featured = is_featured === 'true';
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: products } = await Product.findAndCountAll({
            where: whereClause,
            order: [[sortBy, sortOrder.toUpperCase()]],
            limit: parseInt(limit),
            offset: offset
        });

        // حساب إحصائيات إضافية
        const stats = await getProductStats();

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    pages: Math.ceil(count / parseInt(limit)),
                    limit: parseInt(limit)
                },
                stats
            },
            message: 'تم جلب المنتجات بنجاح'
        });
    } catch (error) {
        console.error('[PRODUCTS] Failed to fetch products:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المنتجات',
            error: error.message
        });
    }
};

// @desc    الحصول على منتج واحد
// @route   GET /api/products/:id
// @access  Private
export const getProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        res.json({
            success: true,
            data: product,
            message: 'تم جلب المنتج بنجاح'
        });
    } catch (error) {
        console.error('[PRODUCTS] Failed to fetch product:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المنتج',
            error: error.message
        });
    }
};

// @desc    إنشاء منتج جديد
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
    try {
        // Log the incoming request body for debugging
        console.log('[PRODUCTS] Incoming request body:', JSON.stringify(req.body, null, 2));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('[PRODUCTS] Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Invalid data provided',
                errors: errors.array()
            });
        }

        const {
            name,
            description,
            category,
            unit,
            price_eur,
            price_syp,
            cost_eur,
            cost_syp,
            stock_quantity,
            minimum_stock,
            barcode,
            is_featured,
            status,
            image_url,
            weight_grams,
            shelf_life_days,
            storage_conditions,
            supplier_info,
            nutritional_info,
            allergen_info,
            expiry_date,
            production_date,
            dimensions,
            created_by_name
        } = req.body;

        // Check for duplicate product name
        const existingProduct = await Product.findOne({
            where: { name }
        });

        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'A product with this name already exists'
            });
        }

        // Check for duplicate barcode if provided
        if (barcode && barcode.trim() !== '') {
            const existingBarcode = await Product.findOne({
                where: { barcode: barcode.trim() }
            });

            if (existingBarcode) {
                return res.status(400).json({
                    success: false,
                    message: 'A product with this barcode already exists'
                });
            }
        }

        // Helper function to parse numeric values safely
        const parseNumber = (value, defaultValue = null) => {
            if (value === null || value === undefined || value === '') {
                return defaultValue;
            }
            const parsed = parseFloat(value);
            return isNaN(parsed) ? defaultValue : parsed;
        };

        const parseInteger = (value, defaultValue = null) => {
            if (value === null || value === undefined || value === '') {
                return defaultValue;
            }
            const parsed = parseInt(value);
            return isNaN(parsed) ? defaultValue : parsed;
        };

        // Helper function for positive numbers only
        const parsePositiveNumber = (value) => {
            const parsed = parseNumber(value, null);
            return parsed && parsed > 0 ? parsed : null;
        };

        const parsePositiveInteger = (value) => {
            const parsed = parseInteger(value, null);
            return parsed && parsed > 0 ? parsed : null;
        };

        // Helper function for database fields that don't allow null but need positive validation
        const parsePositiveNumberWithDefault = (value, defaultValue) => {
            const parsed = parseNumber(value, null);
            if (parsed && parsed > 0) return parsed;
            return defaultValue; // Use provided default instead of null
        };

        const parsePositiveIntegerWithDefault = (value, defaultValue) => {
            const parsed = parseInteger(value, null);
            if (parsed && parsed > 0) return parsed;
            return defaultValue; // Use provided default instead of null
        };

        // Prepare clean product data
        const productData = {
            name: name?.trim(),
            description: description?.trim() || null,
            category: category || 'other',
            unit: unit || 'piece',
            price_eur: Math.max(parseNumber(price_eur, 0.01), 0.01), // Required field with minimum 0.01
            price_syp: parsePositiveNumberWithDefault(price_syp, 0), // Use 0 as default if not provided or invalid
            cost_eur: parseNumber(cost_eur, null), // Can be 0 or null
            cost_syp: parseNumber(cost_syp, null), // Can be 0 or null
            stock_quantity: parseInteger(stock_quantity, null), // Can be 0 or null
            minimum_stock: parseInteger(minimum_stock, null), // Can be 0 or null
            barcode: barcode?.trim() || null,
            is_featured: Boolean(is_featured),
            status: ['active', 'inactive', 'discontinued'].includes(status) ? status : 'active',
            image_url: image_url?.trim() || null,
            weight_grams: parsePositiveIntegerWithDefault(weight_grams, 0), // Use 0 as default if not provided or invalid
            shelf_life_days: parsePositiveIntegerWithDefault(shelf_life_days, 0), // Use 0 as default if not provided or invalid
            storage_conditions: storage_conditions?.trim() || null,
            created_by: req.userId || 1,
            created_by_name: created_by_name?.trim() || 'System',
            // Initialize tracking fields with default values
            total_sold: 0,
            total_revenue_eur: 0.00,
            total_revenue_syp: 0.00
        };

        // Handle JSON fields properly
        if (supplier_info) {
            productData.supplier_info = typeof supplier_info === 'string'
                ? { description: supplier_info.trim() }
                : supplier_info;
        }

        if (nutritional_info) {
            productData.nutritional_info = typeof nutritional_info === 'string'
                ? { description: nutritional_info.trim() }
                : nutritional_info;
        }

        if (allergen_info) {
            productData.allergen_info = typeof allergen_info === 'string'
                ? { description: allergen_info.trim() }
                : allergen_info;
        }

        if (dimensions) {
            productData.dimensions = dimensions;
        }

        // Handle dates
        if (expiry_date) {
            productData.expiry_date = new Date(expiry_date);
        }

        if (production_date) {
            productData.production_date = new Date(production_date);
        }

        console.log('[PRODUCTS] Final product data before creation:', JSON.stringify(productData, null, 2));

        // Create the product
        const product = await Product.create(productData);

        console.log('[PRODUCTS] Product created successfully:', product.id);

        res.status(201).json({
            success: true,
            data: product,
            message: 'Product created successfully'
        });

    } catch (error) {
        console.error('[PRODUCTS] Failed to create product:', error);
        console.error('[PRODUCTS] Full error stack:', error.stack);

        // Handle specific Sequelize errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error occurred',
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message,
                    value: err.value
                }))
            });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Duplicate entry error',
                field: error.errors[0]?.path,
                value: error.errors[0]?.value
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    تحديث منتج
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data provided',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const {
            name,
            description,
            category,
            unit,
            price_eur,
            price_syp,
            cost_eur,
            cost_syp,
            stock_quantity,
            minimum_stock,
            barcode,
            is_featured,
            status,
            image_url,
            weight_grams,
            shelf_life_days,
            storage_conditions,
            supplier_info,
            nutritional_info,
            allergen_info,
            expiry_date,
            production_date,
            dimensions
        } = req.body;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if another product with same name exists
        if (name && name.trim() !== product.name) {
            const existingProduct = await Product.findOne({
                where: {
                    name: name.trim(),
                    id: { [Op.ne]: id }
                }
            });

            if (existingProduct) {
                return res.status(400).json({
                    success: false,
                    message: 'A product with this name already exists'
                });
            }
        }

        // Check if another product with same barcode exists
        if (barcode && barcode.trim() !== '' && barcode.trim() !== product.barcode) {
            const existingBarcode = await Product.findOne({
                where: {
                    barcode: barcode.trim(),
                    id: { [Op.ne]: id }
                }
            });

            if (existingBarcode) {
                return res.status(400).json({
                    success: false,
                    message: 'A product with this barcode already exists'
                });
            }
        }

        // Helper function to parse numeric values safely
        const parseNumber = (value, defaultValue = null) => {
            if (value === null || value === undefined || value === '') {
                return defaultValue;
            }
            const parsed = parseFloat(value);
            return isNaN(parsed) ? defaultValue : parsed;
        };

        const parseInteger = (value, defaultValue = null) => {
            if (value === null || value === undefined || value === '') {
                return defaultValue;
            }
            const parsed = parseInt(value);
            return isNaN(parsed) ? defaultValue : parsed;
        };

        // Helper function for positive numbers only
        const parsePositiveNumber = (value) => {
            const parsed = parseNumber(value, null);
            return parsed && parsed > 0 ? parsed : null;
        };

        const parsePositiveInteger = (value) => {
            const parsed = parseInteger(value, null);
            return parsed && parsed > 0 ? parsed : null;
        };

        // Prepare update data
        const updateData = {};

        if (name !== undefined) updateData.name = name?.trim();
        if (description !== undefined) updateData.description = description?.trim() || null;
        if (category !== undefined) updateData.category = category || 'other';
                 if (unit !== undefined) updateData.unit = unit || 'piece';
         if (price_eur !== undefined) updateData.price_eur = Math.max(parseNumber(price_eur, 0.01), 0.01);
         if (price_syp !== undefined) updateData.price_syp = parsePositiveNumberWithDefault(price_syp, 0);
         if (cost_eur !== undefined) updateData.cost_eur = parseNumber(cost_eur, null);
         if (cost_syp !== undefined) updateData.cost_syp = parseNumber(cost_syp, null);
         if (stock_quantity !== undefined) updateData.stock_quantity = parseInteger(stock_quantity, null);
         if (minimum_stock !== undefined) updateData.minimum_stock = parseInteger(minimum_stock, null);
         if (barcode !== undefined) updateData.barcode = barcode?.trim() || null;
         if (is_featured !== undefined) updateData.is_featured = Boolean(is_featured);
         if (status !== undefined) updateData.status = ['active', 'inactive', 'discontinued'].includes(status) ? status : 'active';
         if (image_url !== undefined) updateData.image_url = image_url?.trim() || null;
         if (weight_grams !== undefined) updateData.weight_grams = parsePositiveIntegerWithDefault(weight_grams, 0);
         if (shelf_life_days !== undefined) updateData.shelf_life_days = parsePositiveIntegerWithDefault(shelf_life_days, 0);
        if (storage_conditions !== undefined) updateData.storage_conditions = storage_conditions?.trim() || null;

        // Handle JSON fields properly
        if (supplier_info !== undefined) {
            updateData.supplier_info = supplier_info ?
                (typeof supplier_info === 'string' ? { description: supplier_info.trim() } : supplier_info) : null;
        }

        if (nutritional_info !== undefined) {
            updateData.nutritional_info = nutritional_info ?
                (typeof nutritional_info === 'string' ? { description: nutritional_info.trim() } : nutritional_info) : null;
        }

        if (allergen_info !== undefined) {
            updateData.allergen_info = allergen_info ?
                (typeof allergen_info === 'string' ? { description: allergen_info.trim() } : allergen_info) : null;
        }

        if (dimensions !== undefined) {
            updateData.dimensions = dimensions;
        }

        // Handle dates
        if (expiry_date !== undefined) {
            updateData.expiry_date = expiry_date ? new Date(expiry_date) : null;
        }

        if (production_date !== undefined) {
            updateData.production_date = production_date ? new Date(production_date) : null;
        }

        await product.update(updateData);

        res.json({
            success: true,
            data: product,
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('[PRODUCTS] Failed to update product:', error);
        console.error('[PRODUCTS] Full error stack:', error.stack);

        // Handle specific Sequelize errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error occurred',
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message,
                    value: err.value
                }))
            });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Duplicate entry error',
                field: error.errors[0]?.path,
                value: error.errors[0]?.value
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
};

// @desc    حذف منتج
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        // التحقق من عدم استخدام المنتج في طلبات موجودة
        // TODO: إضافة فحص OrderItems عند توفر العلاقة

        await product.destroy();

        res.json({
            success: true,
            message: 'تم حذف المنتج بنجاح'
        });
    } catch (error) {
        console.error('[PRODUCTS] Failed to delete product:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف المنتج',
            error: error.message
        });
    }
};

// @desc    تحديث حالة المنتج (تفعيل/إلغاء تفعيل)
// @route   PATCH /api/products/:id/toggle-status
// @access  Private
export const toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        const newStatus = product.status === 'active' ? 'inactive' : 'active';
        await product.update({
            status: newStatus
        });

        res.json({
            success: true,
            data: product,
            message: `تم ${newStatus === 'active' ? 'تفعيل' : 'إلغاء تفعيل'} المنتج بنجاح`
        });
    } catch (error) {
        console.error('[PRODUCTS] Failed to toggle product status:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث حالة المنتج',
            error: error.message
        });
    }
};

// @desc    الحصول على إحصائيات المنتجات
// @route   GET /api/products/stats
// @access  Private
export const getProductStatistics = async (req, res) => {
    try {
        const stats = await getProductStats();

        res.json({
            success: true,
            data: stats,
            message: 'تم جلب الإحصائيات بنجاح'
        });
    } catch (error) {
        console.error('[PRODUCTS] Failed to fetch statistics:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الإحصائيات',
            error: error.message
        });
    }
};

// @desc    البحث في المنتجات
// @route   GET /api/products/search
// @access  Private
export const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'يجب أن يكون البحث أكثر من حرفين'
            });
        }

        const products = await Product.searchByName(q, false);

        res.json({
            success: true,
            data: products,
            message: 'تم البحث بنجاح'
        });
    } catch (error) {
        console.error('[PRODUCTS] Product search failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في البحث',
            error: error.message
        });
    }
};

// دالة مساعدة للحصول على إحصائيات المنتجات
const getProductStats = async () => {
    const [totalProducts, activeProducts, categoryStats] = await Promise.all([
        Product.count(),
        Product.count({ where: { status: 'active' } }),
        Product.findAll({
            attributes: [
                'category',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: { status: 'active' },
            group: ['category']
        })
    ]);

    const averageMarginEur = await Product.findOne({
        attributes: [
            [sequelize.fn('AVG', sequelize.literal('price_eur - cost_eur')), 'avg_margin_eur']
        ],
        where: { status: 'active' }
    });

    const averageMarginSyp = await Product.findOne({
        attributes: [
            [sequelize.fn('AVG', sequelize.literal('price_syp - cost_syp')), 'avg_margin_syp']
        ],
        where: { status: 'active' }
    });

    const lowStockCount = await Product.count({
        where: {
            status: 'active',
            stock_quantity: {
                [Op.lte]: sequelize.col('minimum_stock')
            }
        }
    });

    return {
        total: totalProducts,
        active: activeProducts,
        inactive: totalProducts - activeProducts,
        low_stock: lowStockCount,
        featured: await Product.count({ where: { is_featured: true, status: 'active' } }),
        averageMarginEur: Math.round(parseFloat(averageMarginEur?.dataValues?.avg_margin_eur || 0) * 100) / 100,
        averageMarginSyp: Math.round(parseFloat(averageMarginSyp?.dataValues?.avg_margin_syp || 0) * 100) / 100,
        categoryStats: categoryStats.map(item => ({
            category: item.category,
            count: parseInt(item.dataValues.count)
        }))
    };
};

// @desc    نسخ منتج
// @route   POST /api/products/:id/duplicate
// @access  Private
export const duplicateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // البحث عن المنتج الأصلي
        const originalProduct = await Product.findByPk(id);
        if (!originalProduct) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        // إنشاء نسخة من المنتج مع تغيير الاسم
        const duplicatedData = {
            ...originalProduct.dataValues,
            name: `${originalProduct.name} - نسخة`,
            barcode: null, // إزالة الباركود لتجنب التكرار
            total_sold: 0,
            total_revenue_eur: 0,
            total_revenue_syp: 0,
            created_at: new Date(),
            updated_at: new Date()
        };

        // حذف الـ id لإنشاء منتج جديد
        delete duplicatedData.id;

        const duplicatedProduct = await Product.create(duplicatedData);

        res.status(201).json({
            success: true,
            message: 'تم نسخ المنتج بنجاح',
            data: duplicatedProduct
        });
    } catch (error) {
        console.error('Error duplicating product:', error);
        res.status(500).json({
            success: false,
            message: 'فشل في نسخ المنتج',
            error: error.message
        });
    }
};

// @desc    أرشفة منتج (تغيير الحالة إلى discontinued)
// @route   POST /api/products/:id/archive
// @access  Private
export const archiveProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        // تحديث حالة المنتج إلى discontinued
        product.status = 'discontinued';
        await product.save();

        res.json({
            success: true,
            message: 'تم أرشفة المنتج بنجاح',
            data: product
        });
    } catch (error) {
        console.error('Error archiving product:', error);
        res.status(500).json({
            success: false,
            message: 'فشل في أرشفة المنتج',
            error: error.message
        });
    }
};

// @desc    استعادة منتج من الأرشيف
// @route   POST /api/products/:id/restore
// @access  Private
export const restoreProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        // تحديث حالة المنتج إلى active
        product.status = 'active';
        await product.save();

        res.json({
            success: true,
            message: 'تم استعادة المنتج من الأرشيف بنجاح',
            data: product
        });
    } catch (error) {
        console.error('Error restoring product:', error);
        res.status(500).json({
            success: false,
            message: 'فشل في استعادة المنتج',
            error: error.message
        });
    }
};

// @desc    الحصول على تحليلات المنتج (بيانات وهمية)
// @route   GET /api/products/:id/analytics
// @access  Private
export const getProductAnalytics = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        // بيانات وهمية للتحليلات
        const analytics = {
            views: Math.floor(Math.random() * 1000) + 100,
            sales: product.total_sold || 0,
            revenue: parseFloat(product.total_revenue_eur) || 0,
            rating: (Math.random() * 2 + 3).toFixed(1),
            reviews: Math.floor(Math.random() * 50) + 5,
            conversionRate: (Math.random() * 10 + 2).toFixed(2),
            avgOrderValue: (Math.random() * 50 + 20).toFixed(2),
            returnRate: (Math.random() * 5).toFixed(2)
        };

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Error fetching product analytics:', error);
        res.status(500).json({
            success: false,
            message: 'فشل في جلب تحليلات المنتج',
            error: error.message
        });
    }
};

// @desc    الحصول على أداء المنتج (بيانات وهمية)
// @route   GET /api/products/:id/performance
// @access  Private
export const getProductPerformance = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        // بيانات وهمية للأداء
        const performance = {
            salesTrend: [
                { date: '2024-01-01', sales: 10 },
                { date: '2024-01-02', sales: 15 },
                { date: '2024-01-03', sales: 12 },
                { date: '2024-01-04', sales: 20 },
                { date: '2024-01-05', sales: 18 }
            ],
            profitMargin: product.getMarginPercentageEur(),
            stockTurnover: (Math.random() * 5 + 1).toFixed(2),
            customerSatisfaction: (Math.random() * 2 + 3).toFixed(1)
        };

        res.json({
            success: true,
            data: performance
        });
    } catch (error) {
        console.error('Error fetching product performance:', error);
        res.status(500).json({
            success: false,
            message: 'فشل في جلب أداء المنتج',
            error: error.message
        });
    }
};

// @desc    الحصول على تاريخ مبيعات المنتج (بيانات وهمية)
// @route   GET /api/products/:id/sales
// @access  Private
export const getProductSalesHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        // بيانات وهمية لتاريخ المبيعات
        const salesHistory = [];
        for (let i = 0; i < 10; i++) {
            const quantity = Math.floor(Math.random() * 20) + 1;
            const unitPrice = parseFloat(product.price_eur) || 10;
            const totalAmount = (quantity * unitPrice).toFixed(2);

            salesHistory.push({
                date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                quantity: quantity,
                total_amount: parseFloat(totalAmount),
                unit_price: unitPrice,
                store_name: `Store ${i + 1}`,
                currency: 'EUR'
            });
        }

        res.json({
            success: true,
            data: salesHistory
        });
    } catch (error) {
        console.error('Error fetching product sales history:', error);
        res.status(500).json({
            success: false,
            message: 'فشل في جلب تاريخ مبيعات المنتج',
            error: error.message
        });
    }
};

// @desc    الحصول على مخزون المنتج (بيانات وهمية)
// @route   GET /api/products/:id/inventory
// @access  Private
export const getProductInventory = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        // بيانات وهمية للمخزون
        const inventory = {
            current: product.stock_quantity || 0,
            reserved: Math.floor(Math.random() * 10),
            available: Math.max(0, (product.stock_quantity || 0) - Math.floor(Math.random() * 10)),
            minimum: product.minimum_stock || 0,
            movements: [
                { date: '2024-01-01', type: 'in', quantity: 50, reason: 'Purchase' },
                { date: '2024-01-02', type: 'out', quantity: 5, reason: 'Sale' },
                { date: '2024-01-03', type: 'out', quantity: 3, reason: 'Sale' }
            ]
        };

        res.json({
            success: true,
            data: inventory
        });
    } catch (error) {
        console.error('Error fetching product inventory:', error);
        res.status(500).json({
            success: false,
            message: 'فشل في جلب مخزون المنتج',
            error: error.message
        });
    }
};

// @desc    الحصول على توصيات المنتج (بيانات وهمية)
// @route   GET /api/products/:id/recommendations
// @access  Private
export const getProductRecommendations = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        // الحصول على منتجات مشابهة
        const recommendations = await Product.findAll({
            where: {
                category: product.category,
                status: 'active',
                id: { [Op.ne]: id }
            },
            limit: 5,
            order: [['total_sold', 'DESC']]
        });

        res.json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        console.error('Error fetching product recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'فشل في جلب توصيات المنتج',
            error: error.message
        });
    }
};

// @desc    الحصول على تاريخ الأسعار (بيانات وهمية)
// @route   GET /api/products/:id/price-history
// @access  Private
export const getProductPriceHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        // بيانات وهمية لتاريخ الأسعار
        const priceHistory = [];
        let currentPrice = parseFloat(product.price_eur);

        for (let i = 0; i < 5; i++) {
            priceHistory.push({
                date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                price_eur: currentPrice.toFixed(2),
                price_syp: (currentPrice * 1500).toFixed(2),
                reason: i === 0 ? 'Current Price' : 'Price Update'
            });
            currentPrice = currentPrice * (0.9 + Math.random() * 0.2);
        }

        res.json({
            success: true,
            data: priceHistory.reverse()
        });
    } catch (error) {
        console.error('Error fetching product price history:', error);
        res.status(500).json({
            success: false,
            message: 'فشل في جلب تاريخ أسعار المنتج',
            error: error.message
        });
    }
};

// @desc    الحصول على متغيرات المنتج (بيانات وهمية)
// @route   GET /api/products/:id/variants
// @access  Private
export const getProductVariants = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        // بيانات وهمية للمتغيرات
        const variants = [];
        if (product.category === 'bread') {
            variants.push(
                { id: 1, name: 'Small Size', price_eur: parseFloat(product.price_eur) * 0.8, stock: 50 },
                { id: 2, name: 'Large Size', price_eur: parseFloat(product.price_eur) * 1.2, stock: 30 }
            );
        }

        res.json({
            success: true,
            data: variants
        });
    } catch (error) {
        console.error('Error fetching product variants:', error);
        res.status(500).json({
            success: false,
            message: 'فشل في جلب متغيرات المنتج',
            error: error.message
        });
    }
};

// @desc    Toggle product featured status
// @route   PATCH /api/products/:id/toggle-featured
// @access  Private
export const toggleProductFeatured = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        const newFeaturedStatus = !product.is_featured;
        await product.update({
            is_featured: newFeaturedStatus
        });

        res.json({
            success: true,
            data: product,
            message: `تم ${newFeaturedStatus ? 'إضافة' : 'إزالة'} المنتج ${newFeaturedStatus ? 'إلى' : 'من'} المنتجات المميزة بنجاح`
        });
    } catch (error) {
        console.error('Error toggling product featured status:', error);
        res.status(500).json({
            success: false,
            message: 'فشل في تحديث حالة المنتج المميز',
            error: error.message
        });
    }
};

// @desc    Export products to CSV/Excel
// @route   GET /api/products/export
// @access  Private
export const exportProducts = async (req, res) => {
    try {
        const {
            format = 'csv',
            search = '',
            status = null,
            category = null,
            is_featured = null,
            sortBy = 'name',
            sortOrder = 'ASC'
        } = req.query;

        const whereClause = {};

        // Apply search filter
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { barcode: { [Op.like]: `%${search}%` } }
            ];
        }

        // Apply status filter
        if (status !== null && status !== undefined && status !== '') {
            whereClause.status = status;
        }

        // Apply category filter
        if (category !== null && category !== undefined && category !== '') {
            whereClause.category = category;
        }

        // Apply featured filter
        if (is_featured !== null && is_featured !== undefined && is_featured !== '') {
            whereClause.is_featured = is_featured === 'true';
        }

        const products = await Product.findAll({
            where: whereClause,
            order: [[sortBy, sortOrder.toUpperCase()]],
            attributes: [
                'id', 'name', 'description', 'barcode', 'category',
                'price_eur', 'price_syp', 'cost_eur', 'cost_syp',
                'stock_quantity', 'minimum_stock', 'weight_grams',
                'shelf_life_days', 'is_featured', 'status', 'created_at'
            ]
        });

        // Create CSV format
        if (format === 'csv') {
            const csvHeader = 'ID,Name,Description,Barcode,Category,Price EUR,Price SYP,Cost EUR,Cost SYP,Stock,Min Stock,Weight (g),Shelf Life,Featured,Status,Created At\n';
            const csvData = products.map(product => [
                product.id,
                `"${product.name || ''}"`,
                `"${product.description || ''}"`,
                product.barcode || '',
                product.category || '',
                product.price_eur || 0,
                product.price_syp || 0,
                product.cost_eur || 0,
                product.cost_syp || 0,
                product.stock_quantity || 0,
                product.minimum_stock || 0,
                product.weight_grams || 0,
                product.shelf_life_days || 0,
                product.is_featured ? 'Yes' : 'No',
                product.status || 'active',
                product.created_at ? new Date(product.created_at).toISOString().split('T')[0] : ''
            ].join(','));

            const csvContent = csvHeader + csvData.join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
            return res.send(csvContent);
        }

        // JSON format (default)
        res.json({
            success: true,
            data: products,
            count: products.length,
            message: 'تم جلب المنتجات بنجاح'
        });

    } catch (error) {
        console.error('Error exporting products:', error);
        res.status(500).json({
            success: false,
            message: 'فشل في تصدير المنتجات',
            error: error.message
        });
    }
};

// @desc    Upload product image
// @route   POST /api/products/:id/image
// @access  Private
export const uploadProductImage = async (req, res) => {
    try {
        console.log('[UPLOAD] Starting image upload for product:', req.params.id);
        console.log('[UPLOAD] Request files:', req.files);
        console.log('[UPLOAD] Request file:', req.file);
        console.log('[UPLOAD] Request body:', req.body);

        const { id } = req.params;

        // Check if product exists
        const product = await Product.findByPk(id);
        if (!product) {
            console.log('[UPLOAD] Product not found:', id);
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if file was uploaded
        if (!req.file) {
            console.log('[UPLOAD] No file received in request');
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        console.log('[UPLOAD] File received:', req.file.filename, 'Size:', req.file.size);

        // Generate image URL with proper protocol (HTTPS in production)
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
        const baseUrl = protocol + '://' + req.get('host');
        const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

        console.log('[UPLOAD] Generated image URL:', imageUrl);

        // Delete old image if exists
        if (product.image_url) {
            const oldImagePath = product.image_url.replace(`${baseUrl}/uploads/`, '');
            const fullPath = path.join(__dirname, '../storage/uploads', oldImagePath);

            fs.unlink(fullPath, (err) => {
                if (err) console.log('Error deleting old image:', err);
            });
        }

        // Update product with new image URL
        await product.update({ image_url: imageUrl });

        res.json({
            success: true,
            data: {
                image_url: imageUrl,
                filename: req.file.filename
            },
            message: 'تم رفع الصورة بنجاح'
        });

    } catch (error) {
        console.error('[PRODUCTS] Image upload failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في رفع الصورة',
            error: error.message
        });
    }
};

// @desc    Upload multiple product images
// @route   POST /api/products/:id/images
// @access  Private
export const uploadProductImages = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if product exists
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if files were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No image files provided'
            });
        }

        // Generate image URLs with proper protocol
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
        const baseUrl = protocol + '://' + req.get('host');
        const uploadedImages = req.files.map(file => ({
            filename: file.filename,
            url: `${baseUrl}/uploads/${file.filename}`,
            size: file.size,
            mimetype: file.mimetype
        }));

        res.json({
            success: true,
            data: {
                images: uploadedImages,
                count: uploadedImages.length
            },
            message: 'تم رفع الصور بنجاح'
        });

    } catch (error) {
        console.error('[PRODUCTS] Images upload failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في رفع الصور',
            error: error.message
        });
    }
};

// @desc    Delete product image
// @route   DELETE /api/products/:id/image
// @access  Private
export const deleteProductImage = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if product exists
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (!product.image_url) {
            return res.status(400).json({
                success: false,
                message: 'No image to delete'
            });
        }

        // Extract filename from URL
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
        const baseUrl = protocol + '://' + req.get('host');
        const imagePath = product.image_url.replace(`${baseUrl}/uploads/`, '');
        const fullPath = path.join(__dirname, '../storage/uploads', imagePath);

        // Delete physical file
        fs.unlink(fullPath, (err) => {
            if (err) console.log('Error deleting image file:', err);
        });

        // Update product to remove image URL
        await product.update({ image_url: null });

        res.json({
            success: true,
            message: 'تم حذف الصورة بنجاح'
        });

    } catch (error) {
        console.error('[PRODUCTS] Image deletion failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف الصورة',
            error: error.message
        });
    }
}; 