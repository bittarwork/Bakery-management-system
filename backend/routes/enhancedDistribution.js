import express from 'express';
import {
    createTrip,
    getTrips,
    getTripById,
    startTrip,
    completeTrip,
    updateTripGPS,
    startVisit,
    completeVisit,
    reportVisitProblem,
    getDistributionStatistics,
    getDistributorDashboard,
    getProblematicVisits
} from '../controllers/enhancedDistributionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ===============================
// إدارة الرحلات
// ===============================

// إنشاء رحلة جديدة
router.post('/trips',
    protect,
    authorize('admin', 'manager'),
    createTrip
);

// جلب جميع الرحلات
router.get('/trips',
    protect,
    authorize('admin', 'manager', 'distributor'),
    getTrips
);

// جلب رحلة محددة
router.get('/trips/:id',
    protect,
    authorize('admin', 'manager', 'distributor'),
    getTripById
);

// بدء رحلة
router.post('/trips/:id/start',
    protect,
    authorize('admin', 'manager', 'distributor'),
    startTrip
);

// إنهاء رحلة
router.post('/trips/:id/complete',
    protect,
    authorize('admin', 'manager', 'distributor'),
    completeTrip
);

// تحديث موقع GPS للرحلة
router.post('/trips/:id/gps',
    protect,
    authorize('admin', 'manager', 'distributor'),
    updateTripGPS
);

// ===============================
// إدارة زيارات المحلات
// ===============================

// بدء زيارة محل
router.post('/visits/:id/start',
    protect,
    authorize('admin', 'manager', 'distributor'),
    startVisit
);

// إنهاء زيارة محل
router.post('/visits/:id/complete',
    protect,
    authorize('admin', 'manager', 'distributor'),
    completeVisit
);

// الإبلاغ عن مشكلة في الزيارة
router.post('/visits/:id/report-problem',
    protect,
    authorize('admin', 'manager', 'distributor'),
    reportVisitProblem
);

// ===============================
// الإحصائيات والتقارير
// ===============================

// إحصائيات التوزيع العامة
router.get('/statistics',
    protect,
    authorize('admin', 'manager'),
    getDistributionStatistics
);

// لوحة تحكم الموزع
router.get('/distributor/dashboard',
    protect,
    authorize('distributor'),
    getDistributorDashboard
);

// الزيارات التي بها مشاكل
router.get('/visits/problematic',
    protect,
    authorize('admin', 'manager'),
    getProblematicVisits
);

export default router; 