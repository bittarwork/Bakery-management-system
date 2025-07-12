import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    // معرف المستخدم المستلم للإشعار
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        field: 'user_id'
    },

    // نوع الإشعار
    type: {
        type: DataTypes.ENUM('order', 'inventory', 'delivery', 'payment', 'system', 'customer'),
        allowNull: false
    },

    // مستوى الأولوية
    priority: {
        type: DataTypes.ENUM('low', 'normal', 'high'),
        defaultValue: 'normal'
    },

    // عنوان الإشعار
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },

    // محتوى الإشعار
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    // الأيقونة (emoji أو اسم الأيقونة)
    icon: {
        type: DataTypes.STRING(10),
        defaultValue: '📢'
    },

    // حالة القراءة
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_read'
    },

    // تاريخ القراءة
    readAt: {
        type: DataTypes.DATE,
        field: 'read_at'
    },

    // رابط الإجراء (الصفحة المرتبطة)
    actionUrl: {
        type: DataTypes.STRING(500),
        field: 'action_url'
    },

    // البيانات الإضافية (JSON)
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
    },

    // المراجع للكائنات المرتبطة
    relatedOrderId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Orders',
            key: 'id'
        },
        field: 'related_order_id'
    },

    relatedProductId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Products',
            key: 'id'
        },
        field: 'related_product_id'
    },

    relatedCustomerId: {
        type: DataTypes.INTEGER,
        field: 'related_customer_id'
    },

    relatedPaymentId: {
        type: DataTypes.INTEGER,
        field: 'related_payment_id'
    },

    // تاريخ انتهاء الصلاحية (للإشعارات المؤقتة)
    expiresAt: {
        type: DataTypes.DATE,
        field: 'expires_at'
    },

    // معرف المرسل (للإشعارات من المستخدمين)
    senderId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'id'
        },
        field: 'sender_id'
    },

    // حالة الإشعار
    status: {
        type: DataTypes.ENUM('active', 'archived', 'deleted'),
        defaultValue: 'active'
    }
}, {
    tableName: 'notifications',
    timestamps: true,
    indexes: [
        {
            fields: ['user_id', 'is_read']
        },
        {
            fields: ['user_id', 'type']
        },
        {
            fields: ['user_id', 'priority']
        },
        {
            fields: ['user_id', 'created_at']
        },
        {
            fields: ['expires_at']
        }
    ]
});

// Virtual للحصول على الوقت النسبي
Notification.prototype.getTimeAgo = function () {
    const now = new Date();
    const diff = now - this.createdAt;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
};

// Virtual للحصول على لون النوع
Notification.prototype.getTypeColor = function () {
    const colors = {
        order: 'green',
        inventory: 'orange',
        delivery: 'blue',
        payment: 'purple',
        system: 'gray',
        customer: 'indigo'
    };
    return colors[this.type] || 'gray';
};

