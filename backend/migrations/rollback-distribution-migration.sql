-- =====================================================
-- Distribution System Migration Rollback
-- Railway MySQL Database Rollback
-- =====================================================
-- WARNING: This will remove all distribution system data!
-- Only run if migration needs to be completely reversed
-- =====================================================

-- Enable safe updates
SET SQL_SAFE_UPDATES = 0;

-- =====================================================
-- 1. DROP NEW TABLES
-- =====================================================

-- Drop distributor_daily_performance table
DROP TABLE IF EXISTS distributor_daily_performance;

-- Drop location_history table  
DROP TABLE IF EXISTS location_history;

-- =====================================================
-- 2. REMOVE FOREIGN KEY CONSTRAINTS FROM ORDERS
-- =====================================================

-- Drop foreign key constraint
ALTER TABLE orders DROP FOREIGN KEY IF EXISTS fk_orders_distributor;

-- =====================================================
-- 3. REMOVE NEW COLUMNS FROM ORDERS TABLE
-- =====================================================

-- Remove distributor assignment columns
ALTER TABLE orders 
DROP COLUMN IF EXISTS assigned_distributor_id,
DROP COLUMN IF EXISTS assigned_at,
DROP COLUMN IF EXISTS delivery_started_at,
DROP COLUMN IF EXISTS delivery_completed_at,
DROP COLUMN IF EXISTS delivery_notes;

-- =====================================================
-- 4. REMOVE NEW COLUMNS FROM USERS TABLE
-- =====================================================

-- Remove distributor location and performance columns
ALTER TABLE users 
DROP COLUMN IF EXISTS current_location,
DROP COLUMN IF EXISTS location_updated_at,
DROP COLUMN IF EXISTS vehicle_info,
DROP COLUMN IF EXISTS work_status,
DROP COLUMN IF EXISTS daily_performance;

-- =====================================================
-- 5. DROP NEW INDEXES
-- =====================================================

-- Drop indexes from users table
DROP INDEX IF EXISTS idx_users_work_status ON users;
DROP INDEX IF EXISTS idx_users_location_updated ON users;  
DROP INDEX IF EXISTS idx_users_role_status ON users;

-- Drop indexes from orders table
DROP INDEX IF EXISTS idx_orders_assigned_distributor ON orders;
DROP INDEX IF EXISTS idx_orders_assigned_at ON orders;
DROP INDEX IF EXISTS idx_orders_delivery_dates ON orders;

-- =====================================================
-- 6. VERIFY ROLLBACK SUCCESS
-- =====================================================

-- Check that new tables are gone
SELECT 'Tables removed' as status,
       CASE 
           WHEN (
               SELECT COUNT(*) 
               FROM information_schema.tables 
               WHERE table_schema = DATABASE() 
               AND table_name IN ('location_history', 'distributor_daily_performance')
           ) = 0 THEN 'SUCCESS' 
           ELSE 'FAILED' 
       END as result;

-- Check that new columns are removed from users
SELECT 'Users columns removed' as status,
       CASE 
           WHEN (
               SELECT COUNT(*) 
               FROM information_schema.columns 
               WHERE table_schema = DATABASE() 
               AND table_name = 'users' 
               AND column_name IN ('current_location', 'location_updated_at', 'vehicle_info', 'work_status', 'daily_performance')
           ) = 0 THEN 'SUCCESS' 
           ELSE 'FAILED' 
       END as result;

-- Check that new columns are removed from orders
SELECT 'Orders columns removed' as status,
       CASE 
           WHEN (
               SELECT COUNT(*) 
               FROM information_schema.columns 
               WHERE table_schema = DATABASE() 
               AND table_name = 'orders' 
               AND column_name IN ('assigned_distributor_id', 'assigned_at', 'delivery_started_at', 'delivery_completed_at', 'delivery_notes')
           ) = 0 THEN 'SUCCESS' 
           ELSE 'FAILED' 
       END as result;

-- Reset safe updates
SET SQL_SAFE_UPDATES = 1;

-- =====================================================
-- ROLLBACK COMPLETE
-- =====================================================

SELECT 'ROLLBACK COMPLETED' as message,
       'All distribution system changes have been reversed' as note,
       NOW() as completed_at; 