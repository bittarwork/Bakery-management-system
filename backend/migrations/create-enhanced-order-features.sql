-- Enhanced Order Management Features Migration
-- Created for Phase 6 completion

-- ==============================================
-- 1. PRICE HISTORY TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    old_price_eur DECIMAL(10, 2) DEFAULT 0.00,
    new_price_eur DECIMAL(10, 2) DEFAULT 0.00,
    change_reason TEXT,
    change_type ENUM('manual', 'bulk', 'dynamic', 'system') DEFAULT 'manual',
    changed_by INTEGER, -- user_id
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ==============================================
-- 2. PRICING RULES TABLE (Dynamic Pricing)
-- ==============================================
CREATE TABLE IF NOT EXISTS pricing_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rule_type ENUM('percentage', 'fixed', 'tiered', 'seasonal') DEFAULT 'percentage',
    conditions JSON, -- Store conditions as JSON (quantity, date, store_type, etc.)
    action JSON, -- Store pricing action as JSON (discount%, increase%, fixed_price)
    priority INTEGER DEFAULT 1, -- Higher number = higher priority
    is_active BOOLEAN DEFAULT true,
    applicable_products JSON, -- null = all products, or array of product_ids
    applicable_stores JSON, -- null = all stores, or array of store_ids
    start_date DATE,
    end_date DATE,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ==============================================
-- 3. DISTRIBUTOR ASSIGNMENTS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS distributor_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    distributor_id INTEGER NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER, -- user_id who made the assignment
    status ENUM('assigned', 'in_progress', 'completed', 'cancelled') DEFAULT 'assigned',
    estimated_delivery DATETIME,
    actual_delivery DATETIME,
    notes TEXT,
    delivery_priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    vehicle_info JSON, -- Store vehicle details as JSON
    route_info JSON, -- Store route/GPS info as JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(order_id, distributor_id) -- Prevent duplicate assignments
);

-- ==============================================
-- 4. DELIVERY SCHEDULES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS delivery_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
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
    confirmation_token VARCHAR(50), -- For customer confirmation
    created_by INTEGER,
    rescheduled_from INTEGER, -- Reference to previous schedule if rescheduled
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (rescheduled_from) REFERENCES delivery_schedules(id) ON DELETE SET NULL
);

-- ==============================================
-- 5. BULK OPERATIONS LOG TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS bulk_operations_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_type ENUM('price_update', 'status_change', 'distributor_assign', 'schedule_delivery') NOT NULL,
    total_items INTEGER DEFAULT 0,
    successful_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    operation_data JSON, -- Store operation details
    error_details JSON, -- Store any errors that occurred
    executed_by INTEGER,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (executed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ==============================================
-- 6. INDEXES FOR PERFORMANCE
-- ==============================================

-- Price History Indexes
CREATE INDEX IF NOT EXISTS idx_price_history_product_date ON price_history(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_change_type ON price_history(change_type);

-- Pricing Rules Indexes
CREATE INDEX IF NOT EXISTS idx_pricing_rules_active ON pricing_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_dates ON pricing_rules(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_priority ON pricing_rules(priority DESC);

-- Distributor Assignments Indexes
CREATE INDEX IF NOT EXISTS idx_distributor_assignments_order ON distributor_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_distributor_assignments_distributor ON distributor_assignments(distributor_id);
CREATE INDEX IF NOT EXISTS idx_distributor_assignments_status ON distributor_assignments(status);
CREATE INDEX IF NOT EXISTS idx_distributor_assignments_date ON distributor_assignments(estimated_delivery);

-- Delivery Schedules Indexes
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_order ON delivery_schedules(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_date ON delivery_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_status ON delivery_schedules(status);
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_time_slot ON delivery_schedules(time_slot);

-- Bulk Operations Indexes
CREATE INDEX IF NOT EXISTS idx_bulk_operations_type_date ON bulk_operations_log(operation_type, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_user ON bulk_operations_log(executed_by);

-- ==============================================
-- 7. SAMPLE DATA FOR TESTING
-- ==============================================

-- Insert sample pricing rules
INSERT OR IGNORE INTO pricing_rules (name, description, rule_type, conditions, action, priority, applicable_products, start_date, end_date, created_by) VALUES 
('حجم كبير - خصم 10%', 'خصم 10% للطلبات أكثر من 100 يورو', 'percentage', '{"min_order_amount": 100}', '{"discount_percentage": 10}', 5, null, '2024-01-01', '2024-12-31', 1),
('عميل VIP - خصم 15%', 'خصم خاص للعملاء المميزين', 'percentage', '{"customer_type": "vip"}', '{"discount_percentage": 15}', 10, null, '2024-01-01', '2024-12-31', 1),
('خصم موسمي - شتاء', 'خصم موسمي لفصل الشتاء', 'percentage', '{"season": "winter"}', '{"discount_percentage": 8}', 3, null, '2024-12-01', '2025-02-28', 1);

-- ==============================================
-- 8. TRIGGERS FOR AUTOMATIC UPDATES
-- ==============================================

-- Trigger to log price changes automatically
CREATE TRIGGER IF NOT EXISTS log_price_changes 
AFTER UPDATE ON products 
WHEN OLD.price_eur != NEW.price_eur
BEGIN
    INSERT INTO price_history (product_id, old_price_eur, new_price_eur, change_type, created_at)
    VALUES (NEW.id, OLD.price_eur, NEW.price_eur, 'system', CURRENT_TIMESTAMP);
END;

-- Trigger to update delivery schedule when order delivery date changes
CREATE TRIGGER IF NOT EXISTS sync_delivery_schedule
AFTER UPDATE ON orders 
WHEN OLD.delivery_date != NEW.delivery_date AND NEW.delivery_date IS NOT NULL
BEGIN
    UPDATE delivery_schedules 
    SET scheduled_date = DATE(NEW.delivery_date),
        updated_at = CURRENT_TIMESTAMP
    WHERE order_id = NEW.id AND status IN ('scheduled', 'confirmed');
END;

-- ==============================================
-- 9. VIEWS FOR EASIER DATA ACCESS
-- ==============================================

-- View for current product prices with history
CREATE VIEW IF NOT EXISTS v_product_pricing AS
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
CREATE VIEW IF NOT EXISTS v_delivery_overview AS
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
JOIN orders o ON ds.order_id = o.id
LEFT JOIN distributor_assignments da ON o.id = da.order_id AND da.status = 'assigned'
LEFT JOIN users u ON da.distributor_id = u.id;

-- Success message
SELECT 'Enhanced Order Management database schema created successfully!' as result; 