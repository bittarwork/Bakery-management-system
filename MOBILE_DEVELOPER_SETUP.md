# 🚀 إرشادات سريعة للمبرمج

## 📋 المشكلة والحل

**المشكلة:** المنفذ 5000 كان مشغولاً
**الحل:** تم تغيير المنفذ إلى 5001

## 🔧 إعداد المشروع

### 1. Clone المشروع

```bash
git clone https://github.com/YOUR_USERNAME/bakery-management-system.git
cd bakery-management-system
```

### 2. إعداد Backend

```bash
cd backend
npm install
npm run dev
# السيرفر سيعمل على http://localhost:5001
```

### 3. إعداد Frontend (اختياري)

```bash
cd frontend
npm install
npm run dev
# Frontend سيعمل على http://localhost:3000
```

### 4. إنشاء تطبيق Flutter

```bash
# في مجلد المشروع الرئيسي
flutter create mobile-app
cd mobile-app
```

### 5. إضافة التبعيات

```yaml
# في pubspec.yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  provider: ^6.1.1
  shared_preferences: ^2.2.2
  geolocator: ^10.1.0
  google_maps_flutter: ^2.5.3
  flutter_local_notifications: ^16.3.2
  image_picker: ^1.0.7
  intl: ^0.19.0
  connectivity_plus: ^5.0.2
  cached_network_image: ^3.3.1
```

## 📱 API Configuration

### Base URL للتطبيق

```dart
// lib/config/api_config.dart
class ApiConfig {
  // للتطوير المحلي
  static const String baseUrl = 'http://localhost:5001/api';

  // للإنتاج
  // static const String baseUrl = 'https://your-production-server.com/api';

  // Endpoints
  static const String login = '/auth/login';
  static const String distribution = '/distribution';
  static const String reports = '/reports';
  static const String notifications = '/notifications';
}
```

## 🧪 اختبار API

### اختبار السيرفر

```bash
curl http://localhost:5001/api/health
```

### اختبار تسجيل الدخول

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"distributor1","password":"password123"}'
```

## 📋 المهام الأولية

### الأسبوع الأول:

- [ ] إعداد المشروع والتبعيات
- [ ] شاشة تسجيل الدخول
- [ ] شاشة لوحة التحكم الرئيسية
- [ ] جلب بيانات جدول التوزيع

### الأسبوع الثاني:

- [ ] شاشة قائمة التوصيل
- [ ] شاشة تفاصيل التوصيل
- [ ] تحديث حالة التسليم
- [ ] تتبع الموقع

## 🐛 حل المشاكل الشائعة

### مشكلة: ما يقدر يصل للسيرفر

```bash
# تأكد من تشغيل السيرفر
cd backend && npm run dev

# تأكد من المنفذ
curl http://localhost:5001/api/health
```

### مشكلة: CORS

- تم إعداد CORS لدعم تطبيقات Flutter
- تأكد من استخدام المنفذ 5001

### مشكلة: قاعدة البيانات

```bash
# تأكد من تشغيل MySQL
# تأكد من إنشاء قاعدة البيانات
mysql -u root -p < database/schema.sql
```

## 📞 التواصل

- **GitHub Issues** - للمشاكل التقنية
- **Pull Requests** - لمراجعة الكود
- **Slack/Discord** - للتواصل المباشر

## 📚 مصادر مفيدة

- [API Documentation](./backend/docs/MOBILE_API.md)
- [Flutter Documentation](https://docs.flutter.dev/)
- [Backend Setup](./backend/README.md)

---

**ملاحظة:** جميع API endpoints جاهزة ومختبرة. راجع ملف `MOBILE_API.md` للتفاصيل الكاملة.
