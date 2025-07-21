-- ============================================
-- إنشاء جداول نظام جدولة التسليم المتقدم
-- Create Advanced Delivery Scheduling Tables
-- ============================================

-- 1. جدول جدولة التسليم الأساسي
CREATE TABLE IF NOT EXISTS `delivery_schedules` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `distributor_id` INT NULL,
    `scheduled_date` DATE NOT NULL,
    `scheduled_time_start` TIME NOT NULL,
    `scheduled_time_end` TIME NULL,
    `time_slot` ENUM('morning', 'afternoon', 'evening', 'custom') DEFAULT 'morning',
    `delivery_type` ENUM('standard', 'express', 'scheduled', 'pickup') DEFAULT 'standard',
    `priority` ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    `status` ENUM('scheduled', 'confirmed', 'in_progress', 'delivered', 'missed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
    
    -- معلومات التسليم
    `delivery_address` TEXT NULL,
    `delivery_instructions` TEXT NULL,
    `contact_person` VARCHAR(255) NULL,
    `contact_phone` VARCHAR(50) NULL,
    `contact_email` VARCHAR(255) NULL,
    
    -- الرسوم والتكاليف
    `delivery_fee_eur` DECIMAL(10,2) DEFAULT 0.00,
    `delivery_fee_syp` DECIMAL(15,2) DEFAULT 0.00,
    `extra_charges_eur` DECIMAL(10,2) DEFAULT 0.00,
    `extra_charges_syp` DECIMAL(15,2) DEFAULT 0.00,
    
    -- التأكيد والإشعارات
    `confirmation_token` VARCHAR(100) NULL UNIQUE,
    `confirmation_required` BOOLEAN DEFAULT FALSE,
    `confirmed_at` TIMESTAMP NULL,
    `confirmed_by` VARCHAR(255) NULL,
    `customer_notes` TEXT NULL,
    
    -- إعادة الجدولة
    `rescheduled_from` INT NULL,
    `reschedule_count` INT DEFAULT 0,
    `reschedule_reason` TEXT NULL,
    `max_reschedules` INT DEFAULT 3,
    
    -- GPS والموقع
    `gps_coordinates` JSON NULL,
    `delivery_location` JSON NULL,
    `route_optimization_data` JSON NULL,
    
    -- التتبع والأداء
    `estimated_duration_minutes` INT NULL,
    `actual_duration_minutes` INT NULL,
    `delivery_rating` DECIMAL(3,2) NULL,
    `delivery_feedback` TEXT NULL,
    
    -- التواريخ والمستخدمين
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` INT NULL,
    `updated_by` INT NULL,
    
    -- الفهارس والمفاتيح الخارجية
    INDEX `idx_order_id` (`order_id`),
    INDEX `idx_distributor_id` (`distributor_id`),
    INDEX `idx_scheduled_date` (`scheduled_date`),
    INDEX `idx_time_slot` (`time_slot`),
    INDEX `idx_status` (`status`),
    INDEX `idx_delivery_type` (`delivery_type`),
    INDEX `idx_priority` (`priority`),
    INDEX `idx_confirmation_token` (`confirmation_token`),
    INDEX `idx_date_time` (`scheduled_date`, `scheduled_time_start`),
    
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`rescheduled_from`) REFERENCES `delivery_schedules`(`id`) ON DELETE SET NULL
);

-- 2. جدول سعة التسليم اليومية
CREATE TABLE IF NOT EXISTS `delivery_capacity` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `capacity_date` DATE NOT NULL,
    `time_slot` ENUM('morning', 'afternoon', 'evening', 'all_day') NOT NULL,
    `max_deliveries` INT NOT NULL DEFAULT 10,
    `current_bookings` INT DEFAULT 0,
    `available_capacity` INT GENERATED ALWAYS AS (`max_deliveries` - `current_bookings`) STORED,
    `capacity_percentage` DECIMAL(5,2) GENERATED ALWAYS AS ((`current_bookings` * 100.0) / `max_deliveries`) STORED,
    
    -- تكوين السعة
    `distributor_count` INT DEFAULT 1,
    `vehicle_capacity` JSON NULL,
    `area_restrictions` JSON NULL,
    `weather_factors` JSON NULL,
    
    -- التواريخ
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY `unique_date_slot` (`capacity_date`, `time_slot`),
    INDEX `idx_capacity_date` (`capacity_date`),
    INDEX `idx_time_slot_capacity` (`time_slot`),
    INDEX `idx_available_capacity` (`available_capacity`)
);

-- 3. جدول تتبع التسليم المباشر
CREATE TABLE IF NOT EXISTS `delivery_tracking` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `delivery_schedule_id` INT NOT NULL,
    `distributor_id` INT NOT NULL,
    `tracking_date` DATE NOT NULL,
    `status` ENUM('not_started', 'en_route', 'arrived', 'delivering', 'completed', 'failed') DEFAULT 'not_started',
    
    -- المواقع والأوقات
    `current_location` JSON NULL,
    `start_location` JSON NULL,
    `delivery_location` JSON NULL,
    `estimated_arrival` TIMESTAMP NULL,
    `actual_arrival` TIMESTAMP NULL,
    `delivery_start_time` TIMESTAMP NULL,
    `delivery_completion_time` TIMESTAMP NULL,
    
    -- تفاصيل التسليم
    `delivery_proof` JSON NULL, -- صور، توقيع، إلخ
    `delivery_notes` TEXT NULL,
    `customer_signature` TEXT NULL,
    `photo_urls` JSON NULL,
    
    -- المشاكل والتأخيرات
    `issues_encountered` JSON NULL,
    `delay_reasons` JSON NULL,
    `delay_duration_minutes` INT DEFAULT 0,
    
    -- التحديثات المباشرة
    `last_update` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `update_frequency` INT DEFAULT 5, -- minutes
    
    INDEX `idx_delivery_schedule` (`delivery_schedule_id`),
    INDEX `idx_distributor` (`distributor_id`),
    INDEX `idx_tracking_date` (`tracking_date`),
    INDEX `idx_status_tracking` (`status`),
    
    FOREIGN KEY (`delivery_schedule_id`) REFERENCES `delivery_schedules`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- 4. جدول تحسين المسارات
CREATE TABLE IF NOT EXISTS `delivery_routes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `route_date` DATE NOT NULL,
    `distributor_id` INT NOT NULL,
    `route_name` VARCHAR(255) NOT NULL,
    `route_type` ENUM('optimized', 'manual', 'suggested') DEFAULT 'optimized',
    
    -- بيانات المسار
    `waypoints` JSON NOT NULL,
    `route_polyline` TEXT NULL,
    `total_distance_km` DECIMAL(8,2) NULL,
    `estimated_duration_minutes` INT NULL,
    `actual_duration_minutes` INT NULL,
    
    -- الإحصائيات
    `total_stops` INT NOT NULL,
    `completed_stops` INT DEFAULT 0,
    `success_rate` DECIMAL(5,2) DEFAULT 0.00,
    
    -- تفاصيل التكلفة
    `fuel_cost_eur` DECIMAL(8,2) DEFAULT 0.00,
    `fuel_cost_syp` DECIMAL(12,2) DEFAULT 0.00,
    `toll_charges_eur` DECIMAL(8,2) DEFAULT 0.00,
    `other_expenses_eur` DECIMAL(8,2) DEFAULT 0.00,
    
    -- الحالة والتاريخ
    `status` ENUM('planned', 'active', 'completed', 'cancelled') DEFAULT 'planned',
    `started_at` TIMESTAMP NULL,
    `completed_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_route_date` (`route_date`),
    INDEX `idx_distributor_routes` (`distributor_id`),
    INDEX `idx_route_status` (`status`),
    INDEX `idx_route_type` (`route_type`),
    
    FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- 5. جدول أداء التسليم
CREATE TABLE IF NOT EXISTS `delivery_performance` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `performance_date` DATE NOT NULL,
    `distributor_id` INT NULL,
    `period_type` ENUM('daily', 'weekly', 'monthly') NOT NULL,
    
    -- إحصائيات الأداء
    `total_scheduled` INT DEFAULT 0,
    `total_completed` INT DEFAULT 0,
    `total_missed` INT DEFAULT 0,
    `total_rescheduled` INT DEFAULT 0,
    `completion_rate` DECIMAL(5,2) DEFAULT 0.00,
    `on_time_rate` DECIMAL(5,2) DEFAULT 0.00,
    
    -- مقاييس الوقت
    `avg_delivery_time_minutes` DECIMAL(8,2) DEFAULT 0.00,
    `total_distance_km` DECIMAL(10,2) DEFAULT 0.00,
    `fuel_efficiency` DECIMAL(8,4) DEFAULT 0.00,
    
    -- رضا العملاء
    `customer_rating_avg` DECIMAL(3,2) DEFAULT 0.00,
    `total_ratings_count` INT DEFAULT 0,
    `complaints_count` INT DEFAULT 0,
    `compliments_count` INT DEFAULT 0,
    
    -- التكاليف والإيرادات
    `total_delivery_fees_eur` DECIMAL(12,2) DEFAULT 0.00,
    `total_expenses_eur` DECIMAL(12,2) DEFAULT 0.00,
    `net_profit_eur` DECIMAL(12,2) DEFAULT 0.00,
    
    -- التواريخ
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY `unique_performance` (`performance_date`, `distributor_id`, `period_type`),
    INDEX `idx_performance_date` (`performance_date`),
    INDEX `idx_distributor_performance` (`distributor_id`),
    INDEX `idx_period_type` (`period_type`),
    
    FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- 6. جدول إعدادات جدولة التسليم
CREATE TABLE IF NOT EXISTS `delivery_settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) NOT NULL UNIQUE,
    `setting_value` JSON NOT NULL,
    `setting_type` ENUM('capacity', 'timing', 'pricing', 'notification', 'system') NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_setting_key` (`setting_key`),
    INDEX `idx_setting_type` (`setting_type`),
    INDEX `idx_is_active` (`is_active`)
);

