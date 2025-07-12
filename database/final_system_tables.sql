-- ===========================================
-- جداول النظام النهائية الإضافية
-- لاستكمال نظام إدارة المخبزة الشامل
-- ===========================================

USE `bakery_db`;

-- تعطيل فحص المفاتيح الخارجية مؤقتاً
SET FOREIGN_KEY_CHECKS = 0;

-- ===========================================
-- 1. جدول معاملات الهدايا (gift_transactions)
-- ===========================================

CREATE TABLE IF NOT EXISTS `gift_transactions` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `distributor_id` INT NOT NULL,
    `order_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `quantity` INT NOT NULL,
    `gift_date` DATE NOT NULL,
    `policy_id` INT NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_distributor_id` (`distributor_id`),
    INDEX `idx_order_id` (`order_id`),
    INDEX `idx_product_id` (`product_id`),
    INDEX `idx_gift_date` (`gift_date`),
    
    FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`policy_id`) REFERENCES `gift_policies`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 2. جدول سجلات الأضرار (damage_records)
-- ===========================================

CREATE TABLE IF NOT EXISTS `damage_records` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `distributor_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `quantity` INT NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `recorded_date` DATE NOT NULL,
    `estimated_cost_eur` DECIMAL(10, 2) NULL,
    `estimated_cost_syp` DECIMAL(15, 2) NULL,
    `photos` JSON NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_distributor_id` (`distributor_id`),
    INDEX `idx_product_id` (`product_id`),
    INDEX `idx_recorded_date` (`recorded_date`),
    INDEX `idx_reason` (`reason`),
    
    FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 3. جدول سجلات المخزون (inventory_logs)
-- ===========================================

