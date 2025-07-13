# 🍞 نظام إدارة المخبزة - لوحة التحكم

لوحة تحكم شاملة لإدارة نظام المخبزة مع دعم العملات المتعددة وإدارة التوزيع المتقدمة.

## 🚀 المميزات

### 🔐 نظام المصادقة المتقدم

- **5 أدوار مختلفة**: Admin, Manager, Distributor, Store Owner, Accountant
- **نظام صلاحيات مفصل** لكل دور
- **JWT Authentication** مع refresh tokens
- **Rate limiting** ومعالجة الأمان
- **Password policies** ومصادقة ثنائية

### 💰 العملات المتعددة

- **العملة الأساسية**: EUR (يورو)
- **العملة الثانوية**: SYP (ليرة سورية)
- **تحويل تلقائي** بين العملات
- **أسعار صرف قابلة للتحديث**

### 🚚 إدارة التوزيع الشاملة

- **جداول توزيع ذكية** مع تحسين المسارات
- **تتبع مباشر** لمواقع الموزعين
- **إدارة مخزون السيارات**
- **تسجيل المصاريف** والأضرار
- **تقارير يومية** شاملة

### 📊 التحليلات والتقارير

- **إحصائيات لحظية** للمبيعات والطلبات
- **تقارير يومية/أسبوعية/شهرية**
- **تحليلات الأداء** للموزعين
- **خرائط تفاعلية** للتوزيع
- **تصدير متقدم** (Excel, PDF, CSV)

### 🎨 واجهة المستخدم

- **تصميم متجاوب** يدعم جميع الأجهزة
- **دعم RTL** كامل للعربية
- **Dark mode** مع system preference
- **انتقالات سلسة** مع Framer Motion
- **مكونات UI** قابلة للإعادة الاستخدام

## 🛠️ التقنيات المستخدمة

### Frontend

- **React 18** مع Hooks
- **Vite** للبناء السريع
- **Tailwind CSS** للتصميم
- **React Router** للتنقل
- **Zustand** لإدارة الحالة
- **React Query** للـ API
- **Framer Motion** للحركة
- **Chart.js** للرسوم البيانية

### مكتبات إضافية

- **Axios** للـ API calls
- **React Hot Toast** للإشعارات
- **Leaflet** للخرائط
- **Date-fns** للتواريخ
- **React Select** للـ dropdowns
- **React Table** للجداول

## 📦 التثبيت والتشغيل

### 1. متطلبات النظام

```bash
Node.js >= 18
npm >= 9
```

### 2. تثبيت المشروع

```bash
# الانتقال إلى مجلد الداشبورد
cd dashboard

# تثبيت الاعتماديات
npm install

# تشغيل البيئة التطويرية
npm run dev
```

### 3. بناء المشروع

```bash
# بناء للإنتاج
npm run build

# معاينة البناء
npm run preview
```

## 🔧 الإعدادات

### متغيرات البيئة

إنشاء ملف `.env` في المجلد الجذر:

```env
# API Configuration
VITE_API_URL=https://bakery-management-system-production.up.railway.app/api/
VITE_API_TIMEOUT=30000

# App Configuration
VITE_APP_NAME=نظام إدارة المخبزة
VITE_APP_VERSION=2.0.0

# Google Maps (اختياري)
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

# Development
VITE_DEV_MODE=true
```

### إعدادات Tailwind

ملف `tailwind.config.js` يحتوي على:

- نظام ألوان مخصص للمخبزة
- دعم RTL كامل
- متغيرات CSS مخصصة
- أنماط مكونات جاهزة

## 📋 بنية المشروع

```
dashboard/
├── public/                 # الملفات العامة
├── src/
│   ├── components/        # مكونات React
│   │   ├── ui/           # مكونات UI أساسية
│   │   ├── layout/       # مكونات Layout
│   │   └── forms/        # مكونات النماذج
│   ├── pages/            # صفحات التطبيق
│   │   ├── auth/         # صفحات المصادقة
│   │   ├── dashboard/    # صفحات الداشبورد
│   │   ├── distribution/ # صفحات التوزيع
│   │   ├── orders/       # صفحات الطلبات
│   │   ├── payments/     # صفحات المدفوعات
│   │   └── reports/      # صفحات التقارير
│   ├── services/         # خدمات API
│   ├── stores/           # Zustand stores
│   ├── hooks/            # Custom hooks
│   ├── utils/            # دوال مساعدة
│   └── styles/           # ملفات CSS
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎯 الاستخدام

### 1. تسجيل الدخول

```javascript
// بيانات المستخدم الافتراضية
Username: admin@bakery.com
Password: admin123
```

### 2. الأدوار والصلاحيات

- **Admin**: جميع الصلاحيات
- **Manager**: إدارة التوزيع والطلبات
- **Distributor**: عمليات التوزيع
- **Store Owner**: عرض الطلبات
- **Accountant**: المدفوعات والتقارير

### 3. الواجهة الرئيسية

- **Dashboard**: إحصائيات لحظية
- **Orders**: إدارة الطلبات
- **Distribution**: إدارة التوزيع
- **Payments**: إدارة المدفوعات
- **Reports**: التقارير والتحليلات

## 🔌 تكامل API

### Backend Integration

```javascript
// API Base URL
const API_URL =
  "https://bakery-management-system-production.up.railway.app/api/";