-- إدراج الإعدادات الافتراضية
INSERT INTO `delivery_settings` (`setting_key`, `setting_value`, `setting_type`, `description`) VALUES 
('default_capacity', '{"morning": 10, "afternoon": 15, "evening": 8}', 'capacity', 'السعة الافتراضية لكل فترة زمنية'),
('time_slots', '{"morning": {"start": "09:00", "end": "12:00"}, "afternoon": {"start": "14:00", "end": "17:00"}, "evening": {"start": "18:00", "end": "21:00"}}', 'timing', 'الفترات الزمنية للتسليم'),
('delivery_fees', '{"standard": 5.0, "express": 8.0, "scheduled": 6.0, "pickup": 0.0}', 'pricing', 'رسوم التسليم حسب النوع (EUR)'),
('notification_settings', '{"email": true, "sms": false, "push": true, "confirmation_required": true}', 'notification', 'إعدادات الإشعارات'),
('max_reschedules', '3', 'system', 'العدد الأقصى لإعادة الجدولة المسموح'),
('booking_advance_days', '7', 'system', 'عدد الأيام المسموح للحجز مسبقاً'),
('auto_confirm_hours', '24', 'system', 'ساعات التأكيد التلقائي'),
('route_optimization', '{"enabled": true, "provider": "google_maps", "factors": ["distance", "traffic", "time"]}', 'system', 'إعدادات تحسين المسارات')
ON DUPLICATE KEY UPDATE 
`setting_value` = VALUES(`setting_value`), 
`updated_at` = CURRENT_TIMESTAMP;