CREATE TABLE IF NOT EXISTS `inventory_logs` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `distributor_id` INT NOT NULL,
    `action` ENUM('vehicle_loaded', 'delivery_update', 'manual_adjustment', 'return_processed', 'damage_recorded') NOT NULL,
    `details` JSON NOT NULL,
    `created_by` INT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_distributor_id` (`distributor_id`),
    INDEX `idx_action` (`action`),
    INDEX `idx_created_at` (`created_at`),
    
    FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 4. جدول المسارات (distribution_routes)
-- ===========================================

CREATE TABLE IF NOT EXISTS `distribution_routes` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `distributor_id` INT NOT NULL,
    `route_data` JSON NOT NULL,
    `total_distance` DECIMAL(10, 2) NULL COMMENT 'Distance in kilometers',
    `total_duration` INT NULL COMMENT 'Duration in seconds',
    `optimization_type` ENUM('time', 'distance', 'fuel') NOT NULL DEFAULT 'time',
    `status` ENUM('planned', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'planned',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_distributor_id` (`distributor_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created_at` (`created_at`),
    
    FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 5. جدول التقارير المحفوظة (saved_reports)
-- ===========================================

CREATE TABLE IF NOT EXISTS `saved_reports` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `report_type` ENUM('daily', 'weekly', 'monthly', 'analytics', 'custom') NOT NULL,
    `report_data` JSON NOT NULL,
    `filters` JSON NULL,
    `file_path` VARCHAR(500) NULL,
    `file_format` ENUM('json', 'excel', 'pdf', 'csv') NOT NULL DEFAULT 'json',
    `generated_by` INT NOT NULL,
    `generated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expires_at` TIMESTAMP NULL,
    
    INDEX `idx_report_type` (`report_type`),
    INDEX `idx_generated_by` (`generated_by`),
    INDEX `idx_generated_at` (`generated_at`),
    
    FOREIGN KEY (`generated_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 6. جدول جلسات العمل (work_sessions)
-- ===========================================

CREATE TABLE IF NOT EXISTS `work_sessions` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `distributor_id` INT NOT NULL,
    `session_date` DATE NOT NULL,
    `start_time` TIME NULL,
    `end_time` TIME NULL,
    `start_location` JSON NULL,
    `end_location` JSON NULL,
    `total_distance` DECIMAL(10, 2) NULL,
    `total_duration` INT NULL,
    `status` ENUM('started', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'started',
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY `unique_distributor_date` (`distributor_id`, `session_date`),
    INDEX `idx_session_date` (`session_date`),
    INDEX `idx_status` (`status`),
    
    FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 7. جدول رسائل النظام (system_messages)
-- ===========================================

CREATE TABLE IF NOT EXISTS `system_messages` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `sender_id` INT NULL,
    `recipient_id` INT NOT NULL,
    `message_type` ENUM('notification', 'alert', 'reminder', 'announcement', 'personal') NOT NULL,
    `subject` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `priority` ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `read_at` TIMESTAMP NULL,
    `action_required` BOOLEAN NOT NULL DEFAULT FALSE,
    `action_data` JSON NULL,
    `expires_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_recipient_id` (`recipient_id`),
    INDEX `idx_message_type` (`message_type`),
    INDEX `idx_is_read` (`is_read`),
    INDEX `idx_priority` (`priority`),
    INDEX `idx_created_at` (`created_at`),
    
    FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 8. جدول إعدادات النظام (system_settings)
-- ===========================================

CREATE TABLE IF NOT EXISTS `system_settings` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) NOT NULL UNIQUE,
    `setting_value` TEXT NOT NULL,
    `setting_type` ENUM('string', 'number', 'boolean', 'json', 'encrypted') NOT NULL DEFAULT 'string',
    `category` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT FALSE,
    `updated_by` INT NOT NULL,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_category` (`category`),
    INDEX `idx_is_public` (`is_public`),
    
    FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 9. جدول أوقات التشغيل (operating_hours)
-- ===========================================

CREATE TABLE IF NOT EXISTS `operating_hours` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `entity_type` ENUM('bakery', 'store', 'distributor') NOT NULL,
    `entity_id` INT NOT NULL,
    `day_of_week` TINYINT NOT NULL COMMENT '0=Sunday, 1=Monday, ..., 6=Saturday',
    `open_time` TIME NOT NULL,
    `close_time` TIME NOT NULL,
    `is_closed` BOOLEAN NOT NULL DEFAULT FALSE,
    `break_start` TIME NULL,
    `break_end` TIME NULL,
    `special_notes` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY `unique_entity_day` (`entity_type`, `entity_id`, `day_of_week`),
    INDEX `idx_entity` (`entity_type`, `entity_id`),
    INDEX `idx_day_of_week` (`day_of_week`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 10. جدول الأهداف والمعايير (targets_metrics)
-- ===========================================

CREATE TABLE IF NOT EXISTS `targets_metrics` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `target_type` ENUM('sales', 'deliveries', 'collection', 'efficiency', 'customer_satisfaction') NOT NULL,
    `entity_type` ENUM('distributor', 'store', 'product', 'system') NOT NULL,
    `entity_id` INT NULL,
    `target_period` ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly') NOT NULL,
    `target_value` DECIMAL(15, 2) NOT NULL,
    `current_value` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `unit` VARCHAR(20) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_by` INT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_target_type` (`target_type`),
    INDEX `idx_entity` (`entity_type`, `entity_id`),
    INDEX `idx_period_dates` (`target_period`, `start_date`, `end_date`),
    INDEX `idx_is_active` (`is_active`),
    
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- إدراج البيانات الأساسية للنظام
-- ===========================================

-- إعدادات النظام الأساسية
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `category`, `description`, `is_public`, `updated_by`) VALUES
('default_currency', 'EUR', 'string', 'financial', 'العملة الافتراضية للنظام', 1, 1),
('secondary_currency', 'SYP', 'string', 'financial', 'العملة الثانوية للنظام', 1, 1),
('exchange_rate_eur_syp', '15000', 'number', 'financial', 'سعر صرف اليورو مقابل الليرة السورية', 0, 1),
('working_hours_start', '06:00', 'string', 'operations', 'بداية ساعات العمل', 1, 1),
('working_hours_end', '18:00', 'string', 'operations', 'نهاية ساعات العمل', 1, 1),
('delivery_radius_km', '50', 'number', 'operations', 'نطاق التوصيل بالكيلومتر', 1, 1),
('auto_generate_schedules', 'true', 'boolean', 'automation', 'توليد جداول التوزيع تلقائياً', 0, 1),
('notification_enabled', 'true', 'boolean', 'notifications', 'تفعيل الإشعارات', 1, 1),
('location_tracking_interval', '300', 'number', 'tracking', 'فترة تتبع الموقع بالثواني', 0, 1),
('backup_retention_days', '90', 'number', 'system', 'عدد أيام الاحتفاظ بالنسخ الاحتياطية', 0, 1);

-- ساعات التشغيل الافتراضية للمخبز
INSERT IGNORE INTO `operating_hours` (`entity_type`, `entity_id`, `day_of_week`, `open_time`, `close_time`) VALUES
('bakery', 1, 1, '06:00:00', '18:00:00'), -- Monday
('bakery', 1, 2, '06:00:00', '18:00:00'), -- Tuesday
('bakery', 1, 3, '06:00:00', '18:00:00'), -- Wednesday
('bakery', 1, 4, '06:00:00', '18:00:00'), -- Thursday
('bakery', 1, 5, '06:00:00', '18:00:00'), -- Friday
('bakery', 1, 6, '06:00:00', '14:00:00'), -- Saturday
('bakery', 1, 0, '00:00:00', '00:00:00', 1); -- Sunday (closed)

-- ===========================================
-- إنشاء Triggers للتحديث التلقائي
-- ===========================================

-- Trigger لتحديث رصيد المحل عند إضافة دفعة
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS `update_store_balance_after_payment` 
AFTER INSERT ON `payments`
FOR EACH ROW
BEGIN
    UPDATE stores 
    SET current_balance_eur = current_balance_eur - NEW.amount_eur,
        current_balance_syp = current_balance_syp - NEW.amount_syp,
        total_payments_eur = total_payments_eur + NEW.amount_eur,
        total_payments_syp = total_payments_syp + NEW.amount_syp,
        last_payment_date = CURDATE(),
        updated_at = NOW()
    WHERE id = NEW.store_id;
END$$

-- Trigger لتحديث إحصائيات المحل عند إضافة طلب
CREATE TRIGGER IF NOT EXISTS `update_store_stats_after_order` 
AFTER INSERT ON `orders`
FOR EACH ROW
BEGIN
    UPDATE stores 
    SET total_orders = total_orders + 1,
        current_balance_eur = current_balance_eur + NEW.total_amount_eur,
        current_balance_syp = current_balance_syp + NEW.total_amount_syp,
        total_purchases_eur = total_purchases_eur + NEW.total_amount_eur,
        total_purchases_syp = total_purchases_syp + NEW.total_amount_syp,
        last_order_date = NEW.order_date,
        updated_at = NOW()
    WHERE id = NEW.store_id;
END$$

-- Trigger لتحديث حالة الطلب المكتمل
CREATE TRIGGER IF NOT EXISTS `update_order_completion` 
AFTER UPDATE ON `orders`
FOR EACH ROW
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        UPDATE stores 
        SET completed_orders = completed_orders + 1,
            updated_at = NOW()
        WHERE id = NEW.store_id;
    END IF;
END$$

DELIMITER ;

-- ===========================================
-- إنشاء Functions مساعدة
-- ===========================================

DELIMITER $$

-- Function لحساب المسافة بين نقطتين
CREATE FUNCTION IF NOT EXISTS `calculate_distance`(
    lat1 DECIMAL(10,8), 
    lng1 DECIMAL(11,8), 
    lat2 DECIMAL(10,8), 
    lng2 DECIMAL(11,8)
) 
RETURNS DECIMAL(10,3)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE distance DECIMAL(10,3);
    DECLARE earth_radius DECIMAL(10,3) DEFAULT 6371.0;
    DECLARE dlat DECIMAL(10,8);
    DECLARE dlng DECIMAL(10,8);
    DECLARE a DECIMAL(20,15);
    DECLARE c DECIMAL(20,15);
    
    SET dlat = RADIANS(lat2 - lat1);
    SET dlng = RADIANS(lng2 - lng1);
    SET a = SIN(dlat/2) * SIN(dlat/2) + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlng/2) * SIN(dlng/2);
    SET c = 2 * ATAN2(SQRT(a), SQRT(1-a));
    SET distance = earth_radius * c;
    
    RETURN distance;
END$$

-- Function لتنسيق العملة
CREATE FUNCTION IF NOT EXISTS `format_currency`(
    amount DECIMAL(15,2),
    currency VARCHAR(3)
)
RETURNS VARCHAR(50)
READS SQL DATA
DETERMINISTIC
BEGIN
    CASE currency
        WHEN 'EUR' THEN RETURN CONCAT('€', FORMAT(amount, 2));
        WHEN 'SYP' THEN RETURN CONCAT(FORMAT(amount, 0), ' ل.س');
        ELSE RETURN CONCAT(FORMAT(amount, 2), ' ', currency);
    END CASE;
END$$

DELIMITER ;

-- ===========================================
-- إنشاء Procedures مساعدة
-- ===========================================

DELIMITER $$

-- Procedure لحساب الإحصائيات اليومية
CREATE PROCEDURE IF NOT EXISTS `calculate_daily_stats`(IN target_date DATE)
BEGIN
    DECLARE total_orders INT DEFAULT 0;
    DECLARE total_sales_eur DECIMAL(15,2) DEFAULT 0;
    DECLARE total_sales_syp DECIMAL(15,2) DEFAULT 0;
    DECLARE delivered_orders INT DEFAULT 0;
    
    -- Get daily statistics
    SELECT 
        COUNT(*),
        COALESCE(SUM(total_amount_eur), 0),
        COALESCE(SUM(total_amount_syp), 0),
        COUNT(CASE WHEN status = 'delivered' THEN 1 END)
    INTO total_orders, total_sales_eur, total_sales_syp, delivered_orders
    FROM orders 
    WHERE order_date = target_date;
    
    -- Insert or update daily statistics
    INSERT INTO daily_statistics 
    (stat_date, total_orders, total_sales_eur, total_sales_syp, delivered_orders, delivery_rate)
    VALUES 
    (target_date, total_orders, total_sales_eur, total_sales_syp, delivered_orders, 
     CASE WHEN total_orders > 0 THEN (delivered_orders / total_orders * 100) ELSE 0 END)
    ON DUPLICATE KEY UPDATE
    total_orders = VALUES(total_orders),
    total_sales_eur = VALUES(total_sales_eur),
    total_sales_syp = VALUES(total_sales_syp),
    delivered_orders = VALUES(delivered_orders),
    delivery_rate = VALUES(delivery_rate),
    updated_at = NOW();
END$$

DELIMITER ;

-- ===========================================
-- إنشاء جدول الإحصائيات اليومية
-- ===========================================

CREATE TABLE IF NOT EXISTS `daily_statistics` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `stat_date` DATE NOT NULL UNIQUE,
    `total_orders` INT NOT NULL DEFAULT 0,
    `delivered_orders` INT NOT NULL DEFAULT 0,
    `cancelled_orders` INT NOT NULL DEFAULT 0,
    `total_sales_eur` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `total_sales_syp` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `total_payments_eur` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `total_payments_syp` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `active_distributors` INT NOT NULL DEFAULT 0,
    `active_stores` INT NOT NULL DEFAULT 0,
    `delivery_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `collection_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_stat_date` (`stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إعادة تفعيل فحص المفاتيح الخارجية
SET FOREIGN_KEY_CHECKS = 1;

-- ===========================================
-- رسالة اكتمال
-- ===========================================

SELECT 'تم إنشاء جميع جداول النظام بنجاح!' as status; 