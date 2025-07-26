-- Add distributor workload and performance tracking fields to users table
-- This migration adds the missing fields needed for automatic distributor assignment

-- Add current_workload field
ALTER TABLE users ADD COLUMN current_workload INTEGER DEFAULT 0 NOT NULL 
    COMMENT 'Current number of assigned orders for distributors';

-- Add performance_rating field
ALTER TABLE users ADD COLUMN performance_rating DECIMAL(3,2) DEFAULT 0.00 NOT NULL 
    COMMENT 'Performance rating out of 5 for distributors';

-- Add last_active field
ALTER TABLE users ADD COLUMN last_active DATETIME NULL 
    COMMENT 'Last activity timestamp for distributors';

-- Update existing distributors with default values
UPDATE users SET 
    current_workload = 0, 
    performance_rating = 3.5, 
    last_active = NOW() 
WHERE role = 'distributor';

-- Add indexes for better performance
CREATE INDEX idx_users_current_workload ON users (current_workload);
CREATE INDEX idx_users_performance_rating ON users (performance_rating);
CREATE INDEX idx_users_role_status ON users (role, status); 