# 🔐 إصلاح مشكلة كلمات المرور في Seeders

## المشكلة

كانت كلمات المرور في ملفات seeders الأصلية مشفرة بشكل خاطئ، مما يسبب فشل تسجيل الدخول.

## الحل

تم إنشاء ملفات seeders محدثة مع كلمات المرور المشفرة الصحيحة باستخدام bcrypt مع 12 salt rounds.

## الملفات المحدثة

### 1. `01_users_seeder_fixed.sql`

- يحتوي على كلمات المرور المشفرة الصحيحة
- يستخدم bcrypt مع 12 salt rounds (مطابق للنموذج)
- كلمات المرور:
  - **admin123** للمدراء
  - **distributor123** للموزعين
  - **store123** لأصحاب المحلات

### 2. `master_seeder_fixed.sql`

- يشغل جميع seeders بالترتيب الصحيح
- يستخدم ملف users seeder المحدث

## كيفية التشغيل

### الطريقة الأولى: تشغيل Master Seeder

```sql
SOURCE database/seeders/master_seeder_fixed.sql;
```

### الطريقة الثانية: تشغيل Users Seeder فقط

```sql
SOURCE database/seeders/01_users_seeder_fixed.sql;
```

## معلومات تسجيل الدخول

| الدور         | اسم المستخدم       | البريد الإلكتروني       | كلمة المرور    |
| ------------- | ------------------ | ----------------------- | -------------- |
| مدير          | admin              | admin@bakery.com        | admin123       |
| مدير العمليات | operations_manager | operations@bakery.com   | admin123       |
| محاسبة        | accountant         | accounting@bakery.com   | admin123       |
| موزع 1        | distributor1       | distributor1@bakery.com | distributor123 |
| موزع 2        | distributor2       | distributor2@bakery.com | distributor123 |
| موزع 3        | distributor3       | distributor3@bakery.com | distributor123 |
| صاحب محل 1    | store_owner1       | owner1@example.com      | store123       |
| صاحب محل 2    | store_owner2       | owner2@example.com      | store123       |
| صاحب محل 3    | store_owner3       | owner3@example.com      | store123       |

## التحقق من الإصلاح

بعد تشغيل seeder، يمكنك التحقق من صحة كلمات المرور:

```sql
-- التحقق من وجود المستخدمين
SELECT username, email, role FROM users WHERE status = 'active';

-- التحقق من طول كلمات المرور المشفرة (يجب أن تكون 60 حرف)
SELECT username, LENGTH(password) as hash_length FROM users;
```

## ملاحظات مهمة

1. **تأكد من تشغيل seeder على قاعدة البيانات الصحيحة**
2. **سيتم مسح جميع بيانات المستخدمين الموجودة**
3. **كلمات المرور مشفرة باستخدام bcrypt مع 12 salt rounds**
4. **جميع المستخدمين بحالة 'active'**

## استكشاف الأخطاء

إذا واجهت مشاكل:

1. تأكد من أن قاعدة البيانات `bakery_db` موجودة
2. تأكد من أن جميع الجداول موجودة
3. تحقق من صلاحيات المستخدم في قاعدة البيانات
4. تأكد من تشغيل جميع seeders بالترتيب الصحيح

## التحديث على السيرفر

بعد تشغيل seeders محلياً، قم برفع التغييرات إلى السيرفر:

```bash
# رفع التغييرات إلى Railway
git add .
git commit -m "Fix password hashes in seeders with correct bcrypt 12 salt rounds"
git push origin main
```

ثم قم بتشغيل seeders على قاعدة البيانات في السيرفر.
