# 🍞 نظام إدارة المخبزة الشامل - النسخة 2.0

## نظرة عامة

تم تطوير نظام شامل ومتقدم لإدارة المخبزة يغطي جميع العمليات من التوزيع والمبيعات إلى المدفوعات والتقارير، مع دعم كامل للعملات المتعددة وتطبيق موبايل للموزعين.

## 🚀 الميزات الجديدة

### 📱 تطبيق الموبايل للموزعين

- **استلام جداول التوزيع**: جداول يومية تفاعلية مع خرائط
- **تسليم البضائع**: تسجيل فوري للكميات المسلمة والهدايا
- **تحصيل المدفوعات**: دعم الدفع النقدي والبنكي والمختلط
- **تتبع المخزون**: مراقبة لحظية لمحتوى السيارة
- **إدخال المصاريف**: تسجيل مصاريف السيارة بالصور
- **التقارير اليومية**: رفع تقارير شاملة نهاية اليوم

### 🗺️ نظام الخرائط والمسارات الذكية

- **مسارات محسنة**: حساب أفضل طريق باستخدام Google Maps
- **تتبع مباشر**: متابعة مواقع الموزعين لحظة بلحظة
- **التنبيهات الذكية**: إشعارات عند الاقتراب من المحلات
- **تحليل المسارات**: إحصائيات المسافات والأوقات

### 💰 نظام الدفعات المتقدم

- **عملات متعددة**: EUR (أساسي) و SYP (ثانوي)
- **أنواع دفع مرنة**: نقدي، بنكي، مختلط، مقدماً
- **دفعات مختلطة**: توزيع المبلغ بين الطلب الحالي والديون السابقة
- **تتبع الأرصدة**: متابعة دقيقة لأرصدة المحلات
- **تقارير مالية**: تحليلات شاملة للمدفوعات والديون

### 🎁 نظام الهدايا الذكي

- **سياسات مرنة**: إعداد قواعد هدايا لكل محل أو فئة
- **حساب تلقائي**: احتساب الهدايا تلقائياً عند التسليم
- **تتبع الهدايا**: سجل شامل لجميع الهدايا المعطاة
- **تقارير الهدايا**: تحليلات مفصلة لاستراتيجية الهدايا

### 📊 تقارير وتحليلات شاملة

- **تقارير يومية**: ملخص شامل للعمليات اليومية
- **تقارير أسبوعية**: تحليل الاتجاهات والأداء
- **تقارير شهرية**: إحصائيات النمو والمقارنات
- **تحليلات مخصصة**: فلترة متقدمة حسب أي معيار
- **تصدير متقدم**: Excel، PDF، CSV مع تنسيق احترافي

### 📦 تتبع المخزون الذكي

- **مخزون السيارات**: متابعة دقيقة لمحتوى كل سيارة
- **إدارة الأضرار**: تسجيل وتتبع البضائع التالفة
- **التحكم بالمرتجعات**: إدارة البضائع المرتجعة
- **تنبيهات المخزون**: إشعارات عند انخفاض المخزون

## 🏗️ البنية التقنية

### Backend (Node.js/Express)

```
backend/
├── controllers/
│   ├── comprehensiveDistributionController.js    # إدارة التوزيع الشاملة
│   ├── distributionManagerController.js          # إدارة مدير التوزيع
│   ├── enhancedPaymentController.js              # نظام الدفعات المتقدم
│   ├── comprehensiveReportsController.js         # نظام التقارير الشامل
│   ├── inventoryTrackingController.js            # تتبع المخزون
│   └── mapsAndRoutingController.js               # الخرائط والمسارات
├── routes/
│   ├── comprehensiveDistribution.js              # routes التوزيع الشاملة
│   └── index.js                                  # تجميع جميع الـ routes
├── middleware/
│   ├── auth.js                                   # المصادقة المحسنة
│   └── errorHandler.js                          # معالجة الأخطاء
└── services/
    └── dashboardAPI.js                           # خدمات الداشبورد
```

