-- Enhanced Order Management Features Migration (MySQL Version)
-- Created for Phase 6 completion

-- ==============================================
-- 1. PRICE HISTORY TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS price_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    old_price_eur DECIMAL(10, 2) DEFAULT 0.00,
    new_price_eur DECIMAL(10, 2) DEFAULT 0.00,
    change_reason TEXT,
    change_type ENUM('manual', 'bulk', 'dynamic', 'system') DEFAULT 'manual',
    changed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_price_history_product_date (product_id, created_at DESC),
    INDEX idx_price_history_change_type (change_type),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ==============================================
-- 2. PRICING RULES TABLE (Dynamic Pricing)
-- ==============================================
CREATE TABLE IF NOT EXISTS pricing_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rule_type ENUM('percentage', 'fixed', 'tiered', 'seasonal') DEFAULT 'percentage',
    conditions JSON,
    action JSON,
    priority INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    applicable_products JSON,
    applicable_stores JSON,
    start_date DATE,
    end_date DATE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pricing_rules_active (is_active),
    INDEX idx_pricing_rules_dates (start_date, end_date),
    INDEX idx_pricing_rules_priority (priority DESC),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ==============================================
-- 3. DISTRIBUTOR ASSIGNMENTS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS distributor_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    distributor_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT,
    status ENUM('assigned', 'in_progress', 'completed', 'cancelled') DEFAULT 'assigned',
    estimated_delivery DATETIME,
    actual_delivery DATETIME,
    notes TEXT,
    delivery_priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    vehicle_info JSON,
    route_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_distributor_assignments_order (order_id),
    INDEX idx_distributor_assignments_distributor (distributor_id),
    INDEX idx_distributor_assignments_status (status),
    INDEX idx_distributor_assignments_date (estimated_delivery),
    UNIQUE KEY unique_order_distributor (order_id, distributor_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ==============================================
-- 4. DELIVERY SCHEDULES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS delivery_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time_start TIME NOT NULL,
    scheduled_time_end TIME,
    time_slot ENUM('morning', 'afternoon', 'evening', 'custom') DEFAULT 'morning',
    delivery_type ENUM('standard', 'express', 'scheduled', 'pickup') DEFAULT 'standard',
    delivery_address TEXT,
    delivery_instructions TEXT,
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    delivery_fee_eur DECIMAL(8, 2) DEFAULT 0.00,
    status ENUM('scheduled', 'confirmed', 'in_progress', 'delivered', 'missed', 'rescheduled') DEFAULT 'scheduled',
    confirmation_token VARCHAR(50),
    created_by INT,
    rescheduled_from INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_delivery_schedules_order (order_id),
    INDEX idx_delivery_schedules_date (scheduled_date),
    INDEX idx_delivery_schedules_status (status),
    INDEX idx_delivery_schedules_time_slot (time_slot),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (rescheduled_from) REFERENCES delivery_schedules(id) ON DELETE SET NULL
);

-- ==============================================
-- 5. BULK OPERATIONS LOG TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS bulk_operations_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operation_type ENUM('price_update', 'status_change', 'distributor_assign', 'schedule_delivery') NOT NULL,
    total_items INT DEFAULT 0,
    successful_items INT DEFAULT 0,
    failed_items INT DEFAULT 0,
    operation_data JSON,
    error_details JSON,
    executed_by INT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    INDEX idx_bulk_operations_type_date (operation_type, started_at DESC),
    INDEX idx_bulk_operations_user (executed_by),
    FOREIGN KEY (executed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ==============================================
-- 6. SAMPLE DATA FOR TESTING
-- ==============================================

-- Insert sample pricing rules
INSERT IGNORE INTO pricing_rules (name, description, rule_type, conditions, action, priority, applicable_products, start_date, end_date, created_by) VALUES 
('حجم كبير - خصم 10%', 'خصم 10% للطلبات أكثر من 100 يورو', 'percentage', '{"min_order_amount": 100}', '{"discount_percentage": 10}', 5, null, '2024-01-01', '2024-12-31', 1),
('عميل VIP - خصم 15%', 'خصم خاص للعملاء المميزين', 'percentage', '{"customer_type": "vip"}', '{"discount_percentage": 15}', 10, null, '2024-01-01', '2024-12-31', 1),
('خصم موسمي - شتاء', 'خصم موسمي لفصل الشتاء', 'percentage', '{"season": "winter"}', '{"discount_percentage": 8}', 3, null, '2024-12-01', '2025-02-28', 1);

-- ==============================================
-- 7. VIEWS FOR EASIER DATA ACCESS
-- ==============================================

-- View for current product prices with history
CREATE OR REPLACE VIEW v_product_pricing AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.price_eur as current_price_eur,
    ph.old_price_eur as previous_price_eur,
    ph.change_reason,
    ph.created_at as last_price_change,
    (p.price_eur - COALESCE(ph.old_price_eur, p.price_eur)) as price_difference
FROM products p
LEFT JOIN price_history ph ON p.id = ph.product_id
    AND ph.id = (
        SELECT MAX(id) FROM price_history 
        WHERE product_id = p.id
    );

-- View for delivery schedule overview
CREATE OR REPLACE VIEW v_delivery_overview AS
SELECT 
    ds.id as schedule_id,
    o.id as order_id,
    o.order_number,
    ds.scheduled_date,
    ds.scheduled_time_start,
    ds.time_slot,
    ds.delivery_type,
    ds.status as delivery_status,
    o.status as order_status,
    da.distributor_id,
    u.name as distributor_name,
    ds.delivery_fee_eur
FROM delivery_schedules ds
LEFT JOIN orders o ON ds.order_id = o.id
LEFT JOIN distributor_assignments da ON o.id = da.order_id AND da.status = 'assigned'
LEFT JOIN users u ON da.distributor_id = u.id;

-- Success message (commented out for Sequelize compatibility)
-- SELECT 'Enhanced Order Management database schema created successfully!' as result; 