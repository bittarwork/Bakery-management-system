-- ===========================================
-- Seeder للطلبات وعناصر الطلبات (Orders & Order Items)
-- يشمل: طلبات متنوعة مع عناصرها
-- ===========================================

USE `bakery_db_test`;

-- تعطيل فحص المفاتيح الخارجية مؤقتاً
SET FOREIGN_KEY_CHECKS = 0;

-- مسح البيانات الموجودة
DELETE FROM `order_items`;
DELETE FROM `orders`;

-- إعادة تعيين AUTO_INCREMENT
ALTER TABLE `orders` AUTO_INCREMENT = 1;
ALTER TABLE `order_items` AUTO_INCREMENT = 1;

-- ===========================================
-- إدراج الطلبات
-- ===========================================

INSERT INTO `orders` (
    `order_number`, `store_id`, `store_name`, `order_date`, `delivery_date`,
    `total_amount_eur`, `total_amount_syp`, `discount_amount_eur`, `discount_amount_syp`,
    `final_amount_eur`, `final_amount_syp`, `currency`, `exchange_rate`,
    `status`, `payment_status`, `gift_applied`, `notes`,
    `created_by`, `created_by_name`
) VALUES 
-- طلبات سوبرماركت الأمل (store_id = 1)
('ORD-2024-001', 1, 'سوبرماركت الأمل', '2024-03-10', '2024-03-11',
 485.50, 873900.00, 25.50, 45900.00, 460.00, 828000.00, 'EUR', 1800.00,
 'delivered', 'paid', '{"discount_type": "volume", "discount_rate": 5}',
 'طلب كبير للنهاية الأسبوع، تم تطبيق خصم الكمية', 1, 'مدير النظام'),

('ORD-2024-002', 1, 'سوبرماركت الأمل', '2024-03-12', '2024-03-13',
 320.80, 577440.00, 0.00, 0.00, 320.80, 577440.00, 'EUR', 1800.00,
 'delivered', 'partial', NULL,
 'طلب منتظم', 4, 'محمد السوري'),

-- طلبات مقهى الياسمين (store_id = 2)
('ORD-2024-003', 2, 'مقهى الياسمين', '2024-03-11', '2024-03-11',
 185.20, 333360.00, 5.20, 9360.00, 180.00, 324000.00, 'EUR', 1800.00,
 'delivered', 'paid', '{"discount_type": "loyalty", "discount_rate": 3}',
 'طلب يومي للمقهى، خصم الولاء', 4, 'محمد السوري'),

('ORD-2024-004', 2, 'مقهى الياسمين', '2024-03-13', '2024-03-14',
 165.40, 297720.00, 0.00, 0.00, 165.40, 297720.00, 'EUR', 1800.00,
 'prepared', 'pending', NULL,
 'طلب المعجنات الصباحية', 1, 'مدير النظام'),

-- طلبات مطعم دمشق (store_id = 3)
('ORD-2024-005', 3, 'مطعم دمشق', '2024-03-09', '2024-03-10',
 280.50, 504900.00, 15.50, 27900.00, 265.00, 477000.00, 'EUR', 1800.00,
 'delivered', 'paid', '{"discount_type": "seasonal", "discount_rate": 5.5}',
 'طلب شهري للمطعم، خصم موسمي', 5, 'علي المغربي'),

-- طلبات بقالة الحي (store_id = 4)
('ORD-2024-006', 4, 'بقالة الحي الصغيرة', '2024-03-11', '2024-03-12',
 85.40, 153720.00, 0.00, 0.00, 85.40, 153720.00, 'EUR', 1800.00,
 'delivered', 'paid', NULL,
 'طلب صغير للبقالة', 5, 'علي المغربي'),

-- طلبات فندق بلجيكا الذهبي (store_id = 5)
('ORD-2024-007', 5, 'فندق بلجيكا الذهبي', '2024-03-12', '2024-03-13',
 650.00, 1170000.00, 30.00, 54000.00, 620.00, 1116000.00, 'EUR', 1800.00,
 'delivered', 'paid', '{"discount_type": "corporate", "discount_rate": 4.6}',
 'طلب أسبوعي للفندق، خصم الشركات', 6, 'خالد التونسي'),

-- طلبات كافيتيريا الجامعة (store_id = 6)
('ORD-2024-008', 6, 'كافيتيريا جامعة بروكسل', '2024-03-13', '2024-03-14',
 420.60, 757080.00, 20.60, 37080.00, 400.00, 720000.00, 'EUR', 1800.00,
 'confirmed', 'pending', '{"discount_type": "educational", "discount_rate": 4.9}',
 'طلب للكافيتيريا، خصم تعليمي', 6, 'خالد التونسي'),

