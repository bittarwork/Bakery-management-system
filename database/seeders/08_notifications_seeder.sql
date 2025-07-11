-- ===========================================
-- Seeder للإشعارات (Notifications)
-- يشمل: إشعارات متنوعة للمستخدمين
-- ===========================================

USE `bakery_db_test`;

-- تعطيل فحص المفاتيح الخارجية مؤقتاً
SET FOREIGN_KEY_CHECKS = 0;

-- مسح البيانات الموجودة
DELETE FROM `notifications`;

-- إعادة تعيين AUTO_INCREMENT
ALTER TABLE `notifications` AUTO_INCREMENT = 1;

-- إدراج الإشعارات
INSERT INTO `notifications` (
    `user_id`, `type`, `priority`, `title`, `message`, `icon`,
    `is_read`, `read_at`, `action_url`, `metadata`,
    `related_order_id`, `related_product_id`, `related_payment_id`, `sender_id`
) VALUES 
-- إشعارات للمدير (user_id = 1)
(1, 'system', 'high', 'مرحباً بك في نظام إدارة المخبزة', 
 'تم تفعيل النظام بنجاح ويمكنك الآن إدارة جميع العمليات', '🎉',
 FALSE, NULL, '/dashboard', 
 '{"notification_type": "welcome", "system_version": "2024.1"}',
 NULL, NULL, NULL, NULL),

(1, 'payment', 'high', 'مدفوعة معلقة تحتاج موافقة',
 'مدفوعة متجر المطار بقيمة 580.20 EUR في انتظار التحقق البنكي', '💰',
 FALSE, NULL, '/payments/PAY-2024-011',
 '{"payment_id": "PAY-2024-011", "amount": 580.20, "currency": "EUR"}',
 11, NULL, 11, 8),

(1, 'order', 'normal', 'طلب جديد من كافيتيريا الجامعة',
 'تم إنشاء طلب جديد ORD-2024-008 بقيمة 400.00 EUR', '📦',
 TRUE, '2024-03-13 14:30:00', '/orders/8',
 '{"order_number": "ORD-2024-008", "store_name": "كافيتيريا جامعة بروكسل"}',
 8, NULL, NULL, 6),

-- إشعارات للموزع محمد السوري (user_id = 4)
(4, 'delivery', 'high', 'رحلة توزيع جديدة',
 'تم تخصيص رحلة توزيع جديدة لك تشمل 3 محلات في المنطقة الشمالية', '🚚',
 FALSE, NULL, '/distribution/trips',
 '{"trip_date": "2024-03-17", "stores_count": 3, "region": "north"}',
 NULL, NULL, NULL, 2),

(4, 'payment', 'normal', 'تم تحصيل مدفوعة نقدية',
 'تم تحصيل 180.00 EUR نقداً من مقهى الياسمين', '💵',
 TRUE, '2024-03-11 16:05:00', '/payments/PAY-2024-003',
 '{"amount": 180.00, "store": "مقهى الياسمين", "method": "cash"}',
 3, NULL, 3, NULL),

-- إشعارات للموزع علي المغربي (user_id = 5)
(5, 'customer', 'normal', 'عميل جديد في منطقتك',
 'تمت إضافة بقالة الحي الصغيرة كعميل جديد في المنطقة الجنوبية', '🏪',
 FALSE, NULL, '/stores/4',
 '{"store_id": 4, "store_name": "بقالة الحي الصغيرة", "region": "south"}',
 NULL, NULL, NULL, 1),

(5, 'delivery', 'high', 'طلب عاجل من مطعم دمشق',
 'طلب عاجل يحتاج توصيل اليوم - مطعم دمشق', '🔥',
 TRUE, '2024-03-15 09:15:00', '/orders/5',
 '{"urgency": "high", "delivery_date": "2024-03-15"}',
 5, NULL, NULL, 1),

-- إشعارات للموزع خالد التونسي (user_id = 6)
(6, 'system', 'normal', 'تحديث تطبيق الموزعين',
 'متوفر تحديث جديد لتطبيق الموزعين مع ميزات محسنة لتتبع GPS', '📱',
 FALSE, NULL, '/mobile-app-update',
 '{"version": "2.1.0", "features": ["GPS tracking", "Offline mode"]}',
 NULL, NULL, NULL, NULL),

