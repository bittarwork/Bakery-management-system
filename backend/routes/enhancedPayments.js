import express from 'express';
import {
    createPayment,
    getPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
    verifyPayment,
    rejectPayment,
    getPendingPayments,
    getPaymentStatistics,
    getPaymentReport,
    getPaymentsByStore,
    convertCurrency,
    getDistributorPayments
} from '../controllers/enhancedPaymentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ===============================
// إدارة المدفوعات الأساسية
// ===============================

// إنشاء مدفوعة جديدة
router.post('/',
    protect,
    authorize('admin', 'manager', 'distributor'),
    createPayment
);

// جلب جميع المدفوعات
router.get('/',
    protect,
    authorize('admin', 'manager', 'distributor'),
    getPayments
);

// جلب مدفوعة محددة
router.get('/:id',
    protect,
    authorize('admin', 'manager', 'distributor', 'store_owner'),
    getPaymentById
);

// تحديث مدفوعة
router.put('/:id',
    protect,
    authorize('admin', 'manager'),
    updatePayment
);

// حذف مدفوعة
router.delete('/:id',
    protect,
    authorize('admin'),
    deletePayment
);

// ===============================
// إدارة التحقق من المدفوعات
// ===============================

// التحقق من مدفوعة
router.post('/:id/verify',
    protect,
    authorize('admin', 'manager'),
    verifyPayment
);

// رفض مدفوعة
router.post('/:id/reject',
    protect,
    authorize('admin', 'manager'),
    rejectPayment
);

// جلب المدفوعات المعلقة
router.get('/status/pending',
    protect,
    authorize('admin', 'manager'),
    getPendingPayments
);

// ===============================
// الإحصائيات والتقارير
// ===============================

// إحصائيات المدفوعات العامة
router.get('/statistics/overview',
    protect,
    authorize('admin', 'manager'),
    getPaymentStatistics
);

// تقرير المدفوعات
router.get('/reports/generate',
    protect,
    authorize('admin', 'manager'),
    getPaymentReport
);

// ===============================
// مدفوعات المحلات
// ===============================

// جلب مدفوعات محل محدد
router.get('/store/:store_id',
    protect,
    authorize('admin', 'manager', 'store_owner'),
    getPaymentsByStore
);

// ===============================
// مدفوعات الموزعين
// ===============================

// جلب مدفوعات موزع محدد
router.get('/distributor/:distributor_id',
    protect,
    authorize('admin', 'manager', 'distributor'),
    getDistributorPayments
);

// ===============================
// تحويل العملات
// ===============================

// تحويل عملة
router.post('/currency/convert',
    protect,
    authorize('admin', 'manager', 'distributor'),
    convertCurrency
);

export default router; 