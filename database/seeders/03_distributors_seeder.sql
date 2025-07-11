-- ===========================================
-- Seeder للموزعين (Distributors)
-- يشمل: معلومات الموزعين وأدائهم
-- ===========================================

USE `bakery_db_test`;

-- تعطيل فحص المفاتيح الخارجية مؤقتاً
SET FOREIGN_KEY_CHECKS = 0;

-- مسح البيانات الموجودة
DELETE FROM `distributors`;

-- إعادة تعيين AUTO_INCREMENT
ALTER TABLE `distributors` AUTO_INCREMENT = 1;

-- إدراج الموزعين
INSERT INTO `distributors` (
    `name`, `phone`, `email`, `address`, `license_number`, `vehicle_type`, `vehicle_plate`,
    `vehicle_info`, `salary_base_eur`, `salary_base_syp`, `commission_rate`, `hire_date`,
    `status`, `emergency_contact`, `photo_url`, `notes`
) VALUES 
-- الموزع الأول - المنطقة الشمالية
(
    'محمد السوري', '+32-123-456-792', 'distributor1@bakery.com',
    'شارع النور 15، بروكسل الشمالية، بلجيكا', 'LIC-2024-001',
    'van', 'BXL-123',
    '{
        "type": "van",
        "brand": "Mercedes",
        "model": "Sprinter",
        "year": 2022,
        "plate": "BXL-123",
        "capacity": "2000kg",
        "fuel_type": "diesel",
        "color": "أبيض",
        "insurance": "AXA Belgium",
        "next_maintenance": "2024-06-15"
    }',
    1800.00, 3200000.00, 2.50, '2023-01-15',
    'active', 'زوجة: فاطمة السوري - +32-123-456-800',
    '/images/drivers/mohamed_syria.jpg',
    'موزع خبرة 15 سنة، يتقن الفرنسية والعربية، ممتاز في التعامل مع العملاء'
),

-- الموزع الثاني - المنطقة الجنوبية
(
    'علي المغربي', '+32-123-456-793', 'distributor2@bakery.com',
    'شارع الأمل 28، بروكسل الجنوبية، بلجيكا', 'LIC-2024-002',
    'truck', 'BXL-456',
    '{
        "type": "truck",
        "brand": "Iveco",
        "model": "Daily",
        "year": 2021,
        "plate": "BXL-456",
        "capacity": "3000kg",
        "fuel_type": "diesel",
        "color": "أزرق",
        "insurance": "KBC Insurance",
        "next_maintenance": "2024-07-20"
    }',
    1800.00, 3200000.00, 2.75, '2023-03-20',
    'active', 'أخ: حسن المغربي - +32-123-456-801',
    '/images/drivers/ali_morocco.jpg',
    'متخصص في المناطق الكثيفة، دقيق في المواعيد، يجيد الهولندية'
),

-- الموزع الثالث - المنطقة الشرقية
(
    'خالد التونسي', '+32-123-456-794', 'distributor3@bakery.com',
    'شارع الحرية 42، بروكسل الشرقية، بلجيكا', 'LIC-2024-003',
    'van', 'BXL-789',
    '{
        "type": "van",
        "brand": "Ford",
        "model": "Transit",
        "year": 2023,
        "plate": "BXL-789",
        "capacity": "1800kg",
        "fuel_type": "diesel",
        "color": "رمادي",
        "insurance": "Ethias",
        "next_maintenance": "2024-05-30"
    }',
    1750.00, 3100000.00, 2.25, '2023-07-10',
    'active', 'والد: عبدالله التونسي - +32-123-456-802',
    '/images/drivers/khaled_tunisia.jpg',
    'سريع ومنظم، خبرة في التكنولوجيا، مسؤول عن التطبيق المحمول للموزعين'
),

