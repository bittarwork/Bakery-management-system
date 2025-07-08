import express from 'express';
import { protect, requireDistributorOrHigher } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);
router.use(requireDistributorOrHigher);

// @desc    الحصول على التقارير اليومية للموزع
// @route   GET /api/reports/daily
// @access  Private (Distributor)
router.get('/daily', async (req, res) => {
    try {
        const { date } = req.query;
        const distributorId = req.user.id;

        // TODO: Implement actual database query
        const reports = [
            {
                id: 1,
                report_date: date || new Date().toISOString().split('T')[0],
                distributor_id: distributorId,
                schedule_id: 1,
                total_stores_visited: 5,
                total_amount_delivered: 250.00,
                total_amount_collected: 245.50,
                total_gifts_given: 15.00,
                vehicle_expenses: 45.50,
                status: 'draft',
                notes: 'تقرير يومي عادي'
            }
        ];

        res.json({
            success: true,
            data: reports,
            message: 'تم جلب التقارير اليومية بنجاح'
        });
    } catch (error) {
        console.error('Daily reports error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
});

// @desc    إنشاء تقرير يومي جديد
// @route   POST /api/reports/daily
// @access  Private (Distributor)
router.post('/daily', async (req, res) => {
    try {
        const {
            report_date,
            schedule_id,
            total_stores_visited,
            total_amount_delivered,
            total_amount_collected,
            total_gifts_given,
            vehicle_expenses,
            notes,
            expenses
        } = req.body;

        const distributorId = req.user.id;

        // TODO: Implement actual database insert
        const newReport = {
            id: Date.now(),
            report_date: report_date || new Date().toISOString().split('T')[0],
            distributor_id: distributorId,
            schedule_id,
            total_stores_visited,
            total_amount_delivered,
            total_amount_collected,
            total_gifts_given,
            vehicle_expenses,
            status: 'submitted',
            notes,
            expenses
        };

        res.status(201).json({
            success: true,
            data: newReport,
            message: 'تم إنشاء التقرير اليومي بنجاح'
        });
    } catch (error) {
        console.error('Create daily report error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
});

// @desc    تحديث تقرير يومي
// @route   PUT /api/reports/daily/:id
// @access  Private (Distributor)
router.put('/daily/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const distributorId = req.user.id;

        // TODO: Implement actual database update with ownership check
        res.json({
            success: true,
            message: 'تم تحديث التقرير اليومي بنجاح',
            data: { id }
        });
    } catch (error) {
        console.error('Update daily report error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
});

// @desc    الحصول على إحصائيات الموزع
// @route   GET /api/reports/statistics
// @access  Private (Distributor)
router.get('/statistics', async (req, res) => {
    try {
        const { date_from, date_to } = req.query;
        const distributorId = req.user.id;

        // TODO: Implement actual database query
        const statistics = {
            total_deliveries: 45,
            total_amount_delivered: 2250.00,
            total_amount_collected: 2200.00,
            total_expenses: 450.00,
            average_daily_deliveries: 5,
            completion_rate: 95.5
        };

        res.json({
            success: true,
            data: statistics,
            message: 'تم جلب الإحصائيات بنجاح'
        });
    } catch (error) {
        console.error('Statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
});

export default router; 