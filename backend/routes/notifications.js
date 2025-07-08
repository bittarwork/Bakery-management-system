import express from 'express';
import { protect } from '../middleware/auth.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { Op } from 'sequelize';
import { requireDistributorOrHigher } from '../middleware/auth.js';

const router = express.Router();

// الحصول على جميع الإشعارات للمستخدم الحالي
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const filter = req.query.filter || 'all'; // all, unread, read
        const sortBy = req.query.sortBy || 'newest'; // newest, oldest, priority
        const type = req.query.type; // order, inventory, delivery, payment, system, customer

        // بناء شروط البحث
        const where = { userId: req.user.id };

        if (filter === 'unread') {
            where.isRead = false;
        } else if (filter === 'read') {
            where.isRead = true;
        }

        if (type) {
            where.type = type;
        }

        // بناء خيارات الترتيب
        let order = [];
        switch (sortBy) {
            case 'oldest':
                order = [['createdAt', 'ASC']];
                break;
            case 'priority':
                order = [
                    ['priority', 'DESC'],
                    ['createdAt', 'DESC']
                ];
                break;
            default: // newest
                order = [['createdAt', 'DESC']];
        }

        const offset = (page - 1) * limit;

        const { count, rows: notifications } = await Notification.findAndCountAll({
            where,
            order,
            limit,
            offset
        });

        const unreadCount = await Notification.count({
            where: {
                userId: req.user.id,
                isRead: false
            }
        });

        res.json({
            success: true,
            data: {
                notifications,
                pagination: {
                    current: page,
                    pages: Math.ceil(count / limit),
                    total: count,
                    limit
                },
                unreadCount
            }
        });
    } catch (error) {
        console.error('خطأ في جلب الإشعارات:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الإشعارات'
        });
    }
});

// تعيين إشعار كمقروء
router.patch('/:id/read', protect, async (req, res) => {
    try {
        const [updatedRowsCount] = await Notification.update(
            {
                isRead: true,
                readAt: new Date()
            },
            {
                where: {
                    id: req.params.id,
                    userId: req.user.id
                },
                returning: true
            }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'الإشعار غير موجود'
            });
        }

        const notification = await Notification.findByPk(req.params.id);

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('خطأ في تحديث الإشعار:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث الإشعار'
        });
    }
});

// تعيين إشعار كغير مقروء
router.patch('/:id/unread', protect, async (req, res) => {
    try {
        const [updatedRowsCount] = await Notification.update(
            {
                isRead: false,
                readAt: null
            },
            {
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'الإشعار غير موجود'
            });
        }

        const notification = await Notification.findByPk(req.params.id);

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('خطأ في تحديث الإشعار:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث الإشعار'
        });
    }
});

// تعيين جميع الإشعارات كمقروءة
router.patch('/mark-all-read', protect, async (req, res) => {
    try {
        const [updatedRowsCount] = await Notification.update(
            {
                isRead: true,
                readAt: new Date()
            },
            {
                where: {
                    userId: req.user.id,
                    isRead: false
                }
            }
        );

        res.json({
            success: true,
            message: `تم تعيين ${updatedRowsCount} إشعار كمقروء`,
            modifiedCount: updatedRowsCount
        });
    } catch (error) {
        console.error('خطأ في تحديث الإشعارات:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث الإشعارات'
        });
    }
});

// حذف إشعار
router.delete('/:id', protect, async (req, res) => {
    try {
        const deletedRowsCount = await Notification.destroy({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (deletedRowsCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'الإشعار غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم حذف الإشعار بنجاح'
        });
    } catch (error) {
        console.error('خطأ في حذف الإشعار:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف الإشعار'
        });
    }
});

// حذف جميع الإشعارات المقروءة
router.delete('/clear-read', protect, async (req, res) => {
    try {
        const deletedRowsCount = await Notification.destroy({
            where: {
                userId: req.user.id,
                isRead: true
            }
        });

        res.json({
            success: true,
            message: `تم حذف ${deletedRowsCount} إشعار مقروء`,
            deletedCount: deletedRowsCount
        });
    } catch (error) {
        console.error('خطأ في حذف الإشعارات:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف الإشعارات'
        });
    }
});

