import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getDistributorDailySchedule,
    getStoreDeliveryDetails,
    updateDeliveryQuantities,
    completeDelivery,
    recordPayment,
    getVehicleInventory,
    recordVehicleExpense,
    submitDailyReport,
    getDistributorHistory
} from '../controllers/comprehensiveDistributionController.js';

import {
    getDailyOrdersForProcessing,
    addManualOrder,
    generateDistributionSchedules,
    getLiveDistributionTracking,
    getDistributorPerformance,
    getDistributionAnalytics,
    generateWeeklyReport,
    assignStoreToDistributor,
    updateStoreBalanceManually,
    approveDistributorReport
} from '../controllers/distributionManagerController.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// ==========================================
// 🚚 DISTRIBUTOR ROUTES (عامل التوزيع)
// ==========================================

// @desc    Get daily distribution schedule for distributor
// @route   GET /api/distribution/schedule/daily
// @access  Private (Distributor)
router.get('/schedule/daily', authorize('distributor', 'manager', 'admin'), async (req, res) => {
    try {
        const { date } = req.query;
        const distributorId = req.user.role === 'distributor' ? req.user.id : req.query.distributor_id;

        // Get daily schedule with stores, products, and routes
        const schedule = await getDistributorDailySchedule(distributorId, date);

        res.json({
            success: true,
            data: schedule,
            message: 'تم جلب جدول التوزيع اليومي بنجاح'
        });
    } catch (error) {
        console.error('Get daily schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب جدول التوزيع'
        });
    }
});

// @desc    Get store details for delivery
// @route   GET /api/distribution/store/:storeId/details
// @access  Private (Distributor)
router.get('/store/:storeId/details', authorize('distributor', 'manager', 'admin'), async (req, res) => {
    try {
        const { storeId } = req.params;

        // Get comprehensive store details for delivery
        const storeDetails = await getStoreDeliveryDetails(storeId);

        res.json({
            success: true,
            data: storeDetails,
            message: 'تم جلب تفاصيل المحل بنجاح'
        });
    } catch (error) {
        console.error('Get store details error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب تفاصيل المحل'
        });
    }
});

// @desc    Update delivery quantities (modify order during delivery)
// @route   PATCH /api/distribution/delivery/:deliveryId/quantities
// @access  Private (Distributor)
router.patch('/delivery/:deliveryId/quantities', authorize('distributor', 'manager', 'admin'), async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const { quantities, notes } = req.body;

        // Update delivery quantities and calculate gifts
        const updatedDelivery = await updateDeliveryQuantities(deliveryId, quantities, notes, req.user.id);

        res.json({
            success: true,
            data: updatedDelivery,
            message: 'تم تحديث الكميات بنجاح'
        });
    } catch (error) {
        console.error('Update delivery quantities error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث الكميات'
        });
    }
});

// @desc    Record delivery completion
// @route   POST /api/distribution/delivery/:deliveryId/complete
// @access  Private (Distributor)
router.post('/delivery/:deliveryId/complete', authorize('distributor', 'manager', 'admin'), async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const { actualQuantities, gifts, damages, notes } = req.body;

        // Complete delivery and update inventory
        const completedDelivery = await completeDelivery(deliveryId, {
            actualQuantities,
            gifts,
            damages,
            notes,
            distributorId: req.user.id
        });

        res.json({
            success: true,
            data: completedDelivery,
            message: 'تم تسجيل التسليم بنجاح'
        });
    } catch (error) {
        console.error('Complete delivery error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تسجيل التسليم'
        });
    }
});

// @desc    Record payment from store
// @route   POST /api/distribution/payment/record
// @access  Private (Distributor)
router.post('/payment/record', authorize('distributor', 'manager', 'admin'), async (req, res) => {
    try {
        const {
            storeId,
            orderId,
            amount,
            currency,
            paymentMethod,
            paymentType, // 'current_order', 'old_debt', 'mixed'
            distribution, // for mixed payments
            bankDetails,
            notes
        } = req.body;

        // Record payment with flexible options
        const payment = await recordPayment({
            storeId,
            orderId,
            amount,
            currency,
            paymentMethod,
            paymentType,
            distribution,
            bankDetails,
            notes,
            collectedBy: req.user.id
        });

        res.json({
            success: true,
            data: payment,
            message: 'تم تسجيل الدفعة بنجاح'
        });
    } catch (error) {
        console.error('Record payment error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تسجيل الدفعة'
        });
    }
});

