import { initializeModels } from '../models/index.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const seedNotifications = async () => {
    try {
        console.log('🔄 بدء إنشاء الإشعارات التجريبية...');

        // تهيئة النماذج
        await initializeModels();

        // البحث عن أول مستخدم في النظام
        const user = await User.findOne();

        if (!user) {
            console.log('❌ لا يوجد مستخدمين في النظام. يرجى إنشاء مستخدم أولاً.');
            return;
        }

        console.log(`📝 إنشاء إشعارات للمستخدم: ${user.username || user.email}`);

        // حذف الإشعارات الموجودة للمستخدم (للاختبار)
        await Notification.destroy({
            where: { userId: user.id }
        });

        // إنشاء إشعارات تجريبية متنوعة
        const sampleNotifications = [
            {
                userId: user.id,
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
                userId: user.id,
                type: 'inventory',
                priority: 'high',
                title: 'تحذير نفاد المخزون',
                message: 'خبز التوست أوشك على النفاد - متبقي 3 قطع فقط من أصل 50',
                icon: '⚠️',
                actionUrl: '/products/1',
                metadata: {
                    productName: 'خبز التوست',
                    currentStock: 3,
                    minStock: 10
                }
            },
            {
                userId: user.id,
                type: 'inventory',
                priority: 'high',
                title: 'نفاد المخزون',
                message: 'كعك الشوكولاتة نفد من المخزون تماماً',
                icon: '❌',
                actionUrl: '/products/2',
                metadata: {
                    productName: 'كعك الشوكولاتة',
                    currentStock: 0,
                    minStock: 5
                }
            },
            {
                userId: user.id,
                type: 'delivery',
                priority: 'normal',
                title: 'تم التسليم بنجاح',
                message: 'تم تسليم الطلب #1000 بنجاح للعميل فاطمة علي',
                icon: '✅',
                actionUrl: '/orders/1000',
                isRead: true,
                readAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // قبل ساعتين
                metadata: {
                    orderNumber: '1000',
                    customerName: 'فاطمة علي'
                }
            },
            {
                userId: user.id,
                type: 'delivery',
                priority: 'high',
                title: 'فشل في التوصيل',
                message: 'فشل توصيل الطلب #1002 - العميل غير متواجد',
                icon: '❌',
                actionUrl: '/orders/1002',
                metadata: {
                    orderNumber: '1002',
                    customerName: 'محمد سالم',
                    reason: 'العميل غير متواجد'
                }
            },
            {
                userId: user.id,
                type: 'payment',
                priority: 'normal',
                title: 'دفعة جديدة مستلمة',
                message: 'تم استلام دفعة بقيمة 500 ريال من سارة أحمد عبر بطاقة ائتمان',
                icon: '💰',
                actionUrl: '/payments/123',
                isRead: true,
                readAt: new Date(Date.now() - 30 * 60 * 1000), // قبل 30 دقيقة
                metadata: {
                    amount: 500,
                    customerName: 'سارة أحمد',
                    paymentMethod: 'بطاقة ائتمان'
                }
            },
            {
                userId: user.id,
                type: 'payment',
                priority: 'high',
                title: 'فشل في الدفع',
                message: 'فشل في دفع مبلغ 300 ريال - بطاقة منتهية الصلاحية',
                icon: '❌',
                actionUrl: '/payments/124',
                metadata: {
                    amount: 300,
                    customerName: 'خالد أحمد',
                    paymentMethod: 'بطاقة ائتمان',
                    reason: 'بطاقة منتهية الصلاحية'
                }
            },
            {
                userId: user.id,
                type: 'system',
                priority: 'normal',
                title: 'تحديث النظام مكتمل',
                message: 'تم تحديث النظام إلى الإصدار 2.1.0 بنجاح مع إضافة ميزات جديدة',
                icon: '🔄',
                actionUrl: '/system/updates',
                isRead: true,
                readAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // قبل يوم
                metadata: {
                    version: '2.1.0',
                    features: ['تحسينات الأداء', 'واجهة محسنة', 'إصلاح أخطاء']
                }
            },
            {
                userId: user.id,
                type: 'system',
                priority: 'high',
                title: 'تحذير أمني',
                message: 'تم اكتشاف محاولة دخول مشبوهة من عنوان IP غير معروف',
                icon: '🔒',
                actionUrl: '/security/logs',
                metadata: {
                    ipAddress: '192.168.1.100',
                    location: 'غير معروف',
                    timestamp: new Date()
                }
            },
            {
                userId: user.id,
                type: 'customer',
                priority: 'low',
                title: 'عميل جديد مسجل',
                message: 'انضم عميل جديد: محمد سالم إلى قائمة العملاء',
                icon: '👤',
                actionUrl: '/customers/new',
                metadata: {
                    customerName: 'محمد سالم',
                    registrationDate: new Date()
                }
            },
            {
                userId: user.id,
                type: 'customer',
                priority: 'normal',
                title: 'عيد ميلاد عميل',
                message: 'عيد ميلاد سعيد للعميل نورا أحمد اليوم! 🎉',
                icon: '🎂',
                actionUrl: '/customers/nora',
                metadata: {
                    customerName: 'نورا أحمد',
                    birthday: new Date()
                }
            },
            {
                userId: user.id,
                type: 'order',
                priority: 'normal',
                title: 'طلب جاهز للاستلام',
                message: 'الطلب #999 جاهز للاستلام - يرجى إشعار العميل',
                icon: '📦',
                actionUrl: '/orders/999',
                metadata: {
                    orderNumber: '999',
                    customerName: 'علي محمد',
                    status: 'ready'
                }
            }
        ];

        // إنشاء الإشعارات
        const createdNotifications = await Notification.bulkCreate(sampleNotifications);

        console.log(`✅ تم إنشاء ${createdNotifications.length} إشعار تجريبي بنجاح`);

        // إحصائيات الإشعارات المنشأة
        const stats = await Notification.findAll({
            where: { userId: user.id },
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

        console.log('\n📊 إحصائيات الإشعارات:');
        console.table(stats);

        const totalUnread = await Notification.count({
            where: {
                userId: user.id,
                isRead: false
            }
        });

        console.log(`\n🔔 إجمالي الإشعارات غير المقروءة: ${totalUnread}`);

    } catch (error) {
        console.error('❌ خطأ في إنشاء الإشعارات التجريبية:', error);
    } finally {
        process.exit(0);
    }
};

// تشغيل السكريبت
seedNotifications(); 