### Database Schema

```sql
-- جداول جديدة للنظام الشامل
- distribution_schedules      # جداول التوزيع
- vehicle_inventory          # مخزون السيارات
- delivery_records          # سجلات التسليم
- vehicle_expenses          # مصاريف السيارات
- daily_reports            # التقارير اليومية
- gift_policies           # سياسات الهدايا
- gift_transactions       # معاملات الهدايا
- damage_records         # سجلات الأضرار
- location_tracking      # تتبع المواقع
- distribution_routes    # المسارات
- notifications         # الإشعارات
```

### Mobile App (Flutter)

```
delivery_app/
├── lib/
│   ├── screens/
│   │   ├── login_screen.dart
│   │   ├── orders_screen.dart
│   │   └── order_details_screen.dart
│   ├── models/
│   │   ├── order_model.dart
│   │   └── distributor_api.dart
│   └── cubits/
│       └── orders_cubit.dart
```

## 📋 السيناريوهات المدعومة

### سيناريو الموزع الكامل

#### 1. **استلام جدول التوزيع الصباحي (6:00 ص)**

```http
GET /api/distribution/schedule/daily?date=2024-01-15
```

- قائمة المحلات مرتبة حسب المسار الأقرب
- الكميات المطلوبة لكل منتج
- ملاحظات خاصة ومعلومات الهدايا
- خريطة تفاعلية بالمسار المحسن

#### 2. **الانطلاق والتوصيل**

```http
GET /api/distribution/store/{storeId}/details
```

- عرض تفاصيل المحل والرصيد الحالي
- سياسة الهدايا الخاصة بالمحل
- تاريخ الطلبات والمدفوعات

#### 3. **تسليم البضاعة**

```http
PATCH /api/distribution/delivery/{deliveryId}/quantities
POST /api/distribution/delivery/{deliveryId}/complete
```

- تعديل الكميات حسب الحاجة
- حساب الهدايا تلقائياً
- تسجيل التسليم الفعلي

#### 4. **تحصيل المدفوعات**

```http
POST /api/distribution/payment/record
```

- دفع نقدي، بنكي، أو مختلط
- تسديد للطلب الحالي أو ديون سابقة
- توزيع المبلغ بمرونة كاملة

#### 5. **تحديث المخزون**

```http
GET /api/distribution/vehicle/inventory
```

- خصم الكميات المسلمة والهدايا
- تحديث الكميات المتبقية
- تسجيل الأضرار والمرتجعات

#### 6. **إدخال المصاريف**

```http
POST /api/distribution/expense/record
```

- مصاريف الوقود والصيانة
- إرفاق صور الإيصالات
- تصنيف أنواع المصاريف

#### 7. **رفع التقرير اليومي**

```http
POST /api/distribution/report/daily/submit
```

- ملخص شامل لليوم
- الكميات الموزعة والمدفوعات
- المصاريف والملاحظات

### سيناريو مدير التوزيع الكامل

#### 1. **استلام الطلبات اليومية (6:00 ص)**

```http
GET /api/distribution/manager/orders/daily?date=2024-01-15
POST /api/distribution/manager/orders/add
```

- جمع الطلبات من WhatsApp يدوياً
- إدخال طلبات جديدة للمحلات
- اقتراح كميات للمحلات المعتادة

#### 2. **توليد جداول التوزيع**

```http
POST /api/distribution/manager/schedules/generate
```

- توزيع الطلبات على الموزعين
- ترتيب المحلات حسب المسار الأمثل
- إضافة بضاعة احتياطية

#### 3. **المتابعة المباشرة**

```http
GET /api/distribution/manager/tracking/live?date=2024-01-15
```

- تتبع تقدم كل موزع لحظياً
- مراقبة حالة كل محل
- إشعارات التأخير والمشاكل

#### 4. **مراجعة التقارير**

