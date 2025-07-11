import express from 'express';
import {
    createStore,
    getStores,
    getStoreById,
    updateStore,
    deleteStore,
    updateCreditLimit,
    getCreditStatus,
    getStoreStatistics,
    getStorePerformance,
    getStoreOwnerDashboard,
    getStoreOwnerReports,
    searchStoresNearby,
    getStoreRoute
} from '../controllers/enhancedStoreController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ===============================
// إدارة المحلات (Admin/Manager)
// ===============================

// إنشاء محل جديد
router.post('/',
    protect,
    authorize('admin', 'manager'),
    createStore
);

// جلب جميع المحلات
router.get('/',
    protect,
    authorize('admin', 'manager', 'distributor'),
    getStores
);

// جلب محل محدد
router.get('/:id',
    protect,
    authorize('admin', 'manager', 'distributor', 'store_owner'),
    getStoreById
);

// تحديث محل
router.put('/:id',
    protect,
    authorize('admin', 'manager'),
    updateStore
);

// حذف محل
router.delete('/:id',
    protect,
    authorize('admin'),
    deleteStore
);

// ===============================
// إدارة الائتمان
// ===============================

// تحديث حد الائتمان
router.put('/:id/credit-limit',
    protect,
    authorize('admin', 'manager'),
    updateCreditLimit
);

// جلب حالة الائتمان
router.get('/:id/credit-status',
    protect,
    authorize('admin', 'manager', 'store_owner'),
    getCreditStatus
);

// ===============================
// الإحصائيات والتقارير
// ===============================

// إحصائيات المحلات العامة
router.get('/statistics/overview',
    protect,
    authorize('admin', 'manager'),
    getStoreStatistics
);

// أداء محل محدد
router.get('/:id/performance',
    protect,
    authorize('admin', 'manager', 'store_owner'),
    getStorePerformance
);

// ===============================
// واجهة صاحب المحل
// ===============================

// لوحة تحكم صاحب المحل
router.get('/:store_id/owner/dashboard',
    protect,
    authorize('admin', 'manager', 'store_owner'),
    getStoreOwnerDashboard
);

// تقارير صاحب المحل
router.get('/:store_id/owner/reports',
    protect,
    authorize('admin', 'manager', 'store_owner'),
    getStoreOwnerReports
);

// ===============================
// البحث المتقدم والخرائط
// ===============================

// البحث عن المحلات القريبة
router.get('/search/nearby',
    protect,
    authorize('admin', 'manager', 'distributor'),
    searchStoresNearby
);

// حساب المسار الأمثل للمحلات
router.post('/route/calculate',
    protect,
    authorize('admin', 'manager', 'distributor'),
    getStoreRoute
);

export default router; 