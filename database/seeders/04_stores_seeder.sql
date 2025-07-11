-- ===========================================
-- Seeder للمحلات (Stores)
-- يشمل: متنوع من المحلات في مناطق مختلفة
-- ===========================================

USE `bakery_db_test`;

-- تعطيل فحص المفاتيح الخارجية مؤقتاً
SET FOREIGN_KEY_CHECKS = 0;

-- مسح البيانات الموجودة
DELETE FROM `stores`;

-- إعادة تعيين AUTO_INCREMENT
ALTER TABLE `stores` AUTO_INCREMENT = 1;

-- إدراج المحلات
INSERT INTO `stores` (
    `name`, `owner_name`, `phone`, `email`, `address`, `gps_coordinates`,
    `store_type`, `category`, `size_category`, `opening_hours`,
    `credit_limit_eur`, `credit_limit_syp`, `current_balance_eur`, `current_balance_syp`,
    `total_purchases_eur`, `total_purchases_syp`, `total_payments_eur`, `total_payments_syp`,
    `commission_rate`, `payment_terms`, `total_orders`, `completed_orders`,
    `average_order_value_eur`, `average_order_value_syp`, `last_order_date`, `last_payment_date`,
    `performance_rating`, `status`, `preferred_delivery_time`, `special_instructions`,
    `assigned_distributor_id`, `assigned_distributor_name`, `created_by`, `created_by_name`
) VALUES 
-- 1. سوبرماركت الأمل - المنطقة الشمالية
(
    'سوبرماركت الأمل', 'عبدالله بن سعد', '+32-123-456-795', 'amal.supermarket@gmail.com',
    'شارع النور 25، بروكسل الشمالية، بلجيكا',
    '{"latitude": 50.8503, "longitude": 4.3517, "accuracy": "high"}',
    'retail', 'supermarket', 'large',
    '{"monday": "07:00-22:00", "tuesday": "07:00-22:00", "wednesday": "07:00-22:00", "thursday": "07:00-22:00", "friday": "07:00-23:00", "saturday": "07:00-23:00", "sunday": "08:00-21:00"}',
    5000.00, 9000000.00, 1250.00, 2250000.00,
    18500.00, 33300000.00, 17250.00, 31050000.00,
    2.00, 'credit_15_days', 42, 40,
    285.50, 513900.00, '2024-03-15', '2024-03-10',
    4.70, 'active', '07:00-09:00',
    'يفضل التوصيل المبكر، لديه مخزن بارد، يحتاج تنسيق مسبق للكميات الكبيرة',
    1, 'محمد السوري', 1, 'مدير النظام'
),

-- 2. مقهى الياسمين - المنطقة الشمالية
(
    'مقهى الياسمين', 'مريم الخضراء', '+32-123-456-796', 'yasmine.cafe@outlook.com',
    'شارع الربيع 12، بروكسل الشمالية، بلجيكا',
    '{"latitude": 50.8485, "longitude": 4.3525, "accuracy": "high"}',
    'restaurant', 'cafe', 'medium',
    '{"monday": "06:00-20:00", "tuesday": "06:00-20:00", "wednesday": "06:00-20:00", "thursday": "06:00-20:00", "friday": "06:00-22:00", "saturday": "07:00-22:00", "sunday": "07:00-19:00"}',
    1500.00, 2700000.00, 320.00, 576000.00,
    8750.00, 15750000.00, 8430.00, 15174000.00,
    3.50, 'credit_7_days', 28, 27,
    165.20, 297360.00, '2024-03-14', '2024-03-12',
    4.50, 'active', '06:00-08:00',
    'يطلب المنتجات الطازجة يومياً، يفضل الخبز الفرنسي والكرواسان',
    1, 'محمد السوري', 1, 'مدير النظام'
),

-- 3. مطعم دمشق - المنطقة الجنوبية
(
    'مطعم دمشق', 'حسام الدين', '+32-123-456-797', 'damascus.restaurant@hotmail.com',
    'شارع الشام 45، بروكسل الجنوبية، بلجيكا',
    '{"latitude": 50.8263, "longitude": 4.3406, "accuracy": "high"}',
    'restaurant', 'restaurant', 'large',
    '{"monday": "11:00-23:00", "tuesday": "11:00-23:00", "wednesday": "11:00-23:00", "thursday": "11:00-23:00", "friday": "11:00-00:00", "saturday": "11:00-00:00", "sunday": "12:00-22:00"}',
    3000.00, 5400000.00, 850.00, 1530000.00,
    12400.00, 22320000.00, 11550.00, 20790000.00,
    2.75, 'credit_30_days', 35, 33,
    220.80, 397440.00, '2024-03-13', '2024-03-08',
    4.60, 'active', '10:00-11:00',
    'يحتاج خبز شرقي وفطائر، توصيل من الخلف، مساحة وقوف محدودة',
    2, 'علي المغربي', 1, 'مدير النظام'
),

