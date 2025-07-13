# 🚀 دليل تشغيل نظام إدارة المخبزة على Railway

## ✅ تم إنجازه بنجاح:

- إنشاء قاعدة البيانات (19 جدول + 3 views)
- إدراج البيانات الأساسية (3 مستخدمين، 15 منتج، 9 محلات)
- اختبار الاتصال بقاعدة البيانات

## 🔐 بيانات تسجيل الدخول الأساسية:

### المدير العام:

```
👤 Username: admin
🔑 Password: admin123
📧 Email: admin@bakery.com
🎯 Role: admin
```

### مدير العمليات:

```
👤 Username: manager
🔑 Password: admin123
📧 Email: manager@bakery.com
🎯 Role: manager
```

### الموزع:

```
👤 Username: distributor1
🔑 Password: admin123
📧 Email: distributor1@bakery.com
🎯 Role: distributor
```

## 🚀 تشغيل النظام:

### 1. تشغيل الخادم الخلفي:

```bash
cd backend
npm start
```

### 2. تشغيل الواجهة الأمامية:

```bash
cd frontend
npm start
```

### 3. الوصول إلى النظام:

- الخادم الخلفي: `http://localhost:5001`
- الواجهة الأمامية: `http://localhost:3000`

## 📊 البيانات الأساسية المتاحة:

### المنتجات (15 منتج):

- **خبز**: خبز أبيض فرنسي
- **معجنات**: كرواسان زبدة
- **كعك**: كيك الفانيليا
- **مشروبات**: قهوة إسبريسو
- **فطائر**: فطيرة السبانخ

### المحلات (9 محلات):

- **سوبرماركت الأمل** - عبدالله بن سعد
- **مقهى الياسمين** - مريم الخضراء
- **مطعم دمشق** - حسام الدين

## 🔧 إعدادات Railway:

### متغيرات البيئة المطلوبة:

```env
DB_HOST=shinkansen.proxy.rlwy.net
DB_USER=root
DB_PASSWORD=ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA
DB_NAME=railway
DB_PORT=24785
JWT_SECRET=your-jwt-secret-key
NODE_ENV=production
FRONTEND_URL=your-frontend-url
```

## 🎯 الميزات الأساسية:

### للمدير:

- إدارة المستخدمين والأدوار
- إدارة المنتجات والأسعار
- إدارة المحلات والموزعين
- تقارير المبيعات والإحصائيات
- إدارة المدفوعات والحسابات

### للموزع:

- عرض جدول التوزيع
- تسجيل الزيارات والتسليم
- إدارة المدفوعات
- تقارير الأداء اليومية

### للمدير العمليات:

- إدارة الطلبات والجداول
- متابعة أداء الموزعين
- تقارير العمليات

## 🚀 الخطوات التالية:

1. **اختبار تسجيل الدخول** باستخدام حساب admin
2. **إضافة المزيد من المنتجات** والمحلات حسب الحاجة
3. **إنشاء طلبات تجريبية** لاختبار النظام
4. **تخصيص الموزعين** للمحلات المختلفة

## 🔍 فحص قاعدة البيانات:

يمكنك استخدام هذا الأمر لفحص البيانات:

```bash
node -e "
const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({
    host: 'shinkansen.proxy.rlwy.net',
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    port: 24785,
    database: 'railway'
  });

  const [users] = await conn.execute('SELECT COUNT(*) as count FROM users');
  const [products] = await conn.execute('SELECT COUNT(*) as count FROM products');
  const [stores] = await conn.execute('SELECT COUNT(*) as count FROM stores');

  console.log('📊 Database Status:');
  console.log('Users:', users[0].count);
  console.log('Products:', products[0].count);
  console.log('Stores:', stores[0].count);

  await conn.end();
})();
"
```

## 🎉 النظام جاهز للاستخدام!

نظام إدارة المخبزة الخاص بك جاهز الآن مع:

- ✅ قاعدة بيانات كاملة
- ✅ بيانات أساسية
- ✅ اتصال مع Railway
- ✅ جميع الميزات المطلوبة

**بالتوفيق في إدارة مخبزتك! 🍞**
