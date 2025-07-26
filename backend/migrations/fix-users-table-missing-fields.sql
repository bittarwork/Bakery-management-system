-- =====================================================
-- Fix Users Table Missing Fields Migration
-- Adds distributor-related fields to users table
-- =====================================================

-- Enable safe updates
SET SQL_SAFE_UPDATES = 0;

-- Check if current_location column exists
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_schema = DATABASE() 
    AND table_name = 'users' 
    AND column_name = 'current_location'
);

-- Add missing columns if they don't exist
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE users 
     ADD COLUMN current_location JSON NULL COMMENT "Current GPS location with timestamp for distributors",
     ADD COLUMN location_updated_at DATETIME NULL COMMENT "When location was last updated",
     ADD COLUMN vehicle_info JSON NULL COMMENT "Vehicle details for distributors",
     ADD COLUMN work_status ENUM("available", "busy", "offline", "break") NULL COMMENT "Current work status for distributors",
     ADD COLUMN daily_performance JSON NULL COMMENT "Daily performance metrics for distributors";',
    'SELECT "Columns already exist" as message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes for better performance (only if columns were added)
SET @index_sql = IF(@column_exists = 0,
    'CREATE INDEX idx_users_work_status ON users(work_status);
     CREATE INDEX idx_users_location_updated ON users(location_updated_at);
     CREATE INDEX idx_users_role_status ON users(role, status);',
    'SELECT "Indexes already exist" as message;'
);

PREPARE stmt FROM @index_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Reset safe updates
SET SQL_SAFE_UPDATES = 1;

-- Verify the fix
SELECT 
    'USERS TABLE FIX COMPLETED' as status,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = DATABASE() 
     AND table_name = 'users' 
     AND column_name = 'current_location') as current_location_exists,
    NOW() as completed_at;

-- Show current users table structure
SELECT column_name, data_type, is_nullable, column_default, column_comment
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'users'
ORDER BY ordinal_position; 