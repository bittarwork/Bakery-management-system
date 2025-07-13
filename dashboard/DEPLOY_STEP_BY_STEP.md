# 🚀 دليل الـ Deploy خطوة بخطوة - Vercel

## 📋 المتطلبات المسبقة

### 1. حساب GitHub

- [ ] إنشاء حساب على GitHub
- [ ] رفع المشروع على GitHub

### 2. حساب Vercel

- [ ] إنشاء حساب على [vercel.com](https://vercel.com)
- [ ] ربط حساب GitHub

---

## 🔧 الخطوة 1: رفع المشروع على GitHub

### 1.1 إنشاء Repository جديد

```bash
# في GitHub
1. اذهب إلى github.com
2. اضغط على "New repository"
3. اسم المشروع: bakery-management-system
4. اختر Public أو Private
5. اضغط "Create repository"
```

### 1.2 رفع الكود

```bash
# في مجلد المشروع الرئيسي
git init
git add .
git commit -m "Initial commit: Bakery Management System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bakery-management-system.git
git push -u origin main
```

---

## 🌐 الخطوة 2: إعداد Vercel

### 2.1 إنشاء حساب Vercel

1. اذهب إلى [vercel.com](https://vercel.com)
2. اضغط "Sign Up"
3. اختر "Continue with GitHub"
4. امنح الصلاحيات المطلوبة

### 2.2 ربط المشروع

1. في Vercel Dashboard، اضغط "New Project"
2. اختر repository: `bakery-management-system`
3. اضغط "Import"

### 2.3 إعدادات المشروع

```
Framework Preset: Vite
Root Directory: dashboard
Build Command: npm run build
Output Directory: dist
Install Command: npm install --legacy-peer-deps
```

---

## ⚙️ الخطوة 3: إعداد متغيرات البيئة

### 3.1 في Vercel Dashboard

1. اذهب إلى Project Settings
2. اختر "Environment Variables"
3. أضف المتغيرات التالية:

```
Name: VITE_API_BASE_URL
Value: https://bakery-management-system-production.up.railway.app/api/
Environment: Production, Preview, Development
```

### 3.2 متغيرات إضافية (اختيارية)

```
Name: VITE_APP_NAME
Value: Bakery Management System
Environment: Production, Preview, Development

Name: VITE_APP_VERSION
Value: 1.0.0
Environment: Production, Preview, Development
```

---

## 🚀 الخطوة 4: Deploy

### 4.1 Deploy الأولي

1. في Vercel، اضغط "Deploy"
2. انتظر حتى يكتمل البناء (2-3 دقائق)
3. تحقق من النجاح في Build Logs

### 4.2 التحقق من النجاح

- ✅ Build Status: Success
- ✅ No errors in logs
- ✅ Preview URL يعمل

---

## 🔍 الخطوة 5: اختبار التطبيق

### 5.1 اختبار الوظائف الأساسية

- [ ] تحميل الصفحة الرئيسية
- [ ] تسجيل الدخول (admin@bakery.com / admin123)
- [ ] التنقل بين الصفحات
- [ ] عرض البيانات

### 5.2 اختبار الأداء

- [ ] سرعة التحميل
- [ ] استجابة الواجهة
- [ ] عمل على الأجهزة المحمولة

### 5.3 اختبار API

- [ ] الاتصال بالباك إند
- [ ] عرض البيانات الحقيقية
- [ ] عدم وجود أخطاء CORS

---

## 🛠️ الخطوة 6: حل المشاكل الشائعة

### 6.1 مشكلة: Build Failed

**الأسباب المحتملة:**

- خطأ في dependencies
- خطأ في متغيرات البيئة
- خطأ في الكود

**الحل:**

```bash
# تحقق من Build Logs في Vercel
# تأكد من عمل البناء محلياً
npm run build
```

### 6.2 مشكلة: CORS Error

**الحل:**

```javascript
// في الباك إند
app.use(
  cors({
    origin: ["https://your-app.vercel.app"],
    credentials: true,
  })
);
```

### 6.3 مشكلة: Environment Variables

**الحل:**

- تأكد من إضافة `VITE_` prefix
- تأكد من اختيار Environment الصحيح
- Redeploy بعد تغيير المتغيرات

---

## 📱 الخطوة 7: إعدادات إضافية

### 7.1 Custom Domain (اختياري)

1. في Vercel Dashboard
2. اذهب إلى Settings > Domains
3. أضف domain مخصص
4. اتبع تعليمات DNS

### 7.2 Analytics

1. في Vercel Dashboard
2. اذهب إلى Analytics
3. فعّل Vercel Analytics (مجاني)

### 7.3 Monitoring

1. فعّل Error Monitoring
2. فعّل Performance Monitoring
3. أضف Web Vitals tracking

---

## 🔄 الخطوة 8: Deploy تلقائي

### 8.1 إعداد Git Hooks

- كل push على main branch سيؤدي لـ deploy تلقائي
- يمكن إعداد preview deployments للـ branches الأخرى

### 8.2 Workflow

```bash
# تطوير محلي
git add .
git commit -m "Update feature"
git push origin main

# Deploy تلقائي على Vercel
# انتظر 2-3 دقائق
# تحقق من النجاح
```

---

## 📊 الخطوة 9: مراقبة الأداء

### 9.1 Vercel Analytics

- مراقبة الزيارات
- تحليل الأداء
- تتبع الأخطاء

### 9.2 Performance Monitoring

- Core Web Vitals
- Page Load Times
- User Experience Metrics

---

## 🆘 الدعم والمساعدة

### إذا واجهت مشاكل:

1. **تحقق من Build Logs** في Vercel
2. **اختبر محلياً** أولاً
3. **راجع التوثيق** في Vercel
4. **تواصل مع الدعم** إذا لزم الأمر

### روابط مفيدة:

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://reactjs.org/)

---

## ✅ قائمة التحقق النهائية

### قبل الـ Deploy:

- [ ] الكود يعمل محلياً
- [ ] البناء ينجح محلياً
- [ ] المشروع على GitHub
- [ ] متغيرات البيئة جاهزة

### بعد الـ Deploy:

- [ ] Build نجح
- [ ] التطبيق يعمل
- [ ] تسجيل الدخول يعمل
- [ ] API يعمل
- [ ] الموبايل يعمل

---

**🎉 تهانينا! تم نشر الفرونت إند بنجاح على Vercel!**

**الرابط:** `https://your-app-name.vercel.app`
