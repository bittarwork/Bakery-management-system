import express from 'express';
import { protect, requireDistributorOrHigher } from '../middleware/auth.js';
import DailyReport from '../models/DailyReport.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);
router.use(requireDistributorOrHigher);

// @desc    الحصول على التقارير اليومية للموزع
// @route   GET /api/reports/daily
// @access  Private (Distributor)
router.get('/daily', async (req, res) => {
    try {
        const { date, page = 1, limit = 10 } = req.query;
        const distributorId = req.user.id;

        const offset = (page - 1) * limit;
        const reports = await DailyReport.findByDistributor(distributorId, {
            date,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: reports,
            message: 'تم جلب التقارير اليومية بنجاح'
        });
    } catch (error) {
        console.error('Daily reports error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطأ في الخادم'
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

        const reportData = {
            distributor_id: distributorId,
            report_date: report_date || new Date().toISOString().split('T')[0],
            schedule_id,
            total_stores_visited,
            total_amount_delivered,
            total_amount_collected,
            total_gifts_given,
            vehicle_expenses,
            notes,
            expenses
        };

        const newReport = await DailyReport.create(reportData);

        res.status(201).json({
            success: true,
            data: newReport,
            message: 'تم إنشاء التقرير اليومي بنجاح'
        });
    } catch (error) {
        console.error('Create daily report error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطأ في الخادم'
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
        const updateData = req.body;

        const updatedReport = await DailyReport.update(parseInt(id), distributorId, updateData);

        res.json({
            success: true,
            message: 'تم تحديث التقرير اليومي بنجاح',
            data: updatedReport
        });
    } catch (error) {
        console.error('Update daily report error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطأ في الخادم'
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

        const statistics = await DailyReport.getDistributorStatistics(distributorId, {
            date_from,
            date_to
        });

        res.json({
            success: true,
            data: statistics,
            message: 'تم جلب الإحصائيات بنجاح'
        });
    } catch (error) {
        console.error('Statistics error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطأ في الخادم'
        });
    }
});

export default router; 