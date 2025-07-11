-- ===========================================
-- Seeder لرحلات التوزيع وزيارات المحلات
-- يشمل: رحلات التوزيع وزياراتها
-- ===========================================

USE `bakery_db_test`;

-- تعطيل فحص المفاتيح الخارجية مؤقتاً
SET FOREIGN_KEY_CHECKS = 0;

-- مسح البيانات الموجودة
DELETE FROM `store_visits`;
DELETE FROM `distribution_trips`;

-- إعادة تعيين AUTO_INCREMENT
ALTER TABLE `distribution_trips` AUTO_INCREMENT = 1;
ALTER TABLE `store_visits` AUTO_INCREMENT = 1;

-- ===========================================
-- إدراج رحلات التوزيع
-- ===========================================

INSERT INTO `distribution_trips` (
    `trip_number`, `trip_date`, `distributor_id`, `distributor_name`, `vehicle_info`, `route_plan`,
    `planned_start_time`, `actual_start_time`, `planned_end_time`, `actual_end_time`,
    `total_orders`, `total_stores`, `completed_stores`,
    `total_amount_eur`, `total_amount_syp`, `collected_amount_eur`, `collected_amount_syp`,
    `fuel_cost_eur`, `fuel_cost_syp`, `other_expenses_eur`, `other_expenses_syp`,
    `distance_covered`, `status`, `completion_rate`, `collection_rate`,
    `gps_tracking_enabled`, `start_location`, `end_location`, `problems_encountered`, `notes`,
    `created_by`, `created_by_name`
) VALUES 
-- رحلة محمد السوري - المنطقة الشمالية
('TRIP-2024-001', '2024-03-11', 1, 'محمد السوري',
 '{"type": "van", "brand": "Mercedes", "model": "Sprinter", "plate": "BXL-123"}',
 '{"route": "north", "stores": [1, 2], "estimated_time": "4 hours"}',
 '2024-03-11 07:00:00', '2024-03-11 07:15:00',
 '2024-03-11 12:00:00', '2024-03-11 11:45:00',
 2, 2, 2,
 640.00, 1152000.00, 640.00, 1152000.00,
 25.50, 45900.00, 8.20, 14760.00,
 45.8, 'completed', 100.00, 100.00,
 TRUE,
 '{"latitude": 50.8503, "longitude": 4.3517, "timestamp": "2024-03-11 07:15:00"}',
 '{"latitude": 50.8485, "longitude": 4.3525, "timestamp": "2024-03-11 11:45:00"}',
 NULL, 'رحلة ناجحة بدون مشاكل، تحصيل كامل',
 2, 'أحمد حسن - مدير العمليات'),

-- رحلة علي المغربي - المنطقة الجنوبية
('TRIP-2024-002', '2024-03-10', 2, 'علي المغربي',
 '{"type": "truck", "brand": "Iveco", "model": "Daily", "plate": "BXL-456"}',
 '{"route": "south", "stores": [3, 4], "estimated_time": "5 hours"}',
 '2024-03-10 08:00:00', '2024-03-10 08:10:00',
 '2024-03-10 14:00:00', '2024-03-10 13:30:00',
 2, 2, 2,
 350.40, 630720.00, 350.40, 630720.00,
 32.80, 59040.00, 12.50, 22500.00,
 62.3, 'completed', 100.00, 100.00,
 TRUE,
 '{"latitude": 50.8263, "longitude": 4.3406, "timestamp": "2024-03-10 08:10:00"}',
 '{"latitude": 50.8245, "longitude": 4.3398, "timestamp": "2024-03-10 13:30:00"}',
 '{"delay_at_store_3": "15 minutes waiting for manager"}',
 'رحلة ناجحة مع تأخير بسيط في مطعم دمشق',
 2, 'أحمد حسن - مدير العمليات'),

-- رحلة خالد التونسي - المنطقة الشرقية
('TRIP-2024-003', '2024-03-13', 3, 'خالد التونسي',
 '{"type": "van", "brand": "Ford", "model": "Transit", "plate": "BXL-789"}',
 '{"route": "east", "stores": [5, 6, 8], "estimated_time": "6 hours"}',
 '2024-03-13 06:30:00', '2024-03-13 06:45:00',
 '2024-03-13 15:00:00', '2024-03-13 14:20:00',
 3, 3, 2,
 1145.00, 2061000.00, 745.00, 1341000.00,
 38.50, 69300.00, 15.80, 28440.00,
 78.5, 'completed', 66.67, 65.07,
 TRUE,
 '{"latitude": 50.8467, "longitude": 4.3720, "timestamp": "2024-03-13 06:45:00"}',
 '{"latitude": 50.8425, "longitude": 4.3680, "timestamp": "2024-03-13 14:20:00"}',
 '{"university_payment_failed": "Credit card declined at university cafeteria"}',
 'مشكلة في الدفع بكافيتيريا الجامعة، باقي الرحلة ناجحة',
 2, 'أحمد حسن - مدير العمليات'),

