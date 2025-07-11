-- ===========================================
-- Seeder للمدفوعات (Payments)
-- يشمل: مدفوعات متنوعة بالعملتين EUR و SYP
-- ===========================================

USE `bakery_db_test`;

-- تعطيل فحص المفاتيح الخارجية مؤقتاً
SET FOREIGN_KEY_CHECKS = 0;

-- مسح البيانات الموجودة
DELETE FROM `payments`;

-- إعادة تعيين AUTO_INCREMENT
ALTER TABLE `payments` AUTO_INCREMENT = 1;

-- إدراج المدفوعات
INSERT INTO `payments` (
    `payment_number`, `payment_date`, `store_id`, `store_name`, `order_id`,
    `distributor_id`, `distributor_name`, `visit_id`,
    `amount_eur`, `amount_syp`, `currency`, `exchange_rate`,
    `payment_method`, `payment_type`, `payment_reference`, `bank_details`,
    `payment_proof`, `status`, `verification_status`, `verified_by`, 
    `verified_by_name`, `verified_at`, `receipt_generated`, `receipt_url`,
    `notes`, `internal_notes`, `created_by`, `created_by_name`
) VALUES 
-- مدفوعات سوبرماركت الأمل
('PAY-2024-001', '2024-03-11 14:30:00', 1, 'سوبرماركت الأمل', 1,
 1, 'محمد السوري', NULL,
 460.00, 828000.00, 'EUR', 1800.00,
 'bank_transfer', 'full', 'TRF-2024-001', 
 '{"bank": "KBC", "account": "BE68 5390 0754 7034", "iban": "BE68 5390 0754 7034"}',
 '/receipts/PAY-2024-001.pdf', 'completed', 'verified', 3,
 'فاطمة علي - محاسبة', '2024-03-11 15:45:00', TRUE, '/receipts/generated/PAY-2024-001.pdf',
 'دفعة بنكية كاملة للطلب الكبير', 'تم التحقق من الحساب البنكي بنجاح', 1, 'مدير النظام'),

('PAY-2024-002', '2024-03-13 10:15:00', 1, 'سوبرماركت الأمل', 2,
 4, 'محمد السوري', NULL,
 200.00, 360000.00, 'EUR', 1800.00,
 'cash', 'partial', NULL, NULL,
 NULL, 'completed', 'verified', 4,
 'محمد السوري', '2024-03-13 10:15:00', TRUE, '/receipts/generated/PAY-2024-002.pdf',
 'دفعة نقدية جزئية', 'مبلغ متبقي: 120.80 EUR', 4, 'محمد السوري'),

-- مدفوعات مقهى الياسمين
('PAY-2024-003', '2024-03-11 16:00:00', 2, 'مقهى الياسمين', 3,
 4, 'محمد السوري', NULL,
 180.00, 324000.00, 'EUR', 1800.00,
 'cash', 'full', NULL, NULL,
 NULL, 'completed', 'verified', 4,
 'محمد السوري', '2024-03-11 16:00:00', TRUE, '/receipts/generated/PAY-2024-003.pdf',
 'دفعة نقدية كاملة عند التسليم', 'عميل منتظم وموثوق', 4, 'محمد السوري'),

-- مدفوعات مطعم دمشق
('PAY-2024-004', '2024-03-10 20:30:00', 3, 'مطعم دمشق', 5,
 5, 'علي المغربي', NULL,
 265.00, 477000.00, 'EUR', 1800.00,
 'credit_card', 'full', 'CC-2024-001',
 '{"type": "Visa", "last_digits": "1234", "approval_code": "AP001"}',
 '/receipts/PAY-2024-004.pdf', 'completed', 'verified', 3,
 'فاطمة علي - محاسبة', '2024-03-10 20:45:00', TRUE, '/receipts/generated/PAY-2024-004.pdf',
 'دفعة بالبطاقة الائتمانية', 'معاملة آمنة ومتحققة', 5, 'علي المغربي'),