(6, 'payment', 'normal', 'دفعة فندق بلجيكا مكتملة',
 'تم تأكيد استلام مدفوعة فندق بلجيكا الذهبي بقيمة 620.00 EUR', '✅',
 TRUE, '2024-03-13 12:30:00', '/payments/PAY-2024-006',
 '{"payment_confirmed": true, "verification_status": "verified"}',
 7, NULL, 6, 3),

-- إشعارات للمحاسبة (user_id = 3)
(3, 'payment', 'high', 'مدفوعة مرفوضة تحتاج متابعة',
 'مدفوعة كافيتيريا الجامعة مرفوضة بسبب عدم كفاية الرصيد', '❌',
 FALSE, NULL, '/payments/PAY-2024-012',
 '{"rejection_reason": "Insufficient funds", "requires_action": true}',
 8, NULL, 12, 6),

(3, 'system', 'normal', 'تقرير مالي شهري جاهز',
 'تم إنتاج التقرير المالي لشهر مارس 2024 بنجاح', '📊',
 FALSE, NULL, '/reports/monthly/2024-03',
 '{"report_type": "monthly", "period": "2024-03", "total_sales": "3500.00 EUR"}',
 NULL, NULL, NULL, NULL),

-- إشعارات لمدير العمليات (user_id = 2)
(2, 'inventory', 'normal', 'نفاد مخزون منتج',
 'منتج "كعك عيد الميلاد" أوشك على النفاد - متبقي 5 قطع فقط', '⚠️',
 FALSE, NULL, '/products/22',
 '{"product_name": "كعك عيد الميلاد", "remaining_stock": 5, "reorder_level": 10}',
 NULL, 22, NULL, NULL),

(2, 'system', 'low', 'نسخ احتياطي يومية مكتملة',
 'تم إنشاء النسخة الاحتياطية اليومية لقاعدة البيانات بنجاح', '💾',
 TRUE, '2024-03-16 02:00:00', '/system/backups',
 '{"backup_date": "2024-03-16", "size": "45.2 MB", "status": "success"}',
 NULL, NULL, NULL, NULL),

-- إشعارات عامة للجميع
(4, 'system', 'normal', 'اجتماع فريق التوزيع',
 'اجتماع أسبوعي لفريق التوزيع يوم الاثنين الساعة 9 صباحاً', '👥',
 FALSE, NULL, '/meetings/weekly',
 '{"meeting_date": "2024-03-18", "time": "09:00", "location": "مكتب الإدارة"}',
 NULL, NULL, NULL, 2),

(5, 'customer', 'low', 'تقييم إيجابي من عميل',
 'حصلت على تقييم 5 نجوم من سوبرماركت الأمل - أحسنت!', '⭐',
 TRUE, '2024-03-14 18:00:00', '/reviews/positive',
 '{"rating": 5, "store": "سوبرماركت الأمل", "comment": "خدمة ممتازة وتوصيل سريع"}',
 1, NULL, NULL, NULL);

-- إعادة تشغيل فحص المفاتيح الخارجية
SET FOREIGN_KEY_CHECKS = 1;

-- تأكيد البيانات
SELECT '✅ تم إدراج بيانات الإشعارات بنجاح' AS status;

-- إحصائيات الإشعارات
SELECT 
    CONCAT('إجمالي الإشعارات: ', COUNT(*)) AS total_notifications,
    CONCAT('المقروءة: ', SUM(CASE WHEN is_read = TRUE THEN 1 ELSE 0 END)) AS read_notifications,
    CONCAT('غير المقروءة: ', SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END)) AS unread_notifications,
    CONCAT('عالية الأولوية: ', SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END)) AS high_priority
FROM notifications;

-- توزيع الإشعارات حسب النوع
SELECT 
    type AS 'نوع الإشعار',
    COUNT(*) AS 'العدد',
    SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) AS 'غير مقروءة',
    SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) AS 'عالية الأولوية'
FROM notifications
GROUP BY type
ORDER BY COUNT(*) DESC;

-- إشعارات المستخدمين
SELECT 
    u.full_name AS 'المستخدم',
    COUNT(n.id) AS 'إجمالي الإشعارات',
    SUM(CASE WHEN n.is_read = FALSE THEN 1 ELSE 0 END) AS 'غير مقروءة',
    SUM(CASE WHEN n.priority = 'high' THEN 1 ELSE 0 END) AS 'عالية الأولوية'
FROM users u
LEFT JOIN notifications n ON u.id = n.user_id
GROUP BY u.id, u.full_name
HAVING COUNT(n.id) > 0
ORDER BY COUNT(n.id) DESC; 