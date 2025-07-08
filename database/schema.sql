-- نظام إدارة قسم التوزيع - مخبز بلجيكا
-- Database Schema

CREATE DATABASE IF NOT EXISTS bakery_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bakery_db;

-- جدول المستخدمين (Users)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'manager', 'distributor', 'assistant') DEFAULT 'distributor',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- جدول المناطق الجغرافية (Regions)
CREATE TABLE regions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    coordinates JSON, -- للخريطة
    default_distributor_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- جدول المنتجات (Products)
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    unit VARCHAR(20) DEFAULT 'piece', -- قطعة، كيلو، علبة
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- جدول المحلات (Stores)
CREATE TABLE stores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    owner_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    region_id INT,
    payment_method ENUM('cash', 'bank', 'mixed') DEFAULT 'cash',
    credit_limit DECIMAL(10,2) DEFAULT 0.00,
    current_balance DECIMAL(10,2) DEFAULT 0.00, -- رصيد حالي
    gift_policy JSON, -- قواعد الهدايا
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- جدول السيارات (Vehicles)
CREATE TABLE vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    model VARCHAR(50),
    year INT,
    capacity DECIMAL(8,2), -- الحمولة
    fuel_type ENUM('gasoline', 'diesel', 'electric') DEFAULT 'diesel',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- جدول الموزعين (Distributors)
CREATE TABLE distributors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    employee_id VARCHAR(20) UNIQUE,
    vehicle_id INT,
    default_region_id INT,
    salary DECIMAL(10,2),
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    hire_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (default_region_id) REFERENCES regions(id)
);

-- جدول الطلبات اليومية (Daily Orders)
CREATE TABLE daily_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_date DATE NOT NULL,
    store_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    notes TEXT,
    status ENUM('pending', 'confirmed', 'distributed', 'cancelled') DEFAULT 'pending',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE KEY unique_daily_order (order_date, store_id, product_id)
);

-- جدول جداول التوزيع (Distribution Schedules)
CREATE TABLE distribution_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    schedule_date DATE NOT NULL,
    distributor_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    route_data JSON, -- بيانات المسار والخريطة
    total_stores INT DEFAULT 0,
    status ENUM('draft', 'active', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (distributor_id) REFERENCES distributors(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE KEY unique_distributor_date (schedule_date, distributor_id)
);

-- جدول تفاصيل التوزيع (Distribution Items)
CREATE TABLE distribution_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    schedule_id INT NOT NULL,
    store_id INT NOT NULL,
    product_id INT NOT NULL,
    planned_quantity INT NOT NULL DEFAULT 0,
    delivered_quantity INT DEFAULT 0,
    gift_quantity INT DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (delivered_quantity * unit_price) STORED,
    delivery_order INT DEFAULT 1, -- ترتيب التوصيل
    delivery_status ENUM('pending', 'partial', 'completed', 'rejected') DEFAULT 'pending',
    delivery_time TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES distribution_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- جدول قواعد الهدايا (Gift Rules)
CREATE TABLE gift_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT,
    product_id INT,
    buy_quantity INT NOT NULL,
    free_quantity INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- جدول الهدايا المعطاة (Gifts Given)
CREATE TABLE gifts_given (
    id INT PRIMARY KEY AUTO_INCREMENT,
    distribution_item_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_value DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_value) STORED,
    rule_applied_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (distribution_item_id) REFERENCES distribution_items(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (rule_applied_id) REFERENCES gift_rules(id)
);

-- جدول المدفوعات (Payments)
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'bank_transfer', 'check', 'credit') NOT NULL,
    payment_type ENUM('current_order', 'previous_debt', 'mixed') DEFAULT 'current_order',
    reference_number VARCHAR(100), -- رقم العملية أو الشيك
    payment_date DATE NOT NULL,
    distribution_schedule_id INT, -- مرتبط بجولة توزيع
    bank_details JSON, -- تفاصيل التحويل البنكي
    notes TEXT,
    verified_by INT,
    verified_at TIMESTAMP NULL,
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (distribution_schedule_id) REFERENCES distribution_schedules(id),
    FOREIGN KEY (verified_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- جدول التحويلات البنكية (Bank Transfers)
CREATE TABLE bank_transfers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id INT NOT NULL,
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    transfer_date DATE NOT NULL,
    transfer_time TIME,
    reference_number VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    receipt_image VARCHAR(255), -- مسار صورة الإيصال
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

-- جدول أرصدة المحلات (Store Balances) - يتم تحديثه تلقائياً
CREATE TABLE store_balances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    balance_date DATE NOT NULL,
    opening_balance DECIMAL(10,2) DEFAULT 0.00,
    total_orders DECIMAL(10,2) DEFAULT 0.00,
    total_gifts DECIMAL(10,2) DEFAULT 0.00,
    total_payments DECIMAL(10,2) DEFAULT 0.00,
    closing_balance DECIMAL(10,2) GENERATED ALWAYS AS (opening_balance + total_orders - total_gifts - total_payments) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    UNIQUE KEY unique_store_date (store_id, balance_date)
);