// حذف جميع الإشعارات
router.delete('/clear-all', protect, async (req, res) => {
    try {
        const deletedRowsCount = await Notification.destroy({
            where: {
                userId: req.user.id
            }
        });

        res.json({
            success: true,
            message: `تم حذف ${deletedRowsCount} إشعار`,
            deletedCount: deletedRowsCount
        });
    } catch (error) {
        console.error('خطأ في حذف الإشعارات:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف الإشعارات'
        });
    }
});

// إحصائيات الإشعارات
router.get('/stats', protect, async (req, res) => {
    try {
        // إحصائيات حسب النوع
        const typeStats = await Notification.findAll({
            where: { userId: req.user.id },
            attributes: [
                'type',
                [Notification.sequelize.fn('COUNT', '*'), 'total'],
                [Notification.sequelize.fn('SUM',
                    Notification.sequelize.literal('CASE WHEN is_read = false THEN 1 ELSE 0 END')
                ), 'unread'],
                [Notification.sequelize.fn('SUM',
                    Notification.sequelize.literal('CASE WHEN priority = \'high\' THEN 1 ELSE 0 END')
                ), 'high_priority']
            ],
            group: ['type'],
            raw: true
        });

        // إحصائيات إجمالية
        const totalStats = await Notification.findOne({
            where: { userId: req.user.id },
            attributes: [
                [Notification.sequelize.fn('COUNT', '*'), 'total'],
                [Notification.sequelize.fn('SUM',
                    Notification.sequelize.literal('CASE WHEN is_read = false THEN 1 ELSE 0 END')
                ), 'unread'],
                [Notification.sequelize.fn('SUM',
                    Notification.sequelize.literal('CASE WHEN priority = \'high\' THEN 1 ELSE 0 END')
                ), 'high_priority']
            ],
            raw: true
        });

        res.json({
            success: true,
            data: {
                byType: typeStats,
                total: totalStats || { total: 0, unread: 0, high_priority: 0 }
            }
        });
    } catch (error) {
        console.error('خطأ في جلب إحصائيات الإشعارات:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب إحصائيات الإشعارات'
        });
    }
});

// إنشاء إشعار جديد (للاختبار)
router.post('/', protect, async (req, res) => {
    try {
        const notificationData = {
            ...req.body,
            userId: req.user.id
        };

        const notification = await Notification.createNotification(notificationData);

        res.status(201).json({
            success: true,
            data: notification,
            message: 'تم إنشاء الإشعار بنجاح'
        });
    } catch (error) {
        console.error('خطأ في إنشاء الإشعار:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الإشعار'
        });
    }
});

