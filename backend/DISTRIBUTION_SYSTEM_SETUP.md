# 🚚 Distribution System Setup Guide

## نظام إدارة التوزيع المطور - دليل التشغيل الشامل

### 📋 **المتطلبات الأساسية**

1. **قاعدة البيانات**: MySQL 8.0+ على Railway
2. **Node.js**: الإصدار 18+ مع npm
3. **Google Maps API Key**: موجود ومفعل ✅
4. **متصفح حديث**: لدعم JavaScript ES6+

---

## 🗄️ **الخطوة الأولى: تحديث قاعدة البيانات**

### 1. تشغيل الـ Migration

```bash
# الانتقال إلى مجلد الباك إند
cd backend

# تشغيل migration script
node scripts/run-distribution-migration.js
```

### 2. التحقق من نجاح الـ Migration

```bash
# التحقق من التحديثات
mysql -h shinkansen.proxy.rlwy.net -u root -p ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA --port 24785 --protocol=TCP railway

# تشغيل اختبار التحقق
source migrations/verify-distribution-migration.sql;
```

### 3. في حالة وجود مشاكل - Rollback

```bash
# فقط في حالة الحاجة للعودة للوضع السابق
source migrations/rollback-distribution-migration.sql;
```

---

## 🚀 **الخطوة الثانية: تشغيل الباك إند**

### 1. تحديث المتغيرات البيئية

```bash
# في ملف backend/config.env أو .env
DB_HOST=shinkansen.proxy.rlwy.net
DB_USER=root
DB_PASSWORD=ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA
DB_NAME=railway
DB_PORT=24785

# Google Maps API Key (موجود مسبقاً)
GOOGLE_MAPS_API_KEY=AIzaSyDhnQwiZuURSLApdQAR_86POf0a_f9n2IE
```

### 2. تشغيل الخادم

```bash
# تثبيت التبعيات الجديدة
npm install

# تشغيل الخادم
npm start
# أو
node server.js
```

### 3. التحقق من عمل APIs الجديدة

```bash
# اختبار الـ APIs الجديدة
curl -X GET "http://localhost:5001/api/health"
curl -X GET "http://localhost:5001/api/distributors/active"
```

---

## 🖥️ **الخطوة الثالثة: تشغيل الفرونت إند**

### 1. تحديث الإعدادات

```bash
# في dashboard/src/config/config.js
API_BASE_URL: 'https://bakery-management-system-production.up.railway.app/api'
```

### 2. تشغيل Dashboard

```bash
# الانتقال إلى مجلد الـ dashboard
cd dashboard

# تثبيت التبعيات
npm install

# تشغيل التطبيق
npm run dev
```

---

## 📱 **الخطوة الرابعة: APIs الجديدة المتاحة**

### **🔗 Distributor Management APIs**

| Method  | Endpoint                            | الوصف                     |
| ------- | ----------------------------------- | ------------------------- |
| `GET`   | `/api/distributors/active`          | جلب جميع الموزعين النشطين |
| `GET`   | `/api/distributors/live-tracking`   | التتبع المباشر للموزعين   |
| `GET`   | `/api/distributors/:id/details`     | تفاصيل موزع محدد          |
| `POST`  | `/api/distributors/:id/location`    | تحديث موقع الموزع         |
| `PATCH` | `/api/distributors/:id/work-status` | تحديث حالة العمل          |
| `POST`  | `/api/distributors/:id/start-work`  | بدء يوم العمل             |
| `POST`  | `/api/distributors/:id/end-work`    | إنهاء يوم العمل           |

### **📊 قاعدة البيانات الجديدة**

#### **جداول جديدة:**

- `location_history` - سجل مواقع الموزعين
- `distributor_daily_performance` - الأداء اليومي للموزعين

#### **حقول جديدة في `users`:**

- `current_location` (JSON) - الموقع الحالي
- `location_updated_at` - وقت آخر تحديث موقع
- `vehicle_info` (JSON) - معلومات المركبة
- `work_status` - حالة العمل
- `daily_performance` (JSON) - الأداء اليومي

#### **حقول جديدة في `orders`:**

- `assigned_distributor_id` - الموزع المعين
- `assigned_at` - وقت التعيين
- `delivery_started_at` - وقت بدء التوصيل
- `delivery_completed_at` - وقت اكتمال التوصيل
- `delivery_notes` - ملاحظات التوصيل

---

## 🎯 **الخطوة الخامسة: اختبار النظام**

### 1. **اختبار لوحة التوزيع**

- انتقل إلى: `http://localhost:3000/distribution/manager`
- تحقق من عرض الموزعين الحقيقيين
- تحقق من عمل الـ route للتفاصيل: `/distribution/distributor/:id`

### 2. **اختبار العمليات اليومية**

- انتقل إلى: `http://localhost:3000/distribution/daily-operations`
- تحقق من عرض الطلبات لليوم الحالي
- تحقق من عمل رابط تفاصيل الطلب

### 3. **اختبار التتبع المباشر**

- انتقل إلى: `http://localhost:3000/distribution/live-tracking`
- تحقق من عرض الموزعين مع المواقع
- تحقق من عمل الخريطة بدون أخطاء

---

## 🔧 **استكشاف الأخطاء**

### **خطأ قاعدة البيانات**

```bash
# التحقق من الاتصال
node scripts/test-db-connection.js

# إعادة تشغيل الـ migration
node scripts/run-distribution-migration.js
```

### **خطأ Google Maps**

- تأكد من وجود API Key في المتغيرات البيئية
- تحقق من تفعيل Maps JavaScript API

### **خطأ CORS**

- تأكد من إضافة `http://localhost:3000` في إعدادات CORS الخادم

---

## 📈 **المميزات الجديدة**

### ✅ **المكتملة:**

1. **تتبع الموقع المباشر** - من تطبيق الموبايل
2. **إدارة الأداء اليومي** - مقاييس شاملة
3. **صفحة تفاصيل الموزع** - معلومات كاملة
4. **التتبع المباشر** - خريطة تفاعلية
5. **إدارة حالة العمل** - متاح/مشغول/إجازة/غير متصل

### 🔄 **للتطوير المستقبلي:**

1. **تطبيق الموبايل** - Flutter للموزعين
2. **صفحة إدارة المركبات** - إدارة شاملة للمركبات
3. **صفحة أرشيف الموزع** - سجل العمل التاريخي
4. **تقارير الأداء المتقدمة** - تحليلات شاملة

---

## 🎉 **بعد التشغيل الناجح**

الآن النظام يدعم:

- **✅ مواقع حقيقية** للموزعين من تطبيق الموبايل
- **✅ أداء يومي** مُسجل ومحسوب تلقائياً
- **✅ تفاصيل شاملة** لكل موزع
- **✅ تتبع مباشر** على الخريطة
- **✅ تواريخ ميلادية** وأسعار باليورو

---

## 📞 **الدعم**

في حالة وجود مشاكل:

1. تحقق من logs الخادم
2. تحقق من اتصال قاعدة البيانات
3. تحقق من browser console للأخطاء

**تم إنجاز النظام بنجاح! 🎉**
