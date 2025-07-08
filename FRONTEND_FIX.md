# 🔧 حل مشكلة Frontend

## 📋 المشكلة

Frontend يحاول الاتصال بالسيرفر على المنفذ القديم (5000) بينما السيرفر يعمل على المنفذ الجديد (5001).

## ✅ الحلول المطبقة

### 1. تحديث ملفات التكوين

- ✅ `frontend/config.env` - تحديث VITE_API_URL
- ✅ `frontend/vite.config.js` - تحديث proxy target
- ✅ `frontend/src/services/apiClient.js` - تحديث baseURL fallback

### 2. تحديث ملفات أخرى

- ✅ `docker-compose.yml` - تحديث VITE_API_URL
- ✅ `docs/MOBILE_API.md` - تحديث Base URL
- ✅ `backend/docs/MOBILE_API.md` - تحديث Base URL
- ✅ `delivery_app/lib/main.dart` - تحديث baseUrl

## 🚀 خطوات التشغيل

### 1. إعادة تشغيل Frontend

```bash
cd frontend
npm run dev
```

### 2. إعادة تشغيل Backend

```bash
cd backend
npm run dev
```

### 3. اختبار الاتصال

```bash
# اختبار السيرفر
curl http://localhost:5001/api/health

# اختبار Frontend
curl http://localhost:3000
```

## 🔍 التحقق من الإصلاح

### في المتصفح:

1. افتح Developer Tools (F12)
2. اذهب إلى Network tab
3. أعد تحميل الصفحة
4. تأكد من أن الطلبات تذهب إلى `localhost:5001`

### في Console:

يجب أن تختفي رسائل الخطأ:

- ❌ `Network Error`
- ❌ `خطأ في الاتصال بالخادم`

## 📱 للمبرمج

### إذا كنت تستخدم تطبيق Flutter:

```dart
// في lib/config/api_config.dart
class ApiConfig {
  static const String baseUrl = 'http://localhost:5001/api';
}
```

### إذا كنت تستخدم Postman:

- غيّر Base URL إلى: `http://localhost:5001/api`

## 🐛 إذا استمرت المشكلة

### 1. مسح Cache المتصفح

- اضغط Ctrl+Shift+R (Hard Refresh)
- أو امسح Cache من Developer Tools

### 2. إعادة تشغيل الخدمات

```bash
# إيقاف جميع عمليات Node.js
taskkill /IM node.exe /F

# إعادة تشغيل
cd backend && npm run dev
cd frontend && npm run dev
```

### 3. التحقق من Firewall

- تأكد من أن المنفذ 5001 مفتوح
- تحقق من إعدادات Windows Defender

## 📞 إذا لم تعمل الحلول

1. تحقق من تشغيل السيرفر على المنفذ الصحيح
2. تأكد من عدم وجود عمليات أخرى على المنفذ 5001
3. جرب إعادة تشغيل الكمبيوتر

---

**ملاحظة:** جميع الملفات محدثة الآن. المشكلة يجب أن تحل بعد إعادة تشغيل الخدمات.
