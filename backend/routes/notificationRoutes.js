import express from 'express';
import NotificationService from '../services/notificationService.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get user notifications
 * GET /api/notifications
 */
router.get('/',
    protect,
    async (req, res) => {
        try {
            const notifications = await NotificationService.getUserNotifications(
                req.user.id,
                req.query
            );

            res.json({
                success: true,
                data: notifications
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

/**
 * Create notification
 * POST /api/notifications
 */
router.post('/',
    protect,
    authorize('admin', 'manager'),
    async (req, res) => {
        try {
            const notification = await NotificationService.createNotification(req.body);

            res.status(201).json({
                success: true,
                message: 'Notification created successfully',
                data: notification
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

/**
 * Send bulk notification
 * POST /api/notifications/bulk
 */
router.post('/bulk',
    protect,
    authorize('admin', 'manager'),
    async (req, res) => {
        try {
            const { userIds, ...notificationData } = req.body;
            const notifications = await NotificationService.sendBulkNotification(
                userIds,
                notificationData
            );

            res.status(201).json({
                success: true,
                message: 'Bulk notifications sent successfully',
                data: notifications
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
router.put('/:id/read',
    protect,
    async (req, res) => {
        try {
            const success = await NotificationService.markAsRead(
                req.params.id,
                req.user.id
            );

            if (success) {
                res.json({
                    success: true,
                    message: 'Notification marked as read'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Notification not found'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
router.put('/read-all',
    protect,
    async (req, res) => {
        try {
            const count = await NotificationService.markAllAsRead(req.user.id);

            res.json({
                success: true,
                message: `${count} notifications marked as read`,
                data: { updated_count: count }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
router.delete('/:id',
    protect,
    async (req, res) => {
        try {
            const success = await NotificationService.deleteNotification(
                req.params.id,
                req.user.id
            );

            if (success) {
                res.json({
                    success: true,
                    message: 'Notification deleted successfully'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Notification not found'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

/**
 * Send order notification
 * POST /api/notifications/order
 */
router.post('/order',
    protect,
    authorize('admin', 'manager', 'distributor'),
    async (req, res) => {
        try {
            const { type, ...orderData } = req.body;
            const notification = await NotificationService.sendOrderNotification(
                type,
                orderData
            );

            res.status(201).json({
                success: true,
                message: 'Order notification sent successfully',
                data: notification
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

/**
 * Send payment notification
 * POST /api/notifications/payment
 */
router.post('/payment',
    protect,
    authorize('admin', 'manager', 'distributor'),
    async (req, res) => {
        try {
            const { type, ...paymentData } = req.body;
            const notification = await NotificationService.sendPaymentNotification(
                type,
                paymentData
            );

            res.status(201).json({
                success: true,
                message: 'Payment notification sent successfully',
                data: notification
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

/**
 * Send distribution notification
 * POST /api/notifications/distribution
 */
router.post('/distribution',
    protect,
    authorize('admin', 'manager'),
    async (req, res) => {
        try {
            const { type, ...distributionData } = req.body;
            const notification = await NotificationService.sendDistributionNotification(
                type,
                distributionData
            );

            res.status(201).json({
                success: true,
                message: 'Distribution notification sent successfully',
                data: notification
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

/**
 * Send system notification
 * POST /api/notifications/system
 */
router.post('/system',
    protect,
    authorize('admin'),
    async (req, res) => {
        try {
            const notifications = await NotificationService.sendSystemNotification(
                req.body.type,
                req.body
            );

            res.status(201).json({
                success: true,
                message: 'System notification sent successfully',
                data: notifications
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

/**
 * Get notification statistics
 * GET /api/notifications/stats
 */
router.get('/stats',
    protect,
    authorize('admin', 'manager'),
    async (req, res) => {
        try {
            const stats = await NotificationService.getNotificationStats(req.query);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

/**
 * Clean up old notifications
 * DELETE /api/notifications/cleanup
 */
router.delete('/cleanup',
    protect,
    authorize('admin'),
    async (req, res) => {
        try {
            const { daysOld = 30 } = req.query;
            const deletedCount = await NotificationService.cleanupOldNotifications(
                parseInt(daysOld)
            );

            res.json({
                success: true,
                message: `${deletedCount} old notifications deleted`,
                data: { deleted_count: deletedCount }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

/**
 * Send scheduled notifications
 * POST /api/notifications/send-scheduled
 */
router.post('/send-scheduled',
    protect,
    authorize('admin'),
    async (req, res) => {
        try {
            const sentCount = await NotificationService.sendScheduledNotifications();

            res.json({
                success: true,
                message: `${sentCount} scheduled notifications sent`,
                data: { sent_count: sentCount }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

export default router; 