-- إضافة جداول نظام الطلبات الجديد
-- هذا الملف يحتوي على التحديثات لدعم نظام الطلبات المحسن

-- جدول الطلبات الرئيسي
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    store_id INT NOT NULL,
    order_date DATE NOT NULL,
    delivery_date DATE NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('draft', 'confirmed', 'in_progress', 'delivered', 'cancelled') DEFAULT 'draft',
    payment_status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
    gift_applied JSON NULL COMMENT 'الهدايا المطبقة على الطلب',
    notes TEXT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_orders_store_id (store_id),
    INDEX idx_orders_order_date (order_date),
    INDEX idx_orders_status (status),
    INDEX idx_orders_payment_status (payment_status),
    INDEX idx_orders_created_by (created_by),
    UNIQUE INDEX idx_orders_order_number (order_number)
);

-- جدول عناصر الطلبات
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    final_price DECIMAL(10,2) NOT NULL,
    gift_quantity INT DEFAULT 0,
    gift_reason VARCHAR(100) NULL COMMENT 'سبب الهدية (وفاء، عميل مميز، إلخ)',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_order_items_order_id (order_id),
    INDEX idx_order_items_product_id (product_id),
    UNIQUE INDEX idx_order_items_order_product (order_id, product_id)
);

-- إضافة تعليقات للجداول
ALTER TABLE orders COMMENT = 'جدول الطلبات الرئيسي - يحتوي على معلومات الطلبات الأساسية';
ALTER TABLE order_items COMMENT = 'جدول عناصر الطلبات - يحتوي على تفاصيل المنتجات في كل طلب';

-- إدراج بيانات تجريبية للطلبات
INSERT IGNORE INTO orders (
    order_number, store_id, order_date, delivery_date, total_amount, discount_amount, 
    final_amount, status, payment_status, notes, created_by
) VALUES 
-- طلبات لمتجر أبو أحمد (ID: 1)
('ORD2401010015628', 1, '2024-01-01', '2024-01-02', 45.00, 0.00, 45.00, 'delivered', 'paid', 'طلب منتظم', 1),
('ORD2401020015729', 1, '2024-01-02', '2024-01-03', 52.50, 2.50, 50.00, 'delivered', 'paid', 'خصم عميل مميز', 1),
('ORD2401030015830', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 38.00, 0.00, 38.00, 'confirmed', 'pending', 'طلب اليوم', 1),

-- طلبات لمتجر الزهراء (ID: 2)
('ORD2401010025631', 2, '2024-01-01', '2024-01-02', 67.50, 0.00, 67.50, 'delivered', 'partial', 'دفع جزئي', 1),
('ORD2401020025732', 2, '2024-01-02', '2024-01-03', 71.00, 3.00, 68.00, 'delivered', 'paid', 'خصم نهاية الأسبوع', 1),
('ORD2401030025833', 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 89.50, 0.00, 89.50, 'draft', 'pending', 'طلب قيد التحضير', 1),

-- طلبات لمتجر النور (ID: 3)
('ORD2401010035634', 3, '2024-01-01', '2024-01-02', 34.50, 0.00, 34.50, 'delivered', 'paid', 'طلب صغير', 1),
('ORD2401020035735', 3, '2024-01-02', '2024-01-03', 76.00, 6.00, 70.00, 'delivered', 'paid', 'خصم كمية', 1),
('ORD2401030035836', 3, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 45.50, 0.00, 45.50, 'confirmed', 'pending', 'طلب اليوم', 1);

-- إدراج عناصر الطلبات التجريبية
INSERT IGNORE INTO order_items (
    order_id, product_id, quantity, unit_price, total_price, discount_amount, 
    final_price, gift_quantity, gift_reason, notes
) VALUES 
-- عناصر الطلب الأول (خبز أبيض + خبز أسمر)
(1, 1, 15, 1.50, 22.50, 0.00, 22.50, 2, 'هدية وفاء', 'خبز طازج'),
(1, 2, 12, 1.75, 21.00, 0.00, 21.00, 1, 'هدية', 'خبز أسمر عضوي'),
(1, 3, 1, 1.50, 1.50, 0.00, 1.50, 0, NULL, 'كرواسان'),

