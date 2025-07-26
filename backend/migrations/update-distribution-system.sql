-- =====================================================
-- Distribution System Database Migration
-- Railway MySQL Database Update
-- =====================================================

-- Enable safe updates
SET SQL_SAFE_UPDATES = 0;

-- =====================================================
-- 1. UPDATE USERS TABLE (Add distributor fields)
-- =====================================================

-- Add location tracking fields for distributors
ALTER TABLE users 
ADD COLUMN current_location JSON NULL COMMENT 'Current GPS location with timestamp for distributors',
ADD COLUMN location_updated_at DATETIME NULL COMMENT 'When location was last updated',
ADD COLUMN vehicle_info JSON NULL COMMENT 'Vehicle details for distributors',
ADD COLUMN work_status ENUM('available', 'busy', 'offline', 'break') NULL COMMENT 'Current work status for distributors',
ADD COLUMN daily_performance JSON NULL COMMENT 'Daily performance metrics for distributors';

-- Add indexes for better performance
CREATE INDEX idx_users_work_status ON users(work_status);
CREATE INDEX idx_users_location_updated ON users(location_updated_at);
CREATE INDEX idx_users_role_status ON users(role, status);

-- =====================================================
-- 2. UPDATE ORDERS TABLE (Add distributor assignment)
-- =====================================================

-- Add distributor assignment fields
ALTER TABLE orders 
ADD COLUMN assigned_distributor_id INT NULL COMMENT 'ID of assigned distributor',
ADD COLUMN assigned_at DATETIME NULL COMMENT 'When the order was assigned to distributor',
ADD COLUMN delivery_started_at DATETIME NULL COMMENT 'When distributor started delivery',
ADD COLUMN delivery_completed_at DATETIME NULL COMMENT 'When delivery was completed',
ADD COLUMN delivery_notes TEXT NULL COMMENT 'Delivery notes from distributor';

-- Add foreign key constraint
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_distributor 
FOREIGN KEY (assigned_distributor_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX idx_orders_assigned_distributor ON orders(assigned_distributor_id);
CREATE INDEX idx_orders_assigned_at ON orders(assigned_at);
CREATE INDEX idx_orders_delivery_dates ON orders(delivery_started_at, delivery_completed_at);

-- =====================================================
-- 3. CREATE LOCATION_HISTORY TABLE
-- =====================================================

CREATE TABLE location_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    distributor_id INT NOT NULL,
    location JSON NOT NULL COMMENT 'GPS coordinates with accuracy and speed',
    recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activity_type ENUM('moving', 'stopped', 'delivering', 'break') DEFAULT 'moving',
    order_id INT NULL COMMENT 'Associated order if delivering',
    battery_level INT NULL COMMENT 'Mobile device battery level',
    is_manual BOOLEAN DEFAULT FALSE COMMENT 'Whether location was manually entered',
    
    -- Foreign key constraints
    FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Add indexes for location_history
CREATE INDEX idx_location_distributor ON location_history(distributor_id);
CREATE INDEX idx_location_recorded_at ON location_history(recorded_at);
CREATE INDEX idx_location_distributor_date ON location_history(distributor_id, recorded_at);
CREATE INDEX idx_location_order ON location_history(order_id);
CREATE INDEX idx_location_activity ON location_history(activity_type);

-- =====================================================
-- 4. CREATE DISTRIBUTOR_DAILY_PERFORMANCE TABLE
-- =====================================================

CREATE TABLE distributor_daily_performance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    distributor_id INT NOT NULL,
    date DATE NOT NULL,
    work_started_at TIME NULL,
    work_ended_at TIME NULL,
    total_work_hours DECIMAL(4,2) DEFAULT 0.00,
    total_orders_assigned INT DEFAULT 0,
    total_orders_delivered INT DEFAULT 0,
    total_orders_failed INT DEFAULT 0,
    total_distance_km DECIMAL(8,2) DEFAULT 0.00,
    total_revenue_eur DECIMAL(10,2) DEFAULT 0.00,
    total_revenue_syp DECIMAL(15,2) DEFAULT 0.00,
    commission_earned_eur DECIMAL(10,2) DEFAULT 0.00,
    commission_earned_syp DECIMAL(15,2) DEFAULT 0.00,
    fuel_cost_eur DECIMAL(8,2) DEFAULT 0.00 COMMENT 'Estimated fuel cost for the day',
    vehicle_expenses_eur DECIMAL(8,2) DEFAULT 0.00 COMMENT 'Other vehicle expenses',
    average_delivery_time_minutes DECIMAL(6,2) DEFAULT 0.00,
    customer_ratings JSON NULL COMMENT 'Customer feedback and ratings',
    issues_reported JSON NULL COMMENT 'Issues and problems during the day',
    notes TEXT NULL,
    efficiency_score DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Calculated efficiency score (0-100)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint for distributor per day
    UNIQUE KEY unique_distributor_date (distributor_id, date)
);

