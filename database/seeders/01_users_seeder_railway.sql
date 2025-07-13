-- ===========================================
-- Seeder للمستخدمين (Users) - محدث لقاعدة البيانات railway
-- تشمل: Admin, Managers, Distributors, Store Owners
-- كلمات المرور مشفرة باستخدام bcrypt مع 12 salt rounds
-- ===========================================

USE `railway`;

-- تعطيل فحص المفاتيح الخارجية مؤقتاً
SET FOREIGN_KEY_CHECKS = 0;

-- مسح البيانات الموجودة
DELETE FROM `users`;

-- إعادة تعيين AUTO_INCREMENT
ALTER TABLE `users` AUTO_INCREMENT = 1;

-- إدراج المستخدمين مع كلمات المرور المشفرة الصحيحة
INSERT INTO `users` (
    `username`, `email`, `password`, `full_name`, `phone`, `role`, `status`,
    `salary_eur`, `salary_syp`, `commission_rate`, `vehicle_info`,
    `total_trips`, `completed_trips`, `total_sales_eur`, `total_sales_syp`,
    `performance_rating`, `email_verified`, `created_by_name`
) VALUES 
-- 1. حساب المدير
(
    'admin', 'admin@bakery.com', 
    '$2b$12$AmfYgU0d5qjuiBLyrEsJkeZElf1x3k2EqHDOz9rewiWY9cKX2hTmO', -- admin123
    'مدير النظام', '+32-123-456-789', 'admin', 'active',
    NULL, NULL, NULL, NULL,
    0, 0, 0.00, 0.00, 5.00, TRUE, 'System'
),

-- 2. مدير العمليات
(
    'operations_manager', 'operations@bakery.com',
    '$2b$12$AmfYgU0d5qjuiBLyrEsJkeZElf1x3k2EqHDOz9rewiWY9cKX2hTmO', -- admin123
    'أحمد حسن - مدير العمليات', '+32-123-456-790', 'manager', 'active',
    2500.00, 4500000.00, NULL, NULL,
    0, 0, 0.00, 0.00, 4.80, TRUE, 'مدير النظام'
),

-- 3. مدير المحاسبة
(
    'accountant', 'accounting@bakery.com',
    '$2b$12$AmfYgU0d5qjuiBLyrEsJkeZElf1x3k2EqHDOz9rewiWY9cKX2hTmO', -- admin123
    'فاطمة علي - محاسبة', '+32-123-456-791', 'accountant', 'active',
    2200.00, 4000000.00, NULL, NULL,
    0, 0, 0.00, 0.00, 4.90, TRUE, 'مدير النظام'
),

-- 4. الموزعين
(
    'distributor1', 'distributor1@bakery.com',
    '$2b$12$lQ2GfmlnubgQwHYqW11EZ.KwbJg2dbrySlwgAKOqUBYpXKwW1hqfa', -- distributor123
    'محمد السوري - موزع المنطقة الشمالية', '+32-123-456-792', 'distributor', 'active',
    1800.00, 3200000.00, 2.50, 
    '{"type": "van", "plate": "BXL-123", "capacity": "2000kg", "fuel_type": "diesel"}',
    45, 42, 15750.00, 28500000.00, 4.75, TRUE, 'مدير النظام'
),

(
    'distributor2', 'distributor2@bakery.com',
    '$2b$12$lQ2GfmlnubgQwHYqW11EZ.KwbJg2dbrySlwgAKOqUBYpXKwW1hqfa', -- distributor123
    'علي المغربي - موزع المنطقة الجنوبية', '+32-123-456-793', 'distributor', 'active',
    1800.00, 3200000.00, 2.75,
    '{"type": "truck", "plate": "BXL-456", "capacity": "3000kg", "fuel_type": "diesel"}',
    38, 35, 18200.00, 32800000.00, 4.60, TRUE, 'مدير النظام'
),

(
    'distributor3', 'distributor3@bakery.com',
    '$2b$12$lQ2GfmlnubgQwHYqW11EZ.KwbJg2dbrySlwgAKOqUBYpXKwW1hqfa', -- distributor123
    'خالد التونسي - موزع المنطقة الشرقية', '+32-123-456-794', 'distributor', 'active',
    1750.00, 3100000.00, 2.25,
    '{"type": "van", "plate": "BXL-789", "capacity": "1800kg", "fuel_type": "diesel"}',
    52, 48, 12800.00, 23000000.00, 4.85, TRUE, 'مدير النظام'
),

-- 5. أصحاب المحلات (سيتم ربطهم بالمحلات لاحقاً)
(
    'store_owner1', 'owner1@example.com',
    '$2b$12$T1kEh6BcQU.D62PrZDt1z.xApz2pp82TGuNIs5HrYLIFt.RlqLQAq', -- store123
    'عبدالله بن سعد - مالك سوبرماركت الأمل', '+32-123-456-795', 'store_owner', 'active',
    NULL, NULL, NULL, NULL,
    0, 0, 0.00, 0.00, 4.50, TRUE, 'مدير النظام'
),

(
    'store_owner2', 'owner2@example.com',
    '$2b$12$T1kEh6BcQU.D62PrZDt1z.xApz2pp82TGuNIs5HrYLIFt.RlqLQAq', -- store123
    'مريم الخضراء - مالكة مقهى الياسمين', '+32-123-456-796', 'store_owner', 'active',
    NULL, NULL, NULL, NULL,
    0, 0, 0.00, 0.00, 4.20, TRUE, 'مدير النظام'
),

(
    'store_owner3', 'owner3@example.com',
    '$2b$12$T1kEh6BcQU.D62PrZDt1z.xApz2pp82TGuNIs5HrYLIFt.RlqLQAq', -- store123
    'حسام الدين - مالك مطعم دمشق', '+32-123-456-797', 'store_owner', 'active',
    NULL, NULL, NULL, NULL,
    0, 0, 0.00, 0.00, 4.70, TRUE, 'مدير النظام'
);

-- إعادة تشغيل فحص المفاتيح الخارجية
SET FOREIGN_KEY_CHECKS = 1;

-- تأكيد البيانات
SELECT '✅ تم إدراج بيانات المستخدمين بنجاح مع كلمات المرور الصحيحة' AS status;
SELECT 
    CONCAT('إجمالي المستخدمين: ', COUNT(*)) AS total_users,
    CONCAT('المدراء: ', SUM(CASE WHEN role IN ('admin', 'manager') THEN 1 ELSE 0 END)) AS managers,
    CONCAT('الموزعين: ', SUM(CASE WHEN role = 'distributor' THEN 1 ELSE 0 END)) AS distributors,
    CONCAT('أصحاب المحلات: ', SUM(CASE WHEN role = 'store_owner' THEN 1 ELSE 0 END)) AS store_owners
FROM users;

-- معلومات تسجيل الدخول
SELECT '🔐 معلومات تسجيل الدخول:' AS login_info;
SELECT 
    username AS 'اسم المستخدم',
    email AS 'البريد الإلكتروني',
    CASE 
        WHEN role = 'admin' THEN 'admin123'
        WHEN role = 'distributor' THEN 'distributor123'
        WHEN role = 'store_owner' THEN 'store123'
        ELSE 'admin123'
    END AS 'كلمة المرور',
    role AS 'الدور'
FROM users
ORDER BY role; 