-- Enhanced AI System Database Tables
-- Add these tables to support the enhanced AI functionality

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
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (adjusted_by) REFERENCES users(id)
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
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id)
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
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Add cost_price_eur column to products table if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost_price_eur DECIMAL(10,2) DEFAULT 0.00 AFTER price_syp;

-- Add cost_price_syp column to products table if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost_price_syp DECIMAL(15,2) DEFAULT 0.00 AFTER cost_price_eur;

-- Enhance ai_conversations table structure if needed
ALTER TABLE ai_conversations 
MODIFY COLUMN content TEXT,
ADD COLUMN IF NOT EXISTS session_id VARCHAR(255) DEFAULT NULL AFTER user_id,
ADD COLUMN IF NOT EXISTS conversation_id VARCHAR(255) DEFAULT NULL AFTER session_id,
ADD COLUMN IF NOT EXISTS response_time_ms INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tokens_used INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS model_used VARCHAR(100) DEFAULT 'gemini-1.5-flash',
ADD COLUMN IF NOT EXISTS cached BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rating TINYINT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sentiment VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS intent VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) DEFAULT NULL;

-- Add indexes for better performance
ALTER TABLE ai_conversations
ADD INDEX IF NOT EXISTS idx_session_id (session_id),
ADD INDEX IF NOT EXISTS idx_conversation_id (conversation_id),
ADD INDEX IF NOT EXISTS idx_sentiment (sentiment),
ADD INDEX IF NOT EXISTS idx_intent (intent),
ADD INDEX IF NOT EXISTS idx_user_date (user_id, created_at);

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
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id)
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
    INDEX idx_last_interaction (last_interaction),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (resolved_by) REFERENCES users(id)
);

-- AI learning data for continuous improvement
CREATE TABLE IF NOT EXISTS ai_learning_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id VARCHAR(255),
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    user_feedback TINYINT, -- 1-5 rating
    feedback_text TEXT,
    intent_accuracy DECIMAL(3,2),
    response_quality DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_user_feedback (user_feedback),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id)
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

-- Cleanup expired cache entries trigger
CREATE EVENT IF NOT EXISTS cleanup_expired_insights
ON SCHEDULE EVERY 1 HOUR
DO
DELETE FROM business_insights_cache WHERE expires_at < NOW();

-- Insert sample cost prices for existing products (if any)
UPDATE products 
SET cost_price_eur = ROUND(price_eur * 0.6, 2),
    cost_price_syp = ROUND(price_syp * 0.6, 2)
WHERE cost_price_eur = 0 OR cost_price_eur IS NULL;

-- Create views for common analytics queries
CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT 
    DATE(created_at) as sale_date,
    COUNT(DISTINCT id) as total_orders,
    SUM(total_amount_eur) as total_revenue_eur,
    SUM(total_amount_syp) as total_revenue_syp,
    AVG(total_amount_eur) as avg_order_value_eur,
    COUNT(DISTINCT store_id) as unique_stores
FROM orders
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

CREATE OR REPLACE VIEW product_performance_summary AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.price_eur,
    p.cost_price_eur,
    (p.price_eur - p.cost_price_eur) as profit_per_unit,
    CASE 
        WHEN p.cost_price_eur > 0 THEN ((p.price_eur - p.cost_price_eur) / p.price_eur) * 100
        ELSE 0
    END as profit_margin_percent,
    p.current_stock,
    p.minimum_stock,
    CASE 
        WHEN p.current_stock = 0 THEN 'out_of_stock'
        WHEN p.current_stock <= p.minimum_stock THEN 'critical'
        WHEN p.current_stock <= p.minimum_stock * 1.5 THEN 'low'
        WHEN p.current_stock <= p.minimum_stock * 2 THEN 'medium'
        ELSE 'good'
    END as stock_status,
    COALESCE(sales_data.total_sold, 0) as total_sold_30d,
    COALESCE(sales_data.revenue_30d, 0) as revenue_30d_eur
FROM products p
LEFT JOIN (
    SELECT 
        oi.product_id,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * p.price_eur) as revenue_30d
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    AND o.status IN ('confirmed', 'delivered')
    GROUP BY oi.product_id
) sales_data ON p.id = sales_data.product_id
WHERE p.status = 'active'
ORDER BY revenue_30d_eur DESC, total_sold DESC;

CREATE OR REPLACE VIEW store_performance_summary AS
SELECT 
    s.id,
    s.name,
    s.area,
    s.phone,
    s.current_balance_eur,
    s.current_balance_syp,
    s.credit_limit_eur,
    s.credit_limit_syp,
    CASE 
        WHEN s.credit_limit_eur > 0 THEN (ABS(s.current_balance_eur) / s.credit_limit_eur) * 100
        ELSE 0
    END as credit_utilization_percent,
    COALESCE(order_stats.total_orders_30d, 0) as total_orders_30d,
    COALESCE(order_stats.total_revenue_30d, 0) as total_revenue_30d_eur,
    COALESCE(order_stats.avg_order_value, 0) as avg_order_value_eur,
    COALESCE(order_stats.delivered_orders, 0) as delivered_orders_30d,
    CASE 
        WHEN order_stats.total_orders_30d > 0 
        THEN (order_stats.delivered_orders * 100.0 / order_stats.total_orders_30d)
        ELSE 0
    END as delivery_success_rate