-- الموزع الرابع - المنطقة الغربية (جديد)
(
    'أحمد الجزائري', '+32-123-456-798', 'distributor4@bakery.com',
    'شارع السلام 67، بروكسل الغربية، بلجيكا', 'LIC-2024-004',
    'van', 'BXL-321',
    '{
        "type": "van",
        "brand": "Renault",
        "model": "Master",
        "year": 2022,
        "plate": "BXL-321",
        "capacity": "2200kg",
        "fuel_type": "diesel",
        "color": "أحمر",
        "insurance": "Belfius Insurance",
        "next_maintenance": "2024-08-10"
    }',
    1700.00, 3000000.00, 2.00, '2024-01-05',
    'active', 'زوجة: عائشة الجزائرية - +32-123-456-803',
    '/images/drivers/ahmed_algeria.jpg',
    'موزع جديد، متحمس ونشيط، يحتاج المزيد من التدريب على الطرق'
),

-- الموزع الخامس - الموزع الاحتياطي
(
    'يوسف اللبناني', '+32-123-456-799', 'distributor5@bakery.com',
    'شارع النهضة 91، بروكسل المركز، بلجيكا', 'LIC-2024-005',
    'motorcycle', 'BXL-654',
    '{
        "type": "motorcycle",
        "brand": "BMW",
        "model": "R1200GS",
        "year": 2021,
        "plate": "BXL-654",
        "capacity": "100kg",
        "fuel_type": "gasoline",
        "color": "أسود",
        "insurance": "Allianz",
        "next_maintenance": "2024-06-01"
    }',
    1400.00, 2500000.00, 3.00, '2023-11-01',
    'active', 'صديق: مرام اللبناني - +32-123-456-804',
    '/images/drivers/youssef_lebanon.jpg',
    'متخصص في التوصيل السريع والطوارئ، يغطي جميع المناطق عند الحاجة'
),

-- موزع غير نشط (للاختبار)
(
    'سامي المصري', '+32-123-456-750', 'distributor_inactive@bakery.com',
    'شارع المستقبل 12، بروكسل، بلجيكا', 'LIC-2023-999',
    'van', 'BXL-OLD',
    '{
        "type": "van",
        "brand": "Volkswagen",
        "model": "Crafter",
        "year": 2019,
        "plate": "BXL-OLD",
        "capacity": "1500kg",
        "fuel_type": "diesel",
        "color": "أبيض",
        "insurance": "منتهية",
        "next_maintenance": "منتهية"
    }',
    1600.00, 2800000.00, 2.00, '2022-05-01',
    'inactive', 'لا يوجد',
    '/images/drivers/sami_egypt.jpg',
    'موزع سابق، تم إيقافه بسبب مشاكل في الأداء'
);

-- إعادة تشغيل فحص المفاتيح الخارجية
SET FOREIGN_KEY_CHECKS = 1;

-- تأكيد البيانات
SELECT '✅ تم إدراج بيانات الموزعين بنجاح' AS status;

SELECT 
    CONCAT('إجمالي الموزعين: ', COUNT(*)) AS total_distributors,
    CONCAT('النشطين: ', SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)) AS active_distributors,
    CONCAT('غير النشطين: ', SUM(CASE WHEN status != 'active' THEN 1 ELSE 0 END)) AS inactive_distributors,
    CONCAT('متوسط الراتب EUR: ', ROUND(AVG(salary_base_eur), 2)) AS avg_salary_eur,
    CONCAT('متوسط العمولة: ', ROUND(AVG(commission_rate), 2), '%') AS avg_commission
FROM distributors;

-- عرض الموزعين النشطين
SELECT 
    name AS 'الاسم',
    vehicle_type AS 'نوع المركبة',
    vehicle_plate AS 'رقم اللوحة',
    CONCAT(salary_base_eur, ' EUR') AS 'الراتب الأساسي',
    CONCAT(commission_rate, '%') AS 'نسبة العمولة',
    hire_date AS 'تاريخ التوظيف',
    status AS 'الحالة'
FROM distributors 
WHERE status = 'active'
ORDER BY hire_date; 