-- مدفوعات بقالة الحي
('PAY-2024-005', '2024-03-12 09:00:00', 4, 'بقالة الحي الصغيرة', 6,
 5, 'علي المغربي', NULL,
 85.40, 153720.00, 'EUR', 1800.00,
 'cash', 'full', NULL, NULL,
 NULL, 'completed', 'verified', 5,
 'علي المغربي', '2024-03-12 09:00:00', TRUE, '/receipts/generated/PAY-2024-005.pdf',
 'دفعة نقدية صغيرة', 'عميلة كبيرة السن، دفع نقدي فقط', 5, 'علي المغربي'),

-- مدفوعات فندق بلجيكا الذهبي
('PAY-2024-006', '2024-03-13 11:30:00', 5, 'فندق بلجيكا الذهبي', 7,
 6, 'خالد التونسي', NULL,
 620.00, 1116000.00, 'EUR', 1800.00,
 'bank_transfer', 'full', 'TRF-2024-002',
 '{"bank": "BNP Paribas", "account": "BE97 0000 9999 8888", "iban": "BE97 0000 9999 8888"}',
 '/receipts/PAY-2024-006.pdf', 'completed', 'verified', 3,
 'فاطمة علي - محاسبة', '2024-03-13 12:00:00', TRUE, '/receipts/generated/PAY-2024-006.pdf',
 'دفعة فندق - تحويل بنكي', 'عميل مؤسسي موثوق', 6, 'خالد التونسي'),

-- مدفوعات مخبزة الأحياء
('PAY-2024-007', '2024-03-11 15:20:00', 7, 'مخبزة أحياء بروكسل', 9,
 7, 'أحمد الجزائري', NULL,
 185.00, 333000.00, 'EUR', 1800.00,
 'check', 'full', 'CHK-2024-001',
 '{"bank": "Belfius", "check_number": "0012345", "date": "2024-03-11"}',
 '/receipts/PAY-2024-007.pdf', 'completed', 'verified', 3,
 'فاطمة علي - محاسبة', '2024-03-12 09:00:00', TRUE, '/receipts/generated/PAY-2024-007.pdf',
 'دفعة بشيك', 'مخبزة محلية، تنافس ولكن تشتري منتجات خاصة', 7, 'أحمد الجزائري'),

-- مدفوعات حلويات دمشق
('PAY-2024-008', '2024-03-12 14:00:00', 8, 'حلويات دمشق الأصيلة', 10,
 6, 'خالد التونسي', NULL,
 125.00, 225000.00, 'EUR', 1800.00,
 'cash', 'full', NULL, NULL,
 NULL, 'completed', 'verified', 6,
 'خالد التونسي', '2024-03-12 14:00:00', TRUE, '/receipts/generated/PAY-2024-008.pdf',
 'دفعة نقدية للحلويات', 'محل صغير، يفضل النقد', 6, 'خالد التونسي'),

-- مدفوعات متنوعة بالليرة السورية (للاختبار)
('PAY-2024-009', '2024-03-14 08:30:00', 2, 'مقهى الياسمين', NULL,
 4, 'محمد السوري', NULL,
 0.00, 500000.00, 'SYP', 1800.00,
 'cash', 'partial', NULL, NULL,
 NULL, 'completed', 'verified', 4,
 'محمد السوري', '2024-03-14 08:30:00', TRUE, '/receipts/generated/PAY-2024-009.pdf',
 'دفعة جزئية بالليرة السورية', 'دفعة إضافية لتسوية حساب قديم', 4, 'محمد السوري'),

-- مدفوعة مختلطة (EUR + SYP)
('PAY-2024-010', '2024-03-15 12:45:00', 3, 'مطعم دمشق', NULL,
 5, 'علي المغربي', NULL,
 150.00, 900000.00, 'MIXED', 1800.00,
 'mixed', 'partial', 'MIX-2024-001',
 '{"eur_amount": 150.00, "syp_amount": 900000.00, "total_eur_equivalent": 650.00}',
 '/receipts/PAY-2024-010.pdf', 'completed', 'verified', 3,
 'فاطمة علي - محاسبة', '2024-03-15 13:15:00', TRUE, '/receipts/generated/PAY-2024-010.pdf',
 'دفعة مختلطة EUR + SYP', 'العميل دفع جزء بالليرة وجزء باليورو', 5, 'علي المغربي'),

