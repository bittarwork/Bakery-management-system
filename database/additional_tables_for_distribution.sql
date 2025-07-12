-- ===========================================
-- جداول إضافية لنظام التوزيع الشامل
-- تم إنشاؤه لدعم كل سيناريوهات العمل
-- ===========================================

USE `bakery_db`;

-- تعطيل فحص المفاتيح الخارجية مؤقتاً
SET FOREIGN_KEY_CHECKS = 0;

-- ===========================================
-- 1. جدول جداول التوزيع (distribution_schedules)
-- ===========================================

CREATE TABLE IF NOT EXISTS `distribution_schedules` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `distributor_id` INT NOT NULL,
    `schedule_date` DATE NOT NULL,
    `total_stores` INT NOT NULL DEFAULT 0,
    `status` ENUM('draft', 'active', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'draft',
    `route_data` JSON NULL,
    `start_time` TIME NULL,
    `end_time` TIME NULL,
    `estimated_duration` INT NULL, -- in minutes
    `actual_duration` INT NULL, -- in minutes
    `notes` TEXT NULL,
    `created_by` INT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_distributor_date` (`distributor_id`, `schedule_date`),
    INDEX `idx_schedule_date` (`schedule_date`),
    INDEX `idx_status` (`status`),
    
    FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 2. جدول مخزون السيارات (vehicle_inventory)
-- ===========================================

CREATE TABLE IF NOT EXISTS `vehicle_inventory` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `distributor_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 0,
    `loaded_quantity` INT NOT NULL DEFAULT 0,
    `delivered_quantity` INT NOT NULL DEFAULT 0,
    `returned_quantity` INT NOT NULL DEFAULT 0,
    `damaged_quantity` INT NOT NULL DEFAULT 0,
    `last_updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY `unique_distributor_product` (`distributor_id`, `product_id`),
    INDEX `idx_distributor_id` (`distributor_id`),
    INDEX `idx_product_id` (`product_id`),
    
    FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 3. جدول سجلات التسليم (delivery_records)
-- ===========================================

CREATE TABLE IF NOT EXISTS `delivery_records` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `distributor_id` INT NOT NULL,
    `actual_quantities` JSON NOT NULL,
    `gifts_given` JSON NULL,
    `damages_recorded` JSON NULL,
    `delivery_time` TIME NULL,
    `notes` TEXT NULL,
    `signature` TEXT NULL,
    `delivery_date` DATE NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_order_id` (`order_id`),
    INDEX `idx_distributor_id` (`distributor_id`),
    INDEX `idx_delivery_date` (`delivery_date`),
    
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 4. جدول مصاريف السيارات (vehicle_expenses)
-- ===========================================

CREATE TABLE IF NOT EXISTS `vehicle_expenses` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `distributor_id` INT NOT NULL,
    `expense_type` ENUM('fuel', 'maintenance', 'repair', 'toll', 'parking', 'other') NOT NULL,
    `amount_eur` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `amount_syp` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `currency` ENUM('EUR', 'SYP') NOT NULL DEFAULT 'EUR',
    `description` TEXT NOT NULL,
    `receipt_image` VARCHAR(500) NULL,
    `expense_date` DATE NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_distributor_id` (`distributor_id`),
    INDEX `idx_expense_date` (`expense_date`),
    INDEX `idx_expense_type` (`expense_type`),
    
    FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 5. جدول التقارير اليومية (daily_reports)
-- ===========================================

CREATE TABLE IF NOT EXISTS `daily_reports` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `distributor_id` INT NOT NULL,
    `report_date` DATE NOT NULL,
    `summary_data` JSON NOT NULL,
    `signature` TEXT NULL,
    `status` ENUM('draft', 'submitted', 'approved', 'rejected') NOT NULL DEFAULT 'draft',
    `approval_notes` TEXT NULL,
    `approved_by` INT NULL,
    `approved_at` TIMESTAMP NULL,
    `submitted_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY `unique_distributor_date` (`distributor_id`, `report_date`),
    INDEX `idx_distributor_id` (`distributor_id`),
    INDEX `idx_report_date` (`report_date`),
    INDEX `idx_status` (`status`),
    
    FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 6. جدول سجلات التوزيع (delivery_logs)
-- ===========================================

CREATE TABLE IF NOT EXISTS `delivery_logs` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `distributor_id` INT NOT NULL,
    `action` ENUM('quantity_update', 'delivery_complete', 'payment_record', 'note_added', 'status_change') NOT NULL,
    `details` JSON NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_order_id` (`order_id`),
    INDEX `idx_distributor_id` (`distributor_id`),
    INDEX `idx_action` (`action`),
    INDEX `idx_created_at` (`created_at`),
    
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 7. جدول سياسات الهدايا (gift_policies)
-- ===========================================

CREATE TABLE IF NOT EXISTS `gift_policies` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `store_id` INT NULL, -- NULL means applies to all stores
    `product_id` INT NOT NULL,
    `store_category` VARCHAR(50) NULL, -- Alternative to store_id
    `buy_quantity` INT NOT NULL,
    `gift_quantity` INT NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `created_by` INT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_store_id` (`store_id`),
    INDEX `idx_product_id` (`product_id`),
    INDEX `idx_store_category` (`store_category`),
    INDEX `idx_is_active` (`is_active`),
    
    FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 8. جدول تعيينات المحلات (store_assignments)
-- ===========================================

CREATE TABLE IF NOT EXISTS `store_assignments` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `store_id` INT NOT NULL,
    `distributor_id` INT NOT NULL,
    `zone` VARCHAR(100) NULL,
    `assigned_by` INT NOT NULL,
    `assigned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    
    INDEX `idx_store_id` (`store_id`),
    INDEX `idx_distributor_id` (`distributor_id`),
    INDEX `idx_zone` (`zone`),
    INDEX `idx_assigned_at` (`assigned_at`),
    
    FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 9. جدول تعديلات الأرصدة (balance_adjustments)
-- ===========================================

CREATE TABLE IF NOT EXISTS `balance_adjustments` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `store_id` INT NOT NULL,
    `amount_eur` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `amount_syp` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `currency` ENUM('EUR', 'SYP') NOT NULL,
    `reason` ENUM('manual_adjustment', 'payment_correction', 'debt_forgiveness', 'bonus', 'penalty', 'other') NOT NULL,
    `notes` TEXT NULL,
    `adjusted_by` INT NOT NULL,
    `adjusted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_store_id` (`store_id`),
    INDEX `idx_adjusted_by` (`adjusted_by`),
    INDEX `idx_adjusted_at` (`adjusted_at`),
    INDEX `idx_reason` (`reason`),
    
    FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`adjusted_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 10. جدول التقارير الأسبوعية (weekly_reports)
-- ===========================================

CREATE TABLE IF NOT EXISTS `weekly_reports` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `week_start` DATE NOT NULL,
    `week_end` DATE NOT NULL,
    `report_data` JSON NOT NULL,
    `format` ENUM('json', 'pdf', 'excel') NOT NULL DEFAULT 'json',
    `file_path` VARCHAR(500) NULL,
    `generated_by` INT NOT NULL,
    `generated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_week_start` (`week_start`),
    INDEX `idx_week_end` (`week_end`),
    INDEX `idx_generated_by` (`generated_by`),
    INDEX `idx_generated_at` (`generated_at`),
    
    FOREIGN KEY (`generated_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 11. جدول الإشعارات (notifications)
-- ===========================================

CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `type` ENUM('delivery_reminder', 'payment_due', 'schedule_update', 'report_approval', 'system_alert', 'other') NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `data` JSON NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `priority` ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    `expires_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_type` (`type`),
    INDEX `idx_is_read` (`is_read`),
    INDEX `idx_priority` (`priority`),
    INDEX `idx_created_at` (`created_at`),
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 12. جدول تتبع المواقع (location_tracking)
-- ===========================================

CREATE TABLE IF NOT EXISTS `location_tracking` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `distributor_id` INT NOT NULL,
    `latitude` DECIMAL(10, 8) NOT NULL,
    `longitude` DECIMAL(11, 8) NOT NULL,
    `accuracy` DECIMAL(5, 2) NULL,
    `speed` DECIMAL(5, 2) NULL,
    `heading` DECIMAL(5, 2) NULL,
    `address` VARCHAR(255) NULL,
    `tracked_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_distributor_id` (`distributor_id`),
    INDEX `idx_tracked_at` (`tracked_at`),
    
    FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- تحديث جدول المدفوعات لدعم البيانات الإضافية
-- ===========================================

ALTER TABLE `payments` 
ADD COLUMN IF NOT EXISTS `payment_type` ENUM('current_order', 'old_debt', 'mixed', 'advance') NOT NULL DEFAULT 'current_order',
ADD COLUMN IF NOT EXISTS `distribution_data` JSON NULL COMMENT 'For mixed payment distribution',
ADD COLUMN IF NOT EXISTS `bank_details` JSON NULL COMMENT 'Bank transfer details',
ADD COLUMN IF NOT EXISTS `collected_by` INT NULL COMMENT 'Distributor who collected payment',
ADD COLUMN IF NOT EXISTS `receipt_number` VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS `exchange_rate` DECIMAL(10, 4) NULL,
ADD INDEX IF NOT EXISTS `idx_payment_type` (`payment_type`),
ADD INDEX IF NOT EXISTS `idx_collected_by` (`collected_by`);

-- إضافة المفاتيح الخارجية للحقول الجديدة
ALTER TABLE `payments` 
ADD CONSTRAINT IF NOT EXISTS `fk_payments_collected_by` 
    FOREIGN KEY (`collected_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;

-- ===========================================
-- تحديث جدول المنتجات لدعم معلومات إضافية
-- ===========================================

ALTER TABLE `products`
ADD COLUMN IF NOT EXISTS `gift_eligible` BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS `minimum_order_quantity` INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS `bulk_discount_threshold` INT NULL,
ADD COLUMN IF NOT EXISTS `bulk_discount_percentage` DECIMAL(5, 2) NULL,
ADD COLUMN IF NOT EXISTS `seasonal` BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS `weight_kg` DECIMAL(8, 3) NULL,
ADD COLUMN IF NOT EXISTS `volume_liters` DECIMAL(8, 3) NULL;

-- ===========================================
-- إنشاء Views للاستعلامات المتكررة
-- ===========================================

-- View for distributor daily summary
CREATE OR REPLACE VIEW `distributor_daily_summary` AS
SELECT 
    u.id as distributor_id,
    u.full_name as distributor_name,
    DATE(dr.delivery_date) as delivery_date,
    COUNT(DISTINCT dr.order_id) as total_deliveries,
    COUNT(DISTINCT o.store_id) as unique_stores,
    SUM(o.total_amount_eur) as total_sales_eur,
    SUM(o.total_amount_syp) as total_sales_syp,
    SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount_eur ELSE 0 END) as collected_eur,
    SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount_syp ELSE 0 END) as collected_syp
