-- إصلاح كلمات المرور للمستخدمين التجريبيين
-- كلمة المرور: password123

USE bakery_db;

-- تحديث كلمات المرور بـ hash صحيح (bcrypt مع salt rounds = 12)
-- Hash صحيح لكلمة المرور: password123
UPDATE users SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewBgQ1Gy5pKKlKCS' WHERE username = 'admin';
UPDATE users SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewBgQ1Gy5pKKlKCS' WHERE username = 'manager1';
UPDATE users SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewBgQ1Gy5pKKlKCS' WHERE username = 'distributor1';
UPDATE users SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewBgQ1Gy5pKKlKCS' WHERE username = 'distributor2';

-- التحقق من التحديث
SELECT username, email, role, is_active FROM users WHERE username IN ('admin', 'manager1', 'distributor1', 'distributor2');