import db from '../config/database.js';

/**
 * Notification Service
 * Handles all notification operations for the system
 */
class NotificationService {

    /**
     * Create a new notification
     * @param {Object} notificationData - Notification data
     * @returns {Object} Created notification
     */
    static async createNotification(notificationData) {
        try {
            const {
                userId,
                type,
                title,
                message,
                data = {},
                priority = 'normal',
                scheduledFor = null
            } = notificationData;

            const [result] = await db.execute(`
                INSERT INTO notifications (
                    user_id, type, title, message, data, priority, 
                    scheduled_for, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                userId,
                type,
                title,
                message,
                JSON.stringify(data),
                priority,
                scheduledFor
            ]);

            return {
                id: result.insertId,
                ...notificationData,
                created_at: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error creating notification:', error);
            throw new Error('فشل في إنشاء الإشعار');
        }
    }

    /**
     * Send notification to multiple users
     * @param {Array} userIds - Array of user IDs
     * @param {Object} notificationData - Notification data
     * @returns {Array} Created notifications
     */
    static async sendBulkNotification(userIds, notificationData) {
        try {
            const notifications = [];

            for (const userId of userIds) {
                const notification = await this.createNotification({
                    ...notificationData,
                    userId
                });
                notifications.push(notification);
            }

            return notifications;

        } catch (error) {
            console.error('Error sending bulk notification:', error);
            throw new Error('فشل في إرسال الإشعارات الجماعية');
        }
    }

    /**
     * Get notifications for a user
     * @param {number} userId - User ID
     * @param {Object} options - Query options
     * @returns {Object} User notifications
     */
    static async getUserNotifications(userId, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                type = null,
                unreadOnly = false,
                priority = null
            } = options;

            const offset = (page - 1) * limit;
            let whereConditions = 'WHERE user_id = ?';
            const params = [userId];

            if (type) {
                whereConditions += ' AND type = ?';
                params.push(type);
            }

            if (unreadOnly) {
                whereConditions += ' AND is_read = FALSE';
            }

            if (priority) {
                whereConditions += ' AND priority = ?';
                params.push(priority);
            }

            // Get notifications
            const [notifications] = await db.execute(`
                SELECT 
                    id,
                    type,
                    title,
                    message,
                    data,
                    priority,
                    is_read,
                    scheduled_for,
                    created_at,
                    updated_at
                FROM notifications
                ${whereConditions}
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `, [...params, limit, offset]);

            // Get total count
            const [totalCount] = await db.execute(`
                SELECT COUNT(*) as total
                FROM notifications
                ${whereConditions}
            `, params);

            // Get unread count
            const [unreadCount] = await db.execute(`
                SELECT COUNT(*) as unread
                FROM notifications
                WHERE user_id = ? AND is_read = FALSE
            `, [userId]);

            return {
                notifications: notifications.map(n => ({
                    ...n,
                    data: JSON.parse(n.data || '{}')
                })),
                pagination: {
                    page,
                    limit,
                    total: totalCount[0]?.total || 0,
                    pages: Math.ceil((totalCount[0]?.total || 0) / limit)
                },
                unread_count: unreadCount[0]?.unread || 0
            };

        } catch (error) {
            console.error('Error getting user notifications:', error);
            throw new Error('فشل في جلب الإشعارات');
        }
    }

    /**
     * Mark notification as read
     * @param {number} notificationId - Notification ID
     * @param {number} userId - User ID
     * @returns {boolean} Success status
     */
    static async markAsRead(notificationId, userId) {
        try {
            const [result] = await db.execute(`
                UPDATE notifications 
                SET is_read = TRUE, updated_at = NOW()
                WHERE id = ? AND user_id = ?
            `, [notificationId, userId]);

            return result.affectedRows > 0;

        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw new Error('فشل في تحديث حالة الإشعار');
        }
    }

    /**
     * Mark all notifications as read for a user
     * @param {number} userId - User ID
     * @returns {number} Number of updated notifications
     */
    static async markAllAsRead(userId) {
        try {
            const [result] = await db.execute(`
                UPDATE notifications 
                SET is_read = TRUE, updated_at = NOW()
                WHERE user_id = ? AND is_read = FALSE
            `, [userId]);

            return result.affectedRows;

        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw new Error('فشل في تحديث الإشعارات');
        }
    }

    /**
     * Delete notification
     * @param {number} notificationId - Notification ID
     * @param {number} userId - User ID
     * @returns {boolean} Success status
     */
    static async deleteNotification(notificationId, userId) {
        try {
            const [result] = await db.execute(`
                DELETE FROM notifications 
                WHERE id = ? AND user_id = ?
            `, [notificationId, userId]);

            return result.affectedRows > 0;

        } catch (error) {
            console.error('Error deleting notification:', error);
            throw new Error('فشل في حذف الإشعار');
        }
    }

    /**
     * Send order notification
     * @param {string} type - Notification type
     * @param {Object} orderData - Order data
     * @returns {Object} Created notification
     */
    static async sendOrderNotification(type, orderData) {
        try {
            const { orderId, storeId, distributorId, storeName, orderNumber } = orderData;

            const notificationMap = {
                'order_created': {
                    userId: distributorId,
                    title: 'طلب جديد',
                    message: `طلب جديد من محل ${storeName} - رقم الطلب: ${orderNumber}`,
                    data: { orderId, storeId, orderNumber }
                },
                'order_delivered': {
                    userId: storeId, // Store owner
                    title: 'تم التسليم',
                    message: `تم تسليم طلبك رقم ${orderNumber} بنجاح`,
                    data: { orderId, orderNumber }
                },
                'order_cancelled': {
                    userId: distributorId,
                    title: 'إلغاء طلب',
                    message: `تم إلغاء الطلب رقم ${orderNumber} من محل ${storeName}`,
                    data: { orderId, storeId, orderNumber }
                }
            };

            const notificationData = notificationMap[type];
            if (!notificationData) {
                throw new Error('نوع إشعار غير مدعوم');
            }

            return await this.createNotification({
                ...notificationData,
                type: 'order'
            });

        } catch (error) {
            console.error('Error sending order notification:', error);
            throw new Error('فشل في إرسال إشعار الطلب');
        }
    }

    /**
     * Send payment notification
     * @param {string} type - Notification type
     * @param {Object} paymentData - Payment data
     * @returns {Object} Created notification
     */
    static async sendPaymentNotification(type, paymentData) {
        try {
            const { paymentId, storeId, distributorId, amount, currency, storeName } = paymentData;

            const notificationMap = {
                'payment_received': {
                    userId: storeId, // Store owner
                    title: 'تم استلام الدفعة',
                    message: `تم استلام دفعة بقيمة ${amount} ${currency}`,
                    data: { paymentId, amount, currency }
                },
                'payment_reminder': {
                    userId: storeId,
                    title: 'تذكير دفعة',
                    message: `تذكير بوجود مستحقات بقيمة ${amount} ${currency}`,
                    data: { storeId, amount, currency },
                    priority: 'high'
                },
                'debt_limit_exceeded': {
                    userId: distributorId,
                    title: 'تجاوز حد الائتمان',
                    message: `محل ${storeName} تجاوز حد الائتمان المسموح`,
                    data: { storeId, storeName, amount, currency },
                    priority: 'urgent'
                }
            };

            const notificationData = notificationMap[type];
            if (!notificationData) {
                throw new Error('نوع إشعار غير مدعوم');
            }

            return await this.createNotification({
                ...notificationData,
                type: 'payment'
            });

        } catch (error) {
            console.error('Error sending payment notification:', error);
            throw new Error('فشل في إرسال إشعار الدفعة');
        }
    }

    /**
     * Send distribution notification
     * @param {string} type - Notification type
     * @param {Object} distributionData - Distribution data
     * @returns {Object} Created notification
     */
    static async sendDistributionNotification(type, distributionData) {
        try {
            const { distributorId, scheduleId, routeCount, date } = distributionData;

            const notificationMap = {
                'schedule_ready': {
                    userId: distributorId,
                    title: 'جدول التوزيع جاهز',
                    message: `جدول التوزيع ليوم ${date} جاهز - ${routeCount} محل`,
                    data: { scheduleId, routeCount, date }
                },
                'delivery_reminder': {
                    userId: distributorId,
                    title: 'تذكير التسليم',
                    message: `لديك طلبات معلقة للتسليم اليوم`,
                    data: { scheduleId, date },
                    priority: 'high'
                },
                'route_optimized': {
                    userId: distributorId,
                    title: 'تحسين المسار',
                    message: `تم تحسين مسار التوزيع لتوفير الوقت والمسافة`,
                    data: { scheduleId, routeCount }
                }
            };

            const notificationData = notificationMap[type];
            if (!notificationData) {
                throw new Error('نوع إشعار غير مدعوم');
            }

            return await this.createNotification({
                ...notificationData,
                type: 'distribution'
            });

        } catch (error) {
            console.error('Error sending distribution notification:', error);
            throw new Error('فشل في إرسال إشعار التوزيع');
        }
    }

    /**
     * Send system notification
     * @param {string} type - Notification type
     * @param {Object} systemData - System data
     * @returns {Array} Created notifications
     */
    static async sendSystemNotification(type, systemData) {
        try {
            const { title, message, userIds, priority = 'normal' } = systemData;

            if (!userIds || userIds.length === 0) {
                // Get all admin and manager users
                const [adminUsers] = await db.execute(`
                    SELECT id FROM users 
                    WHERE role IN ('admin', 'manager') AND status = 'active'
                `);

                systemData.userIds = adminUsers.map(u => u.id);
            }

            return await this.sendBulkNotification(systemData.userIds, {
                type: 'system',
                title,
                message,
                priority,
                data: systemData
            });

        } catch (error) {
            console.error('Error sending system notification:', error);
            throw new Error('فشل في إرسال إشعار النظام');
        }
    }

    /**
     * Get notification statistics
     * @param {Object} options - Query options
     * @returns {Object} Notification statistics
     */
    static async getNotificationStats(options = {}) {
        try {
            const {
                dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                dateTo = new Date().toISOString().split('T')[0]
            } = options;

            // Overall stats
            const [overallStats] = await db.execute(`
                SELECT 
                    COUNT(*) as total_notifications,
                    COUNT(CASE WHEN is_read = TRUE THEN 1 END) as read_notifications,
                    COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread_notifications,
                    COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_notifications,
                    COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_notifications
                FROM notifications
                WHERE created_at BETWEEN ? AND ?
            `, [dateFrom, dateTo]);

            // Notifications by type
            const [typeBreakdown] = await db.execute(`
                SELECT 
                    type,
                    COUNT(*) as count,
                    COUNT(CASE WHEN is_read = TRUE THEN 1 END) as read_count,
                    COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread_count
                FROM notifications
                WHERE created_at BETWEEN ? AND ?
                GROUP BY type
                ORDER BY count DESC
            `, [dateFrom, dateTo]);

            // Daily trends
            const [dailyTrends] = await db.execute(`
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as total_notifications,
                    COUNT(CASE WHEN is_read = TRUE THEN 1 END) as read_notifications,
                    COUNT(CASE WHEN type = 'order' THEN 1 END) as order_notifications,
                    COUNT(CASE WHEN type = 'payment' THEN 1 END) as payment_notifications,
                    COUNT(CASE WHEN type = 'distribution' THEN 1 END) as distribution_notifications
                FROM notifications
                WHERE created_at BETWEEN ? AND ?
                GROUP BY DATE(created_at)
                ORDER BY date
            `, [dateFrom, dateTo]);

            return {
                period: { from: dateFrom, to: dateTo },
                overall_stats: overallStats[0] || {},
                type_breakdown: typeBreakdown,
                daily_trends: dailyTrends,
                read_rate: overallStats[0]?.total_notifications > 0 ?
                    (overallStats[0].read_notifications / overallStats[0].total_notifications * 100).toFixed(2) : 0
            };

        } catch (error) {
            console.error('Error getting notification stats:', error);
            throw new Error('فشل في جلب إحصائيات الإشعارات');
        }
    }

    /**
     * Clean up old notifications
     * @param {number} daysOld - Days old to clean
     * @returns {number} Number of deleted notifications
     */
    static async cleanupOldNotifications(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const [result] = await db.execute(`
                DELETE FROM notifications 
                WHERE created_at < ? AND is_read = TRUE
            `, [cutoffDate.toISOString().split('T')[0]]);

            return result.affectedRows;

        } catch (error) {
            console.error('Error cleaning up old notifications:', error);
            throw new Error('فشل في تنظيف الإشعارات القديمة');
        }
    }

    /**
     * Send scheduled notifications
     * @returns {number} Number of sent notifications
     */
    static async sendScheduledNotifications() {
        try {
            const [scheduledNotifications] = await db.execute(`
                SELECT * FROM notifications 
                WHERE scheduled_for <= NOW() AND is_sent = FALSE
                ORDER BY scheduled_for ASC
            `);

            let sentCount = 0;
            for (const notification of scheduledNotifications) {
                try {
                    // Here you would integrate with push notification service
                    // For now, just mark as sent
                    await db.execute(`
                        UPDATE notifications 
                        SET is_sent = TRUE, sent_at = NOW()
                        WHERE id = ?
                    `, [notification.id]);

                    sentCount++;
                } catch (error) {
                    console.error(`Error sending scheduled notification ${notification.id}:`, error);
                }
            }

            return sentCount;

        } catch (error) {
            console.error('Error sending scheduled notifications:', error);
            throw new Error('فشل في إرسال الإشعارات المجدولة');
        }
    }
}

export default NotificationService; 