```http
GET /api/distribution/manager/performance?distributorId=3&period=week
GET /api/distribution/manager/analytics
```

- تقارير الموزعين الفردية
- تحليلات الأداء والكفاءة
- إحصائيات المبيعات والتحصيل

#### 5. **إدارة المحلات**

```http
PATCH /api/distribution/manager/stores/assign
PATCH /api/distribution/manager/stores/{storeId}/balance
```

- تعيين المحلات للموزعين
- تعديل أرصدة المحلات يدوياً
- إدارة سياسات الائتمان

#### 6. **التقرير الأسبوعي**

```http
POST /api/distribution/manager/reports/weekly
```

- إجمالي المبيعات والطلبات
- أداء الموزعين
- تحليل المحلات والمنتجات

## 🛠️ التثبيت والتشغيل

### 1. إعداد قاعدة البيانات

```sql
-- تشغيل ملفات قاعدة البيانات بالترتيب
mysql -u root -p < database/create_complete_database.sql
mysql -u root -p < database/additional_tables_for_distribution.sql
mysql -u root -p < database/final_system_tables.sql
```

### 2. إعداد Backend

```bash
cd backend
npm install

# إعداد متغيرات البيئة
cp config.env.example config.env

# تشغيل الخادم
npm start
```

### 3. إعداد Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. إعداد تطبيق Flutter

```bash
cd delivery_app
flutter pub get
flutter run
```

## 🔑 API Endpoints الرئيسية

### **التوزيع والموزعين**

- `GET /api/distribution/schedule/daily` - جدول التوزيع اليومي
- `GET /api/distribution/store/{id}/details` - تفاصيل المحل للتسليم
- `POST /api/distribution/payment/record` - تسجيل الدفعات
- `GET /api/distribution/vehicle/inventory` - مخزون السيارة
- `POST /api/distribution/report/daily/submit` - رفع التقرير اليومي

### **إدارة التوزيع**

- `GET /api/distribution/manager/orders/daily` - الطلبات اليومية
- `POST /api/distribution/manager/schedules/generate` - توليد الجداول
- `GET /api/distribution/manager/tracking/live` - المتابعة المباشرة
- `GET /api/distribution/manager/analytics` - التحليلات المتقدمة

### **المدفوعات والتقارير**

- `POST /api/payments/flexible` - تسجيل دفعة مرنة
- `GET /api/payments/analytics` - تحليلات المدفوعات
- `GET /api/reports/daily` - التقرير اليومي
- `GET /api/reports/weekly` - التقرير الأسبوعي

## 🔐 المصادقة والأذونات

### أدوار المستخدمين

- **admin**: صلاحيات كاملة
- **manager**: إدارة التوزيع والتقارير
- **distributor**: عمليات التوزيع والتسليم
- **store_owner**: عرض طلبات المحل فقط
- **accountant**: المدفوعات والتقارير المالية

### استخدام الـ Token

```javascript
// إضافة في header لكل طلب
Authorization: Bearer <jwt_token>
```

## 📱 استخدام تطبيق الموبايل

### 1. تسجيل الدخول

```dart
// استخدام اسم المستخدم وكلمة المرور
username: "distributor1"
password: "password123"
```

### 2. استلام الجدول

- يظهر جدول اليوم تلقائياً
- ترتيب المحلات حسب الأقرب
- إمكانية الترتيب حسب الموقع الحالي

### 3. تسليم الطلبات

- النقر على المحل لعرض التفاصيل
- تعديل الكميات حسب الحاجة
- تسجيل التسليم مع الهدايا

### 4. تحصيل الدفعات

- اختيار طريقة الدفع (نقدي/بنكي/مختلط)
- تحديد توزيع المبلغ
- طباعة الفاتورة (مستقبلياً)

## 🌐 العملات المدعومة

### العملة الأساسية: EUR (يورو)

