import Notification from '../models/Notification.js';
import { Op } from 'sequelize';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

/**
 * دوال مساعدة لإنشاء الإشعارات التلقائية
 */

// إنشاء إشعار عند إنشاء طلب جديد
export const createOrderNotification = async (userId, orderData) => {
    try {
        return await Notification.createOrderNotification(userId, orderData, 'new');
    } catch (error) {
        console.error('Error creating order notification:', error);
    }
};

// إنشاء إشعار عند تحديث حالة الطلب
export const createOrderStatusNotification = async (userId, orderData, status) => {
    try {
        const statusMap = {
            'confirmed': 'updated',
            'preparing': 'updated',
            'ready': 'updated',
            'delivered': 'completed',
            'cancelled': 'cancelled'
        };

        const notificationType = statusMap[status] || 'updated';
        return await Notification.createOrderNotification(userId, orderData, notificationType);
    } catch (error) {
        console.error('Error creating order status notification:', error);
    }
};

// إنشاء إشعار عند نفاد المخزون
export const createLowStockNotification = async (userId, productData) => {
    try {
        const currentStock = productData.stock || productData.currentStock || 0;
        const minStock = productData.minStock || 10;

        if (currentStock <= 0) {
            return await Notification.createInventoryNotification(userId, productData, 'out_of_stock');
        } else if (currentStock <= minStock) {
            return await Notification.createInventoryNotification(userId, productData, 'low_stock');
        }
    } catch (error) {
        console.error('Error creating inventory notification:', error);
    }
};

// إنشاء إشعار عند إعادة تعبئة المخزون
export const createRestockNotification = async (userId, productData) => {
    try {
        return await Notification.createInventoryNotification(userId, productData, 'restock');
    } catch (error) {
        console.error('Error creating restock notification:', error);
    }
};

// إنشاء إشعار عند استلام دفعة
export const createPaymentNotification = async (userId, paymentData, type = 'received') => {
    try {
        return await Notification.createPaymentNotification(userId, paymentData, type);
    } catch (error) {
        console.error('Error creating payment notification:', error);
    }
};

// إنشاء إشعار توصيل
export const createDeliveryNotification = async (userId, orderData, deliveryStatus) => {
    try {
        return await Notification.createDeliveryNotification(userId, orderData, deliveryStatus);
    } catch (error) {
        console.error('Error creating delivery notification:', error);
    }
};

// إنشاء إشعار نظام
export const createSystemNotification = async (userId, title, message, priority = 'normal') => {
    try {
        return await Notification.createSystemNotification(userId, title, message, priority);
    } catch (error) {
        console.error('Error creating system notification:', error);
    }
};

// إنشاء إشعار عميل جديد
export const createNewCustomerNotification = async (userId, customerData) => {
    try {
        return await Notification.createCustomerNotification(userId, customerData, 'new');
    } catch (error) {
        console.error('Error creating new customer notification:', error);
    }
};

// إنشاء إشعارات لجميع المستخدمين المخولين
export const createBroadcastNotification = async (title, message, type = 'system', priority = 'normal') => {
    try {
        // يمكن تحديد المستخدمين المخولين حسب الدور أو الصلاحيات
        // هنا نفترض أن جميع المستخدمين يستلمون الإشعارات
        const User = (await import('../models/User.js')).default;
        const users = await User.findAll({
            attributes: ['id'],
            where: {
                isActive: true // فقط المستخدمين النشطين
            }
        });

        const notifications = users.map(user => ({
            userId: user.id,
            type,
            priority,
            title,
            message,
            metadata: {
                broadcast: true,
                createdAt: new Date()
            }
        }));

        return await Notification.bulkCreate(notifications);
    } catch (error) {
        console.error('Error creating broadcast notification:', error);
    }
};

// تنظيف الإشعارات المنتهية الصلاحية
export const cleanupExpiredNotifications = async () => {
    try {
        const deletedCount = await Notification.destroy({
            where: {
                expiresAt: {
                    [Op.lt]: new Date()
                }
            }
        });

        if (deletedCount > 0) {
            console.log(`Deleted ${deletedCount} expired notifications`);
        }

        return deletedCount;
    } catch (error) {
        console.error('Error cleaning up expired notifications:', error);
    }
};

// تنظيف الإشعارات القديمة (أكثر من 30 يوم)
export const cleanupOldNotifications = async (daysOld = 30) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const deletedCount = await Notification.destroy({
            where: {
                createdAt: {
                    [Op.lt]: cutoffDate
                },
                isRead: true // فقط الإشعارات المقروءة
            }
        });

        if (deletedCount > 0) {
            console.log(`Deleted ${deletedCount} old notifications (older than ${daysOld} days)`);
        }

        return deletedCount;
    } catch (error) {
        console.error('Error cleaning up old notifications:', error);
    }
};

// إحصائيات الإشعارات للمستخدم
export const getUserNotificationStats = async (userId) => {
    try {
        const stats = await Notification.findAll({
            where: { userId },
            attributes: [
                'type',
                'priority',
                [Notification.sequelize.fn('COUNT', '*'), 'count'],
                [Notification.sequelize.fn('SUM',
                    Notification.sequelize.literal('CASE WHEN is_read = false THEN 1 ELSE 0 END')
                ), 'unread']
            ],
            group: ['type', 'priority'],
            raw: true
        });

        return stats;
    } catch (error) {
        console.error('Error fetching notification statistics:', error);
        return [];
    }
};

// تعيين جميع الإشعارات كمقروءة للمستخدم
export const markAllUserNotificationsAsRead = async (userId) => {
    try {
        const [updatedCount] = await Notification.update(
            {
                isRead: true,
                readAt: new Date()
            },
            {
                where: {
                    userId,
                    isRead: false
                }
            }
        );

        return updatedCount;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return 0;
    }
};

// الحصول على الإشعارات عالية الأولوية للمستخدم
export const getHighPriorityNotifications = async (userId, limit = 5) => {
    try {
        return await Notification.findAll({
            where: {
                userId,
                priority: 'high',
                isRead: false
            },
            order: [['createdAt', 'DESC']],
            limit,
            include: [
                {
                    model: Order,
                    as: 'relatedOrder',
                    attributes: ['id', 'orderNumber', 'totalAmount'],
                    required: false
                },
                {
                    model: Product,
                    as: 'relatedProduct',
                    attributes: ['id', 'name', 'stock'],
                    required: false
                }
            ]
        });
    } catch (error) {
        console.error('Error fetching high priority notifications:', error);
        return [];
    }
};

// إنشاء إشعار مخصص
export const createCustomNotification = async (notificationData) => {
    try {
        // التحقق من صحة البيانات
        const requiredFields = ['userId', 'type', 'title', 'message'];
        const missingFields = requiredFields.filter(field => !notificationData[field]);

        if (missingFields.length > 0) {
            throw new Error(`الحقول المطلوبة مفقودة: ${missingFields.join(', ')}`);
        }

        return await Notification.createNotification(notificationData);
    } catch (error) {
        console.error('Error creating custom notification:', error);
        throw error;
    }
};

export default {
    createOrderNotification,
    createOrderStatusNotification,
    createLowStockNotification,
    createRestockNotification,
    createPaymentNotification,
    createDeliveryNotification,
    createSystemNotification,
    createNewCustomerNotification,
    createBroadcastNotification,
    cleanupExpiredNotifications,
    cleanupOldNotifications,
    getUserNotificationStats,
    markAllUserNotificationsAsRead,
    getHighPriorityNotifications,
    createCustomNotification
}; 