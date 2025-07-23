-- Create scheduling_drafts table for auto-scheduling system
-- This table stores AI-generated scheduling suggestions for admin review

CREATE TABLE IF NOT EXISTS scheduling_drafts (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    order_id INTEGER NOT NULL,
    suggested_distributor_id INTEGER NOT NULL,
    suggested_delivery_date DATE NOT NULL,
    suggested_delivery_time TIME DEFAULT '08:00:00',
    suggested_priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    
    -- AI reasoning and confidence
    confidence_score DECIMAL(5,2) DEFAULT 0.00 COMMENT 'AI confidence score (0-100)',
    reasoning TEXT COMMENT 'JSON string containing AI reasoning',
    alternative_suggestions TEXT COMMENT 'JSON array of alternative distributor suggestions',
    route_optimization TEXT COMMENT 'JSON object with route optimization data',
    
    -- Status tracking
    status ENUM('pending_review', 'approved', 'modified', 'rejected') DEFAULT 'pending_review',
    reviewed_by INTEGER NULL,
    reviewed_at TIMESTAMP NULL,
    admin_notes TEXT NULL,
    modifications TEXT NULL COMMENT 'JSON object containing admin modifications',
    
    -- Final approved values (if different from suggested)
    approved_distributor_id INTEGER NULL,
    approved_delivery_date DATE NULL,
    approved_delivery_time TIME NULL,
    approved_priority ENUM('low', 'normal', 'high', 'urgent') NULL,
    
    -- Metadata
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (suggested_distributor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_distributor_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_scheduling_drafts_order (order_id),
    INDEX idx_scheduling_drafts_status (status),
    INDEX idx_scheduling_drafts_distributor (suggested_distributor_id),
    INDEX idx_scheduling_drafts_date (suggested_delivery_date),
    INDEX idx_scheduling_drafts_created (created_at),
    INDEX idx_scheduling_drafts_pending (status, created_at)
);

-- Add sample data for testing
INSERT INTO scheduling_drafts (
    order_id, suggested_distributor_id, suggested_delivery_date, suggested_delivery_time,
    suggested_priority, confidence_score, reasoning, status, created_by
) VALUES 
(1, 4, '2024-03-20', '09:00:00', 'normal', 85.50, 
 '{"factors": ["distance", "workload", "performance"], "primary_reason": "Optimal route match", "distributor_analysis": {"availability": "excellent", "location_proximity": "very_good", "past_performance": "high"}}',
 'pending_review', 1),
(2, 5, '2024-03-21', '10:30:00', 'high', 92.30,
 '{"factors": ["urgent_priority", "distributor_availability", "store_preference"], "primary_reason": "High priority order with preferred distributor", "distributor_analysis": {"availability": "excellent", "specialization": "urgent_deliveries", "customer_relationship": "strong"}}',
 'pending_review', 1);

-- Create trigger to auto-update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS scheduling_drafts_updated_at
    BEFORE UPDATE ON scheduling_drafts
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END; 