-- رحلة يوسف اللبناني - المطار
('TRIP-2024-004', '2024-03-14', 5, 'يوسف اللبناني',
 '{"type": "motorcycle", "brand": "BMW", "model": "R1200GS", "plate": "BXL-654"}',
 '{"route": "airport", "stores": [9], "estimated_time": "2 hours"}',
 '2024-03-14 10:00:00', '2024-03-14 10:00:00',
 '2024-03-14 12:00:00', NULL,
 1, 1, 0,
 580.20, 1044360.00, 0.00, 0.00,
 18.50, 33300.00, 5.00, 9000.00,
 35.2, 'in_progress', 0.00, 0.00,
 TRUE,
 '{"latitude": 50.9010, "longitude": 4.4844, "timestamp": "2024-03-14 10:00:00"}',
 NULL,
 '{"airport_security_delay": "Extra security checks for airport delivery"}',
 'رحلة المطار قيد التنفيذ - تأخير بسبب الأمن',
 8, 'يوسف اللبناني');

-- ===========================================
-- إدراج زيارات المحلات
-- ===========================================

INSERT INTO `store_visits` (
    `trip_id`, `store_id`, `store_name`, `visit_order`,
    `planned_arrival_time`, `actual_arrival_time`, `planned_departure_time`, `actual_departure_time`,
    `visit_status`, `arrival_location`, `departure_location`,
    `order_id`, `order_value_eur`, `order_value_syp`,
    `payment_collected_eur`, `payment_collected_syp`,
    `delivery_successful`, `payment_collected`, `problems_encountered`, `notes`
) VALUES 
-- زيارات رحلة محمد السوري
(1, 1, 'سوبرماركت الأمل', 1,
 '2024-03-11 08:00:00', '2024-03-11 08:15:00',
 '2024-03-11 09:30:00', '2024-03-11 09:20:00',
 'completed', 
 '{"latitude": 50.8503, "longitude": 4.3517, "timestamp": "2024-03-11 08:15:00"}',
 '{"latitude": 50.8503, "longitude": 4.3517, "timestamp": "2024-03-11 09:20:00"}',
 1, 460.00, 828000.00, 460.00, 828000.00,
 TRUE, TRUE, NULL, 'توصيل وتحصيل ناجح - عميل ممتاز'),

(1, 2, 'مقهى الياسمين', 2,
 '2024-03-11 10:00:00', '2024-03-11 10:10:00',
 '2024-03-11 11:00:00', '2024-03-11 10:55:00',
 'completed',
 '{"latitude": 50.8485, "longitude": 4.3525, "timestamp": "2024-03-11 10:10:00"}',
 '{"latitude": 50.8485, "longitude": 4.3525, "timestamp": "2024-03-11 10:55:00"}',
 3, 180.00, 324000.00, 180.00, 324000.00,
 TRUE, TRUE, NULL, 'دفع نقدي مباشرة - صاحبة المقهى ودودة'),

-- زيارات رحلة علي المغربي
(2, 3, 'مطعم دمشق', 1,
 '2024-03-10 09:00:00', '2024-03-10 09:05:00',
 '2024-03-10 10:30:00', '2024-03-10 10:45:00',
 'completed',
 '{"latitude": 50.8263, "longitude": 4.3406, "timestamp": "2024-03-10 09:05:00"}',
 '{"latitude": 50.8263, "longitude": 4.3406, "timestamp": "2024-03-10 10:45:00"}',
 5, 265.00, 477000.00, 265.00, 477000.00,
 TRUE, TRUE, '{"waiting_time": "15 minutes for manager"}',
 'انتظار المدير لفترة، ولكن تم الدفع بالبطاقة'),

(2, 4, 'بقالة الحي الصغيرة', 2,
 '2024-03-10 11:30:00', '2024-03-10 11:40:00',
 '2024-03-10 12:00:00', '2024-03-10 11:58:00',
 'completed',
 '{"latitude": 50.8245, "longitude": 4.3398, "timestamp": "2024-03-10 11:40:00"}',
 '{"latitude": 50.8245, "longitude": 4.3398, "timestamp": "2024-03-10 11:58:00"}',
 6, 85.40, 153720.00, 85.40, 153720.00,
 TRUE, TRUE, NULL, 'سيدة كبيرة السن، دفع نقدي، محل صغير ومرتب'),