-- إنشاء triggers لتحديث السعة تلقائياً
DELIMITER //

CREATE TRIGGER IF NOT EXISTS `update_delivery_capacity_after_schedule_insert`
AFTER INSERT ON `delivery_schedules`
FOR EACH ROW
BEGIN
    INSERT INTO `delivery_capacity` (`capacity_date`, `time_slot`, `max_deliveries`, `current_bookings`)
    VALUES (NEW.scheduled_date, NEW.time_slot, 10, 1)
    ON DUPLICATE KEY UPDATE 
    `current_bookings` = `current_bookings` + 1,
    `updated_at` = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER IF NOT EXISTS `update_delivery_capacity_after_schedule_delete`
AFTER DELETE ON `delivery_schedules`
FOR EACH ROW
BEGIN
    UPDATE `delivery_capacity` 
    SET `current_bookings` = GREATEST(0, `current_bookings` - 1),
        `updated_at` = CURRENT_TIMESTAMP
    WHERE `capacity_date` = OLD.scheduled_date 
    AND `time_slot` = OLD.time_slot;
END//

CREATE TRIGGER IF NOT EXISTS `update_delivery_capacity_after_schedule_update`
AFTER UPDATE ON `delivery_schedules`
FOR EACH ROW
BEGIN
    -- إذا تم تغيير التاريخ أو الفترة الزمنية
    IF OLD.scheduled_date != NEW.scheduled_date OR OLD.time_slot != NEW.time_slot THEN
        -- تقليل السعة للتاريخ والوقت القديم
        UPDATE `delivery_capacity` 
        SET `current_bookings` = GREATEST(0, `current_bookings` - 1),
            `updated_at` = CURRENT_TIMESTAMP
        WHERE `capacity_date` = OLD.scheduled_date 
        AND `time_slot` = OLD.time_slot;
        
        -- زيادة السعة للتاريخ والوقت الجديد
        INSERT INTO `delivery_capacity` (`capacity_date`, `time_slot`, `max_deliveries`, `current_bookings`)
        VALUES (NEW.scheduled_date, NEW.time_slot, 10, 1)
        ON DUPLICATE KEY UPDATE 
        `current_bookings` = `current_bookings` + 1,
        `updated_at` = CURRENT_TIMESTAMP;
    END IF;
