import express from 'express';
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    getProductStatistics,
    searchProducts
} from '../controllers/productController.js';
import {
    validateCreateProduct,
    validateUpdateProduct
} from '../validators/productValidators.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// تطبيق middleware المصادقة على جميع المسارات (مُعطل مؤقتاً للاختبار)
// router.use(protect);

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

// @desc    تحديث منتج
// @route   PUT /api/products/:id
// @access  Private
router.put('/:id', validateUpdateProduct, updateProduct);

// @desc    تحديث حالة المنتج (تفعيل/إلغاء تفعيل)
// @route   PATCH /api/products/:id/toggle-status
// @access  Private
router.patch('/:id/toggle-status', toggleProductStatus);

// @desc    حذف منتج
// @route   DELETE /api/products/:id
// @access  Private
router.delete('/:id', deleteProduct);

export default router; 