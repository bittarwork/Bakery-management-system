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

        // Ensure all numeric values are valid and non-negative
        const productData = {
            name,
            description,
            category,
            unit,
            price_eur: Math.max(0.01, parseFloat(price_eur) || 0.01),
            price_syp: price_syp ? Math.max(0.01, parseFloat(price_syp)) : 0,
            cost_eur: cost_eur ? Math.max(0, parseFloat(cost_eur)) : 0,
            cost_syp: cost_syp ? Math.max(0, parseFloat(cost_syp)) : 0,
            stock_quantity: Math.max(0, parseInt(stock_quantity) || 0),
            minimum_stock: Math.max(0, parseInt(minimum_stock) || 0),
            barcode,
            is_featured,
            status,
            image_url,
            weight_grams: weight_grams ? Math.max(1, parseInt(weight_grams)) : null,
            shelf_life_days: shelf_life_days ? Math.max(1, parseInt(shelf_life_days)) : null,
            storage_conditions,
            supplier_info,
            nutritional_info,
            allergen_info,
            created_by: req.userId,
            created_by_name
        };

        const product = await Product.create(productData);

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
        if (price_eur !== undefined) updateData.price_eur = Math.max(0.01, parseFloat(price_eur) || 0.01);
        if (price_syp !== undefined) updateData.price_syp = price_syp ? Math.max(0.01, parseFloat(price_syp)) : 0;
        if (cost_eur !== undefined) updateData.cost_eur = cost_eur ? Math.max(0, parseFloat(cost_eur)) : 0;
        if (cost_syp !== undefined) updateData.cost_syp = cost_syp ? Math.max(0, parseFloat(cost_syp)) : 0;
        if (stock_quantity !== undefined) updateData.stock_quantity = Math.max(0, parseInt(stock_quantity) || 0);
        if (minimum_stock !== undefined) updateData.minimum_stock = Math.max(0, parseInt(minimum_stock) || 0);
        if (barcode !== undefined) updateData.barcode = barcode;
        if (is_featured !== undefined) updateData.is_featured = is_featured;
        if (status !== undefined) updateData.status = status;
        if (image_url !== undefined) updateData.image_url = image_url;
        if (weight_grams !== undefined) updateData.weight_grams = weight_grams ? Math.max(1, parseInt(weight_grams)) : null;
        if (shelf_life_days !== undefined) updateData.shelf_life_days = shelf_life_days ? Math.max(1, parseInt(shelf_life_days)) : null;
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
            salesHistory.push({
                date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                quantity: Math.floor(Math.random() * 20) + 1,
                revenue: (Math.random() * 100 + 50).toFixed(2),
                customer: `Customer ${i + 1}`
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