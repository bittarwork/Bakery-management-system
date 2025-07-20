import express from 'express';
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    toggleProductFeatured,
    exportProducts,
    getProductStatistics,
    searchProducts,
    duplicateProduct,
    archiveProduct,
    restoreProduct,
    getProductAnalytics,
    getProductPerformance,
    getProductSalesHistory,
    getProductInventory,
    getProductRecommendations,
    getProductPriceHistory,
    getProductVariants,
    uploadProductImage,
    uploadProductImages,
    deleteProductImage
} from '../controllers/productController.js';
import {
    validateCreateProduct,
    validateUpdateProduct
} from '../validators/productValidators.js';
import { protect } from '../middleware/auth.js';
import { uploadSingle, uploadMultiple, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// تطبيق middleware المصادقة على جميع المسارات (مُعطل مؤقتاً للاختبار)
// router.use(protect);

// @desc    تصدير المنتجات
// @route   GET /api/products/export
// @access  Private
router.get('/export', exportProducts);

// @desc    الحصول على إحصائيات المنتجات
// @route   GET /api/products/stats
// @access  Private
router.get('/stats', getProductStatistics);

// @desc    البحث في المنتجات
// @route   GET /api/products/search
// @access  Private
router.get('/search', searchProducts);

// @desc    الحصول على جميع المنتجات
// @route   GET /api/products
// @access  Private
router.get('/', getProducts);

// @desc    الحصول على منتج واحد
// @route   GET /api/products/:id
// @access  Private
router.get('/:id', getProduct);

// @desc    إنشاء منتج جديد
// @route   POST /api/products
// @access  Private
router.post('/', validateCreateProduct, createProduct);

// @desc    نسخ منتج
// @route   POST /api/products/:id/duplicate
// @access  Private
router.post('/:id/duplicate', duplicateProduct);

// @desc    أرشفة منتج
// @route   POST /api/products/:id/archive
// @access  Private
router.post('/:id/archive', archiveProduct);

// @desc    استعادة منتج من الأرشيف
// @route   POST /api/products/:id/restore
// @access  Private
router.post('/:id/restore', restoreProduct);

// @desc    الحصول على تحليلات المنتج
// @route   GET /api/products/:id/analytics
// @access  Private
router.get('/:id/analytics', getProductAnalytics);

// @desc    الحصول على أداء المنتج
// @route   GET /api/products/:id/performance
// @access  Private
router.get('/:id/performance', getProductPerformance);

// @desc    الحصول على تاريخ مبيعات المنتج
// @route   GET /api/products/:id/sales
// @access  Private
router.get('/:id/sales', getProductSalesHistory);

// @desc    الحصول على مخزون المنتج
// @route   GET /api/products/:id/inventory
// @access  Private
router.get('/:id/inventory', getProductInventory);

// @desc    الحصول على توصيات المنتج
// @route   GET /api/products/:id/recommendations
// @access  Private
router.get('/:id/recommendations', getProductRecommendations);

// @desc    الحصول على تاريخ أسعار المنتج
// @route   GET /api/products/:id/price-history
// @access  Private
router.get('/:id/price-history', getProductPriceHistory);

// @desc    الحصول على متغيرات المنتج
// @route   GET /api/products/:id/variants
// @access  Private
router.get('/:id/variants', getProductVariants);

// @desc    تحديث منتج
// @route   PUT /api/products/:id
// @access  Private
router.put('/:id', validateUpdateProduct, updateProduct);

// @desc    تحديث حالة المنتج (تفعيل/إلغاء تفعيل)
// @route   PATCH /api/products/:id/toggle-status
// @access  Private
router.patch('/:id/toggle-status', toggleProductStatus);

// @desc    تحديث حالة المنتج المميز
// @route   PATCH /api/products/:id/toggle-featured
// @access  Private
router.patch('/:id/toggle-featured', toggleProductFeatured);

// @desc    حذف منتج
// @route   DELETE /api/products/:id
// @access  Private
router.delete('/:id', deleteProduct);

// @desc    رفع صورة للمنتج
// @route   POST /api/products/:id/image
// @access  Private
router.post('/:id/image', uploadSingle, handleUploadError, uploadProductImage);

// @desc    رفع صور متعددة للمنتج
// @route   POST /api/products/:id/images
// @access  Private
router.post('/:id/images', uploadMultiple, handleUploadError, uploadProductImages);

// @desc    حذف صورة المنتج
// @route   DELETE /api/products/:id/image
// @access  Private
router.delete('/:id/image', deleteProductImage);

export default router; 