- جميع الحسابات الأساسية
- التقارير المالية الرئيسية
- أسعار المنتجات الافتراضية

### العملة الثانوية: SYP (ليرة سورية)

- دعم كامل للمعاملات المحلية
- تحويل تلقائي بسعر الصرف
- تقارير مزدوجة العملة

### إعداد سعر الصرف

```sql
UPDATE system_settings
SET setting_value = '15000'
WHERE setting_key = 'exchange_rate_eur_syp';
```

## 📊 لوحة التحكم المحسنة

### إحصائيات لحظية

- إجمالي الطلبات والمبيعات اليومية
- حالة الموزعين ومواقعهم
- أرصدة المحلات والديون المستحقة
- أداء المنتجات والفئات

### خرائط تفاعلية

- مواقع الموزعين المباشرة
- مسارات التوزيع المحسنة
- تتبع التقدم لحظة بلحظة
- تنبيهات القرب من المحلات

### تحليلات متقدمة

- اتجاهات المبيعات والنمو
- تحليل أداء الموزعين
- إحصائيات العملاء والولاء
- تقارير الربحية والكفاءة

## 🚨 المشاكل الشائعة والحلول

### 1. **مشكلة اتصال قاعدة البيانات**

```bash
# التحقق من إعدادات قاعدة البيانات
mysql -u root -p -e "SHOW DATABASES;"
```

### 2. **خطأ في API Token**

```javascript
// التحقق من صحة التوكن
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### 3. **مشكلة في الخرائط**

```javascript
// إضافة Google Maps API Key
GOOGLE_MAPS_API_KEY = your_api_key_here;
```

### 4. **تطبيق Flutter لا يتصل**

```dart
// تحديث رابط API في التطبيق
baseUrl: 'http://YOUR_SERVER_IP:5001/api'
```

## 📈 التطوير المستقبلي

### المرحلة القادمة

- [ ] تكامل مع أنظمة POS
- [ ] تطبيق لأصحاب المحلات
- [ ] نظام إشعارات push
- [ ] تحليلات ذكية بالذكاء الاصطناعي
- [ ] تكامل مع أنظمة المحاسبة
- [ ] API للطلبات الآلية

### تحسينات مقترحة

- [ ] تحسين أداء قاعدة البيانات
- [ ] إضافة مزيد من أنواع التقارير
- [ ] تحسين واجهة المستخدم
- [ ] دعم مزيد من العملات
- [ ] نظام النسخ الاحتياطي التلقائي

## 🤝 المساهمة

### مطورين Backend

- Node.js/Express
- MySQL/Database Design
- API Development
- Authentication & Security

### مطورين Frontend

- React.js
- Dashboard Development
- UI/UX Design
- Charts & Analytics

### مطورين Mobile

- Flutter/Dart
- Mobile UI/UX
- GPS & Maps Integration
- Offline Capabilities

## 📞 الدعم والمساعدة

### للدعم التقني

- مراجعة ملفات الـ logs في `backend/logs/`
- فحص حالة الـ API عبر `/api/health`
- التحقق من قاعدة البيانات

### للتطوير

- استخدام Postman collection المرفقة
- مراجعة الـ API documentation
- اتباع معايير الـ coding المحددة

---

## 🎯 خلاصة

تم إنشاء نظام شامل ومتقدم لإدارة المخبزة يغطي جميع الاحتياجات الحقيقية من التوزيع والمبيعات إلى التقارير والتحليلات. النظام يدعم العملات المتعددة ويوفر تطبيق موبايل متكامل للموزعين مع خرائط ذكية وتتبع مباشر.

**تم تطوير النظام ليكون:**

- ✅ شامل وعملي لكل السيناريوهات
- ✅ مرن ويدعم التخصيص
- ✅ سهل الاستخدام والصيانة
- ✅ قابل للتطوير والتوسع
- ✅ آمن ومستقر

**جاهز للاستخدام الفوري والتطوير المستمر!** 🚀