-- زيارات رحلة خالد التونسي
(3, 5, 'فندق بلجيكا الذهبي', 1,
 '2024-03-13 07:30:00', '2024-03-13 07:45:00',
 '2024-03-13 09:00:00', '2024-03-13 08:50:00',
 'completed',
 '{"latitude": 50.8467, "longitude": 4.3720, "timestamp": "2024-03-13 07:45:00"}',
 '{"latitude": 50.8467, "longitude": 4.3720, "timestamp": "2024-03-13 08:50:00"}',
 7, 620.00, 1116000.00, 620.00, 1116000.00,
 TRUE, TRUE, NULL, 'فندق راقي، موظفين محترفين، تحويل بنكي'),

(3, 6, 'كافيتيريا جامعة بروكسل', 2,
 '2024-03-13 10:00:00', '2024-03-13 10:15:00',
 '2024-03-13 11:30:00', '2024-03-13 11:25:00',
 'completed',
 '{"latitude": 50.8414, "longitude": 4.3810, "timestamp": "2024-03-13 10:15:00"}',
 '{"latitude": 50.8414, "longitude": 4.3810, "timestamp": "2024-03-13 11:25:00"}',
 8, 400.00, 720000.00, 0.00, 0.00,
 TRUE, FALSE, '{"payment_failed": "Credit card declined - insufficient funds"}',
 'توصيل تم، لكن مشكلة في الدفع - رصيد غير كافي'),

(3, 8, 'حلويات دمشق الأصيلة', 3,
 '2024-03-13 12:30:00', '2024-03-13 12:40:00',
 '2024-03-13 13:30:00', '2024-03-13 13:20:00',
 'completed',
 '{"latitude": 50.8425, "longitude": 4.3680, "timestamp": "2024-03-13 12:40:00"}',
 '{"latitude": 50.8425, "longitude": 4.3680, "timestamp": "2024-03-13 13:20:00"}',
 10, 125.00, 225000.00, 125.00, 225000.00,
 TRUE, TRUE, NULL, 'محل حلويات شرقية، صاحب المحل ودود'),

-- زيارة رحلة يوسف اللبناني (قيد التنفيذ)
(4, 9, 'متجر مطار بروكسل', 1,
 '2024-03-14 10:30:00', '2024-03-14 10:30:00',
 '2024-03-14 11:30:00', NULL,
 'in_progress',
 '{"latitude": 50.9010, "longitude": 4.4844, "timestamp": "2024-03-14 10:30:00"}',
 NULL,
 11, 580.20, 1044360.00, 0.00, 0.00,
 FALSE, FALSE, '{"security_delay": "Airport security procedures"}',
 'قيد التنفيذ - إجراءات أمنية إضافية في المطار');

-- إعادة تشغيل فحص المفاتيح الخارجية
SET FOREIGN_KEY_CHECKS = 1;

-- تأكيد البيانات
SELECT '✅ تم إدراج بيانات رحلات التوزيع والزيارات بنجاح' AS status;

-- إحصائيات رحلات التوزيع
SELECT 
    CONCAT('إجمالي الرحلات: ', COUNT(*)) AS total_trips,
    CONCAT('المكتملة: ', SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)) AS completed_trips,
    CONCAT('قيد التنفيذ: ', SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END)) AS in_progress_trips,
    CONCAT('متوسط معدل الإكمال: ', ROUND(AVG(completion_rate), 2), '%') AS avg_completion_rate,
    CONCAT('متوسط معدل التحصيل: ', ROUND(AVG(collection_rate), 2), '%') AS avg_collection_rate
FROM distribution_trips;

-- إحصائيات زيارات المحلات
SELECT 
    CONCAT('إجمالي الزيارات: ', COUNT(*)) AS total_visits,
    CONCAT('المكتملة: ', SUM(CASE WHEN visit_status = 'completed' THEN 1 ELSE 0 END)) AS completed_visits,
    CONCAT('التوصيل الناجح: ', SUM(CASE WHEN delivery_successful = TRUE THEN 1 ELSE 0 END)) AS successful_deliveries,
    CONCAT('الدفع المحصل: ', SUM(CASE WHEN payment_collected = TRUE THEN 1 ELSE 0 END)) AS payments_collected,
    CONCAT('إجمالي المحصل EUR: ', ROUND(SUM(payment_collected_eur), 2)) AS total_collected_eur
FROM store_visits;

-- أداء الموزعين في الرحلات
SELECT 
    distributor_name AS 'الموزع',
    COUNT(*) AS 'عدد الرحلات',
    ROUND(AVG(completion_rate), 2) AS 'متوسط الإكمال %',
    ROUND(AVG(collection_rate), 2) AS 'متوسط التحصيل %',
    ROUND(SUM(collected_amount_eur), 2) AS 'إجمالي المحصل EUR'
FROM distribution_trips
GROUP BY distributor_id, distributor_name
ORDER BY SUM(collected_amount_eur) DESC; 