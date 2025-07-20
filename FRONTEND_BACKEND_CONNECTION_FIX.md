# حل مشكلة الاتصال بين التطبيق الأمامي والباك إند

## 🎯 المشكلة

التطبيق الأمامي يحاول الاتصال بـ `localhost:5001` بدلاً من السيرفر على Railway.

## 🔍 السبب

التطبيق الأمامي يعمل في وضع `development` (محلي) ولذلك يستخدم `localhost:5001` بدلاً من السيرفر على Railway.

## ✅ الحل المطبق

### 1. تحديث إعدادات API

تم تحديث `dashboard/src/services/apiService.js` لاستخدام السيرفر على Railway مباشرة:

```javascript
// API Configuration
const API_CONFIG = {
  baseURL: "https://bakery-management-system-production.up.railway.app/api/",
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};
```

### 2. إعادة تشغيل التطبيق الأمامي

بعد التحديث، يجب إعادة تشغيل التطبيق الأمامي:

```bash
cd dashboard
npm run dev
```

## 🧪 اختبار الحل

### 1. اختبار الاتصال

افتح Developer Tools في المتصفح وتحقق من:

- أن الطلبات تذهب إلى `https://bakery-management-system-production.up.railway.app/api/`
- عدم وجود أخطاء CORS
- استجابة صحيحة من السيرفر

### 2. اختبار تسجيل الدخول

جرب تسجيل الدخول باستخدام:

- Username: `admin`
- Password: `admin123`

## 📊 حالة الحل

| المكون                 | الحالة      | الملاحظات              |
| ---------------------- | ----------- | ---------------------- |
| ✅ إعدادات API         | مكتمل       | تم تحديث baseURL       |
| ✅ السيرفر على Railway | يعمل        | متاح على الرابط المحدد |
| ⏳ التطبيق الأمامي     | في الانتظار | يحتاج إعادة تشغيل      |

## 🚀 الخطوات التالية

1. **أعد تشغيل التطبيق الأمامي** بعد التحديث
2. **اختبر تسجيل الدخول** للتأكد من الاتصال
3. **اختبر إنشاء الطلبات** بعد تسجيل الدخول

## 🔧 خيارات إضافية

### خيار 1: استخدام متغيرات البيئة

يمكن إنشاء ملف `.env` في مجلد `dashboard`:

```env
VITE_API_BASE_URL=https://bakery-management-system-production.up.railway.app/api/
```

ثم تحديث `apiService.js`:

```javascript
const API_CONFIG = {
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://bakery-management-system-production.up.railway.app/api/",
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};
```

### خيار 2: التطوير المحلي

إذا كنت تريد التطوير محلياً، يمكنك:

1. تشغيل السيرفر المحلي على `localhost:5001`
2. تغيير `baseURL` إلى `http://localhost:5001/api/`

## 📞 الدعم

إذا استمرت المشكلة:

1. تحقق من أن السيرفر على Railway يعمل
2. تحقق من سجلات المتصفح (F12)
3. تأكد من عدم وجود مشاكل CORS

---

**تاريخ التحديث:** 20 يوليو 2025
**الحالة:** جاهز للاختبار
