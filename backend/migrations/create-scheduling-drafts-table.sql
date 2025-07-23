-- Migration: Create scheduling_drafts table for auto-scheduling system
-- Created: $(date)
-- Description: Table to store AI-generated scheduling suggestions for admin review

CREATE TABLE IF NOT EXISTS `scheduling_drafts` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `order_id` INT(11) NOT NULL,
    `suggested_distributor_id` INT(11) NOT NULL,
    `suggested_distributor_name` VARCHAR(255) NOT NULL,
    `confidence_score` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `suggested_delivery_date` DATE NOT NULL,
    `suggested_priority` ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    `reasoning` JSON DEFAULT NULL COMMENT 'AI reasoning for distributor selection',
    `alternative_suggestions` JSON DEFAULT NULL COMMENT 'Alternative distributor suggestions',
    `route_optimization` JSON DEFAULT NULL COMMENT 'Route optimization information',
    `estimated_delivery_time` TIME DEFAULT NULL,
    `estimated_duration` INT(11) DEFAULT NULL COMMENT 'Estimated duration in minutes',
    `status` ENUM('pending_review', 'reviewed', 'approved', 'rejected', 'modified') DEFAULT 'pending_review',
    `admin_notes` TEXT DEFAULT NULL,
    `modifications` JSON DEFAULT NULL COMMENT 'Admin modifications to the suggestion',
    `approved_distributor_id` INT(11) DEFAULT NULL,
    `approved_delivery_date` DATE DEFAULT NULL,
    `approved_priority` ENUM('low', 'normal', 'high', 'urgent') DEFAULT NULL,
    `created_by` INT(11) NOT NULL,
    `reviewed_by` INT(11) DEFAULT NULL,
    `reviewed_at` DATETIME DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_order_draft` (`order_id`),
    KEY `idx_status` (`status`),
    KEY `idx_suggested_distributor` (`suggested_distributor_id`),
    KEY `idx_delivery_date` (`suggested_delivery_date`),
    KEY `idx_confidence_score` (`confidence_score`),
    KEY `idx_created_at` (`created_at`),
    CONSTRAINT `fk_scheduling_drafts_order` 
        FOREIGN KEY (`order_id`) 
        REFERENCES `orders` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_scheduling_drafts_suggested_distributor` 
        FOREIGN KEY (`suggested_distributor_id`) 
        REFERENCES `users` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_scheduling_drafts_approved_distributor` 
        FOREIGN KEY (`approved_distributor_id`) 
        REFERENCES `users` (`id`) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_scheduling_drafts_created_by` 
        FOREIGN KEY (`created_by`) 
        REFERENCES `users` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_scheduling_drafts_reviewed_by` 
        FOREIGN KEY (`reviewed_by`) 
        REFERENCES `users` (`id`) 
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for performance optimization
CREATE INDEX `idx_pending_review` ON `scheduling_drafts` (`status`, `created_at`) WHERE `status` = 'pending_review';
CREATE INDEX `idx_high_confidence` ON `scheduling_drafts` (`confidence_score` DESC, `created_at` DESC);
CREATE INDEX `idx_distributor_suggestions` ON `scheduling_drafts` (`suggested_distributor_id`, `status`, `confidence_score` DESC);

-- Insert sample data for testing (optional)
INSERT INTO `scheduling_drafts` (
    `order_id`, `suggested_distributor_id`, `suggested_distributor_name`, 
    `confidence_score`, `suggested_delivery_date`, `suggested_priority`,
    `reasoning`, `alternative_suggestions`, `route_optimization`,
    `estimated_delivery_time`, `estimated_duration`, `status`, `created_by`
) VALUES 
(
    1, -- Assuming order ID 1 exists
    2, -- Assuming distributor user ID 2 exists  
    'محمد علي',
    87.50,
    CURDATE() + INTERVAL 1 DAY,
    'normal',
    JSON_OBJECT(
        'zone_match', true,
        'capacity_available', true, 
        'performance_score', 87,
        'distance_optimal', true,
        'experience', false,
        'main_factors', JSON_ARRAY('موقع مثالي للتسليم', 'متاح بشكل كامل', 'أداء ممتاز')
    ),
    JSON_ARRAY(
        JSON_OBJECT('distributor_id', 3, 'distributor_name', 'أحمد محمد', 'confidence_score', 75.0),
        JSON_OBJECT('distributor_id', 4, 'distributor_name', 'علي حسن', 'confidence_score', 68.5)
    ),
    JSON_OBJECT(
        'estimated_distance', '12 km',
        'estimated_travel_time', '18 minutes', 
        'suggested_route', 'الطريق الرئيسي',
        'traffic_consideration', 'منخفض',
        'fuel_cost_estimate', '€4.50'
    ),
    '10:30:00',
    35,
    'pending_review',
    1 -- System/Admin user ID
) ON DUPLICATE KEY UPDATE
    `confidence_score` = VALUES(`confidence_score`),
    `updated_at` = CURRENT_TIMESTAMP; 