END//

DELIMITER ;

-- إنشاء فهارس إضافية للأداء
CREATE INDEX IF NOT EXISTS `idx_delivery_schedules_performance` ON `delivery_schedules` (`scheduled_date`, `status`, `delivery_type`);
CREATE INDEX IF NOT EXISTS `idx_delivery_schedules_distributor_date` ON `delivery_schedules` (`distributor_id`, `scheduled_date`);
CREATE INDEX IF NOT EXISTS `idx_delivery_capacity_performance` ON `delivery_capacity` (`capacity_date`, `available_capacity`);

-- إنشاء views مفيدة
CREATE OR REPLACE VIEW `v_delivery_schedule_summary` AS
SELECT 
    ds.id,
    ds.order_id,
    o.order_number,
    ds.scheduled_date,
    ds.scheduled_time_start,
    ds.scheduled_time_end,
    ds.time_slot,
    ds.delivery_type,
    ds.status,
    ds.priority,
    s.name as store_name,
    s.address as store_address,
    u.full_name as distributor_name,
    ds.delivery_fee_eur,
    ds.contact_person,
    ds.contact_phone,
    CASE 
        WHEN ds.status = 'delivered' THEN '✅ تم التسليم'
        WHEN ds.status = 'confirmed' THEN '🔒 مؤكد'
        WHEN ds.status = 'scheduled' THEN '📅 مجدول'
        WHEN ds.status = 'in_progress' THEN '🚚 قيد التنفيذ'
        WHEN ds.status = 'missed' THEN '❌ فائت'
        WHEN ds.status = 'cancelled' THEN '🚫 ملغي'
        ELSE ds.status
    END as status_display
