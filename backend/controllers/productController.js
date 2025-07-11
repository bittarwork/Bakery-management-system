import Product from '../models/Product.js';
import { validationResult } from 'express-validator';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

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
        if (status !== null) {
            whereClause.status = status;
        }

        // تطبيق فلتر الفئة
        if (category !== null) {
            whereClause.category = category;
        }

        // تطبيق فلتر المنتجات المميزة
        if (is_featured !== null) {
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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        const {
            name,
            description,
            category = 'other',
            unit,
            price_eur,
            price_syp,
            cost_eur,
            cost_syp,
            stock_quantity = 0,
            minimum_stock = 0,
            barcode,
            is_featured = false,
            status = 'active',
            image_url,
            weight_grams,
            shelf_life_days,
            storage_conditions,
            supplier_info,
            nutritional_info,
            allergen_info,
            created_by_name
        } = req.body;

        // التحقق من عدم وجود منتج بنفس الاسم
        const existingProduct = await Product.findOne({
            where: { name }
        });

        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'يوجد منتج بهذا الاسم مسبقاً'
            });
        }

        // التحقق من عدم وجود منتج بنفس الباركود
        if (barcode) {
            const existingBarcode = await Product.findOne({
                where: { barcode }
            });

            if (existingBarcode) {
                return res.status(400).json({
                    success: false,
                    message: 'يوجد منتج بهذا الباركود مسبقاً'
                });
            }
        }

        const product = await Product.create({
            name,
            description,
            category,
            unit,
            price_eur: price_eur || 0,
            price_syp: price_syp || 0,
            cost_eur: cost_eur || 0,
            cost_syp: cost_syp || 0,
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
            created_by: req.userId,
            created_by_name
        });

        res.status(201).json({
            success: true,
            data: product,
            message: 'تم إنشاء المنتج بنجاح'
        });
    } catch (error) {
        console.error('[PRODUCTS] Failed to create product:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء المنتج',
            error: error.message
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
                message: 'بيانات غير صحيحة',
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
            allergen_info
        } = req.body;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        // التحقق من عدم وجود منتج آخر بنفس الاسم
        if (name && name !== product.name) {
            const existingProduct = await Product.findOne({
                where: {
                    name,
                    id: { [Op.ne]: id }
                }
            });

            if (existingProduct) {
                return res.status(400).json({
                    success: false,
                    message: 'يوجد منتج بهذا الاسم مسبقاً'
                });
            }
        }

        // التحقق من عدم وجود منتج آخر بنفس الباركود
        if (barcode && barcode !== product.barcode) {
            const existingBarcode = await Product.findOne({
                where: {
                    barcode,
                    id: { [Op.ne]: id }
                }
            });

            if (existingBarcode) {
                return res.status(400).json({
                    success: false,
                    message: 'يوجد منتج بهذا الباركود مسبقاً'
                });
            }
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (unit !== undefined) updateData.unit = unit;
        if (price_eur !== undefined) updateData.price_eur = price_eur;
        if (price_syp !== undefined) updateData.price_syp = price_syp;
        if (cost_eur !== undefined) updateData.cost_eur = cost_eur;
        if (cost_syp !== undefined) updateData.cost_syp = cost_syp;
        if (stock_quantity !== undefined) updateData.stock_quantity = stock_quantity;
        if (minimum_stock !== undefined) updateData.minimum_stock = minimum_stock;
        if (barcode !== undefined) updateData.barcode = barcode;
        if (is_featured !== undefined) updateData.is_featured = is_featured;
        if (status !== undefined) updateData.status = status;
        if (image_url !== undefined) updateData.image_url = image_url;
        if (weight_grams !== undefined) updateData.weight_grams = weight_grams;
        if (shelf_life_days !== undefined) updateData.shelf_life_days = shelf_life_days;
        if (storage_conditions !== undefined) updateData.storage_conditions = storage_conditions;
        if (supplier_info !== undefined) updateData.supplier_info = supplier_info;
        if (nutritional_info !== undefined) updateData.nutritional_info = nutritional_info;
        if (allergen_info !== undefined) updateData.allergen_info = allergen_info;

        await product.update(updateData);

        res.json({
            success: true,
            data: product,
            message: 'تم تحديث المنتج بنجاح'
        });
    } catch (error) {
        console.error('[PRODUCTS] Failed to update product:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث المنتج',
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
    const [totalProducts, activeProducts, priceRange, categoryStats] = await Promise.all([
        Product.count(),
        Product.count({ where: { status: 'active' } }),
        Product.getPriceRange(),
        Product.getProductStatistics()
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
        priceRange,
        averageMarginEur: Math.round(parseFloat(averageMarginEur?.dataValues?.avg_margin_eur || 0) * 100) / 100,
        averageMarginSyp: Math.round(parseFloat(averageMarginSyp?.dataValues?.avg_margin_syp || 0) * 100) / 100,
        categoryStats
    };
}; 