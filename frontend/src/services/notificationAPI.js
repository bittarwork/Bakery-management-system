import apiClient from './apiClient';

class NotificationAPI {
    // الحصول على جميع الإشعارات
    async getNotifications(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.filter) queryParams.append('filter', params.filter);
            if (params.sortBy) queryParams.append('sortBy', params.sortBy);
            if (params.type) queryParams.append('type', params.type);

            const response = await apiClient.get(`/notifications?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('خطأ في جلب الإشعارات:', error);
            throw error;
        }
    }

    // تعيين إشعار كمقروء
    async markAsRead(notificationId) {
        try {
            const response = await apiClient.patch(`/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            console.error('خطأ في تعيين الإشعار كمقروء:', error);
            throw error;
        }
    }

    // تعيين إشعار كغير مقروء
    async markAsUnread(notificationId) {
        try {
            const response = await apiClient.patch(`/notifications/${notificationId}/unread`);
            return response.data;
        } catch (error) {
            console.error('خطأ في تعيين الإشعار كغير مقروء:', error);
            throw error;
        }
    }

    // تعيين جميع الإشعارات كمقروءة
    async markAllAsRead() {
        try {
            const response = await apiClient.patch('/notifications/mark-all-read');
            return response.data;
        } catch (error) {
            console.error('خطأ في تعيين جميع الإشعارات كمقروءة:', error);
            throw error;
        }
    }

    // حذف إشعار
    async deleteNotification(notificationId) {
        try {
            const response = await apiClient.delete(`/notifications/${notificationId}`);
            return response.data;
        } catch (error) {
            console.error('خطأ في حذف الإشعار:', error);
            throw error;
        }
    }

    // حذف جميع الإشعارات المقروءة
    async clearReadNotifications() {
        try {
            const response = await apiClient.delete('/notifications/clear-read');
            return response.data;
        } catch (error) {
            console.error('خطأ في حذف الإشعارات المقروءة:', error);
            throw error;
        }
    }

    // حذف جميع الإشعارات
    async clearAllNotifications() {
        try {
            const response = await apiClient.delete('/notifications/clear-all');
            return response.data;
        } catch (error) {
            console.error('خطأ في حذف جميع الإشعارات:', error);
            throw error;
        }
    }

    // الحصول على إحصائيات الإشعارات
    async getNotificationStats() {
        try {
            const response = await apiClient.get('/notifications/stats');
            return response.data;
        } catch (error) {
            console.error('خطأ في جلب إحصائيات الإشعارات:', error);
            throw error;
        }
    }

    // الحصول على عدد الإشعارات غير المقروءة
    async getUnreadCount() {
        try {
            const response = await this.getNotifications({ limit: 1, filter: 'unread' });
            return response.data.unreadCount || 0;
        } catch (error) {
            console.error('خطأ في جلب عدد الإشعارات غير المقروءة:', error);
            return 0;
        }
    }

    // إنشاء إشعار جديد (للاختبار أو الإدارة)
    async createNotification(notificationData) {
        try {
            const response = await apiClient.post('/notifications', notificationData);
            return response.data;
        } catch (error) {
            console.error('خطأ في إنشاء الإشعار:', error);
            throw error;
        }
    }

    // تحديث إشعار
    async updateNotification(notificationId, updateData) {
        try {
            const response = await apiClient.patch(`/notifications/${notificationId}`, updateData);
            return response.data;
        } catch (error) {
            console.error('خطأ في تحديث الإشعار:', error);
            throw error;
        }
    }

    // البحث في الإشعارات
    async searchNotifications(searchQuery, filters = {}) {
        try {
            const params = {
                ...filters,
                search: searchQuery
            };
            return await this.getNotifications(params);
        } catch (error) {
            console.error('خطأ في البحث في الإشعارات:', error);
            throw error;
        }
    }

    // الحصول على الإشعارات حسب النوع
    async getNotificationsByType(type, params = {}) {
        try {
            return await this.getNotifications({ ...params, type });
        } catch (error) {
            console.error(`خطأ في جلب إشعارات ${type}:`, error);
            throw error;
        }
    }

    // الحصول على الإشعارات عالية الأولوية
    async getHighPriorityNotifications(params = {}) {
        try {
            const response = await this.getNotifications({ ...params, priority: 'high' });
            return response;
        } catch (error) {
            console.error('خطأ في جلب الإشعارات عالية الأولوية:', error);
            throw error;
        }
    }

    // تصدير الإشعارات
    async exportNotifications(format = 'json', filters = {}) {
        try {
            const params = new URLSearchParams({ ...filters, format });
            const response = await apiClient.get(`/notifications/export?${params.toString()}`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('خطأ في تصدير الإشعارات:', error);
            throw error;
        }
    }

    // تحديث إعدادات الإشعارات
    async updateNotificationSettings(settings) {
        try {
            const response = await apiClient.patch('/notifications/settings', settings);
            return response.data;
        } catch (error) {
            console.error('خطأ في تحديث إعدادات الإشعارات:', error);
            throw error;
        }
    }

    // الحصول على إعدادات الإشعارات
    async getNotificationSettings() {
        try {
            const response = await apiClient.get('/notifications/settings');
            return response.data;
        } catch (error) {
            console.error('خطأ في جلب إعدادات الإشعارات:', error);
            throw error;
        }
    }

    // تسجيل الاشتراك في الإشعارات الفورية (WebSocket)
    subscribeToRealTimeNotifications(callback) {
        // سيتم تطبيق هذا لاحقاً مع WebSocket
        console.log('تسجيل الاشتراك في الإشعارات الفورية');

        // مثال على كيفية التطبيق:
        // const socket = io('/notifications');
        // socket.on('new-notification', callback);
        // return () => socket.disconnect();
    }

    // إلغاء الاشتراك في الإشعارات الفورية
    unsubscribeFromRealTimeNotifications() {
        console.log('إلغاء الاشتراك من الإشعارات الفورية');
    }

    // دوال مساعدة لتنسيق البيانات
    formatNotificationTime(timestamp) {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diff = now - notificationTime;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        return `منذ ${days} يوم`;
    }

    getNotificationIcon(type) {
        const icons = {
            order: '📋',
            inventory: '⚠️',
            delivery: '✅',
            payment: '💰',
            system: '🔄',
            customer: '👤'
        };
        return icons[type] || '📢';
    }

    getNotificationColor(type) {
        const colors = {
            order: 'green',
            inventory: 'orange',
            delivery: 'blue',
            payment: 'purple',
            system: 'gray',
            customer: 'indigo'
        };
        return colors[type] || 'gray';
    }

    getPriorityColor(priority) {
        const colors = {
            high: 'red',
            normal: 'blue',
            low: 'gray'
        };
        return colors[priority] || 'gray';
    }

    // دالة لتجميع الإشعارات حسب النوع
    groupNotificationsByType(notifications) {
        return notifications.reduce((groups, notification) => {
            const type = notification.type;
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(notification);
            return groups;
        }, {});
    }

    // دالة لتجميع الإشعارات حسب التاريخ
    groupNotificationsByDate(notifications) {
        return notifications.reduce((groups, notification) => {
            const date = new Date(notification.createdAt).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(notification);
            return groups;
        }, {});
    }

    // دالة للتحقق من صحة بيانات الإشعار
    validateNotificationData(data) {
        const required = ['title', 'message', 'type'];
        const missing = required.filter(field => !data[field]);

        if (missing.length > 0) {
            throw new Error(`الحقول المطلوبة مفقودة: ${missing.join(', ')}`);
        }

        const validTypes = ['order', 'inventory', 'delivery', 'payment', 'system', 'customer'];
        if (!validTypes.includes(data.type)) {
            throw new Error(`نوع الإشعار غير صحيح: ${data.type}`);
        }

        const validPriorities = ['low', 'normal', 'high'];
        if (data.priority && !validPriorities.includes(data.priority)) {
            throw new Error(`مستوى الأولوية غير صحيح: ${data.priority}`);
        }

        return true;
    }
}

// إنشاء مثيل واحد من الخدمة
const notificationAPI = new NotificationAPI();

export default notificationAPI; 