FROM delivery_schedules ds
LEFT JOIN orders o ON ds.order_id = o.id
LEFT JOIN stores s ON o.store_id = s.id
LEFT JOIN users u ON ds.distributor_id = u.id;

CREATE OR REPLACE VIEW `v_daily_delivery_capacity` AS
SELECT 
    dc.capacity_date,
    dc.time_slot,
    dc.max_deliveries,
    dc.current_bookings,
    dc.available_capacity,
    dc.capacity_percentage,
    CASE 
        WHEN dc.capacity_percentage >= 90 THEN 'HIGH'
        WHEN dc.capacity_percentage >= 75 THEN 'MEDIUM'
        WHEN dc.capacity_percentage >= 50 THEN 'LOW'
        ELSE 'AVAILABLE'
    END as capacity_status,
    CASE dc.time_slot
        WHEN 'morning' THEN '🌅 صباحي (9:00-12:00)'
        WHEN 'afternoon' THEN '☀️ مسائي (14:00-17:00)'
        WHEN 'evening' THEN '🌇 مسائي متأخر (18:00-21:00)'
        ELSE dc.time_slot
    END as time_slot_display
FROM delivery_capacity dc;

-- إنشاء functions مفيدة
DELIMITER //

CREATE FUNCTION IF NOT EXISTS `get_available_time_slots`(delivery_date DATE)
RETURNS JSON
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE result JSON;
    
    SELECT JSON_OBJECT(
        'morning', JSON_OBJECT(
            'available', COALESCE((SELECT available_capacity FROM delivery_capacity 
                                 WHERE capacity_date = delivery_date AND time_slot = 'morning'), 10),
            'status', CASE 
                WHEN COALESCE((SELECT capacity_percentage FROM delivery_capacity 
                              WHERE capacity_date = delivery_date AND time_slot = 'morning'), 0) >= 90 
                THEN 'full'
                WHEN COALESCE((SELECT capacity_percentage FROM delivery_capacity 
                              WHERE capacity_date = delivery_date AND time_slot = 'morning'), 0) >= 75 
                THEN 'busy'
                ELSE 'available'
            END
        ),
        'afternoon', JSON_OBJECT(
            'available', COALESCE((SELECT available_capacity FROM delivery_capacity 
                                 WHERE capacity_date = delivery_date AND time_slot = 'afternoon'), 15),
            'status', CASE 
                WHEN COALESCE((SELECT capacity_percentage FROM delivery_capacity 
                              WHERE capacity_date = delivery_date AND time_slot = 'afternoon'), 0) >= 90 
                THEN 'full'
                WHEN COALESCE((SELECT capacity_percentage FROM delivery_capacity 
                              WHERE capacity_date = delivery_date AND time_slot = 'afternoon'), 0) >= 75 
                THEN 'busy'
                ELSE 'available'
            END
        ),
        'evening', JSON_OBJECT(
            'available', COALESCE((SELECT available_capacity FROM delivery_capacity 
                                 WHERE capacity_date = delivery_date AND time_slot = 'evening'), 8),
            'status', CASE 
                WHEN COALESCE((SELECT capacity_percentage FROM delivery_capacity 
                              WHERE capacity_date = delivery_date AND time_slot = 'evening'), 0) >= 90 
                THEN 'full'
                WHEN COALESCE((SELECT capacity_percentage FROM delivery_capacity 
                              WHERE capacity_date = delivery_date AND time_slot = 'evening'), 0) >= 75 
                THEN 'busy'
                ELSE 'available'
            END
        )
    ) INTO result;
    
    RETURN result;
END//

DELIMITER ;

-- رسالة تأكيد
SELECT '✅ تم إنشاء جداول نظام جدولة التسليم المتقدم بنجاح!' as status;
SELECT 'تشمل: delivery_schedules, delivery_capacity, delivery_tracking, delivery_routes, delivery_performance' as tables_created;
SELECT 'مع triggers وviews وfunctions مساعدة للنظام' as additional_features; 