-- جدول مصاريف السيارات (Vehicle Expenses)
CREATE TABLE vehicle_expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    distributor_id INT,
    expense_date DATE NOT NULL,
    expense_type ENUM('fuel', 'maintenance', 'repair', 'insurance', 'other') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    receipt_image VARCHAR(255),
    mileage INT, -- الكيلومترات
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (distributor_id) REFERENCES distributors(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- جدول التقارير اليومية (Daily Reports)
CREATE TABLE daily_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_date DATE NOT NULL,
    distributor_id INT NOT NULL,
    schedule_id INT NOT NULL,
    total_stores_visited INT DEFAULT 0,
    total_amount_delivered DECIMAL(10,2) DEFAULT 0.00,
    total_amount_collected DECIMAL(10,2) DEFAULT 0.00,
    total_gifts_given DECIMAL(10,2) DEFAULT 0.00,
    vehicle_expenses DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
    notes TEXT,
    submitted_at TIMESTAMP NULL,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (distributor_id) REFERENCES distributors(id),
    FOREIGN KEY (schedule_id) REFERENCES distribution_schedules(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    UNIQUE KEY unique_distributor_date_report (report_date, distributor_id)
);

-- جدول التقارير الأسبوعية (Weekly Reports)
CREATE TABLE weekly_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    total_stores INT DEFAULT 0,
    total_orders DECIMAL(10,2) DEFAULT 0.00,
    total_payments DECIMAL(10,2) DEFAULT 0.00,
    total_debts DECIMAL(10,2) DEFAULT 0.00,
    total_gifts DECIMAL(10,2) DEFAULT 0.00,
    total_expenses DECIMAL(10,2) DEFAULT 0.00,
    report_data JSON, -- بيانات مفصلة
    generated_by INT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id)
);

-- جدول سجل العمليات (Activity Logs)
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- جدول أنواع المصروفات (Expense Types)
CREATE TABLE expense_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الأدوار والصلاحيات (Roles & Permissions)
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول ربط المستخدمين بالأدوار (User Roles)
CREATE TABLE user_roles (
    user_id INT,
    role_id INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- جدول إعدادات النظام (System Settings)
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- إنشاء الفهارس لتسريع الاستعلامات
CREATE INDEX idx_daily_orders_date_store ON daily_orders(order_date, store_id);
CREATE INDEX idx_distribution_schedules_date ON distribution_schedules(schedule_date);
CREATE INDEX idx_distribution_items_schedule ON distribution_items(schedule_id);
CREATE INDEX idx_payments_store_date ON payments(store_id, payment_date);
CREATE INDEX idx_store_balances_date ON store_balances(balance_date);
CREATE INDEX idx_activity_logs_user_date ON activity_logs(user_id, created_at);
CREATE INDEX idx_stores_region ON stores(region_id);
CREATE INDEX idx_stores_location ON stores(latitude, longitude);

-- إدراج البيانات الأساسية
INSERT INTO roles (name, display_name, permissions) VALUES 
('admin', 'مدير النظام', '["all"]'),
('manager', 'مدير التوزيع', '["manage_orders", "manage_distributors", "view_reports", "manage_stores"]'),
('distributor', 'موزع', '["view_schedule", "update_delivery", "add_payment", "add_expense"]'),
('assistant', 'مساعد', '["view_reports", "view_stores"]');

INSERT INTO expense_types (name, description) VALUES 
('fuel', 'وقود السيارة'),
('maintenance', 'صيانة دورية'),
('repair', 'إصلاحات'),
('insurance', 'تأمين'),
('washing', 'غسيل السيارة'),
('other', 'مصروفات أخرى');

INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES 
('default_pagination_limit', '20', 'number', 'عدد العناصر في الصفحة الواحدة'),
('max_pagination_limit', '100', 'number', 'الحد الأقصى للعناصر في الصفحة'),
('company_name', 'مخبز بلجيكا', 'string', 'اسم الشركة'),
('default_currency', 'EUR', 'string', 'العملة الافتراضية'),
('working_hours_start', '06:00', 'string', 'بداية ساعات العمل'),
('working_hours_end', '18:00', 'string', 'نهاية ساعات العمل'); 