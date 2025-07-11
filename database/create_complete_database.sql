-- ===========================================
-- نظام إدارة المخبزة - قاعدة البيانات الكاملة
-- تم إنشاؤه بتاريخ: 2024
-- العملة الافتراضية: EUR (يورو)
-- العملة الثانوية: SYP (ليرة سورية)
-- ===========================================

-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS `bakery_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- إنشاء قاعدة بيانات الاختبار
CREATE DATABASE IF NOT EXISTS `bakery_db_test` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- استخدام قاعدة البيانات الرئيسية
USE `bakery_db`;

-- تعطيل فحص المفاتيح الخارجية مؤقتاً
SET FOREIGN_KEY_CHECKS = 0;

-- ===========================================
-- 1. جدول المستخدمين (users)
-- ===========================================

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `role` ENUM('admin', 'manager', 'distributor', 'store_owner', 'accountant') NOT NULL DEFAULT 'distributor',
    `status` ENUM('active', 'inactive', 'suspended', 'pending') NOT NULL DEFAULT 'active',
    `last_login` DATETIME NULL,
    `login_attempts` INT NOT NULL DEFAULT 0,
    `locked_until` DATETIME NULL,
    `profile_image` VARCHAR(500) NULL,
    
    -- حقول خاصة بالموزعين
    `salary_eur` DECIMAL(10, 2) NULL,
    `salary_syp` DECIMAL(15, 2) NULL,
    `commission_rate` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `vehicle_info` JSON NULL,
    `assigned_areas` JSON NULL,
    
    -- حقول خاصة بأصحاب المحلات
    `store_id` INT NULL,
    
    -- مقاييس الأداء
    `total_trips` INT NOT NULL DEFAULT 0,
    `completed_trips` INT NOT NULL DEFAULT 0,
    `total_sales_eur` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total_sales_syp` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `performance_rating` DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    
    -- حقول الأمان
    `two_factor_enabled` BOOLEAN NOT NULL DEFAULT FALSE,
    `password_reset_token` VARCHAR(255) NULL,
    `password_reset_expires` DATETIME NULL,
    `email_verified` BOOLEAN NOT NULL DEFAULT FALSE,
    `email_verification_token` VARCHAR(255) NULL,
    
    -- حقول التتبع
    `created_by` INT NULL,
    `created_by_name` VARCHAR(100) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_users_username` (`username`),
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_status` (`status`),
    INDEX `idx_users_store_id` (`store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 2. جدول المنتجات (products)
-- ===========================================

CREATE TABLE IF NOT EXISTS `products` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `unit` VARCHAR(20) NOT NULL DEFAULT 'piece',
    `price_eur` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `price_syp` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `cost_eur` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `cost_syp` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `category` VARCHAR(50) NULL,
    `barcode` VARCHAR(50) NULL,
    `image_url` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_products_name` (`name`),
    INDEX `idx_products_category` (`category`),
    INDEX `idx_products_barcode` (`barcode`),
    INDEX `idx_products_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 3. جدول المحلات (stores)
-- ===========================================

CREATE TABLE IF NOT EXISTS `stores` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `owner_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NULL,
    `address` TEXT NOT NULL,
    `gps_coordinates` JSON NULL,
    `store_type` ENUM('retail', 'wholesale', 'restaurant', 'cafe', 'hotel', 'other') NOT NULL DEFAULT 'retail',
    `category` ENUM('grocery', 'supermarket', 'restaurant', 'cafe', 'hotel', 'bakery', 'other') NOT NULL DEFAULT 'grocery',
    `size_category` ENUM('small', 'medium', 'large', 'enterprise') NOT NULL DEFAULT 'medium',
    `opening_hours` JSON NULL,
    
    -- المعلومات المالية
    `credit_limit_eur` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `credit_limit_syp` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `current_balance_eur` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `current_balance_syp` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `total_purchases_eur` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total_purchases_syp` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `total_payments_eur` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total_payments_syp` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `commission_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `payment_terms` ENUM('cash', 'credit_7_days', 'credit_15_days', 'credit_30_days', 'custom') NOT NULL DEFAULT 'cash',
    
    -- مقاييس الأداء
    `total_orders` INT NOT NULL DEFAULT 0,
    `completed_orders` INT NOT NULL DEFAULT 0,
    `cancelled_orders` INT NOT NULL DEFAULT 0,
    `average_order_value_eur` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `average_order_value_syp` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `last_order_date` DATE NULL,
    `last_payment_date` DATE NULL,
    `performance_rating` DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    
    -- الحالة والتفضيلات
    `status` ENUM('active', 'inactive', 'suspended', 'pending_approval') NOT NULL DEFAULT 'active',
    `preferred_delivery_time` VARCHAR(50) NULL,
    `special_instructions` TEXT NULL,
    
    -- معلومات العلاقات
    `assigned_distributor_id` INT NULL,
    `assigned_distributor_name` VARCHAR(100) NULL,
    `created_by` INT NULL,
    `created_by_name` VARCHAR(100) NULL,
    `updated_by` INT NULL,
    `updated_by_name` VARCHAR(100) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_stores_name` (`name`),
    INDEX `idx_stores_owner_name` (`owner_name`),
    INDEX `idx_stores_phone` (`phone`),
    INDEX `idx_stores_status` (`status`),
    INDEX `idx_stores_category` (`category`),
    INDEX `idx_stores_assigned_distributor_id` (`assigned_distributor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 4. جدول الطلبات (orders)
-- ===========================================

CREATE TABLE IF NOT EXISTS `orders` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `order_number` VARCHAR(50) NOT NULL UNIQUE,
    `store_id` INT NOT NULL,
    `store_name` VARCHAR(100) NOT NULL,
    `order_date` DATE NOT NULL,
    `delivery_date` DATE NULL,
    `total_amount_eur` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total_amount_syp` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `discount_amount_eur` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `discount_amount_syp` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `final_amount_eur` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `final_amount_syp` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `currency` ENUM('EUR', 'SYP', 'MIXED') NOT NULL DEFAULT 'EUR',
    `exchange_rate` DECIMAL(10, 4) NULL,
    `status` ENUM('draft', 'pending', 'confirmed', 'prepared', 'delivered', 'cancelled') NOT NULL DEFAULT 'draft',
    `payment_status` ENUM('pending', 'partial', 'paid', 'overdue') NOT NULL DEFAULT 'pending',
    `gift_applied` JSON NULL,
    `notes` TEXT NULL,
    `created_by` INT NOT NULL,
    `created_by_name` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_orders_order_number` (`order_number`),
    INDEX `idx_orders_store_id` (`store_id`),
    INDEX `idx_orders_order_date` (`order_date`),
    INDEX `idx_orders_status` (`status`),
    INDEX `idx_orders_payment_status` (`payment_status`),
    INDEX `idx_orders_created_by` (`created_by`),
    
    FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 5. جدول عناصر الطلبات (order_items)
-- ===========================================

CREATE TABLE IF NOT EXISTS `order_items` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `product_name` VARCHAR(100) NOT NULL,
    `quantity` INT NOT NULL,
    `unit_price_eur` DECIMAL(10, 2) NOT NULL,
    `unit_price_syp` DECIMAL(15, 2) NOT NULL,
    `total_price_eur` DECIMAL(10, 2) NOT NULL,
    `total_price_syp` DECIMAL(15, 2) NOT NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_order_items_order_id` (`order_id`),
    INDEX `idx_order_items_product_id` (`product_id`),
    
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 6. جدول الموزعين (distributors)
-- ===========================================

CREATE TABLE IF NOT EXISTS `distributors` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL UNIQUE,
    `email` VARCHAR(255) NULL UNIQUE,
    `address` TEXT NULL,
    `license_number` VARCHAR(50) NULL,
    `vehicle_type` ENUM('car', 'van', 'truck', 'motorcycle') NOT NULL DEFAULT 'van',
    `vehicle_plate` VARCHAR(20) NULL,
    `vehicle_info` JSON NULL,
    `salary_base_eur` DECIMAL(10, 2) DEFAULT 0.00,
    `salary_base_syp` DECIMAL(15, 2) DEFAULT 0.00,
    `commission_rate` DECIMAL(5, 2) DEFAULT 0.00,
    `hire_date` DATE NOT NULL,
    `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    `emergency_contact` VARCHAR(255) NULL,
    `photo_url` VARCHAR(500) NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_distributors_name` (`name`),
    INDEX `idx_distributors_phone` (`phone`),
    INDEX `idx_distributors_status` (`status`),
    INDEX `idx_distributors_hire_date` (`hire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 7. جدول رحلات التوزيع (distribution_trips)
-- ===========================================

CREATE TABLE IF NOT EXISTS `distribution_trips` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `trip_number` VARCHAR(50) NOT NULL UNIQUE,
    `trip_date` DATE NOT NULL,
    `distributor_id` INT NOT NULL,
    `distributor_name` VARCHAR(100) NOT NULL,
    `vehicle_info` JSON NULL,
    `route_plan` JSON NULL,
    
    -- أوقات الرحلة
    `planned_start_time` DATETIME NULL,
    `actual_start_time` DATETIME NULL,
    `planned_end_time` DATETIME NULL,
    `actual_end_time` DATETIME NULL,
    
    -- إحصائيات الرحلة
    `total_orders` INT NOT NULL DEFAULT 0,
    `total_stores` INT NOT NULL DEFAULT 0,
    `completed_stores` INT NOT NULL DEFAULT 0,
    `total_amount_eur` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total_amount_syp` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `collected_amount_eur` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `collected_amount_syp` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    
    -- التكاليف
    `fuel_cost_eur` DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    `fuel_cost_syp` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `other_expenses_eur` DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    `other_expenses_syp` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `distance_covered` DECIMAL(8, 2) NULL,
    
    -- الحالة والأداء
    `status` ENUM('planned', 'in_progress', 'completed', 'cancelled', 'suspended') NOT NULL DEFAULT 'planned',
    `completion_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `collection_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    
    -- التتبع
    `gps_tracking_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    `start_location` JSON NULL,
    `end_location` JSON NULL,
    `problems_encountered` JSON NULL,
    `notes` TEXT NULL,
    
    -- حقول التتبع
    `created_by` INT NOT NULL,
    `created_by_name` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_trips_trip_number` (`trip_number`),
    INDEX `idx_trips_trip_date` (`trip_date`),
    INDEX `idx_trips_distributor_id` (`distributor_id`),
    INDEX `idx_trips_status` (`status`),
    
    FOREIGN KEY (`distributor_id`) REFERENCES `distributors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 8. جدول زيارات المحلات (store_visits)
-- ===========================================

CREATE TABLE IF NOT EXISTS `store_visits` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `trip_id` INT NOT NULL,
    `store_id` INT NOT NULL,
    `store_name` VARCHAR(100) NOT NULL,
    `visit_order` INT NOT NULL DEFAULT 1,
    
    -- أوقات الزيارة
    `planned_arrival_time` DATETIME NULL,
    `actual_arrival_time` DATETIME NULL,
    `planned_departure_time` DATETIME NULL,
    `actual_departure_time` DATETIME NULL,
    
    -- حالة الزيارة
    `visit_status` ENUM('planned', 'in_progress', 'completed', 'cancelled', 'failed') NOT NULL DEFAULT 'planned',
    `arrival_location` JSON NULL,
    `departure_location` JSON NULL,
    
    -- معلومات الطلب
    `order_id` INT NULL,
    `order_value_eur` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `order_value_syp` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `payment_collected_eur` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `payment_collected_syp` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    
    -- التفاصيل
    `delivery_successful` BOOLEAN NOT NULL DEFAULT FALSE,
    `payment_collected` BOOLEAN NOT NULL DEFAULT FALSE,
    `problems_encountered` JSON NULL,
    `photos_urls` JSON NULL,
    `notes` TEXT NULL,
    
    -- حقول التتبع
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_visits_trip_id` (`trip_id`),
    INDEX `idx_visits_store_id` (`store_id`),
    INDEX `idx_visits_visit_status` (`visit_status`),
    INDEX `idx_visits_order_id` (`order_id`),
    
    FOREIGN KEY (`trip_id`) REFERENCES `distribution_trips`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 9. جدول المدفوعات (payments)
-- ===========================================

CREATE TABLE IF NOT EXISTS `payments` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `payment_number` VARCHAR(50) NOT NULL UNIQUE,
    `payment_date` DATETIME NOT NULL,
    
    -- الكيانات المرتبطة
    `store_id` INT NOT NULL,
    `store_name` VARCHAR(100) NOT NULL,
    `order_id` INT NULL,
    `distributor_id` INT NULL,
    `distributor_name` VARCHAR(100) NULL,
    `visit_id` INT NULL,
    
    -- مبالغ الدفع
    `amount_eur` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `amount_syp` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `currency` ENUM('EUR', 'SYP', 'MIXED') NOT NULL DEFAULT 'EUR',
    `exchange_rate` DECIMAL(10, 4) NULL,
    
    -- تفاصيل الدفع
    `payment_method` ENUM('cash', 'bank_transfer', 'check', 'credit_card', 'mobile_payment', 'crypto') NOT NULL DEFAULT 'cash',
    `payment_type` ENUM('full', 'partial', 'refund') DEFAULT 'full',
    `payment_reference` VARCHAR(100) NULL,
    `bank_details` JSON NULL,
    `payment_proof` VARCHAR(500) NULL,
    
    -- الحالة والتحقق
    `status` ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
    `verification_status` ENUM('pending', 'verified', 'rejected', 'requires_review') NOT NULL DEFAULT 'pending',
    `verified_by` INT NULL,
    `verified_by_name` VARCHAR(100) NULL,
    `verified_at` DATETIME NULL,
    
    -- التفاصيل الإضافية
    `receipt_generated` BOOLEAN NOT NULL DEFAULT FALSE,
    `receipt_url` VARCHAR(500) NULL,
    `notes` TEXT NULL,
    `internal_notes` TEXT NULL,
    
    -- حقول التتبع
    `created_by` INT NOT NULL,
    `created_by_name` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_payments_payment_number` (`payment_number`),
    INDEX `idx_payments_payment_date` (`payment_date`),
    INDEX `idx_payments_store_id` (`store_id`),
    INDEX `idx_payments_order_id` (`order_id`),
    INDEX `idx_payments_distributor_id` (`distributor_id`),
    INDEX `idx_payments_visit_id` (`visit_id`),
    INDEX `idx_payments_status` (`status`),
    INDEX `idx_payments_verification_status` (`verification_status`),
    INDEX `idx_payments_created_by` (`created_by`),
    
    FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`distributor_id`) REFERENCES `distributors`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`visit_id`) REFERENCES `store_visits`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 10. جدول مسارات التوزيع (distribution_routes)
-- ===========================================

CREATE TABLE IF NOT EXISTS `distribution_routes` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `primary_distributor_id` INT,
    `days_of_week` SET('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
    `estimated_duration` TIME,
    `estimated_distance` DECIMAL(8, 2),
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_routes_status` (`status`),
    INDEX `idx_routes_distributor` (`primary_distributor_id`),
    
    FOREIGN KEY (`primary_distributor_id`) REFERENCES `distributors`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 11. جدول ربط المسارات بالمحلات (route_stores)
-- ===========================================

CREATE TABLE IF NOT EXISTS `route_stores` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `route_id` INT NOT NULL,
    `store_id` INT NOT NULL,
    `visit_order` INT NOT NULL,
    `estimated_arrival` TIME,
    `special_instructions` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY `unique_route_store` (`route_id`, `store_id`),
    INDEX `idx_route_stores_route` (`route_id`),
    INDEX `idx_route_stores_store` (`store_id`),
    INDEX `idx_route_stores_visit_order` (`route_id`, `visit_order`),
    
    FOREIGN KEY (`route_id`) REFERENCES `distribution_routes`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 12. جدول تخصيص الموزعين للمحلات (distributor_store_assignments)
-- ===========================================

CREATE TABLE IF NOT EXISTS `distributor_store_assignments` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `distributor_id` INT NOT NULL,
    `store_id` INT NOT NULL,
    `responsibility_type` ENUM('primary', 'secondary', 'backup') DEFAULT 'primary',
    `start_date` DATE NOT NULL,
    `end_date` DATE,
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_assignments_distributor` (`distributor_id`),
    INDEX `idx_assignments_store` (`store_id`),
    INDEX `idx_assignments_status` (`status`),
    INDEX `idx_assignments_dates` (`start_date`, `end_date`),
    
    FOREIGN KEY (`distributor_id`) REFERENCES `distributors`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 13. جدول مدفوعات الموزعين (distributor_payments)
-- ===========================================

CREATE TABLE IF NOT EXISTS `distributor_payments` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `distributor_id` INT NOT NULL,
    `trip_id` INT,
    `payment_period_start` DATE NOT NULL,
    `payment_period_end` DATE NOT NULL,
    `base_salary_eur` DECIMAL(10, 2) DEFAULT 0.00,
    `base_salary_syp` DECIMAL(15, 2) DEFAULT 0.00,
    `commission_amount_eur` DECIMAL(10, 2) DEFAULT 0.00,
    `commission_amount_syp` DECIMAL(15, 2) DEFAULT 0.00,
    `bonus_amount_eur` DECIMAL(10, 2) DEFAULT 0.00,
    `bonus_amount_syp` DECIMAL(15, 2) DEFAULT 0.00,
    `deduction_amount_eur` DECIMAL(10, 2) DEFAULT 0.00,
    `deduction_amount_syp` DECIMAL(15, 2) DEFAULT 0.00,
    `total_amount_eur` DECIMAL(10, 2) NOT NULL,
    `total_amount_syp` DECIMAL(15, 2) NOT NULL,
    `payment_date` DATE,
    `payment_status` ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_distributor_payments_distributor` (`distributor_id`),
    INDEX `idx_distributor_payments_payment_date` (`payment_date`),
    INDEX `idx_distributor_payments_status` (`payment_status`),
    INDEX `idx_distributor_payments_period` (`payment_period_start`, `payment_period_end`),
    
    FOREIGN KEY (`distributor_id`) REFERENCES `distributors`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`trip_id`) REFERENCES `distribution_trips`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 14. جدول إحصائيات الموزعين (distributor_statistics)
-- ===========================================

CREATE TABLE IF NOT EXISTS `distributor_statistics` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `distributor_id` INT NOT NULL,
    `stat_date` DATE NOT NULL,
    `total_trips` INT DEFAULT 0,
    `completed_trips` INT DEFAULT 0,
    `total_visits` INT DEFAULT 0,
    `successful_visits` INT DEFAULT 0,
    `total_amount_due_eur` DECIMAL(12, 2) DEFAULT 0.00,
    `total_amount_due_syp` DECIMAL(15, 2) DEFAULT 0.00,
    `total_amount_collected_eur` DECIMAL(12, 2) DEFAULT 0.00,
    `total_amount_collected_syp` DECIMAL(15, 2) DEFAULT 0.00,
    `collection_rate` DECIMAL(5, 2) DEFAULT 0.00,
    `average_visit_time` INT DEFAULT 0,
    `fuel_cost_eur` DECIMAL(10, 2) DEFAULT 0.00,
    `fuel_cost_syp` DECIMAL(15, 2) DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY `unique_distributor_date` (`distributor_id`, `stat_date`),
    INDEX `idx_statistics_stat_date` (`stat_date`),
    INDEX `idx_statistics_distributor` (`distributor_id`),
    
    FOREIGN KEY (`distributor_id`) REFERENCES `distributors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 15. جدول جلسات المستخدمين (user_sessions)
-- ===========================================

CREATE TABLE IF NOT EXISTS `user_sessions` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `session_token` VARCHAR(255) NOT NULL,
    `device_info` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `location` JSON NULL,
    `login_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `last_activity` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expires_at` TIMESTAMP NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `logout_time` TIMESTAMP NULL,
    `logout_reason` ENUM('manual', 'timeout', 'forced', 'security') NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_user_sessions_user_id` (`user_id`),
    INDEX `idx_user_sessions_session_token` (`session_token`),
    INDEX `idx_user_sessions_is_active` (`is_active`),
    INDEX `idx_user_sessions_expires_at` (`expires_at`),
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 16. جدول الإشعارات (notifications)
-- ===========================================

CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `type` ENUM('order', 'inventory', 'delivery', 'payment', 'system', 'customer') NOT NULL,
    `priority` ENUM('low', 'normal', 'high') NOT NULL DEFAULT 'normal',
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `icon` VARCHAR(10) NOT NULL DEFAULT '📢',
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `read_at` TIMESTAMP NULL,
    `action_url` VARCHAR(500) NULL,
    `metadata` JSON NULL,
    `related_order_id` INT NULL,
    `related_product_id` INT NULL,
    `related_payment_id` INT NULL,
    `sender_id` INT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_notifications_user_id` (`user_id`),
    INDEX `idx_notifications_type` (`type`),
    INDEX `idx_notifications_is_read` (`is_read`),
    INDEX `idx_notifications_priority` (`priority`),
    INDEX `idx_notifications_created_at` (`created_at`),
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`related_order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`related_product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`related_payment_id`) REFERENCES `payments`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- إنشاء Views للتقارير
-- ===========================================

-- View أداء الموزعين
CREATE VIEW `distributor_performance` AS
SELECT 
    d.id,
    d.name,
    d.phone,
    d.status,
    COUNT(DISTINCT dt.id) as total_trips,
    COUNT(DISTINCT CASE WHEN dt.status = 'completed' THEN dt.id END) as completed_trips,
    COUNT(DISTINCT sv.id) as total_visits,
    COUNT(DISTINCT CASE WHEN sv.visit_status = 'completed' THEN sv.id END) as successful_visits,
    COALESCE(SUM(sv.order_value_eur), 0) as total_amount_due_eur,
    COALESCE(SUM(sv.order_value_syp), 0) as total_amount_due_syp,
    COALESCE(SUM(sv.payment_collected_eur), 0) as total_amount_collected_eur,
    COALESCE(SUM(sv.payment_collected_syp), 0) as total_amount_collected_syp,
    CASE 
        WHEN SUM(sv.order_value_eur) > 0 
        THEN ROUND((SUM(sv.payment_collected_eur) / SUM(sv.order_value_eur)) * 100, 2)
        ELSE 0 
    END as collection_rate_eur,
    CASE 
        WHEN SUM(sv.order_value_syp) > 0 
        THEN ROUND((SUM(sv.payment_collected_syp) / SUM(sv.order_value_syp)) * 100, 2)
        ELSE 0 
    END as collection_rate_syp
FROM distributors d
LEFT JOIN distribution_trips dt ON d.id = dt.distributor_id
LEFT JOIN store_visits sv ON dt.id = sv.trip_id
WHERE d.status = 'active'
GROUP BY d.id, d.name, d.phone, d.status;

-- View المبيعات الشهرية
CREATE VIEW `monthly_sales` AS
SELECT 
    DATE_FORMAT(o.order_date, '%Y-%m') as month,
    COUNT(o.id) as total_orders,
    SUM(o.final_amount_eur) as total_sales_eur,
    SUM(o.final_amount_syp) as total_sales_syp,
    COUNT(DISTINCT o.store_id) as unique_stores,
    AVG(o.final_amount_eur) as average_order_value_eur,
    AVG(o.final_amount_syp) as average_order_value_syp
FROM orders o
WHERE o.status != 'cancelled'
GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
ORDER BY month DESC;

-- View حالة المدفوعات
CREATE VIEW `payment_status_summary` AS
SELECT 
    s.name as store_name,
    s.current_balance_eur,
    s.current_balance_syp,
    s.credit_limit_eur,
    s.credit_limit_syp,
    COUNT(DISTINCT o.id) as total_orders,
    SUM(o.final_amount_eur) as total_order_value_eur,
    SUM(o.final_amount_syp) as total_order_value_syp,
    SUM(CASE WHEN p.status = 'completed' THEN p.amount_eur ELSE 0 END) as total_paid_eur,
    SUM(CASE WHEN p.status = 'completed' THEN p.amount_syp ELSE 0 END) as total_paid_syp,
    (SUM(o.final_amount_eur) - SUM(CASE WHEN p.status = 'completed' THEN p.amount_eur ELSE 0 END)) as outstanding_balance_eur,
    (SUM(o.final_amount_syp) - SUM(CASE WHEN p.status = 'completed' THEN p.amount_syp ELSE 0 END)) as outstanding_balance_syp
FROM stores s
LEFT JOIN orders o ON s.id = o.store_id
LEFT JOIN payments p ON o.id = p.order_id
WHERE s.status = 'active'
GROUP BY s.id, s.name, s.current_balance_eur, s.current_balance_syp, s.credit_limit_eur, s.credit_limit_syp;

-- ===========================================
-- إنشاء فهارس إضافية للأداء
-- ===========================================

CREATE INDEX idx_payments_distributor_date ON payments(distributor_id, payment_date);
CREATE INDEX idx_trips_date_status ON distribution_trips(trip_date, status);
CREATE INDEX idx_visits_date_status ON store_visits(created_at, visit_status);
CREATE INDEX idx_orders_date_status ON orders(order_date, status);
CREATE INDEX idx_orders_store_date ON orders(store_id, order_date);
CREATE INDEX idx_payments_store_date ON payments(store_id, payment_date);

-- ===========================================
-- إعادة تشغيل فحص المفاتيح الخارجية
-- ===========================================

SET FOREIGN_KEY_CHECKS = 1;

-- ===========================================
-- تأكيد إنشاء قاعدة البيانات
-- ===========================================

SELECT 'تم إنشاء قاعدة البيانات bakery_db بنجاح مع جميع الجداول والعلاقات' AS status;
SELECT 'العملة الافتراضية: EUR (يورو)' AS currency_info;
SELECT 'العملة الثانوية: SYP (ليرة سورية)' AS secondary_currency_info;
SELECT CONCAT('إجمالي عدد الجداول: ', COUNT(*)) AS total_tables 
FROM information_schema.tables 
WHERE table_schema = 'bakery_db'; 