-- 4. بقالة الحي - المنطقة الجنوبية
(
    'بقالة الحي الصغيرة', 'أم محمد الفلسطينية', '+32-123-456-820', 'small.grocery@gmail.com',
    'شارع فلسطين 8، بروكسل الجنوبية، بلجيكا',
    '{"latitude": 50.8245, "longitude": 4.3398, "accuracy": "medium"}',
    'retail', 'grocery', 'small',
    '{"monday": "08:00-20:00", "tuesday": "08:00-20:00", "wednesday": "08:00-20:00", "thursday": "08:00-20:00", "friday": "08:00-21:00", "saturday": "08:00-21:00", "sunday": "09:00-18:00"}',
    800.00, 1440000.00, 150.00, 270000.00,
    3200.00, 5760000.00, 3050.00, 5490000.00,
    1.50, 'cash', 18, 17,
    95.40, 171720.00, '2024-03-11', '2024-03-09',
    4.20, 'active', '08:00-09:00',
    'محل صغير، كميات محدودة، دفع نقدي فقط، سيدة كبيرة في السن',
    2, 'علي المغربي', 1, 'مدير النظام'
),

-- 5. فندق بلجيكا الذهبي - المنطقة الشرقية
(
    'فندق بلجيكا الذهبي', 'إدارة الفندق - السيد كريم', '+32-123-456-830', 'golden.hotel@belgique.be',
    'شارع الملوك 100، بروكسل الشرقية، بلجيكا',
    '{"latitude": 50.8467, "longitude": 4.3720, "accuracy": "high"}',
    'wholesale', 'hotel', 'enterprise',
    '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}',
    8000.00, 14400000.00, 2100.00, 3780000.00,
    28500.00, 51300000.00, 26400.00, 47520000.00,
    1.75, 'credit_30_days', 55, 52,
    425.00, 765000.00, '2024-03-16', '2024-03-14',
    4.85, 'active', '05:00-07:00',
    'فندق 4 نجوم، يحتاج توصيل يومي للمخبوزات الطازجة، مدخل خدمات منفصل، إدارة صارمة للجودة',
    3, 'خالد التونسي', 1, 'مدير النظام'
),

-- 6. كافيتيريا الجامعة - المنطقة الشرقية
(
    'كافيتيريا جامعة بروكسل', 'إدارة الجامعة', '+32-123-456-835', 'university.cafeteria@ulb.be',
    'حرم الجامعة، بروكسل الشرقية، بلجيكا',
    '{"latitude": 50.8414, "longitude": 4.3810, "accuracy": "high"}',
    'wholesale', 'cafe', 'large',
    '{"monday": "07:00-18:00", "tuesday": "07:00-18:00", "wednesday": "07:00-18:00", "thursday": "07:00-18:00", "friday": "07:00-16:00", "saturday": "closed", "sunday": "closed"}',
    4000.00, 7200000.00, 680.00, 1224000.00,
    15800.00, 28440000.00, 15120.00, 27216000.00,
    2.25, 'credit_15_days', 38, 36,
    312.50, 562500.00, '2024-03-15', '2024-03-13',
    4.40, 'active', '06:30-07:30',
    'كميات كبيرة للطلاب، أسعار مخفضة، إغلاق في العطل الجامعية',
    3, 'خالد التونسي', 1, 'مدير النظام'
),

-- 7. مخبزة الأحياء - المنطقة الغربية
(
    'مخبزة أحياء بروكسل', 'عائلة الخباز البلجيكي', '+32-123-456-840', 'local.bakery@brussels.be',
    'شارع أوروبا 33، بروكسل الغربية، بلجيكا',
    '{"latitude": 50.8370, "longitude": 4.3247, "accuracy": "high"}',
    'retail', 'bakery', 'medium',
    '{"monday": "06:00-19:00", "tuesday": "06:00-19:00", "wednesday": "06:00-19:00", "thursday": "06:00-19:00", "friday": "06:00-20:00", "saturday": "06:00-20:00", "sunday": "07:00-17:00"}',
    2000.00, 3600000.00, 450.00, 810000.00,
    9200.00, 16560000.00, 8750.00, 15750000.00,
    3.00, 'credit_7_days', 25, 24,
    185.60, 334080.00, '2024-03-12', '2024-03-11',
    4.30, 'active', '05:30-06:30',
    'مخبزة محلية، منافس ولكن عميل أيضاً، يشتري منتجات خاصة فقط',
    4, 'أحمد الجزائري', 1, 'مدير النظام'
),

