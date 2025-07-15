-- Create daily_reports table for distributor reports
CREATE TABLE IF NOT EXISTS daily_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    distributor_id INTEGER NOT NULL,
    report_date DATE NOT NULL,
    schedule_id INTEGER,
    total_stores_visited INTEGER DEFAULT 0,
    total_amount_delivered DECIMAL(10,2) DEFAULT 0.00,
    total_amount_collected DECIMAL(10,2) DEFAULT 0.00,
    total_gifts_given DECIMAL(10,2) DEFAULT 0.00,
    vehicle_expenses DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    expenses TEXT, -- JSON string for additional expenses
    status VARCHAR(20) DEFAULT 'draft', -- draft, submitted, approved, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES distribution_schedules(id) ON DELETE SET NULL,
    
    -- Indexes for better performance
    INDEX idx_daily_reports_distributor (distributor_id),
    INDEX idx_daily_reports_date (report_date),
    INDEX idx_daily_reports_status (status),
    INDEX idx_daily_reports_distributor_date (distributor_id, report_date)
);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_daily_reports_updated_at
    AFTER UPDATE ON daily_reports
    FOR EACH ROW
BEGIN
    UPDATE daily_reports SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END; 