-- Add indexes for distributor_daily_performance
CREATE INDEX idx_performance_date ON distributor_daily_performance(date);
CREATE INDEX idx_performance_efficiency ON distributor_daily_performance(efficiency_score);
CREATE INDEX idx_performance_distributor_date ON distributor_daily_performance(distributor_id, date);

-- =====================================================
-- 5. ADD SAMPLE DATA FOR TESTING
-- =====================================================

-- Update some existing users to be distributors with vehicle info
UPDATE users 
SET 
    role = 'distributor',
    vehicle_info = JSON_OBJECT(
        'type', 'van',
        'plate_number', CONCAT('ABC-', LPAD(id, 3, '0')),
        'model', 'Ford Transit',
        'year', 2020,
        'capacity_kg', 1000,
        'fuel_type', 'diesel'
    ),
    work_status = 'available',
    current_location = JSON_OBJECT(
        'lat', 33.8938 + (RAND() - 0.5) * 0.1,
        'lng', 35.5018 + (RAND() - 0.5) * 0.1,
        'address', CONCAT('بيروت - منطقة ', id),
        'accuracy', 10,
        'timestamp', NOW()
    ),
    location_updated_at = NOW()
WHERE role = 'distributor' OR id IN (
    SELECT id FROM (
        SELECT id FROM users WHERE role != 'admin' LIMIT 5
    ) AS temp_users
);

-- Insert sample daily performance data for today
INSERT INTO distributor_daily_performance (
    distributor_id, 
    date, 
    work_started_at, 
    total_work_hours,
    total_orders_assigned,
    total_orders_delivered,
    total_revenue_eur,
    efficiency_score
)
SELECT 
    id,
    CURDATE(),
    '08:00:00',
    8.0,
    FLOOR(RAND() * 15) + 5,
    FLOOR(RAND() * 12) + 3,
    ROUND(RAND() * 500 + 200, 2),
    ROUND(RAND() * 30 + 70, 2)
FROM users 
WHERE role = 'distributor' 
LIMIT 5;

-- =====================================================
-- 6. UPDATE EXISTING ORDERS WITH DISTRIBUTOR ASSIGNMENTS
-- =====================================================

-- Assign some orders to distributors for testing
UPDATE orders o
SET 
    assigned_distributor_id = (
        SELECT id 
        FROM users 
        WHERE role = 'distributor' 
        ORDER BY RAND() 
        LIMIT 1
    ),
    assigned_at = DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 24) HOUR)
WHERE status IN ('confirmed', 'prepared', 'delivered')
AND assigned_distributor_id IS NULL
LIMIT 20;

-- =====================================================
-- 7. VERIFY MIGRATION SUCCESS
-- =====================================================

-- Check users table structure
SELECT 'Users table updated' as status, 
       COUNT(*) as distributor_count 
FROM users 
WHERE role = 'distributor' AND current_location IS NOT NULL;

-- Check orders table structure  
SELECT 'Orders assigned' as status,
       COUNT(*) as assigned_orders_count
FROM orders 
WHERE assigned_distributor_id IS NOT NULL;

-- Check new tables
SELECT 'Location history table' as status,
       COUNT(*) as table_exists
FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'location_history';

SELECT 'Performance table' as status,
       COUNT(*) as table_exists  
FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'distributor_daily_performance';

-- Reset safe updates
SET SQL_SAFE_UPDATES = 1;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

SELECT 'MIGRATION COMPLETED SUCCESSFULLY' as message,
       NOW() as completed_at; 