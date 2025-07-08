# 🏗️ هيكلية المشروع المحسنة

## 📋 نظرة عامة

تم تحسين هيكلية مشروع نظام إدارة توزيع المخابز لتكون أكثر تنظيماً ومرونة للتطوير المستقبلي.

## 🗂️ الهيكلية العامة

```
Bakery-management-system/
├── 📁 backend/                 # خادم Node.js + Express
├── 📁 frontend/                # تطبيق React + Vite
├── 📁 database/                # ملفات قاعدة البيانات
├── 📁 docs/                    # الوثائق
├── 📄 docker-compose.yml       # إعداد Docker
├── 📄 README.md               # ملف README الرئيسي
└── 📄 PROJECT_ROADMAP.md      # خارطة طريق المشروع
```

---

## 🔧 Backend Structure

```
backend/
├── 📁 config/                  # إعدادات التطبيق
│   ├── database.js            # إعداد قاعدة البيانات
│   └── config.js              # إعدادات عامة
├── 📁 controllers/             # Controllers
│   ├── authController.js      # تحكم التوثيق
│   ├── orderController.js     # تحكم الطلبات
│   └── ...
├── 📁 models/                  # نماذج قاعدة البيانات
│   ├── User.js               # نموذج المستخدم
│   ├── Order.js              # نموذج الطلب
│   └── ...
├── 📁 routes/                  # مسارات API
│   ├── auth.js               # مسارات التوثيق
│   ├── orders.js             # مسارات الطلبات
│   └── ...
├── 📁 middleware/              # Middleware
│   ├── auth.js               # middleware التوثيق
│   ├── validation.js         # middleware التحقق
│   └── ...
├── 📁 services/                # خدمات الأعمال
│   ├── orderService.js       # خدمة الطلبات
│   ├── emailService.js       # خدمة البريد الإلكتروني
│   └── ...
├── 📁 utils/                   # أدوات مساعدة
│   ├── helpers.js            # دوال مساعدة
│   ├── logger.js             # نظام التسجيل
│   └── ...
├── 📁 validators/              # 🆕 validators مخصصة
│   ├── authValidators.js     # validators التوثيق
│   ├── orderValidators.js    # validators الطلبات
│   └── README.md
├── 📁 constants/               # 🆕 الثوابت
│   ├── orderStatus.js        # حالات الطلبات
│   ├── paymentStatus.js      # حالات الدفع
│   ├── userRoles.js          # أدوار المستخدمين
│   ├── index.js              # تصدير الثوابت
│   └── README.md
├── 📁 types/                   # 🆕 أنواع البيانات
│   └── README.md
├── 📁 interfaces/              # 🆕 واجهات البيانات
│   └── README.md
├── 📁 dto/                     # 🆕 Data Transfer Objects
│   ├── request/              # DTOs للطلبات
│   ├── response/             # DTOs للاستجابات
│   └── README.md
├── 📁 exceptions/              # 🆕 استثناءات مخصصة
│   └── README.md
├── 📁 jobs/                    # 🆕 مهام مجدولة
│   └── README.md
├── 📁 events/                  # 🆕 الأحداث
│   └── README.md
├── 📁 listeners/               # 🆕 مستمعي الأحداث
│   └── README.md
├── 📁 storage/                 # 🆕 التخزين
│   ├── logs/                 # ملفات السجلات
│   ├── uploads/              # الملفات المرفوعة
│   └── temp/                 # ملفات مؤقتة
├── 📁 tests/                   # 🆕 الاختبارات
│   ├── unit/                 # اختبارات الوحدة
│   ├── integration/          # اختبارات التكامل
│   └── fixtures/             # بيانات الاختبار
├── 📁 scripts/                 # 🆕 سكريبتات مساعدة
│   └── README.md
├── 📁 docs/                    # 🆕 الوثائق
│   ├── api/                  # وثائق API
│   └── database/             # وثائق قاعدة البيانات
├── 📁 seeders/                 # بذور قاعدة البيانات
└── 📄 server.js               # نقطة دخول التطبيق
```

---

## ⚛️ Frontend Structure

```
frontend/
├── 📁 public/                  # ملفات عامة
├── 📁 src/
│   ├── 📁 components/          # المكونات
│   │   ├── common/            # مكونات مشتركة
│   │   ├── forms/             # مكونات النماذج
│   │   ├── ui/                # مكونات واجهة المستخدم
│   │   ├── Orders/            # مكونات الطلبات
│   │   └── ...
│   ├── 📁 pages/               # الصفحات
│   │   ├── Orders/            # صفحات الطلبات
│   │   ├── Dashboard/         # صفحات لوحة التحكم
│   │   └── ...
│   ├── 📁 services/            # خدمات API
│   │   ├── apiClient.js       # عميل API
│   │   ├── ordersAPI.js       # خدمة الطلبات
│   │   └── ...
│   ├── 📁 store/               # إدارة الحالة
│   │   ├── authStore.js       # متجر التوثيق
│   │   ├── ordersStore.js     # متجر الطلبات
│   │   └── ...
│   ├── 📁 hooks/               # React Hooks مخصصة
│   │   ├── useAuth.js         # hook التوثيق
│   │   ├── useOrders.js       # hook الطلبات
│   │   └── ...
│   ├── 📁 utils/               # أدوات مساعدة
│   │   ├── formatters.js      # دوال التنسيق
│   │   ├── validators.js      # دوال التحقق
│   │   └── ...
│   ├── 📁 assets/              # 🆕 الأصول
│   │   ├── images/            # الصور
│   │   ├── icons/             # الأيقونات
│   │   ├── fonts/             # الخطوط
│   │   └── styles/            # ملفات CSS إضافية
│   ├── 📁 constants/           # 🆕 الثوابت
│   │   └── index.js           # ثوابت التطبيق
│   ├── 📁 types/               # 🆕 أنواع البيانات
│   │   └── index.js           # تعريفات الأنواع
│   ├── 📁 contexts/            # 🆕 React Contexts
│   │   └── README.md
│   ├── 📁 layouts/             # 🆕 تخطيطات الصفحات
│   │   └── README.md
│   ├── 📁 guards/              # 🆕 حراس المسارات
│   │   └── README.md
│   ├── 📁 providers/           # 🆕 مزودي البيانات
│   │   └── README.md
│   ├── 📄 App.jsx             # المكون الرئيسي
│   ├── 📄 main.jsx            # نقطة دخول التطبيق
│   └── 📄 index.css           # ملف CSS الرئيسي
├── 📄 package.json            # تبعيات المشروع
├── 📄 vite.config.js          # إعداد Vite
└── 📄 tailwind.config.js      # إعداد Tailwind CSS
```

