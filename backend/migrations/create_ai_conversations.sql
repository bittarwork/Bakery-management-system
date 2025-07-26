-- Migration: Create AI Conversations Tables
-- Created: $(date)
-- Description: Tables for storing AI chat conversations, ratings, and analytics

-- Main conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    conversation_id VARCHAR(255) NOT NULL,
    message_type ENUM('user', 'ai', 'system') NOT NULL,
    content TEXT NOT NULL,
    metadata JSON DEFAULT NULL,
    response_time_ms INT DEFAULT NULL,
    tokens_used INT DEFAULT NULL,
    model_used VARCHAR(100) DEFAULT 'gemini-1.5-flash',
    cached BOOLEAN DEFAULT FALSE,
    rating TINYINT DEFAULT NULL CHECK (rating >= 1 AND rating <= 5),
    sentiment VARCHAR(20) DEFAULT NULL,
    intent VARCHAR(50) DEFAULT NULL,
    confidence_score DECIMAL(3,2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_created_at (created_at),
    INDEX idx_message_type (message_type),
    INDEX idx_rating (rating),
    INDEX idx_sentiment (sentiment),
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Conversation statistics table (for performance)
CREATE TABLE IF NOT EXISTS ai_conversation_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    total_messages INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    avg_response_time DECIMAL(8,2) DEFAULT 0,
    satisfaction_score DECIMAL(3,2) DEFAULT 0,
    positive_sentiment_count INT DEFAULT 0,
    negative_sentiment_count INT DEFAULT 0,
    neutral_sentiment_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Unique constraint to prevent duplicates
    UNIQUE KEY unique_user_date (user_id, date),
    
    -- Indexes
    INDEX idx_date (date),
    INDEX idx_user_date (user_id, date),
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Context memory table for intelligent conversations
CREATE TABLE IF NOT EXISTS ai_context_memory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    context_type ENUM('short_term', 'long_term', 'preferences') NOT NULL,
    context_key VARCHAR(255) NOT NULL,
    context_value JSON NOT NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_context_type (context_type),
    INDEX idx_context_key (context_key),
    INDEX idx_expires_at (expires_at),
    
    -- Unique constraint for context keys per user
    UNIQUE KEY unique_user_context (user_id, context_type, context_key),
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AI chat analytics table for business insights
CREATE TABLE IF NOT EXISTS ai_chat_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    total_conversations INT DEFAULT 0,
    total_messages INT DEFAULT 0,
    total_users INT DEFAULT 0,
    avg_satisfaction DECIMAL(3,2) DEFAULT 0,
    most_common_intent VARCHAR(50) DEFAULT NULL,
    avg_response_time DECIMAL(8,2) DEFAULT 0,
    cache_hit_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Unique constraint
    UNIQUE KEY unique_date (date),
    
    -- Index
    INDEX idx_date (date)
);

-- Insert initial analytics record for today
INSERT IGNORE INTO ai_chat_analytics (date) VALUES (CURDATE());

-- Create triggers for automatic statistics updates
DELIMITER //

CREATE TRIGGER IF NOT EXISTS update_conversation_stats_after_insert
    AFTER INSERT ON ai_conversations
    FOR EACH ROW
BEGIN
    INSERT INTO ai_conversation_stats (user_id, date, total_messages, total_tokens, avg_response_time)
    VALUES (NEW.user_id, DATE(NEW.created_at), 1, COALESCE(NEW.tokens_used, 0), COALESCE(NEW.response_time_ms, 0))
    ON DUPLICATE KEY UPDATE
        total_messages = total_messages + 1,
        total_tokens = total_tokens + COALESCE(NEW.tokens_used, 0),
        avg_response_time = ((avg_response_time * (total_messages - 1)) + COALESCE(NEW.response_time_ms, 0)) / total_messages,
        updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER IF NOT EXISTS update_conversation_stats_after_rating
    AFTER UPDATE ON ai_conversations
    FOR EACH ROW
BEGIN
    IF NEW.rating IS NOT NULL AND OLD.rating IS NULL THEN
        UPDATE ai_conversation_stats 
        SET satisfaction_score = (
            SELECT AVG(rating) 
            FROM ai_conversations 
            WHERE user_id = NEW.user_id 
            AND DATE(created_at) = DATE(NEW.created_at) 
            AND rating IS NOT NULL
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id AND date = DATE(NEW.created_at);
    END IF;
END//

DELIMITER ;

-- Add some sample context for testing (optional)
-- INSERT IGNORE INTO ai_context_memory (user_id, context_type, context_key, context_value) VALUES
-- (1, 'preferences', 'language', '"ar"'),
-- (1, 'preferences', 'report_format', '"detailed"'),
-- (1, 'long_term', 'frequent_queries', '["sales", "inventory", "reports"]');

-- Create indexes for better performance on large datasets
CREATE INDEX IF NOT EXISTS idx_conversations_user_date ON ai_conversations(user_id, DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_conversations_sentiment_date ON ai_conversations(sentiment, DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_context_user_type ON ai_context_memory(user_id, context_type);

COMMIT; 