-- 8. محل الحلويات الشرقية - المنطقة الشرقية
(
    'حلويات دمشق الأصيلة', 'أبو أحمد الحلواني', '+32-123-456-845', 'damascus.sweets@gmail.com',
    'شارع العرب 18، بروكسل الشرقية، بلجيكا',
    '{"latitude": 50.8425, "longitude": 4.3680, "accuracy": "medium"}',
    'retail', 'bakery', 'small',
    '{"monday": "09:00-21:00", "tuesday": "09:00-21:00", "wednesday": "09:00-21:00", "thursday": "09:00-21:00", "friday": "09:00-22:00", "saturday": "09:00-22:00", "sunday": "10:00-20:00"}',
    1200.00, 2160000.00, 200.00, 360000.00,
    4800.00, 8640000.00, 4600.00, 8280000.00,
    2.50, 'cash', 20, 19,
    128.70, 231660.00, '2024-03-10', '2024-03-08',
    4.10, 'active', '09:00-10:00',
    'متخصص في الحلويات الشرقية، يطلب منتجات خاصة أحياناً، دفع نقدي غالباً',
    3, 'خالد التونسي', 1, 'مدير النظام'
),

-- 9. متجر المطار - حالة خاصة
(
    'متجر مطار بروكسل', 'شركة المطار', '+32-123-456-850', 'airport.shop@brussels-airport.be',
    'مطار بروكسل الدولي، تيرمينال 1', 
    '{"latitude": 50.9010, "longitude": 4.4844, "accuracy": "high"}',
    'wholesale', 'other', 'large',
    '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}',
    6000.00, 10800000.00, 1850.00, 3330000.00,
    22000.00, 39600000.00, 20150.00, 36270000.00,
    1.50, 'credit_30_days', 48, 45,
    380.20, 684360.00, '2024-03-16', '2024-03-15',
    4.75, 'active', 'مرونة كاملة',
    'متجر المطار، يحتاج توصيل 24/7، أمن صارم، تصاريح خاصة مطلوبة',
    5, 'يوسف اللبناني', 1, 'مدير النظام'
),

-- 10. محل معطل للاختبار
(
    'محل مغلق للاختبار', 'مالك سابق', '+32-123-456-999', 'closed@test.com',
    'شارع مهجور، بروكسل',
    '{"latitude": 50.8000, "longitude": 4.3000, "accuracy": "low"}',
    'retail', 'grocery', 'small',
    '{"status": "closed"}',
    500.00, 900000.00, -100.00, -180000.00,
    1200.00, 2160000.00, 1300.00, 2340000.00,
    0.00, 'cash', 5, 3,
    85.00, 153000.00, '2023-12-20', '2023-12-25',
    2.10, 'suspended', 'غير محدد',
    'محل مغلق لأغراض الاختبار',
    NULL, NULL, 1, 'مدير النظام'
);

-- إعادة تشغيل فحص المفاتيح الخارجية
SET FOREIGN_KEY_CHECKS = 1;

-- تأكيد البيانات
SELECT '✅ تم إدراج بيانات المحلات بنجاح' AS status;

SELECT 
    CONCAT('إجمالي المحلات: ', COUNT(*)) AS total_stores,
    CONCAT('النشطة: ', SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)) AS active_stores,
    CONCAT('المعطلة: ', SUM(CASE WHEN status != 'active' THEN 1 ELSE 0 END)) AS inactive_stores,
    CONCAT('متوسط حد الائتمان EUR: ', ROUND(AVG(credit_limit_eur), 2)) AS avg_credit_limit,
    CONCAT('إجمالي المبيعات EUR: ', ROUND(SUM(total_purchases_eur), 2)) AS total_sales
FROM stores;

-- عرض المحلات بحسب الفئة
SELECT 
    category AS 'الفئة',
    COUNT(*) AS 'عدد المحلات',
    ROUND(AVG(total_purchases_eur), 2) AS 'متوسط المشتريات EUR',
    ROUND(AVG(performance_rating), 2) AS 'متوسط التقييم'
FROM stores 
WHERE status = 'active'
GROUP BY category
ORDER BY COUNT(*) DESC;

-- عرض توزيع المحلات على الموزعين
SELECT 
    assigned_distributor_name AS 'الموزع',
    COUNT(*) AS 'عدد المحلات المخصصة',
    ROUND(SUM(total_purchases_eur), 2) AS 'إجمالي المبيعات EUR'
FROM stores 
WHERE status = 'active' AND assigned_distributor_id IS NOT NULL
GROUP BY assigned_distributor_name, assigned_distributor_id
ORDER BY COUNT(*) DESC; 