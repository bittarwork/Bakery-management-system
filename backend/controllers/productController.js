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
            is_active = null,
            sortBy = 'name',
            sortOrder = 'ASC'
        } = req.query;

        const whereClause = {};

        // تطبيق فلتر البحث
        if (search) {
            whereClause.name = {
                [Op.like]: `%${search}%`
            };
        }

        // تطبيق فلتر الحالة
        if (is_active !== null) {
            whereClause.is_active = is_active === 'true';
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
        console.error('Error fetching products:', error);
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
        console.error('Error fetching product:', error);
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

        const { name, description, unit, price, cost, is_active } = req.body;

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

        const product = await Product.create({
            name,
            description,
            unit,
            price,
            cost,
            is_active: is_active !== undefined ? is_active : true
        });

        res.status(201).json({
            success: true,
            data: product,
            message: 'تم إنشاء المنتج بنجاح'
        });
    } catch (error) {
        console.error('Error creating product:', error);
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
        const { name, description, unit, price, cost, is_active } = req.body;

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

        await product.update({
            name: name || product.name,
            description: description !== undefined ? description : product.description,
            unit: unit || product.unit,
            price: price !== undefined ? price : product.price,
            cost: cost !== undefined ? cost : product.cost,
            is_active: is_active !== undefined ? is_active : product.is_active
        });

        res.json({
            success: true,
            data: product,
            message: 'تم تحديث المنتج بنجاح'
        });
    } catch (error) {
        console.error('Error updating product:', error);
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
        console.error('Error deleting product:', error);
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

        await product.update({
            is_active: !product.is_active
        });

        res.json({
            success: true,
            data: product,
            message: `تم ${product.is_active ? 'تفعيل' : 'إلغاء تفعيل'} المنتج بنجاح`
        });
    } catch (error) {
        console.error('Error toggling product status:', error);
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
        console.error('Error fetching product statistics:', error);
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
        console.error('Error searching products:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في البحث',
            error: error.message
        });
    }
};

// دالة مساعدة للحصول على إحصائيات المنتجات
const getProductStats = async () => {
    const [totalProducts, activeProducts, priceRange] = await Promise.all([
        Product.count(),
        Product.count({ where: { is_active: true } }),
        Product.getPriceRange()
    ]);

    const averageMargin = await Product.findOne({
        attributes: [
            [sequelize.fn('AVG', sequelize.literal('price - cost')), 'avg_margin']
        ],
        where: { is_active: true }
    });

    return {
        total: totalProducts,
        active: activeProducts,
        inactive: totalProducts - activeProducts,
        priceRange,
        averageMargin: Math.round(parseFloat(averageMargin?.dataValues?.avg_margin || 0) * 100) / 100
    };
}; 