import express from 'express';
import { protect, requireDistributorOrHigher } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);
router.use(requireDistributorOrHigher);

// @desc    الحصول على جداول التوزيع للموزع
// @route   GET /api/distribution
// @access  Private (Distributor)
router.get('/', async (req, res) => {
    try {
        const { date, status } = req.query;
        const distributorId = req.user.id;

        // TODO: Implement actual database query
        const schedules = [
            {
                id: 1,
                schedule_date: date || new Date().toISOString().split('T')[0],
                distributor_id: distributorId,
                vehicle_id: 1,
                total_stores: 5,
                status: status || 'active',
                route_data: {
                    route: [
                        { store_id: 1, order: 1, estimated_time: "08:00" },
                        { store_id: 2, order: 2, estimated_time: "08:30" }
                    ]
                }
            }
        ];

        res.json({
            success: true,
            data: schedules,
            message: 'تم جلب جداول التوزيع بنجاح'
        });
    } catch (error) {
        console.error('Distribution schedules error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
});

// @desc    الحصول على جدول توزيع محدد
// @route   GET /api/distribution/:id
// @access  Private (Distributor)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const distributorId = req.user.id;

        // TODO: Implement actual database query with ownership check
        const schedule = {
            id: parseInt(id),
            schedule_date: new Date().toISOString().split('T')[0],
            distributor_id: distributorId,
            vehicle_id: 1,
            total_stores: 5,
            status: 'active',
            route_data: {
                route: [
                    { store_id: 1, order: 1, estimated_time: "08:00" },
                    { store_id: 2, order: 2, estimated_time: "08:30" }
                ]
            },
            items: [
                {
                    id: 1,
                    store_id: 1,
                    product_id: 1,
                    planned_quantity: 20,
                    delivered_quantity: 0,
                    unit_price: 1.50,
                    delivery_status: 'pending'
                }
            ]
        };

        res.json({
            success: true,
            data: schedule,
            message: 'تم جلب جدول التوزيع بنجاح'
        });
    } catch (error) {
        console.error('Distribution schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
});

// @desc    تحديث حالة جدول التوزيع
// @route   PATCH /api/distribution/:id/status
// @access  Private (Distributor)
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const distributorId = req.user.id;

        // TODO: Implement actual database update
        res.json({
            success: true,
            message: 'تم تحديث حالة جدول التوزيع بنجاح',
            data: { id, status }
        });
    } catch (error) {
        console.error('Update distribution status error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
});

// @desc    تحديث حالة تسليم عنصر
// @route   PATCH /api/distribution/:scheduleId/items/:itemId
// @access  Private (Distributor)
router.patch('/:scheduleId/items/:itemId', async (req, res) => {
    try {
        const { scheduleId, itemId } = req.params;
        const { delivered_quantity, delivery_status, notes } = req.body;
        const distributorId = req.user.id;

        // TODO: Implement actual database update
        res.json({
            success: true,
            message: 'تم تحديث حالة التسليم بنجاح',
            data: {
                schedule_id: scheduleId,
                item_id: itemId,
                delivered_quantity,
                delivery_status
            }
        });
    } catch (error) {
        console.error('Update delivery item error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
});

// @desc    توليد جداول التوزيع
// @route   POST /api/distribution/generate
// @access  Private (Manager/Admin)
router.post('/generate', async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'تم توليد جداول التوزيع بنجاح'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
});

export default router; 