-- طلبات مخبزة الأحياء (store_id = 7)
('ORD-2024-009', 7, 'مخبزة أحياء بروكسل', '2024-03-10', '2024-03-11',
 195.80, 352440.00, 10.80, 19440.00, 185.00, 333000.00, 'EUR', 1800.00,
 'delivered', 'paid', '{"discount_type": "competitor", "discount_rate": 5.5}',
 'طلب خاص للمخبزة المحلية', 7, 'أحمد الجزائري'),

-- طلبات حلويات دمشق (store_id = 8)
('ORD-2024-010', 8, 'حلويات دمشق الأصيلة', '2024-03-11', '2024-03-12',
 128.90, 232020.00, 3.90, 7020.00, 125.00, 225000.00, 'EUR', 1800.00,
 'delivered', 'pending', '{"discount_type": "small_business", "discount_rate": 3}',
 'طلب للحلويات الشرقية', 6, 'خالد التونسي'),

-- طلبات متجر المطار (store_id = 9)
('ORD-2024-011', 9, 'متجر مطار بروكسل', '2024-03-14', '2024-03-14',
 580.20, 1044360.00, 0.00, 0.00, 580.20, 1044360.00, 'EUR', 1800.00,
 'pending', 'pending', NULL,
 'طلب المطار - توصيل عاجل', 8, 'يوسف اللبناني');

-- ===========================================
-- إدراج عناصر الطلبات
-- ===========================================

INSERT INTO `order_items` (
    `order_id`, `product_id`, `product_name`, `quantity`,
    `unit_price_eur`, `unit_price_syp`, `total_price_eur`, `total_price_syp`, `notes`
) VALUES 
-- عناصر الطلب الأول (سوبرماركت الأمل)
(1, 1, 'خبز أبيض فرنسي', 50, 2.50, 4500.00, 125.00, 225000.00, 'كمية كبيرة للنهاية الأسبوع'),
(1, 2, 'خبز أسمر كامل', 30, 3.00, 5400.00, 90.00, 162000.00, NULL),
(1, 5, 'كرواسان زبدة', 40, 4.50, 8100.00, 180.00, 324000.00, 'للإفطار'),
(1, 10, 'كيك الشوكولاتة', 5, 18.00, 32400.00, 90.00, 162000.00, 'لقسم الحلويات'),

-- عناصر الطلب الثاني (سوبرماركت الأمل)
(2, 3, 'باجيت فرنسي', 25, 3.50, 6300.00, 87.50, 157500.00, NULL),
(2, 6, 'دانيش الجبن', 20, 5.20, 9360.00, 104.00, 187200.00, NULL),
(2, 13, 'كوكيز الشوكولاتة', 35, 2.20, 3960.00, 77.00, 138600.00, NULL),
(2, 18, 'قهوة إسبريسو', 15, 2.80, 5040.00, 42.00, 75600.00, 'للكافيه الداخلي'),

-- عناصر الطلب الثالث (مقهى الياسمين)
(3, 5, 'كرواسان زبدة', 20, 4.50, 8100.00, 90.00, 162000.00, 'للإفطار الصباحي'),
(3, 7, 'مافن التوت', 15, 3.80, 6840.00, 57.00, 102600.00, NULL),
(3, 18, 'قهوة إسبريسو', 10, 2.80, 5040.00, 28.00, 50400.00, NULL),
(3, 19, 'كابتشينو', 3, 3.50, 6300.00, 10.50, 18900.00, 'مزيج قهوة'),

-- عناصر الطلب الرابع (مقهى الياسمين)
(4, 1, 'خبز أبيض فرنسي', 10, 2.50, 4500.00, 25.00, 45000.00, NULL),
(4, 5, 'كرواسان زبدة', 15, 4.50, 8100.00, 67.50, 121500.00, NULL),
(4, 14, 'بسكويت الزبدة', 20, 1.80, 3240.00, 36.00, 64800.00, NULL),
(4, 19, 'كابتشينو', 10, 3.50, 6300.00, 35.00, 63000.00, NULL),

-- عناصر الطلب الخامس (مطعم دمشق)
(5, 16, 'فطيرة السبانخ', 25, 4.80, 8640.00, 120.00, 216000.00, 'للقائمة الشرقية'),
(5, 17, 'فطيرة اللحم', 15, 6.50, 11700.00, 97.50, 175500.00, NULL),
(5, 2, 'خبز أسمر كامل', 20, 3.00, 5400.00, 60.00, 108000.00, 'خبز للوجبات'),
(5, 21, 'شاي أخضر', 10, 2.50, 4500.00, 25.00, 45000.00, NULL),

-- عناصر الطلب السادس (بقالة الحي)
(6, 1, 'خبز أبيض فرنسي', 8, 2.50, 4500.00, 20.00, 36000.00, NULL),
(6, 13, 'كوكيز الشوكولاتة', 12, 2.20, 3960.00, 26.40, 47520.00, NULL),
(6, 14, 'بسكويت الزبدة', 15, 1.80, 3240.00, 27.00, 48600.00, NULL),
(6, 7, 'مافن التوت', 3, 3.80, 6840.00, 11.40, 20520.00, NULL),

