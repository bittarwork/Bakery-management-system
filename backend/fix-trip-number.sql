-- إصلاح جدول distribution_trips - إضافة حقل trip_number
-- تاريخ: 2025-08-01
-- الهدف: حل مشكلة "Field 'trip_number' doesn't have a default value"

-- 1. إضافة حقل trip_number مع قيمة افتراضية
ALTER TABLE distribution_trips 
ADD COLUMN trip_number VARCHAR(20) 
DEFAULT 'TRIP-DEFAULT'
AFTER id;

-- 2. تحديث الصفوف الموجودة بقيم فريدة
UPDATE distribution_trips 
SET trip_number = CONCAT(
    'TRIP-', 
    DATE_FORMAT(COALESCE(created_at, NOW()), '%Y%m%d'), 
    '-', 
    TIME_FORMAT(COALESCE(created_at, NOW()), '%H%i%s'), 
    '-', 
    LPAD(id, 3, '0')
)
WHERE trip_number = 'TRIP-DEFAULT' OR trip_number IS NULL;

-- 3. إضافة قيد الفريدة
ALTER TABLE distribution_trips 
ADD UNIQUE INDEX idx_trip_number (trip_number);

-- 4. تحديث القيمة الافتراضية لتكون فريدة
ALTER TABLE distribution_trips 
ALTER COLUMN trip_number SET DEFAULT CONCAT('TRIP-', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), '-', CONNECTION_ID());

-- 5. التحقق من النتائج
SELECT 
    id, 
    trip_number, 
    distributor_id, 
    trip_date, 
    trip_status,
    created_at
FROM distribution_trips 
ORDER BY id;

-- تم الانتهاء من الإصلاح!