FROM users u
LEFT JOIN delivery_records dr ON u.id = dr.distributor_id
LEFT JOIN orders o ON dr.order_id = o.id
WHERE u.role = 'distributor'
GROUP BY u.id, u.full_name, DATE(dr.delivery_date);

-- View for store performance
CREATE OR REPLACE VIEW `store_performance` AS
SELECT 
    s.id as store_id,
    s.name as store_name,
    s.category,
    s.total_orders,
    s.completed_orders,
    s.total_purchases_eur,
    s.total_purchases_syp,
    s.current_balance_eur,
    s.current_balance_syp,
    s.last_order_date,
    s.last_payment_date,
    CASE 
        WHEN s.total_orders > 0 THEN (s.completed_orders / s.total_orders) * 100
        ELSE 0 
    END as completion_percentage,
    CASE 
        WHEN s.current_balance_eur > 0 OR s.current_balance_syp > 0 THEN 'debtor'
        WHEN s.current_balance_eur < 0 OR s.current_balance_syp < 0 THEN 'creditor'
        ELSE 'balanced'
    END as balance_status
FROM stores s;

-- إعادة تفعيل فحص المفاتيح الخارجية
SET FOREIGN_KEY_CHECKS = 1;

-- إنشاء فهارس إضافية للأداء
CREATE INDEX IF NOT EXISTS `idx_orders_date_status` ON `orders` (`order_date`, `status`);
CREATE INDEX IF NOT EXISTS `idx_payments_date_method` ON `payments` (`payment_date`, `payment_method`);
CREATE INDEX IF NOT EXISTS `idx_stores_distributor_status` ON `stores` (`assigned_distributor_id`, `status`); 