-- Basic Enhanced AI System Migration
-- Compatible with older MySQL versions

-- Stock adjustments tracking table
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    old_stock INT NOT NULL DEFAULT 0,
    new_stock INT NOT NULL DEFAULT 0,
    adjustment_reason TEXT,
    adjusted_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_product_id (product_id),
    INDEX idx_adjusted_by (adjusted_by),
    INDEX idx_created_at (created_at)
);

-- Order status history tracking
CREATE TABLE IF NOT EXISTS order_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    change_reason TEXT,
    changed_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_order_id (order_id),
    INDEX idx_changed_by (changed_by),
    INDEX idx_created_at (created_at)
);

-- Order notes for additional information
CREATE TABLE IF NOT EXISTS order_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    note TEXT NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_order_id (order_id),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
);

-- AI action logs for tracking system actions performed by AI
CREATE TABLE IF NOT EXISTS ai_action_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_name VARCHAR(100) NOT NULL,
    parameters JSON,
    success BOOLEAN DEFAULT FALSE,
    result_summary TEXT,
    error_message TEXT,
    execution_time_ms INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action_name (action_name),
    INDEX idx_success (success),
    INDEX idx_created_at (created_at)
);

-- User behavioral patterns cache table
CREATE TABLE IF NOT EXISTS user_behavior_patterns (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    total_interactions INT DEFAULT 0,
    preferred_intents JSON,
    active_hours JSON,
    personality_type VARCHAR(50) DEFAULT 'balanced',
    personality_confidence DECIMAL(3,2) DEFAULT 0.00,
    last_interaction TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_personality_type (personality_type),
    INDEX idx_last_interaction (last_interaction)
);

-- System alerts and notifications
CREATE TABLE IF NOT EXISTS system_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    resolved_by INT NULL,
    
    INDEX idx_alert_type (alert_type),
    INDEX idx_severity (severity),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);

-- AI learning data for continuous improvement
CREATE TABLE IF NOT EXISTS ai_learning_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id VARCHAR(255),
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    user_feedback TINYINT,
    feedback_text TEXT,
    intent_accuracy DECIMAL(3,2),
    response_quality DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_user_feedback (user_feedback),
    INDEX idx_created_at (created_at)
);

-- Business insights cache for faster access
CREATE TABLE IF NOT EXISTS business_insights_cache (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    insight_type VARCHAR(100) NOT NULL,
    data JSON NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    INDEX idx_cache_key (cache_key),
    INDEX idx_insight_type (insight_type),
    INDEX idx_expires_at (expires_at),
    INDEX idx_generated_at (generated_at)
);

-- Insert sample system alerts if none exist
INSERT IGNORE INTO system_alerts (alert_type, severity, title, message, data)
VALUES 
('inventory', 'high', 'Low Stock Alert', 'Several products are running low on stock', 
 JSON_OBJECT('product_count', 5, 'critical_count', 2)),
('sales', 'medium', 'Sales Performance', 'Daily sales target not met for 3 consecutive days',
 JSON_OBJECT('target_missed_days', 3, 'performance_drop', 15));

COMMIT;