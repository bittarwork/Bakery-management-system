-- Create vehicles table for vehicle management
-- This table stores information about vehicles used by distributors

CREATE TABLE IF NOT EXISTS vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Basic vehicle information
    vehicle_type ENUM('car', 'van', 'truck', 'motorcycle') NOT NULL DEFAULT 'van',
    vehicle_model VARCHAR(100) NOT NULL,
    vehicle_plate VARCHAR(20) UNIQUE NOT NULL,
    vehicle_year INT NOT NULL,
    vehicle_color VARCHAR(50),
    
    -- Status and assignment
    status ENUM('active', 'maintenance', 'inactive', 'retired') DEFAULT 'active',
    assigned_distributor_id INT NULL,
    
    -- Insurance and registration info
    insurance_company VARCHAR(100),
    insurance_expiry_date DATE,
    registration_expiry_date DATE,
    
    -- Technical specifications
    fuel_type ENUM('gasoline', 'diesel', 'electric', 'hybrid') DEFAULT 'gasoline',
    engine_capacity VARCHAR(20),
    transmission_type ENUM('manual', 'automatic') DEFAULT 'manual',
    
    -- Maintenance info
    last_maintenance_date DATE,
    last_maintenance_km INT DEFAULT 0,
    next_maintenance_km INT,
    current_km INT DEFAULT 0,
    
    -- Financial info
    purchase_date DATE,
    purchase_price_eur DECIMAL(12,2) DEFAULT 0.00,
    purchase_price_syp DECIMAL(15,2) DEFAULT 0.00,
    
    -- Additional info
    notes TEXT,
    is_company_owned BOOLEAN DEFAULT TRUE,
    
    -- Audit fields
    created_by INT,
    created_by_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better performance
    INDEX idx_vehicle_type (vehicle_type),
    INDEX idx_status (status),
    INDEX idx_assigned_distributor (assigned_distributor_id),
    INDEX idx_vehicle_plate (vehicle_plate),
    INDEX idx_insurance_expiry (insurance_expiry_date),
    INDEX idx_registration_expiry (registration_expiry_date),
    
    -- Foreign key constraint
    FOREIGN KEY (assigned_distributor_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='جدول المركبات المستخدمة في التوزيع';

-- Insert some sample vehicles for testing
INSERT INTO vehicles (
    vehicle_type, vehicle_model, vehicle_plate, vehicle_year, vehicle_color,
    status, fuel_type, engine_capacity, transmission_type,
    purchase_date, purchase_price_eur, notes, created_by_name
) VALUES 
(
    'van', 'Ford Transit 2020', 'ABC-123', 2020, 'أبيض',
    'active', 'diesel', '2.0L', 'manual',
    '2020-01-15', 25000.00, 'مركبة توزيع رئيسية للمخبز', 'System Admin'
),
(
    'car', 'Toyota Corolla 2019', 'XYZ-456', 2019, 'أزرق',
    'active', 'gasoline', '1.6L', 'automatic',
    '2019-06-10', 18000.00, 'سيارة للتوزيع السريع', 'System Admin'
),
(
    'motorcycle', 'Honda CB 150', 'MOT-789', 2021, 'أسود',
    'active', 'gasoline', '150cc', 'manual',
    '2021-03-20', 3500.00, 'دراجة نارية للتوصيل السريع', 'System Admin'
); 