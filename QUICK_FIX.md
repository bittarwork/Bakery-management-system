# إصلاح سريع لمشكلة قاعدة البيانات

## المشكلة

الخطأ `connect ETIMEDOUT` يعني أن الخادم لا يستطيع الاتصال بقاعدة البيانات MySQL.

## الحل الأسرع (5 دقائق)

### 1. تثبيت XAMPP

- اذهب إلى: https://www.apachefriends.org/download.html
- حمل XAMPP لنظام Windows
- قم بتثبيته (اختر MySQL و Apache فقط)

### 2. تشغيل MySQL

- افتح XAMPP Control Panel
- اضغط على "Start" بجانب MySQL
- تأكد من أن المنفذ 3306 يعمل

### 3. إنشاء قاعدة البيانات

- افتح المتصفح واذهب إلى: http://localhost/phpmyadmin
- انقر على "New" في الجهة اليسرى
- اسم قاعدة البيانات: `bakery_db`
- Collation: `utf8mb4_unicode_ci`
- انقر على "Create"

### 4. إعداد كلمة المرور (اختياري)

- في phpMyAdmin، انقر على "User accounts"
- انقر على "Edit privileges" بجانب المستخدم "root"
- انقر على "Change password"
- اتركها فارغة أو ضع `rootpassword`

### 5. تحديث الإعدادات

```bash
# في backend/config.env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bakery_db
DB_USER=root
DB_PASSWORD=
# أو DB_PASSWORD=rootpassword إذا وضعت كلمة مرور
```

### 6. تشغيل الخادم

```bash
cd backend
npm run dev
```

## بعد الإعداد

بمجرد أن يعمل الخادم، ستحصل على:

```
✅ Database connection established successfully.
✅ Database models synchronized.
🚀 Server running on port 5001
```
