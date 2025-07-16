import express from 'express';
import { body } from 'express-validator';
import {
    getStores,
    getStore,
    createStore,
    updateStore,
    deleteStore,
    getNearbyStores,
    getStoreStatistics,
    getStoresMap,
    getStoreOrders,
    getStorePayments,
    getStoreSpecificStatistics,
    updateStoreStatus
} from '../controllers/storeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    الحصول على خريطة المحلات
// @route   GET /api/stores/map
// @access  Private
router.get('/map', getStoresMap);

// @desc    الحصول على إحصائيات المحلات
// @route   GET /api/stores/statistics
// @access  Private
router.get('/statistics', getStoreStatistics);

// @desc    الحصول على المحلات القريبة
// @route   GET /api/stores/nearby
// @access  Private
router.get('/nearby', getNearbyStores);

// @desc    الحصول على جميع المحلات
// @route   GET /api/stores
// @access  Private
router.get('/', getStores);

// @desc    الحصول على محل واحد
// @route   GET /api/stores/:id
// @access  Private
router.get('/:id', getStore);

// @desc    الحصول على طلبات محل محدد
// @route   GET /api/stores/:id/orders
// @access  Private
router.get('/:id/orders', getStoreOrders);

// @desc    الحصول على مدفوعات محل محدد
// @route   GET /api/stores/:id/payments
// @access  Private
router.get('/:id/payments', getStorePayments);

// @desc    الحصول على إحصائيات محل محدد
// @route   GET /api/stores/:id/statistics
// @access  Private
router.get('/:id/statistics', getStoreSpecificStatistics);

// @desc    تحديث حالة محل
// @route   PATCH /api/stores/:id/status
// @access  Private (Manager/Admin)
router.patch('/:id/status', [
    body('status').isIn(['active', 'inactive', 'suspended']).withMessage('حالة المحل غير صحيحة')
], updateStoreStatus);

// @desc    إنشاء محل جديد
// @route   POST /api/stores
// @access  Private (Manager/Admin)
router.post('/', [
    body('name').notEmpty().withMessage('اسم المحل مطلوب'),
    body('phone').optional().custom((value) => {
        if (!value || value === '') return true;
        if (!/^\+?[0-9\s\-\(\)]{7,20}$/.test(value)) {
            throw new Error('رقم الهاتف غير صحيح');
        }
        return true;
    }),
    body('email').optional().custom((value) => {
        if (!value || value === '') return true;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            throw new Error('البريد الإلكتروني غير صحيح');
        }
        return true;
    }),
    body('payment_method').optional().isIn(['cash', 'bank', 'mixed']).withMessage('طريقة الدفع غير صحيحة'),
    body('credit_limit').optional().custom((value) => {
        if (value === null || value === undefined || value === '' || value === 0 || value === '0') return true;
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) {
            throw new Error('حد الائتمان يجب أن يكون رقماً موجباً');
        }
        return true;
    }),
    body('credit_limit_eur').optional().custom((value) => {
        if (value === null || value === undefined || value === '' || value === 0 || value === '0') return true;
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) {
            throw new Error('حد الائتمان باليورو يجب أن يكون رقماً موجباً');
        }
        return true;
    }),
    body('credit_limit_syp').optional().custom((value) => {
        if (value === null || value === undefined || value === '' || value === 0 || value === '0') return true;
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) {
            throw new Error('حد الائتمان بالليرة السورية يجب أن يكون رقماً موجباً');
        }
        return true;
    }),
    body('latitude').optional().custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        const num = parseFloat(value);
        if (isNaN(num) || num < -90 || num > 90) {
            throw new Error('خط العرض غير صحيح');
        }
        return true;
    }),
    body('longitude').optional().custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        const num = parseFloat(value);
        if (isNaN(num) || num < -180 || num > 180) {
            throw new Error('خط الطول غير صحيح');
        }
        return true;
    })
], createStore);

// @desc    تحديث محل
// @route   PUT /api/stores/:id
// @access  Private (Manager/Admin)
router.put('/:id', [
    body('name').optional().notEmpty().withMessage('اسم المحل مطلوب'),
    body('phone').optional().custom((value) => {
        if (!value || value === '') return true;
        if (!/^\+?[0-9\s\-\(\)]{7,20}$/.test(value)) {
            throw new Error('رقم الهاتف غير صحيح');
        }
        return true;
    }),
    body('email').optional().custom((value) => {
        if (!value || value === '') return true;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            throw new Error('البريد الإلكتروني غير صحيح');
        }
        return true;
    }),
    body('payment_method').optional().isIn(['cash', 'bank', 'mixed']).withMessage('طريقة الدفع غير صحيحة'),
    body('credit_limit').optional().custom((value) => {
        if (value === null || value === undefined || value === '' || value === 0 || value === '0') return true;
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) {
            throw new Error('حد الائتمان يجب أن يكون رقماً موجباً');
        }
        return true;
    }),
    body('credit_limit_eur').optional().custom((value) => {
        if (value === null || value === undefined || value === '' || value === 0 || value === '0') return true;
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) {
            throw new Error('حد الائتمان باليورو يجب أن يكون رقماً موجباً');
        }
        return true;
    }),
    body('credit_limit_syp').optional().custom((value) => {
        if (value === null || value === undefined || value === '' || value === 0 || value === '0') return true;
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) {
            throw new Error('حد الائتمان بالليرة السورية يجب أن يكون رقماً موجباً');
        }
        return true;
    }),
    body('latitude').optional().custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        const num = parseFloat(value);
        if (isNaN(num) || num < -90 || num > 90) {
            throw new Error('خط العرض غير صحيح');
        }
        return true;
    }),
    body('longitude').optional().custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        const num = parseFloat(value);
        if (isNaN(num) || num < -180 || num > 180) {
            throw new Error('خط الطول غير صحيح');
        }
        return true;
    })
], updateStore);

// @desc    حذف محل
// @route   DELETE /api/stores/:id
// @access  Private (Admin only)
router.delete('/:id', deleteStore);

export default router; 