-- عناصر الطلب الثاني 
(2, 1, 20, 1.50, 30.00, 2.50, 27.50, 3, 'عميل مميز', 'خصم خاص'),
(2, 4, 8, 2.75, 22.00, 0.00, 22.00, 0, NULL, 'دونات شوكولاتة'),
(2, 5, 3, 1.00, 3.00, 0.00, 3.00, 1, 'هدية', 'ماء'),

-- عناصر الطلب الثالث (طلب اليوم)
(3, 1, 12, 1.50, 18.00, 0.00, 18.00, 1, 'هدية', NULL),
(3, 2, 10, 1.75, 17.50, 0.00, 17.50, 0, NULL, NULL),
(3, 6, 5, 0.50, 2.50, 0.00, 2.50, 0, NULL, 'عصير برتقال'),

-- عناصر طلبات متجر الزهراء
(4, 1, 25, 1.50, 37.50, 0.00, 37.50, 5, 'كمية كبيرة', 'خبز أبيض'),
(4, 3, 20, 1.50, 30.00, 0.00, 30.00, 2, 'هدية', 'كرواسان'),

(5, 2, 18, 1.75, 31.50, 3.00, 28.50, 2, 'خصم', 'خبز أسمر'),
(5, 4, 15, 2.75, 41.25, 0.00, 41.25, 1, 'هدية', 'دونات'),

(6, 1, 30, 1.50, 45.00, 0.00, 45.00, 5, 'كمية كبيرة', NULL),
(6, 2, 20, 1.75, 35.00, 0.00, 35.00, 3, 'هدية', NULL),
(6, 5, 10, 1.00, 10.00, 0.00, 10.00, 2, 'هدية', 'مشروبات'),

-- عناصر طلبات متجر النور
(7, 1, 15, 1.50, 22.50, 0.00, 22.50, 2, 'هدية', NULL),
(7, 6, 24, 0.50, 12.00, 0.00, 12.00, 0, NULL, 'عصائر'),

(8, 2, 25, 1.75, 43.75, 6.00, 37.75, 3, 'خصم كمية', 'خبز أسمر'),
(8, 4, 12, 2.75, 33.00, 0.00, 33.00, 1, 'هدية', 'دونات'),

(9, 1, 20, 1.50, 30.00, 0.00, 30.00, 3, 'هدية', NULL),
(9, 3, 10, 1.50, 15.00, 0.00, 15.00, 1, 'هدية', NULL),
(9, 5, 1, 0.50, 0.50, 0.00, 0.50, 0, NULL, 'ماء');

-- إنشاء views مفيدة لاستعلامات سريعة

-- عرض ملخص الطلبات اليومية
CREATE OR REPLACE VIEW daily_orders_summary AS
SELECT 
    DATE(o.order_date) as order_date,
    COUNT(o.id) as total_orders,
    SUM(o.final_amount) as total_amount,
    COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as delivered_orders,
    COUNT(CASE WHEN o.payment_status = 'paid' THEN 1 END) as paid_orders,
    COUNT(CASE WHEN o.payment_status = 'pending' THEN 1 END) as pending_payments
FROM orders o
WHERE o.status != 'cancelled'
GROUP BY DATE(o.order_date)
ORDER BY order_date DESC;

-- عرض أداء المتاجر
CREATE OR REPLACE VIEW store_performance AS
SELECT 
    s.id as store_id,
    s.name as store_name,
    COUNT(o.id) as total_orders,
    SUM(o.final_amount) as total_amount,
    AVG(o.final_amount) as avg_order_amount,
    COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as delivered_orders,
    SUM(CASE WHEN o.payment_status = 'paid' THEN o.final_amount ELSE 0 END) as paid_amount,
    SUM(CASE WHEN o.payment_status != 'paid' THEN o.final_amount ELSE 0 END) as pending_amount