// @desc    Get current vehicle inventory
// @route   GET /api/distribution/vehicle/inventory
// @access  Private (Distributor)
router.get('/vehicle/inventory', authorize('distributor', 'manager', 'admin'), async (req, res) => {
    try {
        const distributorId = req.user.role === 'distributor' ? req.user.id : req.query.distributor_id;

        // Get current vehicle inventory
        const inventory = await getVehicleInventory(distributorId);

        res.json({
            success: true,
            data: inventory,
            message: 'تم جلب مخزون السيارة بنجاح'
        });
    } catch (error) {
        console.error('Get vehicle inventory error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب مخزون السيارة'
        });
    }
});

// @desc    Record vehicle expense
// @route   POST /api/distribution/expense/record
// @access  Private (Distributor)
router.post('/expense/record', authorize('distributor', 'manager', 'admin'), async (req, res) => {
    try {
        const { type, amount, currency, description, receiptImage } = req.body;

        // Record vehicle expense
        const expense = await recordVehicleExpense({
            type,
            amount,
            currency,
            description,
            receiptImage,
            distributorId: req.user.id
        });

        res.json({
            success: true,
            data: expense,
            message: 'تم تسجيل المصروف بنجاح'
        });
    } catch (error) {
        console.error('Record expense error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تسجيل المصروف'
        });
    }
});

// @desc    Submit daily report
// @route   POST /api/distribution/report/daily/submit
// @access  Private (Distributor)
router.post('/report/daily/submit', authorize('distributor', 'manager', 'admin'), async (req, res) => {
    try {
        const { date, summary, signature } = req.body;

        // Submit daily report
        const report = await submitDailyReport({
            date,
            summary,
            signature,
            distributorId: req.user.id
        });

        res.json({
            success: true,
            data: report,
            message: 'تم رفع التقرير اليومي بنجاح'
        });
    } catch (error) {
        console.error('Submit daily report error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في رفع التقرير اليومي'
        });
    }
});

// @desc    Get distributor history/archive
// @route   GET /api/distribution/history
// @access  Private (Distributor)
router.get('/history', authorize('distributor', 'manager', 'admin'), async (req, res) => {
    try {
        const { dateFrom, dateTo, page = 1, limit = 10 } = req.query;
        const distributorId = req.user.role === 'distributor' ? req.user.id : req.query.distributor_id;

        // Get distributor history
        const history = await getDistributorHistory(distributorId, {
            dateFrom,
            dateTo,
            page,
            limit
        });

        res.json({
            success: true,
            data: history,
            message: 'تم جلب التاريخ بنجاح'
        });
    } catch (error) {
        console.error('Get distributor history error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب التاريخ'
        });
    }
});

// ==========================================
// 🧠 DISTRIBUTION MANAGER ROUTES (مدير التوزيع)
// ==========================================

// @desc    Get daily orders for processing
// @route   GET /api/distribution/manager/orders/daily
// @access  Private (Manager/Admin)
router.get('/manager/orders/daily', authorize('manager', 'admin'), async (req, res) => {
    try {
        const { date } = req.query;

        // Get daily orders for processing
        const orders = await getDailyOrdersForProcessing(date);

        res.json({
            success: true,
            data: orders,
            message: 'تم جلب الطلبات اليومية بنجاح'
        });
    } catch (error) {
        console.error('Get daily orders error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الطلبات اليومية'
        });
    }
});

// @desc    Add manual order
// @route   POST /api/distribution/manager/orders/add
// @access  Private (Manager/Admin)
router.post('/manager/orders/add', authorize('manager', 'admin'), async (req, res) => {
    try {
        const { storeId, products, notes } = req.body;

        // Add manual order
        const order = await addManualOrder({
            storeId,
            products,
            notes,
            createdBy: req.user.id
        });

        res.json({
            success: true,
            data: order,
            message: 'تم إضافة الطلب بنجاح'
        });
    } catch (error) {
        console.error('Add manual order error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إضافة الطلب'
        });
    }
});

// @desc    Generate distribution schedules
// @route   POST /api/distribution/manager/schedules/generate
// @access  Private (Manager/Admin)
router.post('/manager/schedules/generate', authorize('manager', 'admin'), async (req, res) => {
    try {
        const { date, distributorAssignments } = req.body;

        // Generate distribution schedules
        const schedules = await generateDistributionSchedules({
            date,
            distributorAssignments,
            createdBy: req.user.id
        });

        res.json({
            success: true,
            data: schedules,
            message: 'تم توليد جداول التوزيع بنجاح'
        });
    } catch (error) {
        console.error('Generate schedules error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في توليد جداول التوزيع'
        });
    }
});