-- عناصر الطلب السابع (فندق بلجيكا)
(7, 9, 'كيك الفانيليا', 8, 15.00, 27000.00, 120.00, 216000.00, 'لقاعة الإفطار'),
(7, 10, 'كيك الشوكولاتة', 6, 18.00, 32400.00, 108.00, 194400.00, NULL),
(7, 5, 'كرواسان زبدة', 50, 4.50, 8100.00, 225.00, 405000.00, 'للإفطار'),
(7, 18, 'قهوة إسبريسو', 80, 2.80, 5040.00, 224.00, 403200.00, 'لخدمة الغرف'),

-- عناصر الطلب الثامن (كافيتيريا الجامعة)
(8, 1, 'خبز أبيض فرنسي', 60, 2.50, 4500.00, 150.00, 270000.00, 'للطلاب'),
(8, 13, 'كوكيز الشوكولاتة', 50, 2.20, 3960.00, 110.00, 198000.00, NULL),
(8, 7, 'مافن التوت', 30, 3.80, 6840.00, 114.00, 205200.00, NULL),
(8, 18, 'قهوة إسبريسو', 25, 2.80, 5040.00, 70.00, 126000.00, 'للكافيتيريا'),

-- عناصر الطلب التاسع (مخبزة الأحياء)
(9, 3, 'باجيت فرنسي', 15, 3.50, 6300.00, 52.50, 94500.00, 'منتج متخصص'),
(9, 15, 'مكرون اللوز', 20, 3.50, 6300.00, 70.00, 126000.00, NULL),
(9, 11, 'تورتة الفراولة', 2, 25.00, 45000.00, 50.00, 90000.00, 'للمناسبات'),
(9, 8, 'إكلير الشوكولاتة', 5, 6.00, 10800.00, 30.00, 54000.00, NULL),

-- عناصر الطلب العاشر (حلويات دمشق)
(10, 22, 'كعك عيد الميلاد', 3, 20.00, 36000.00, 60.00, 108000.00, 'للمناسبات'),
(10, 15, 'مكرون اللوز', 10, 3.50, 6300.00, 35.00, 63000.00, NULL),
(10, 8, 'إكلير الشوكولاتة', 4, 6.00, 10800.00, 24.00, 43200.00, NULL),
(10, 11, 'تورتة الفراولة', 1, 25.00, 45000.00, 25.00, 45000.00, 'طلب خاص'),

-- عناصر الطلب الحادي عشر (متجر المطار)
(11, 1, 'خبز أبيض فرنسي', 40, 2.50, 4500.00, 100.00, 180000.00, 'للمسافرين'),
(11, 5, 'كرواسان زبدة', 35, 4.50, 8100.00, 157.50, 283500.00, NULL),
(11, 18, 'قهوة إسبريسو', 60, 2.80, 5040.00, 168.00, 302400.00, 'للكافيه'),
(11, 19, 'كابتشينو', 30, 3.50, 6300.00, 105.00, 189000.00, NULL),
(11, 13, 'كوكيز الشوكولاتة', 25, 2.20, 3960.00, 55.00, 99000.00, 'وجبات خفيفة');

-- إعادة تشغيل فحص المفاتيح الخارجية
SET FOREIGN_KEY_CHECKS = 1;

-- تأكيد البيانات
SELECT '✅ تم إدراج بيانات الطلبات وعناصرها بنجاح' AS status;

SELECT 
    CONCAT('إجمالي الطلبات: ', COUNT(*)) AS total_orders,
    CONCAT('المكتملة: ', SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)) AS delivered_orders,
    CONCAT('قيد التحضير: ', SUM(CASE WHEN status IN ('pending', 'confirmed', 'prepared') THEN 1 ELSE 0 END)) AS pending_orders,
    CONCAT('إجمالي القيمة EUR: ', ROUND(SUM(final_amount_eur), 2)) AS total_value_eur,
    CONCAT('متوسط قيمة الطلب EUR: ', ROUND(AVG(final_amount_eur), 2)) AS avg_order_value
FROM orders;

-- إحصائيات عناصر الطلبات
SELECT 
    CONCAT('إجمالي عناصر الطلبات: ', COUNT(*)) AS total_order_items,
    CONCAT('إجمالي الكمية: ', SUM(quantity)) AS total_quantity,
    CONCAT('متوسط العناصر لكل طلب: ', ROUND(COUNT(*) / (SELECT COUNT(*) FROM orders), 2)) AS avg_items_per_order
FROM order_items;

-- أكثر المنتجات طلباً
SELECT 
    product_name AS 'المنتج',
    SUM(quantity) AS 'إجمالي الكمية',
    COUNT(*) AS 'عدد مرات الطلب',
    ROUND(SUM(total_price_eur), 2) AS 'إجمالي المبيعات EUR'
FROM order_items
GROUP BY product_id, product_name
ORDER BY SUM(quantity) DESC
LIMIT 5; 