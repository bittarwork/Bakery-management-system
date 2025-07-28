# 📱 Distributor Mobile App

تطبيق موبايل لموظفي التوزيع في نظام إدارة المخبزة

## 🌟 المميزات الأساسية

- **المصادقة الآمنة**: تسجيل دخول آمن للموزعين مع JWT
- **إدارة الطلبات**: عرض وتحديث حالة طلبات اليوم
- **نظام المدفوعات**: تسجيل المدفوعات بالعملتين EUR/SYP
- **التتبع المباشر**: تتبع موقع الموزع وحالة التوصيل
- **لوحة التحكم**: إحصائيات شاملة عن الأداء اليومي
- **دعم العربية**: واجهة كاملة باللغة العربية مع RTL

## 🛠️ التقنيات المستخدمة

- **Flutter**: إطار عمل التطبيق
- **Dart**: لغة البرمجة
- **Dio**: للتعامل مع HTTP requests
- **BLoC**: إدارة الحالة
- **Hive**: قاعدة بيانات محلية
- **Secure Storage**: تخزين آمن للمعلومات الحساسة
- **Google Maps**: تتبع المواقع والخرائط

## 🏗️ بنية المشروع

```
lib/
├── core/                 # العناصر الأساسية
│   ├── api/             # API client وإعدادات الشبكة
│   ├── constants/       # الثوابت والإعدادات
│   ├── error/           # معالجة الأخطاء
│   ├── theme/           # التصميم والألوان
│   └── utils/           # الأدوات المساعدة
├── features/            # الميزات الرئيسية
│   ├── auth/           # المصادقة وتسجيل الدخول
│   ├── dashboard/      # الشاشة الرئيسية
│   ├── orders/         # إدارة الطلبات
│   ├── delivery/       # التوصيل والخرائط
│   ├── payments/       # نظام المدفوعات
│   └── profile/        # إعدادات المستخدم
└── shared/             # المكونات المشتركة
    ├── widgets/        # Widget مشتركة
    └── models/         # نماذج البيانات
```

## 🚀 بدء التشغيل

### المتطلبات

- Flutter SDK (>= 3.10.0)
- Dart SDK (>= 3.0.0)
- Android Studio / VS Code
- Git

### التثبيت

1. نسخ المشروع:

```bash
git clone [repository-url]
cd distributor_mobile_app
```

2. تثبيت الحزم:

```bash
flutter pub get
```

3. تشغيل التطبيق:

```bash
flutter run
```

## 🔧 الإعدادات

### API Configuration

في ملف `lib/core/constants/app_constants.dart`:

```dart
static const String baseUrl = 'https://bakery-management-system-production.up.railway.app/api';
```

### أذونات التطبيق

#### Android (android/app/src/main/AndroidManifest.xml):

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
```

#### iOS (ios/Runner/Info.plist):

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to track delivery routes</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs location access to track delivery routes</string>
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to capture delivery proof</string>
```

## 📱 الاستخدام

### تسجيل الدخول

1. افتح التطبيق
2. أدخل اسم المستخدم وكلمة المرور
3. اضغط "تسجيل الدخول"

### إدارة الطلبات

1. في الشاشة الرئيسية، اضغط على "طلبات اليوم"
2. اختر طلب لعرض التفاصيل
3. حدث حالة الطلب حسب التقدم
4. أضف ملاحظات عند الحاجة

### تسجيل المدفوعات

1. من تفاصيل الطلب، اضغط "تسجيل دفعة"
2. اختر طريقة الدفع (نقدي/بنك)
3. أدخل المبلغ بالعملة المناسبة
4. أضف ملاحظات واحفظ

## 🔍 API Endpoints

- `POST /api/mobile/auth/login` - تسجيل الدخول
- `GET /api/mobile/dashboard/summary` - ملخص لوحة التحكم
- `GET /api/mobile/orders/today` - طلبات اليوم
- `PUT /api/mobile/orders/:id/status` - تحديث حالة الطلب
- `POST /api/mobile/payments` - تسجيل دفعة
- `GET /api/mobile/profile` - بيانات المستخدم

## 🧪 الاختبار

```bash
# تشغيل الاختبارات
flutter test

# تشغيل اختبارات التكامل
flutter drive --target=test_driver/app.dart
```

## 📦 بناء التطبيق

### Android:

```bash
flutter build apk --release
# أو
flutter build appbundle --release
```

### iOS:

```bash
flutter build ios --release
```

## 🛡️ الأمان

- استخدام JWT للمصادقة
- تشفير البيانات المحلية
- Secure Storage للمعلومات الحساسة
- التحقق من SSL certificates
- Rate limiting على API calls

## 🤝 المساهمة

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى Branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع محمي بترخيص MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 الدعم

- **البريد الإلكتروني**: support@bakery-system.com
- **الهاتف**: +963-XXX-XXXXXX
- **الموقع**: https://bakery-system.com

## 📋 المتطلبات المستقبلية

- [ ] إشعارات Push
- [ ] خرائط تفاعلية متقدمة
- [ ] تقارير مفصلة
- [ ] دعم العمل دون اتصال
- [ ] تحليلات الأداء
- [ ] نظام التقييم

---

**تطوير**: فريق تطوير نظام إدارة المخبزة  
**الإصدار**: 1.0.0  
**تاريخ التحديث**: 2025-01-28