// @route   GET /api/distribution/manager/tracking/live
// @desc    Get live distribution tracking
router.get('/manager/tracking/live', authorize('manager', 'admin'), async (req, res) => {
    try {
        const { date } = req.query;

        // Get live tracking data - this already returns a success/data structure
        const trackingResponse = await getLiveDistributionTracking(date);

        // Return the response directly since it already has the proper structure
        res.json(trackingResponse);
    } catch (error) {
        console.error('Get live tracking error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب متابعة التوزيع'
        });
    }
});

// @desc    Get distributor performance
// @route   GET /api/distribution/manager/performance
// @access  Private (Manager/Admin)
router.get('/manager/performance', authorize('manager', 'admin'), async (req, res) => {
    try {
        const { distributorId, period } = req.query;

        // Get distributor performance metrics
        const performance = await getDistributorPerformance(distributorId, period);

        res.json({
            success: true,
            data: performance,
            message: 'تم جلب أداء الموزع بنجاح'
        });
    } catch (error) {
        console.error('Get distributor performance error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب أداء الموزع'
        });
    }
});

// @desc    Get advanced analytics
// @route   GET /api/distribution/manager/analytics
// @access  Private (Manager/Admin)
router.get('/manager/analytics', authorize('manager', 'admin'), async (req, res) => {
    try {
        const { period, filters } = req.query;

        // Get advanced analytics
        const analytics = await getDistributionAnalytics({
            period,
            filters: JSON.parse(filters || '{}')
        });

        res.json({
            success: true,
            data: analytics,
            message: 'تم جلب التحليلات بنجاح'
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب التحليلات'
        });
    }
});

// @desc    Generate weekly report
// @route   POST /api/distribution/manager/reports/weekly
// @access  Private (Manager/Admin)
router.post('/manager/reports/weekly', authorize('manager', 'admin'), async (req, res) => {
    try {
        const { weekStart, weekEnd, format } = req.body;

        // Generate weekly report
        const report = await generateWeeklyReport({
            weekStart,
            weekEnd,
            format,
            generatedBy: req.user.id
        });

        res.json({
            success: true,
            data: report,
            message: 'تم توليد التقرير الأسبوعي بنجاح'
        });
    } catch (error) {
        console.error('Generate weekly report error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في توليد التقرير الأسبوعي'
        });
    }
});

// @desc    Manage store assignments
// @route   PATCH /api/distribution/manager/stores/assign
// @access  Private (Manager/Admin)
router.patch('/manager/stores/assign', authorize('manager', 'admin'), async (req, res) => {
    try {
        const { storeId, distributorId, zone } = req.body;

        // Assign store to distributor
        const assignment = await assignStoreToDistributor({
            storeId,
            distributorId,
            zone,
            assignedBy: req.user.id
        });

        res.json({
            success: true,
            data: assignment,
            message: 'تم تعيين المحل للموزع بنجاح'
        });
    } catch (error) {
        console.error('Assign store error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تعيين المحل'
        });
    }
});

// @desc    Update store balance manually
// @route   PATCH /api/distribution/manager/stores/:storeId/balance
// @access  Private (Manager/Admin)
router.patch('/manager/stores/:storeId/balance', authorize('manager', 'admin'), async (req, res) => {
    try {
        const { storeId } = req.params;
        const { amount, currency, reason, notes } = req.body;

        // Update store balance manually
        const balance = await updateStoreBalanceManually({
            storeId,
            amount,
            currency,
            reason,
            notes,
            updatedBy: req.user.id
        });

        res.json({
            success: true,
            data: balance,
            message: 'تم تحديث رصيد المحل بنجاح'
        });
    } catch (error) {
        console.error('Update store balance error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث رصيد المحل'
        });
    }
});

// @desc    Lock/approve distributor report
// @route   PATCH /api/distribution/manager/reports/:reportId/approve
// @access  Private (Manager/Admin)
router.patch('/manager/reports/:reportId/approve', authorize('manager', 'admin'), async (req, res) => {
    try {
        const { reportId } = req.params;
        const { approved, notes } = req.body;

        // Approve or reject report
        const report = await approveDistributorReport({
            reportId,
            approved,
            notes,
            approvedBy: req.user.id
        });

        res.json({
            success: true,
            data: report,
            message: approved ? 'تم الموافقة على التقرير' : 'تم رفض التقرير'
        });
    } catch (error) {
        console.error('Approve report error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في معالجة التقرير'
        });
    }
});

export default router; 
