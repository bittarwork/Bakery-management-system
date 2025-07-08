-- البيانات التجريبية لنظام إدارة التوزيع
USE bakery_db;

-- إدراج المناطق الجغرافية
INSERT INTO regions (name, description, coordinates) VALUES 
('بروكسل الشرقي', 'المنطقة الشرقية من بروكسل', '{"center": {"lat": 50.8503, "lng": 4.3517}}'),
('بروكسل الغربي', 'المنطقة الغربية من بروكسل', '{"center": {"lat": 50.8503, "lng": 4.3017}}'),
('أنتويرب', 'منطقة أنتويرب ومحيطها', '{"center": {"lat": 51.2194, "lng": 4.4025}}'),
('غنت', 'منطقة غنت ومحيطها', '{"center": {"lat": 51.0543, "lng": 3.7174}}');

-- إدراج المنتجات
INSERT INTO products (name, description, unit, price, cost) VALUES 
('خبز عربي', 'خبز عربي تقليدي طازج', 'قطعة', 1.50, 0.80),
('توست أبيض', 'توست أبيض طري', 'علبة', 2.00, 1.20),
('كرواسان', 'كرواسان بالزبدة الطازجة', 'قطعة', 1.75, 1.00),
('بيتزا صغيرة', 'بيتزا فردية بالجبنة', 'قطعة', 3.50, 2.00),
('خبز فرنسي', 'خبز فرنسي مقرمش', 'قطعة', 1.80, 1.00),
('كعك شوكولاتة', 'كعك محشو بالشوكولاتة', 'قطعة', 2.50, 1.50);

-- إدراج السيارات
INSERT INTO vehicles (license_plate, model, year, capacity, fuel_type) VALUES 
('1-ABC-123', 'Ford Transit', 2020, 1000.00, 'diesel'),
('1-DEF-456', 'Mercedes Sprinter', 2021, 1200.00, 'diesel'),
('1-GHI-789', 'Renault Master', 2019, 900.00, 'diesel');

-- إدراج المستخدمين (كلمة المرور: password123)
INSERT INTO users (username, email, password_hash, full_name, phone, role) VALUES 
('admin', 'admin@bakery.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewBgQ1Gy5pKKlKCS', 'مدير النظام', '+32123456789', 'admin'),
('manager1', 'manager@bakery.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewBgQ1Gy5pKKlKCS', 'أحمد محمد', '+32123456788', 'manager'),
('distributor1', 'dist1@bakery.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewBgQ1Gy5pKKlKCS', 'محمد علي', '+32123456787', 'distributor'),
('distributor2', 'dist2@bakery.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewBgQ1Gy5pKKlKCS', 'خالد حسن', '+32123456786', 'distributor');

-- إدراج الموزعين
INSERT INTO distributors (user_id, employee_id, vehicle_id, default_region_id, salary, commission_rate, hire_date) VALUES 
(3, 'DIST001', 1, 1, 2500.00, 5.00, '2023-01-15'),
(4, 'DIST002', 2, 2, 2600.00, 5.00, '2023-02-01');

-- إدراج المحلات
INSERT INTO stores (name, owner_name, phone, email, address, latitude, longitude, region_id, payment_method, credit_limit, gift_policy) VALUES 
('سوبر ماركت الرحمة', 'عبدالله أحمد', '+32123111111', 'rahma@store.com', 'Rue de la Paix 123, Brussels', 50.8503, 4.3517, 1, 'mixed', 500.00, '{"bread": {"buy": 10, "free": 1}, "toast": {"buy": 5, "free": 1}}'),
('محل البركة', 'فاطمة حسن', '+32123222222', 'baraka@store.com', 'Avenue Louise 456, Brussels', 50.8403, 4.3617, 1, 'cash', 300.00, '{"bread": {"buy": 8, "free": 1}}'),
('متجر النور', 'يوسف كريم', '+32123333333', 'nour@store.com', 'Chaussée de Waterloo 789, Brussels', 50.8203, 4.3717, 2, 'bank', 800.00, '{"croissant": {"buy": 6, "free": 1}}'),
('سوق الخير', 'مريم سالم', '+32123444444', 'kheir@store.com', 'Boulevard Anspach 321, Brussels', 50.8603, 4.3417, 2, 'mixed', 600.00, '{"pizza": {"buy": 4, "free": 1}}'),
('محل السلام', 'عثمان محمد', '+32123555555', 'salam@store.com', 'Rue Neuve 654, Brussels', 50.8533, 4.3567, 1, 'cash', 400.00, '{"bread": {"buy": 12, "free": 1}}');

-- إدراج قواعد الهدايا
INSERT INTO gift_rules (store_id, product_id, buy_quantity, free_quantity, valid_from, valid_until) VALUES 
(1, 1, 10, 1, '2024-01-01', '2024-12-31'), -- سوبر ماركت الرحمة - خبز عربي
(1, 2, 5, 1, '2024-01-01', '2024-12-31'),  -- سوبر ماركت الرحمة - توست
(2, 1, 8, 1, '2024-01-01', '2024-12-31'),  -- محل البركة - خبز عربي
(3, 3, 6, 1, '2024-01-01', '2024-12-31'),  -- متجر النور - كرواسان
(4, 4, 4, 1, '2024-01-01', '2024-12-31'),  -- سوق الخير - بيتزا
(5, 1, 12, 1, '2024-01-01', '2024-12-31'); -- محل السلام - خبز عربي