FROM stores s
LEFT JOIN (
    SELECT 
        o.store_id,
        COUNT(*) as total_orders_30d,
        SUM(o.total_amount_eur) as total_revenue_30d,
        AVG(o.total_amount_eur) as avg_order_value,
        COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as delivered_orders
    FROM orders o
    WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY o.store_id
) order_stats ON s.id = order_stats.store_id
WHERE s.status = 'active'
ORDER BY total_revenue_30d_eur DESC;

-- Add sample data for testing if tables are empty
-- This will only insert if the respective tables are empty

-- Sample system alerts
INSERT INTO system_alerts (alert_type, severity, title, message, data)
SELECT 'inventory', 'high', 'Low Stock Alert', 'Several products are running low on stock', 
JSON_OBJECT('product_count', 5, 'critical_count', 2)
WHERE NOT EXISTS (SELECT 1 FROM system_alerts LIMIT 1);

INSERT INTO system_alerts (alert_type, severity, title, message, data)
SELECT 'sales', 'medium', 'Sales Performance', 'Daily sales target not met for 3 consecutive days',
JSON_OBJECT('target_missed_days', 3, 'performance_drop', 15)
WHERE (SELECT COUNT(*) FROM system_alerts) < 2;

-- Sample learning data for AI improvement
INSERT INTO ai_learning_data (user_id, session_id, user_message, ai_response, user_feedback, intent_accuracy, response_quality)
SELECT 1, 'sample_session_1', 'كم عدد الطلبات اليوم؟', 'يوجد 25 طلب اليوم بقيمة إجمالية 450 يورو', 5, 0.95, 0.90
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1) 
AND NOT EXISTS (SELECT 1 FROM ai_learning_data LIMIT 1);

-- Create stored procedures for common operations
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS GetBusinessAnalytics(
    IN period_type VARCHAR(20),
    IN store_filter INT
)
BEGIN
    DECLARE date_condition VARCHAR(500) DEFAULT '';
    DECLARE store_condition VARCHAR(100) DEFAULT '';
    
    -- Set date condition based on period
    CASE period_type
        WHEN 'today' THEN SET date_condition = 'DATE(o.created_at) = CURDATE()';
        WHEN 'yesterday' THEN SET date_condition = 'DATE(o.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)';
        WHEN 'week' THEN SET date_condition = 'DATE(o.created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        WHEN 'month' THEN SET date_condition = 'DATE(o.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        WHEN 'quarter' THEN SET date_condition = 'DATE(o.created_at) >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)';
        WHEN 'year' THEN SET date_condition = 'DATE(o.created_at) >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)';
        ELSE SET date_condition = 'DATE(o.created_at) = CURDATE()';
    END CASE;
    
    -- Set store condition if provided
    IF store_filter IS NOT NULL THEN
        SET store_condition = CONCAT(' AND o.store_id = ', store_filter);
    END IF;
    
    -- Execute dynamic query
    SET @sql = CONCAT('
        SELECT 
            COUNT(DISTINCT o.id) as total_orders,
            COALESCE(SUM(o.total_amount_eur), 0) as total_revenue_eur,
            COALESCE(SUM(o.total_amount_syp), 0) as total_revenue_syp,
            COALESCE(AVG(o.total_amount_eur), 0) as avg_order_value_eur,
            COUNT(DISTINCT CASE WHEN o.status = "pending" THEN o.id END) as pending_orders,
            COUNT(DISTINCT CASE WHEN o.status = "confirmed" THEN o.id END) as confirmed_orders,
            COUNT(DISTINCT CASE WHEN o.status = "delivered" THEN o.id END) as delivered_orders,
            COUNT(DISTINCT CASE WHEN o.status = "cancelled" THEN o.id END) as cancelled_orders,
            COUNT(DISTINCT o.store_id) as active_stores,
            COUNT(DISTINCT oi.product_id) as products_sold,
            COALESCE(SUM(oi.quantity), 0) as total_quantity_sold,
            COUNT(DISTINCT s.id) as unique_customers
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN stores s ON o.store_id = s.id
        WHERE ', date_condition, store_condition
    );
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //

DELIMITER ;

-- Add triggers for automated insights generation
DELIMITER //

CREATE TRIGGER IF NOT EXISTS after_order_insert
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    -- Invalidate relevant cache entries
    DELETE FROM business_insights_cache 
    WHERE insight_type IN ('daily_sales', 'store_performance', 'business_analytics');
    
    -- Log high-value orders
    IF NEW.total_amount_eur > 100 THEN
        INSERT INTO system_alerts (alert_type, severity, title, message, data)
        VALUES ('sales', 'low', 'High Value Order', 
                CONCAT('New high-value order #', NEW.order_number, ' for ', NEW.total_amount_eur, ' EUR'),
                JSON_OBJECT('order_id', NEW.id, 'amount', NEW.total_amount_eur, 'store_id', NEW.store_id));
    END IF;
END //

CREATE TRIGGER IF NOT EXISTS after_product_stock_update
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    -- Check for low stock alerts
    IF NEW.current_stock <= NEW.minimum_stock AND OLD.current_stock > NEW.minimum_stock THEN
        INSERT INTO system_alerts (alert_type, severity, title, message, data)
        VALUES ('inventory', 'high', 'Low Stock Alert', 
                CONCAT('Product "', NEW.name, '" is now below minimum stock level'),
                JSON_OBJECT('product_id', NEW.id, 'current_stock', NEW.current_stock, 'minimum_stock', NEW.minimum_stock));
    END IF;
    
    -- Invalidate inventory-related cache
    DELETE FROM business_insights_cache 
    WHERE insight_type IN ('inventory_alerts', 'product_analytics');
END //

DELIMITER ;

COMMIT;