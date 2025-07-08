# 🥖 نظام إدارة قسم التوزيع - مخبز بلجيكا

نظام ويب شامل لإدارة عمليات توزيع المخبوزات اليومية، تسجيل المدفوعات، إدارة المحلات، وتوليد التقارير المالية.

## 🏗️ بنية المشروع

```
bakery-management-system/
├── backend/              # Node.js + Express.js API
│   ├── config/          # إعدادات قاعدة البيانات والتطبيق
│   ├── controllers/     # منطق العمليات الأساسية
│   ├── middleware/      # المصادقة والحماية
│   ├── models/          # نماذج قاعدة البيانات
│   ├── routes/          # مسارات API
│   ├── services/        # الخدمات المساعدة
│   └── utils/           # أدوات مساعدة
├── frontend/            # React.js واجهة المستخدم
│   ├── src/
│   │   ├── components/  # مكونات قابلة للإعادة
│   │   ├── pages/       # صفحات التطبيق
│   │   ├── hooks/       # React Hooks مخصصة
│   │   ├── services/    # استدعاءات API
│   │   ├── store/       # إدارة الحالة
│   │   └── utils/       # أدوات مساعدة
├── database/            # سكريبت قاعدة البيانات
│   ├── migrations/      # تحديثات قاعدة البيانات
│   ├── seeders/         # بيانات تجريبية
│   └── schema.sql       # هيكل قاعدة البيانات
└── docs/                # الوثائق

```

## 🚀 البدء السريع

### طريقة سريعة (باستخدام package.json الرئيسي):

```bash
# تثبيت جميع التبعيات
npm run install:all

# تشغيل النظام كاملاً (Backend + Frontend)
npm run dev
```

### الطريقة التقليدية:

#### 1. إعداد Backend

```bash
cd backend
npm install
npm run dev
```

#### 2. إعداد Frontend (في terminal جديد)

```bash
cd frontend
npm install
npm run dev
```

### 3. إعداد قاعدة البيانات

```bash
# إنشاء قاعدة البيانات
mysql -u root -p < database/schema.sql

# إدراج البيانات التجريبية
mysql -u root -p bakery_db < database/seeders/sample_data.sql
```

## 🎯 الميزات الرئيسية

- ✅ إدارة الطلبات اليومية
- ✅ نظام التوزيع الذكي
- ✅ تسجيل المدفوعات والديون
- ✅ إدارة المحلات والموزعين
- ✅ تقارير يومية وأسبوعية
- ✅ نظام المصادقة والأدوار
- ✅ واجهة متجاوبة للموبايل

## 🛠️ التقنيات المستخدمة

**Backend:**

- Node.js + Express.js
- MySQL + Sequelize ORM
- JWT Authentication
- Swagger Documentation

**Frontend:**

- React.js + Vite
- Tailwind CSS
- Zustand (State Management)
- React Router

## 📊 النسخ المدعومة

- Node.js >= 18.0.0
- MySQL >= 8.0
- React >= 18.0.0

## 👥 المساهمة

هذا مشروع خاص لمخبز بلجيكا.

## 📄 الترخيص

جميع الحقوق محفوظة © 2024