-- إدراج طلبات يومية تجريبية (لليوم الحالي)
INSERT INTO daily_orders (order_date, store_id, product_id, quantity, unit_price, created_by) VALUES 
(CURDATE(), 1, 1, 20, 1.50, 2), -- سوبر ماركت الرحمة - خبز عربي
(CURDATE(), 1, 2, 10, 2.00, 2), -- سوبر ماركت الرحمة - توست
(CURDATE(), 1, 3, 15, 1.75, 2), -- سوبر ماركت الرحمة - كرواسان
(CURDATE(), 2, 1, 16, 1.50, 2), -- محل البركة - خبز عربي
(CURDATE(), 2, 4, 8, 3.50, 2),  -- محل البركة - بيتزا
(CURDATE(), 3, 3, 12, 1.75, 2), -- متجر النور - كرواسان
(CURDATE(), 3, 5, 10, 1.80, 2), -- متجر النور - خبز فرنسي
(CURDATE(), 4, 4, 8, 3.50, 2),  -- سوق الخير - بيتزا
(CURDATE(), 4, 6, 6, 2.50, 2),  -- سوق الخير - كعك شوكولاتة
(CURDATE(), 5, 1, 24, 1.50, 2); -- محل السلام - خبز عربي

-- إدراج جدول توزيع تجريبي
INSERT INTO distribution_schedules (schedule_date, distributor_id, vehicle_id, route_data, total_stores, status, created_by) VALUES 
(CURDATE(), 1, 1, '{"route": [{"store_id": 1, "order": 1, "estimated_time": "08:00"}, {"store_id": 2, "order": 2, "estimated_time": "08:30"}, {"store_id": 5, "order": 3, "estimated_time": "09:00"}]}', 3, 'active', 2),
(CURDATE(), 2, 2, '{"route": [{"store_id": 3, "order": 1, "estimated_time": "08:00"}, {"store_id": 4, "order": 2, "estimated_time": "08:45"}]}', 2, 'active', 2);

-- إدراج تفاصيل التوزيع
INSERT INTO distribution_items (schedule_id, store_id, product_id, planned_quantity, unit_price, delivery_order) VALUES 
-- جدول التوزيع الأول (محمد علي)
(1, 1, 1, 20, 1.50, 1), -- سوبر ماركت الرحمة - خبز عربي
(1, 1, 2, 10, 2.00, 1), -- سوبر ماركت الرحمة - توست
(1, 1, 3, 15, 1.75, 1), -- سوبر ماركت الرحمة - كرواسان
(1, 2, 1, 16, 1.50, 2), -- محل البركة - خبز عربي
(1, 2, 4, 8, 3.50, 2),  -- محل البركة - بيتزا
(1, 5, 1, 24, 1.50, 3), -- محل السلام - خبز عربي
-- جدول التوزيع الثاني (خالد حسن)
(2, 3, 3, 12, 1.75, 1), -- متجر النور - كرواسان
(2, 3, 5, 10, 1.80, 1), -- متجر النور - خبز فرنسي
(2, 4, 4, 8, 3.50, 2),  -- سوق الخير - بيتزا
(2, 4, 6, 6, 2.50, 2);  -- سوق الخير - كعك شوكولاتة

-- إدراج أرصدة المحلات الافتتاحية
INSERT INTO store_balances (store_id, balance_date, opening_balance, total_orders, total_payments) VALUES 
(1, CURDATE(), 0.00, 0.00, 0.00),
(2, CURDATE(), -50.00, 0.00, 0.00), -- محل البركة له دين سابق
(3, CURDATE(), 100.00, 0.00, 0.00), -- متجر النور له رصيد مسبق
(4, CURDATE(), 0.00, 0.00, 0.00),
(5, CURDATE(), -25.00, 0.00, 0.00); -- محل السلام له دين صغير

-- إدراج مصاريف تجريبية للسيارات
INSERT INTO vehicle_expenses (vehicle_id, distributor_id, expense_date, expense_type, amount, description, created_by) VALUES 
(1, 1, CURDATE(), 'fuel', 45.50, 'تعبئة ديزل', 3),
(2, 2, CURDATE(), 'fuel', 42.00, 'تعبئة ديزل', 4),
(1, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'washing', 15.00, 'غسيل السيارة', 3);

-- تحديث default_distributor_id في المناطق
UPDATE regions SET default_distributor_id = 1 WHERE id IN (1, 2);
UPDATE regions SET default_distributor_id = 2 WHERE id IN (3, 4);

-- إضافة بعض الدفعات التجريبية للأمس
INSERT INTO payments (store_id, amount, payment_method, payment_type, payment_date, status, created_by) VALUES 
(1, 50.00, 'cash', 'current_order', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'verified', 3),
(3, 75.00, 'bank_transfer', 'previous_debt', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'verified', 4),
(4, 30.00, 'cash', 'current_order', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'verified', 3);

-- تحديث الأرصدة بناءً على الدفعات
UPDATE store_balances SET total_payments = 50.00 WHERE store_id = 1 AND balance_date = CURDATE();
UPDATE store_balances SET total_payments = 75.00 WHERE store_id = 3 AND balance_date = CURDATE();
UPDATE store_balances SET total_payments = 30.00 WHERE store_id = 4 AND balance_date = CURDATE(); 