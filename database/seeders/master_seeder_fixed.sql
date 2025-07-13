-- ===========================================
-- Master Seeder - بذر البيانات الكامل (محدث)
-- يشغل جميع seeders بالترتيب الصحيح مع كلمات المرور الصحيحة
-- ===========================================

-- معلومات النظام
SELECT '🌱 بدء عملية بذر البيانات الكاملة مع كلمات المرور الصحيحة...' AS message;
SELECT CONCAT('التاريخ: ', NOW()) AS current_time;
SELECT 'العملة الافتراضية: EUR (يورو)' AS currency_info;
SELECT 'العملة الثانوية: SYP (ليرة سورية)' AS secondary_currency_info;

-- ===========================================
-- 1. بذر المستخدمين (Users) - محدث
-- ===========================================

SELECT '📥 1/8 - بذر بيانات المستخدمين مع كلمات المرور الصحيحة...' AS step;
SOURCE database/seeders/01_users_seeder_fixed.sql;

-- ===========================================
-- 2. بذر المنتجات (Products)  
-- ===========================================

SELECT '📥 2/8 - بذر بيانات المنتجات...' AS step;
SOURCE database/seeders/02_products_seeder.sql;

-- ===========================================
-- 3. بذر الموزعين (Distributors)
-- ===========================================

SELECT '📥 3/8 - بذر بيانات الموزعين...' AS step;
SOURCE database/seeders/03_distributors_seeder.sql;

-- ===========================================
-- 4. بذر المحلات (Stores)
-- ===========================================

SELECT '📥 4/8 - بذر بيانات المحلات...' AS step;
SOURCE database/seeders/04_stores_seeder.sql;

-- ===========================================
-- 5. بذر الطلبات (Orders)
-- ===========================================

SELECT '📥 5/8 - بذر بيانات الطلبات...' AS step;
SOURCE database/seeders/05_orders_seeder.sql;

-- ===========================================
-- 6. بذر رحلات التوزيع (Distribution Trips)
-- ===========================================

SELECT '📥 6/8 - بذر بيانات رحلات التوزيع...' AS step;
SOURCE database/seeders/06_distribution_trips_seeder.sql;

-- ===========================================
-- 7. بذر المدفوعات (Payments)
-- ===========================================

SELECT '📥 7/8 - بذر بيانات المدفوعات...' AS step;
SOURCE database/seeders/07_payments_seeder.sql;

-- ===========================================
-- 8. بذر الإشعارات (Notifications)
-- ===========================================

SELECT '📥 8/8 - بذر بيانات الإشعارات...' AS step;
SOURCE database/seeders/08_notifications_seeder.sql;

-- ===========================================
-- تقرير نهائي شامل
-- ===========================================

SELECT '✅ تم إكمال عملية بذر البيانات بنجاح مع كلمات المرور الصحيحة!' AS final_status;

-- إحصائيات شاملة
SELECT 
    'إحصائيات النظام' AS section,
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM products) AS total_products,
    (SELECT COUNT(*) FROM distributors) AS total_distributors,
    (SELECT COUNT(*) FROM stores) AS total_stores,
    (SELECT COUNT(*) FROM orders) AS total_orders,
    (SELECT COUNT(*) FROM distribution_trips) AS total_trips,
    (SELECT COUNT(*) FROM payments) AS total_payments,
    (SELECT COUNT(*) FROM notifications) AS total_notifications;

-- إحصائيات مالية
SELECT 
    'الإحصائيات المالية' AS section,
    CONCAT(ROUND(SUM(total_purchases_eur), 2), ' EUR') AS total_sales_eur,
    CONCAT(FORMAT(SUM(total_purchases_syp), 0), ' SYP') AS total_sales_syp,
    CONCAT(ROUND(SUM(current_balance_eur), 2), ' EUR') AS total_outstanding_eur,
    CONCAT(FORMAT(SUM(current_balance_syp), 0), ' SYP') AS total_outstanding_syp,
    CONCAT(ROUND(AVG(performance_rating), 2), '/5') AS avg_store_rating
FROM stores 
WHERE status = 'active';

-- حالة المستخدمين
SELECT 
    'توزيع المستخدمين' AS section,
    role AS 'الدور',
    COUNT(*) AS 'العدد',
    status AS 'الحالة'
FROM users 
GROUP BY role, status
ORDER BY role;

-- حالة المحلات
SELECT 
    'توزيع المحلات' AS section,
    category AS 'الفئة',
    COUNT(*) AS 'العدد',
    ROUND(AVG(performance_rating), 2) AS 'متوسط التقييم'
FROM stores 
WHERE status = 'active'
GROUP BY category
ORDER BY COUNT(*) DESC;

-- أداء الموزعين
SELECT 
    'أداء الموزعين' AS section,
    d.name AS 'الموزع',
    COUNT(s.id) AS 'عدد المحلات',
    d.status AS 'الحالة',
    CONCAT(d.commission_rate, '%') AS 'العمولة'
FROM distributors d
LEFT JOIN stores s ON d.id = s.assigned_distributor_id
GROUP BY d.id, d.name, d.status, d.commission_rate
ORDER BY COUNT(s.id) DESC;

SELECT '🎉 النظام جاهز للاستخدام مع بيانات تجريبية كاملة!' AS completion_message;
SELECT '👤 حساب المدير: admin@bakery.com / admin123' AS admin_info;
SELECT '🔐 كلمات المرور محدثة مع bcrypt 12 salt rounds' AS password_info;
SELECT '💰 العملة الافتراضية: EUR (يورو)' AS currency_reminder;
SELECT '🗓️ التقويم: ميلادي' AS calendar_info; 