// مثال على استخدام API
import { apiService } from "./services/apiService";

// جلب الطلبات
const orders = await apiService.get("/orders");

// إنشاء طلب جديد
const newOrder = await apiService.post("/orders", orderData);
```

### Authentication

```javascript
// تسجيل الدخول
const response = await authService.login({
  email: "admin@bakery.com",
  password: "admin123",
});

// استخدام الـ store
const { login, logout, user } = useAuthStore();
```

## 📱 الاستجابة والتوافق

### المتصفحات المدعومة

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### الأجهزة المدعومة

- **Desktop**: 1920x1080+
- **Tablet**: 768x1024+
- **Mobile**: 375x667+

## 🚀 النشر

### 1. النشر على Netlify

```bash
# بناء المشروع
npm run build

# نشر المجلد dist
netlify deploy --prod --dir=dist
```

### 2. النشر على Vercel

```bash
# بناء المشروع
npm run build

# نشر
vercel --prod
```

### 3. النشر مع Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🔍 التطوير والتخصيص

### إضافة مكونات جديدة

```javascript
// مكون جديد
import React from "react";
import { motion } from "framer-motion";

const NewComponent = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card"
    >
      {/* محتوى المكون */}
    </motion.div>
  );
};

export default NewComponent;
```

### إضافة صفحة جديدة

```javascript
// في App.jsx
<Route
  path="/new-page"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <NewPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
```

### إضافة API service

```javascript
// في services/
class NewService {
  async getData() {
    return await apiService.get("/new-endpoint");
  }
}

export const newService = new NewService();
```

## 🐛 معالجة الأخطاء

### Error Boundary

```javascript
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>;
```

### Toast Notifications

```javascript
import { toast } from "react-hot-toast";

toast.success("نجح الحفظ");
toast.error("حدث خطأ");
toast.loading("جاري الحفظ...");
```

## 📊 الأداء والتحسين

### Code Splitting

```javascript
const LazyComponent = React.lazy(() => import('./Component'))

<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

### Memoization

```javascript
const MemoizedComponent = React.memo(Component);
const memoizedValue = useMemo(() => compute(), [deps]);
```

## 🔐 الأمان

### معالجة الأمان

- **HTTPS only** في الإنتاج
- **CSP headers** للحماية
- **XSS protection** في المدخلات
- **CSRF protection** في النماذج

### Best Practices

- تشفير البيانات الحساسة
- تحديث الـ dependencies دورياً
- مراجعة الكود أمنياً
- تسجيل الأنشطة المشبوهة

## 🆘 استكشاف الأخطاء

### مشاكل شائعة

1. **خطأ في الاتصال**: تحقق من URL الـ API
2. **خطأ في المصادقة**: تحقق من صحة الـ token
3. **خطأ في التحميل**: تحقق من الشبكة
4. **خطأ في البناء**: تحقق من الـ dependencies

### أدوات التطوير

- **React DevTools** لفحص المكونات
- **Redux DevTools** لفحص الحالة
- **Network tab** لفحص الـ API
- **Console** لفحص الأخطاء

## 📞 الدعم والمساعدة

### التواصل

- **Email**: support@bakery-system.com
- **GitHub**: [Repository Issues](https://github.com/your-repo/issues)
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)

### المساهمة

1. Fork المشروع
2. إنشاء branch جديد
3. إضافة التغييرات
4. إنشاء Pull Request

## 📄 الرخصة

هذا المشروع مرخص تحت رخصة MIT. راجع ملف `LICENSE` للتفاصيل.

## 🎉 الخلاصة

تم إنشاء نظام إدارة مخبزة شامل مع:

- ✅ واجهة مستخدم حديثة وسهلة الاستخدام
- ✅ نظام مصادقة متقدم
- ✅ دعم العملات المتعددة
- ✅ إدارة توزيع ذكية
- ✅ تقارير وتحليلات شاملة
- ✅ تكامل كامل مع Backend

**🚀 جاهز للاستخدام الفوري!**