// إنشاء إشعارات تجريبية للاختبار
router.post('/seed', protect, async (req, res) => {
    try {
        const userId = req.user.id;

        // إنشاء إشعارات تجريبية متنوعة
        const sampleNotifications = [
            {
                userId,
                type: 'order',
                priority: 'high',
                title: 'طلب جديد عاجل',
                message: 'تم استلام طلب جديد #1001 من أحمد محمد بقيمة 250 ريال',
                icon: '📋',
                actionUrl: '/orders/1001',
                metadata: {
                    orderNumber: '1001',
                    customerName: 'أحمد محمد',
                    totalAmount: 250
                }
            },
            {
                userId,
                type: 'inventory',
                priority: 'high',
                title: 'تحذير نفاد المخزون',
                message: 'خبز التوست أوشك على النفاد - متبقي 3 قطع فقط',
                icon: '⚠️',
                actionUrl: '/products/toast',
                metadata: {
                    productName: 'خبز التوست',
                    currentStock: 3,
                    minStock: 10
                }
            },
            {
                userId,
                type: 'delivery',
                priority: 'normal',
                title: 'تم التسليم بنجاح',
                message: 'تم تسليم الطلب #1000 بنجاح للعميل فاطمة علي',
                icon: '✅',
                actionUrl: '/orders/1000',
                isRead: true,
                readAt: new Date(),
                metadata: {
                    orderNumber: '1000',
                    customerName: 'فاطمة علي'
                }
            },
            {
                userId,
                type: 'payment',
                priority: 'normal',
                title: 'دفعة جديدة مستلمة',
                message: 'تم استلام دفعة بقيمة 500 ريال من سارة أحمد عبر بطاقة ائتمان',
                icon: '💰',
                actionUrl: '/payments/123',
                isRead: true,
                readAt: new Date(),
                metadata: {
                    amount: 500,
                    customerName: 'سارة أحمد',
                    paymentMethod: 'بطاقة ائتمان'
                }
            },
            {
                userId,
                type: 'system',
                priority: 'low',
                title: 'تحديث النظام',
                message: 'تم تحديث النظام إلى الإصدار 2.1.0 بنجاح',
                icon: '🔄',
                actionUrl: '/system/updates',
                isRead: true,
                readAt: new Date(),
                metadata: {
                    version: '2.1.0'
                }
            },
            {
                userId,
                type: 'customer',
                priority: 'low',
                title: 'عميل جديد مسجل',
                message: 'انضم عميل جديد: محمد سالم إلى قائمة العملاء',
                icon: '👤',
                actionUrl: '/customers/new',
                metadata: {
                    customerName: 'محمد سالم'
                }
            }
        ];

        const createdNotifications = await Notification.bulkCreate(sampleNotifications);

        res.status(201).json({
            success: true,
            data: createdNotifications,
            message: `تم إنشاء ${createdNotifications.length} إشعار تجريبي بنجاح`
        });
    } catch (error) {
        console.error('خطأ في إنشاء الإشعارات التجريبية:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الإشعارات التجريبية'
        });
    }
});

// @desc    تحديث موقع الموزع
// @route   POST /api/notifications/location
// @access  Private (Distributor)
router.post('/location', protect, requireDistributorOrHigher, async (req, res) => {
    try {
        const { latitude, longitude, accuracy, timestamp } = req.body;
        const distributorId = req.user.id;

        // TODO: Store location in database for tracking
        const locationData = {
            distributor_id: distributorId,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            accuracy: parseFloat(accuracy),
            timestamp: timestamp || new Date().toISOString()
        };

        // TODO: Implement actual database insert
        console.log('Location update:', locationData);

        res.json({
            success: true,
            message: 'تم تحديث الموقع بنجاح',
            data: locationData
        });
    } catch (error) {
        console.error('Location update error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث الموقع'
        });
    }
});

// @desc    الحصول على إشعارات الموزع
// @route   GET /api/notifications/distributor
// @access  Private (Distributor)
router.get('/distributor', protect, requireDistributorOrHigher, async (req, res) => {
    try {
        const distributorId = req.user.id;
        const { limit = 20, unread_only = false } = req.query;

        // TODO: Implement actual database query
        const notifications = [
            {
                id: 1,
                type: 'delivery',
                title: 'طلب جديد',
                message: 'تم إضافة طلب جديد لجدول التوزيع',
                priority: 'normal',
                is_read: false,
                created_at: new Date().toISOString()
            }
        ];

        res.json({
            success: true,
            data: notifications,
            message: 'تم جلب الإشعارات بنجاح'
        });
    } catch (error) {
        console.error('Distributor notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الإشعارات'
        });
    }
});

// @desc    تحديث حالة قراءة الإشعار
// @route   PATCH /api/notifications/:id/read
// @access  Private (Distributor)
router.patch('/:id/read', protect, requireDistributorOrHigher, async (req, res) => {
    try {
        const { id } = req.params;
        const distributorId = req.user.id;

        // TODO: Implement actual database update
        res.json({
            success: true,
            message: 'تم تحديث حالة الإشعار بنجاح'
        });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث الإشعار'
        });
    }
});

export default router; 