-- مدفوعة معلقة (للاختبار)
('PAY-2024-011', '2024-03-16 09:00:00', 9, 'متجر مطار بروكسل', 11,
 8, 'يوسف اللبناني', NULL,
 580.20, 1044360.00, 'EUR', 1800.00,
 'bank_transfer', 'full', 'TRF-2024-003',
 '{"bank": "ING", "account": "BE12 3456 7890 1234", "iban": "BE12 3456 7890 1234"}',
 NULL, 'pending', 'pending', NULL,
 NULL, NULL, FALSE, NULL,
 'دفعة معلقة - في انتظار التحقق البنكي', 'تحويل مطار، يحتاج موافقات إضافية', 8, 'يوسف اللبناني'),

-- مدفوعة مرفوضة (للاختبار)
('PAY-2024-012', '2024-03-14 16:30:00', 6, 'كافيتيريا جامعة بروكسل', 8,
 6, 'خالد التونسي', NULL,
 400.00, 720000.00, 'EUR', 1800.00,
 'credit_card', 'full', 'CC-2024-002',
 '{"type": "MasterCard", "last_digits": "5678", "error": "Insufficient funds"}',
 NULL, 'failed', 'rejected', 3,
 'فاطمة علي - محاسبة', '2024-03-14 16:45:00', FALSE, NULL,
 'دفعة مرفوضة - رصيد غير كافي', 'يجب المتابعة مع الجامعة لحل مشكلة الدفع', 6, 'خالد التونسي');

-- إعادة تشغيل فحص المفاتيح الخارجية
SET FOREIGN_KEY_CHECKS = 1;

-- تأكيد البيانات
SELECT '✅ تم إدراج بيانات المدفوعات بنجاح' AS status;

-- إحصائيات المدفوعات
SELECT 
    CONCAT('إجمالي المدفوعات: ', COUNT(*)) AS total_payments,
    CONCAT('المكتملة: ', SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)) AS completed_payments,
    CONCAT('المعلقة: ', SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)) AS pending_payments,
    CONCAT('المرفوضة: ', SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)) AS failed_payments,
    CONCAT('إجمالي المبلغ EUR: ', ROUND(SUM(amount_eur), 2)) AS total_amount_eur,
    CONCAT('إجمالي المبلغ SYP: ', FORMAT(SUM(amount_syp), 0)) AS total_amount_syp
FROM payments;

-- إحصائيات طرق الدفع
SELECT 
    payment_method AS 'طريقة الدفع',
    COUNT(*) AS 'عدد المدفوعات',
    ROUND(SUM(amount_eur), 2) AS 'إجمالي EUR',
    FORMAT(SUM(amount_syp), 0) AS 'إجمالي SYP'
FROM payments
WHERE status = 'completed'
GROUP BY payment_method
ORDER BY COUNT(*) DESC;

-- إحصائيات العملات
SELECT 
    currency AS 'العملة',
    COUNT(*) AS 'عدد المدفوعات',
    ROUND(AVG(amount_eur), 2) AS 'متوسط المبلغ EUR',
    FORMAT(AVG(amount_syp), 0) AS 'متوسط المبلغ SYP'
FROM payments
GROUP BY currency
ORDER BY COUNT(*) DESC;

-- أداء الموزعين في التحصيل
SELECT 
    distributor_name AS 'الموزع',
    COUNT(*) AS 'عدد المدفوعات',
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS 'المكتملة',
    ROUND(SUM(CASE WHEN status = 'completed' THEN amount_eur ELSE 0 END), 2) AS 'إجمالي محصل EUR',
    CONCAT(ROUND((SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1), '%') AS 'نسبة النجاح'
FROM payments
GROUP BY distributor_id, distributor_name
ORDER BY SUM(CASE WHEN status = 'completed' THEN amount_eur ELSE 0 END) DESC; 