// دالة لإنشاء إشعار جديد
Notification.createNotification = async function (data) {
    try {
        const notification = await this.create(data);

        // يمكن إضافة إرسال إشعار فوري هنا (WebSocket, Push Notification, etc.)

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// دالة لإنشاء إشعار طلب جديد
Notification.createOrderNotification = async function (userId, order, type = 'new') {
    const titles = {
        new: 'طلب جديد',
        updated: 'تحديث الطلب',
        cancelled: 'إلغاء الطلب',
        completed: 'اكتمال الطلب'
    };

    const messages = {
        new: `تم استلام طلب جديد #${order.orderNumber || order.id} من ${order.customerName || 'عميل'} بقيمة ${order.totalAmount} ريال`,
        updated: `تم تحديث الطلب #${order.orderNumber || order.id}`,
        cancelled: `تم إلغاء الطلب #${order.orderNumber || order.id}`,
        completed: `تم اكتمال الطلب #${order.orderNumber || order.id} بنجاح`
    };

    const priorities = {
        new: 'high',
        updated: 'normal',
        cancelled: 'normal',
        completed: 'normal'
    };

    return await this.createNotification({
        userId,
        type: 'order',
        priority: priorities[type],
        title: titles[type],
        message: messages[type],
        icon: '📋',
        actionUrl: `/orders/${order.id}`,
        relatedOrderId: order.id,
        metadata: {
            orderNumber: order.orderNumber || order.id,
            customerName: order.customerName,
            totalAmount: order.totalAmount,
            orderType: type
        }
    });
};

// دالة لإنشاء إشعار مخزون
Notification.createInventoryNotification = async function (userId, product, type = 'low_stock') {
    const titles = {
        low_stock: 'تحذير نفاد المخزون',
        out_of_stock: 'نفاد المخزون',
        restock: 'إعادة تعبئة المخزون'
    };

    const messages = {
        low_stock: `${product.name} أوشك على النفاد - متبقي ${product.currentStock || product.stock} قطعة من أصل ${product.minStock || 10} حد أدنى`,
        out_of_stock: `${product.name} نفد من المخزون تماماً`,
        restock: `تم إعادة تعبئة مخزون ${product.name} - الكمية الحالية: ${product.currentStock || product.stock}`
    };

    const priorities = {
        low_stock: 'high',
        out_of_stock: 'high',
        restock: 'normal'
    };

    return await this.createNotification({
        userId,
        type: 'inventory',
        priority: priorities[type],
        title: titles[type],
        message: messages[type],
        icon: type === 'restock' ? '📦' : '⚠️',
        actionUrl: `/products/${product.id}`,
        relatedProductId: product.id,
        metadata: {
            productName: product.name,
            currentStock: product.currentStock || product.stock,
            minStock: product.minStock || 10,
            inventoryType: type
        }
    });
};

// دالة لإنشاء إشعار توصيل
Notification.createDeliveryNotification = async function (userId, order, type = 'delivered') {
    const titles = {
        delivered: 'تم التسليم بنجاح',
        out_for_delivery: 'خرج للتوصيل',
        delivery_failed: 'فشل التوصيل'
    };

    const messages = {
        delivered: `تم تسليم الطلب #${order.orderNumber || order.id} بنجاح للعميل ${order.customerName || 'العميل'}`,
        out_for_delivery: `الطلب #${order.orderNumber || order.id} خرج للتوصيل`,
        delivery_failed: `فشل توصيل الطلب #${order.orderNumber || order.id} - يرجى المتابعة`
    };

    const priorities = {
        delivered: 'normal',
        out_for_delivery: 'normal',
        delivery_failed: 'high'
    };

    return await this.createNotification({
        userId,
        type: 'delivery',
        priority: priorities[type],
        title: titles[type],
        message: messages[type],
        icon: type === 'delivered' ? '✅' : type === 'delivery_failed' ? '❌' : '🚚',
        actionUrl: `/orders/${order.id}`,
        relatedOrderId: order.id,
        metadata: {
            orderNumber: order.orderNumber || order.id,
            customerName: order.customerName,
            deliveryType: type
        }
    });
};

// دالة لإنشاء إشعار دفع
Notification.createPaymentNotification = async function (userId, payment, type = 'received') {
    const titles = {
        received: 'دفعة جديدة مستلمة',
        failed: 'فشل في الدفع',
        refunded: 'تم الاسترداد'
    };

    const messages = {
        received: `تم استلام دفعة بقيمة ${payment.amount} ريال من ${payment.customerName || 'العميل'} عبر ${payment.method}`,
        failed: `فشل في دفع مبلغ ${payment.amount} ريال - يرجى المتابعة`,
        refunded: `تم استرداد مبلغ ${payment.amount} ريال للعميل ${payment.customerName || 'العميل'}`
    };

    const priorities = {
        received: 'normal',
        failed: 'high',
        refunded: 'normal'
    };

    return await this.createNotification({
        userId,
        type: 'payment',
        priority: priorities[type],
        title: titles[type],
        message: messages[type],
        icon: type === 'received' ? '💰' : type === 'failed' ? '❌' : '💸',
        actionUrl: `/payments/${payment.id}`,
        relatedPaymentId: payment.id,
        metadata: {
            amount: payment.amount,
            customerName: payment.customerName,
            paymentMethod: payment.method,
            paymentType: type
        }
    });
};

// دالة لإنشاء إشعار نظام
Notification.createSystemNotification = async function (userId, title, message, priority = 'normal') {
    return await this.createNotification({
        userId,
        type: 'system',
        priority,
        title,
        message,
        icon: '🔄',
        actionUrl: '/system/updates',
        metadata: {
            systemNotification: true
        }
    });
};

// دالة لإنشاء إشعار عميل جديد
Notification.createCustomerNotification = async function (userId, customer, type = 'new') {
    const titles = {
        new: 'عميل جديد مسجل',
        updated: 'تحديث بيانات العميل',
        birthday: 'عيد ميلاد العميل'
    };

    const messages = {
        new: `انضم عميل جديد: ${customer.name} إلى قائمة العملاء`,
        updated: `تم تحديث بيانات العميل ${customer.name}`,
        birthday: `عيد ميلاد سعيد للعميل ${customer.name} اليوم! 🎉`
    };

    return await this.createNotification({
        userId,
        type: 'customer',
        priority: type === 'birthday' ? 'normal' : 'low',
        title: titles[type],
        message: messages[type],
        icon: type === 'birthday' ? '🎂' : '👤',
        actionUrl: `/customers/${customer.id}`,
        relatedCustomerId: customer.id,
        metadata: {
            customerName: customer.name,
            customerType: type
        }
    });
};

// Hook قبل الحفظ
Notification.beforeCreate((notification) => {
    // تعيين أيقونة افتراضية حسب النوع
    if (!notification.icon) {
        const icons = {
            order: '📋',
            inventory: '⚠️',
            delivery: '✅',
            payment: '💰',
            system: '🔄',
            customer: '👤'
        };
        notification.icon = icons[notification.type] || '📢';
    }

    // تعيين رابط افتراضي حسب النوع
    if (!notification.actionUrl) {
        const urls = {
            order: notification.relatedOrderId ? `/orders/${notification.relatedOrderId}` : '/orders',
            inventory: notification.relatedProductId ? `/products/${notification.relatedProductId}` : '/products',
            delivery: notification.relatedOrderId ? `/orders/${notification.relatedOrderId}` : '/orders',
            payment: notification.relatedPaymentId ? `/payments/${notification.relatedPaymentId}` : '/payments',
            system: '/system',
            customer: notification.relatedCustomerId ? `/customers/${notification.relatedCustomerId}` : '/customers'
        };
        notification.actionUrl = urls[notification.type] || '/dashboard';
    }
});

export default Notification; 