---

## 🆕 المجلدات الجديدة والغرض منها

### Backend

| المجلد        | الغرض                               | الأمثلة                                   |
| ------------- | ----------------------------------- | ----------------------------------------- |
| `validators/` | validators مخصصة للتحقق من البيانات | `orderValidators.js`, `authValidators.js` |
| `constants/`  | الثوابت المستخدمة في التطبيق        | `ORDER_STATUS`, `USER_ROLES`              |
| `dto/`        | كائنات نقل البيانات                 | `CreateOrderDto`, `OrderResponseDto`      |
| `exceptions/` | استثناءات مخصصة                     | `ValidationException`, `NotFoundError`    |
| `jobs/`       | مهام مجدولة                         | `SendEmailJob`, `GenerateReportJob`       |
| `events/`     | الأحداث                             | `OrderCreated`, `PaymentReceived`         |
| `listeners/`  | مستمعي الأحداث                      | `SendOrderConfirmation`                   |
| `storage/`    | ملفات التخزين                       | `logs/`, `uploads/`, `temp/`              |
| `tests/`      | الاختبارات                          | `unit/`, `integration/`, `fixtures/`      |
| `scripts/`    | سكريبتات مساعدة                     | `backup.js`, `migrate.js`                 |
| `docs/`       | الوثائق                             | `api/`, `database/`                       |

### Frontend

| المجلد       | الغرض           | الأمثلة                         |
| ------------ | --------------- | ------------------------------- |
| `assets/`    | الأصول الثابتة  | `images/`, `icons/`, `fonts/`   |
| `constants/` | ثوابت التطبيق   | `ROUTES`, `MESSAGES`, `CONFIG`  |
| `types/`     | تعريفات الأنواع | `UserType`, `OrderType`         |
| `contexts/`  | React Contexts  | `AuthContext`, `ThemeContext`   |
| `layouts/`   | تخطيطات الصفحات | `MainLayout`, `AuthLayout`      |
| `guards/`    | حراس المسارات   | `AuthGuard`, `RoleGuard`        |
| `providers/` | مزودي البيانات  | `AuthProvider`, `ThemeProvider` |

---

## 📝 قواعد التسمية

### Backend

- **الملفات**: `camelCase.js` (مثل: `orderController.js`)
- **الكلاسات**: `PascalCase` (مثل: `OrderService`)
- **الثوابت**: `UPPER_SNAKE_CASE` (مثل: `ORDER_STATUS`)
- **المتغيرات**: `camelCase` (مثل: `userId`)

### Frontend

- **المكونات**: `PascalCase.jsx` (مثل: `OrderCard.jsx`)
- **الصفحات**: `PascalCase.jsx` (مثل: `OrdersPage.jsx`)
- **الخدمات**: `camelCase.js` (مثل: `ordersAPI.js`)
- **الثوابت**: `UPPER_SNAKE_CASE` (مثل: `ROUTES`)

---

## 🚀 الفوائد من الهيكلية الجديدة

### 1. **تنظيم أفضل**

- فصل الاهتمامات بوضوح
- سهولة العثور على الملفات
- هيكلية قابلة للتوسع

### 2. **قابلية الصيانة**

- كود أكثر تنظيماً
- سهولة إضافة ميزات جديدة
- تقليل التعقيد

### 3. **التطوير الجماعي**

- قواعد واضحة للتسمية
- هيكلية موحدة
- سهولة فهم المشروع للمطورين الجدد

### 4. **الاختبار**

- مجلدات مخصصة للاختبارات
- فصل اختبارات الوحدة عن التكامل
- بيانات اختبار منظمة

### 5. **الأداء**

- تحميل أفضل للموارد
- تنظيم أفضل للأصول
- إدارة أفضل للذاكرة

---

## 📚 الخطوات التالية

1. **نقل الكود الحالي** إلى الهيكلية الجديدة
2. **إنشاء الثوابت** المطلوبة
3. **إضافة validators** مخصصة
4. **إنشاء DTOs** للبيانات
5. **إضافة الاختبارات** المطلوبة
6. **توثيق APIs** في مجلد docs
7. **إضافة المزيد من المكونات** المشتركة

---

## 🔄 التحديثات المستقبلية

- إضافة TypeScript للـ Frontend
- إضافة نظام logging متقدم
- إضافة نظام caching
- إضافة نظام notifications
- إضافة نظام file uploads
- إضافة نظام backup تلقائي
