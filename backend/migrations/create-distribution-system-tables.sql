-- ==========================================
-- 🚚 DISTRIBUTION SYSTEM TABLES MIGRATION
-- ==========================================
-- This migration creates all necessary tables for the daily distribution management system
-- Created: 2024-12-19
-- Purpose: Support daily distribution scheduling, real-time tracking, and route optimization

-- ==========================================
-- 1. DISTRIBUTION TRIPS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS distribution_trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    distributor_id INT NOT NULL,
    trip_date DATE NOT NULL,
    trip_status ENUM('planned', 'in_progress', 'completed', 'cancelled') DEFAULT 'planned',
    start_time DATETIME,
    end_time DATETIME,
    total_distance DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Total distance in kilometers',
    total_duration INT DEFAULT 0 COMMENT 'Total duration in minutes',
    fuel_consumption DECIMAL(8,2) DEFAULT 0.00 COMMENT 'Fuel consumption in liters',
    vehicle_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_distributor_date (distributor_id, trip_date),
    INDEX idx_trip_status (trip_status),
    INDEX idx_trip_date (trip_date),
    FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. DAILY DISTRIBUTION SCHEDULE TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS daily_distribution_schedule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    distributor_id INT NOT NULL,
    schedule_date DATE NOT NULL,
    store_id INT NOT NULL,
    visit_order INT NOT NULL COMMENT 'Order of visit in the route (1, 2, 3, ...)',
    planned_arrival_time TIME,
    planned_departure_time TIME,
    actual_arrival_time DATETIME,
    actual_departure_time DATETIME,
    visit_status ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'failed') DEFAULT 'scheduled',
    order_ids JSON COMMENT 'Array of order IDs for this store visit',
    estimated_duration INT DEFAULT 15 COMMENT 'Estimated duration in minutes',
    actual_duration INT COMMENT 'Actual duration in minutes',
    distance_from_previous DECIMAL(8,2) COMMENT 'Distance from previous store in km',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_distributor_date (distributor_id, schedule_date),
    INDEX idx_store_date (store_id, schedule_date),
    INDEX idx_visit_status (visit_status),
    INDEX idx_visit_order (distributor_id, schedule_date, visit_order),
    FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. REAL-TIME LOCATION TRACKING TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS location_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    distributor_id INT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    accuracy DECIMAL(5,2) COMMENT 'GPS accuracy in meters',
    speed DECIMAL(5,2) COMMENT 'Speed in km/h',
    heading INT COMMENT 'Direction in degrees (0-360)',
    altitude DECIMAL(8,2) COMMENT 'Altitude in meters',
    battery_level INT COMMENT 'Device battery level (0-100)',
    is_moving BOOLEAN DEFAULT FALSE,
    activity_type ENUM('still', 'walking', 'running', 'driving', 'unknown') DEFAULT 'unknown',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_distributor_timestamp (distributor_id, timestamp),
    INDEX idx_timestamp (timestamp),
    INDEX idx_location (latitude, longitude),
    FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. DISTRIBUTION PERFORMANCE METRICS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS distribution_performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    distributor_id INT NOT NULL,
    performance_date DATE NOT NULL,
    total_trips INT DEFAULT 0,
    completed_trips INT DEFAULT 0,
    total_orders INT DEFAULT 0,
    completed_orders INT DEFAULT 0,
    total_distance DECIMAL(10,2) DEFAULT 0.00,
    total_duration INT DEFAULT 0 COMMENT 'Total working time in minutes',
    fuel_consumption DECIMAL(8,2) DEFAULT 0.00,
    on_time_deliveries INT DEFAULT 0,
    late_deliveries INT DEFAULT 0,
    customer_satisfaction DECIMAL(3,2) DEFAULT 0.00 COMMENT 'Average rating 0-5',
    efficiency_score DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Efficiency percentage',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_distributor_date (distributor_id, performance_date),
    INDEX idx_performance_date (performance_date),
    INDEX idx_efficiency_score (efficiency_score),
    FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 5. ROUTE OPTIMIZATION CACHE TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS route_optimization_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL,
    distributor_id INT,
    store_ids JSON NOT NULL COMMENT 'Array of store IDs in optimized order',
    optimized_route JSON NOT NULL COMMENT 'Optimized route data from Google Maps',
    total_distance DECIMAL(10,2),
    total_duration INT COMMENT 'Duration in minutes',
    fuel_estimate DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL COMMENT 'Cache expiration time',
    
    UNIQUE KEY unique_cache_key (cache_key),
    INDEX idx_distributor (distributor_id),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 6. DISTRIBUTION NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS distribution_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    distributor_id INT NOT NULL,
    notification_type ENUM('schedule_update', 'route_change', 'delay_alert', 'performance_alert', 'system_alert') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    is_read BOOLEAN DEFAULT FALSE,
    action_required BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    metadata JSON COMMENT 'Additional notification data',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    INDEX idx_distributor_read (distributor_id, is_read),
    INDEX idx_notification_type (notification_type),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 7. DISTRIBUTION SETTINGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS distribution_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE COMMENT 'System settings cannot be modified by users',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_setting_key (setting_key),
    INDEX idx_setting_type (setting_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- INSERT DEFAULT DISTRIBUTION SETTINGS
-- ==========================================
INSERT INTO distribution_settings (setting_key, setting_value, setting_type, description, is_system) VALUES
('default_visit_duration', '15', 'number', 'Default visit duration in minutes', TRUE),
('max_daily_distance', '200', 'number', 'Maximum daily distance in kilometers', TRUE),
('max_daily_orders', '50', 'number', 'Maximum orders per distributor per day', TRUE),
('route_optimization_enabled', 'true', 'boolean', 'Enable automatic route optimization', TRUE),
('real_time_tracking_enabled', 'true', 'boolean', 'Enable real-time location tracking', TRUE),
('location_update_interval', '30', 'number', 'Location update interval in seconds', TRUE),
('performance_alert_threshold', '80', 'number', 'Performance alert threshold percentage', TRUE),
('google_maps_api_key', '', 'string', 'Google Maps API key for route optimization', TRUE),
('default_working_hours', '{"start": "08:00", "end": "18:00"}', 'json', 'Default working hours for distributors', TRUE),
('break_time_minutes', '60', 'number', 'Total break time in minutes per day', TRUE)
ON DUPLICATE KEY UPDATE
    setting_value = VALUES(setting_value),
    updated_at = CURRENT_TIMESTAMP;

-- ==========================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- ==========================================

-- Add distribution-related columns to orders table if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS distribution_trip_id INT NULL,
ADD COLUMN IF NOT EXISTS scheduled_delivery_time TIME NULL,
ADD COLUMN IF NOT EXISTS actual_delivery_time DATETIME NULL,
ADD COLUMN IF NOT EXISTS delivery_notes TEXT NULL,
ADD COLUMN IF NOT EXISTS delivery_rating INT NULL COMMENT 'Customer rating 1-5',
ADD COLUMN IF NOT EXISTS delivery_feedback TEXT NULL,
ADD INDEX IF NOT EXISTS idx_distribution_trip (distribution_trip_id),
ADD INDEX IF NOT EXISTS idx_scheduled_delivery (scheduled_delivery_time);

-- Add distribution-related columns to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS current_trip_id INT NULL,
ADD COLUMN IF NOT EXISTS current_schedule_id INT NULL,
ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS working_status ENUM('available', 'busy', 'break', 'offline') DEFAULT 'offline',
ADD COLUMN IF NOT EXISTS daily_quota_orders INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_quota_distance DECIMAL(10,2) DEFAULT 0.00,
ADD INDEX IF NOT EXISTS idx_working_status (working_status),
ADD INDEX IF NOT EXISTS idx_is_online (is_online);

-- Add distribution-related columns to stores table if they don't exist
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS preferred_delivery_days JSON NULL COMMENT 'Preferred delivery days of the week',
ADD COLUMN IF NOT EXISTS delivery_time_slot VARCHAR(50) NULL COMMENT 'Preferred delivery time slot',
ADD COLUMN IF NOT EXISTS delivery_instructions TEXT NULL,
ADD COLUMN IF NOT EXISTS last_delivery_date DATE NULL,
ADD COLUMN IF NOT EXISTS average_delivery_rating DECIMAL(3,2) DEFAULT 0.00;

-- ==========================================
-- CREATE VIEWS FOR EASY DATA ACCESS
-- ==========================================

-- View for daily distribution summary
CREATE OR REPLACE VIEW daily_distribution_summary AS
SELECT 
    dds.schedule_date,
    dds.distributor_id,
    u.full_name as distributor_name,
    u.phone as distributor_phone,
    COUNT(dds.id) as total_visits,
    SUM(CASE WHEN dds.visit_status = 'completed' THEN 1 ELSE 0 END) as completed_visits,
    SUM(CASE WHEN dds.visit_status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_visits,
    SUM(CASE WHEN dds.visit_status = 'scheduled' THEN 1 ELSE 0 END) as scheduled_visits,
    SUM(dds.estimated_duration) as total_estimated_duration,
    SUM(dds.actual_duration) as total_actual_duration,
    SUM(dds.distance_from_previous) as total_distance
FROM daily_distribution_schedule dds
JOIN users u ON dds.distributor_id = u.id
GROUP BY dds.schedule_date, dds.distributor_id, u.full_name, u.phone;

-- View for distributor performance today
CREATE OR REPLACE VIEW distributor_performance_today AS
SELECT 
    u.id as distributor_id,
    u.full_name as distributor_name,
    u.phone as distributor_phone,
    u.working_status,
    u.is_online,
    u.last_location_update,
    COALESCE(dp.total_orders, 0) as total_orders,
    COALESCE(dp.completed_orders, 0) as completed_orders,
    COALESCE(dp.total_distance, 0) as total_distance,
    COALESCE(dp.total_duration, 0) as total_duration,
    COALESCE(dp.efficiency_score, 0) as efficiency_score,
    COALESCE(dp.customer_satisfaction, 0) as customer_satisfaction
FROM users u
LEFT JOIN distribution_performance dp ON u.id = dp.distributor_id 
    AND dp.performance_date = CURDATE()
WHERE u.role = 'distributor' AND u.status = 'active';

-- ==========================================
-- MIGRATION COMPLETED SUCCESSFULLY
-- ==========================================
-- All distribution system tables have been created
-- The system is now ready for daily distribution management
-- Next steps: Create models, controllers, and API endpoints