FROM stores s
LEFT JOIN orders o ON s.id = o.store_id AND o.status != 'cancelled'
GROUP BY s.id, s.name
ORDER BY total_amount DESC;

-- عرض المنتجات الأكثر طلباً
CREATE OR REPLACE VIEW popular_products AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    SUM(oi.quantity) as total_quantity,
    SUM(oi.gift_quantity) as total_gifts,
    SUM(oi.final_price) as total_revenue,
    COUNT(DISTINCT oi.order_id) as order_count,
    AVG(oi.unit_price) as avg_price
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.status != 'cancelled'
GROUP BY p.id, p.name
ORDER BY total_quantity DESC;

-- إضافة فهارس محسنة للأداء
CREATE INDEX idx_orders_date_status ON orders(order_date, status);
CREATE INDEX idx_orders_store_date ON orders(store_id, order_date);
CREATE INDEX idx_order_items_product_order ON order_items(product_id, order_id);

-- إضافة triggers للحفاظ على تكامل البيانات
DELIMITER //

-- Trigger لحساب final_amount تلقائياً عند إدراج طلب
CREATE TRIGGER orders_calculate_final_amount_insert
    BEFORE INSERT ON orders
    FOR EACH ROW
BEGIN
    SET NEW.final_amount = NEW.total_amount - NEW.discount_amount;
END//

-- Trigger لحساب final_amount تلقائياً عند تحديث طلب
CREATE TRIGGER orders_calculate_final_amount_update
    BEFORE UPDATE ON orders
    FOR EACH ROW
BEGIN
    SET NEW.final_amount = NEW.total_amount - NEW.discount_amount;
END//

-- Trigger لحساب final_price تلقائياً عند إدراج عنصر طلب
CREATE TRIGGER order_items_calculate_final_price_insert
    BEFORE INSERT ON order_items
    FOR EACH ROW
BEGIN
    SET NEW.total_price = NEW.quantity * NEW.unit_price;
    SET NEW.final_price = NEW.total_price - NEW.discount_amount;
END//

-- Trigger لحساب final_price تلقائياً عند تحديث عنصر طلب
CREATE TRIGGER order_items_calculate_final_price_update
    BEFORE UPDATE ON order_items
    FOR EACH ROW
BEGIN
    SET NEW.total_price = NEW.quantity * NEW.unit_price;
    SET NEW.final_price = NEW.total_price - NEW.discount_amount;
END//

DELIMITER ;

-- إضافة stored procedures مفيدة

DELIMITER //

-- إجراء لحساب إجمالي الطلب وتحديثه
CREATE PROCEDURE UpdateOrderTotal(IN order_id INT)
BEGIN
    DECLARE total DECIMAL(10,2) DEFAULT 0.00;
    
    SELECT SUM(final_price) INTO total
    FROM order_items 
    WHERE order_items.order_id = order_id;
    
    UPDATE orders 
    SET total_amount = IFNULL(total, 0.00),
        final_amount = IFNULL(total, 0.00) - discount_amount
    WHERE id = order_id;
END//

-- إجراء للحصول على إحصائيات متجر معين
CREATE PROCEDURE GetStoreStatistics(
    IN store_id INT,
    IN date_from DATE,
    IN date_to DATE
)
BEGIN
    SELECT 
        COUNT(o.id) as total_orders,
        SUM(o.final_amount) as total_amount,
        AVG(o.final_amount) as avg_order_amount,
        SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
        SUM(CASE WHEN o.payment_status = 'paid' THEN o.final_amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN o.payment_status = 'pending' THEN o.final_amount ELSE 0 END) as pending_amount
    FROM orders o
    WHERE o.store_id = store_id
    AND o.order_date BETWEEN date_from AND date_to
    AND o.status != 'cancelled';
END//

DELIMITER ;

-- رسالة نجاح
SELECT 'تم إنشاء جداول الطلبات وإدراج البيانات التجريبية بنجاح!' as message; 