# نظام إدارة الجلسات - Session Management System

## نظرة عامة

تم تطوير نظام شامل لإدارة جلسات المستخدمين في الفرونت إند مع مدة صلاحية 3 ساعات. النظام يوفر إدارة تلقائية للجلسات، تحذيرات انتهاء الصلاحية، وتتبع نشاط المستخدم.

## المكونات الرئيسية

### 1. SessionManager (utils/sessionManager.js)

- **الغرض**: إدارة مركزية للجلسات
- **المدة**: 3 ساعات بالضبط
- **الميزات**:
  - إنشاء وإدارة الجلسات
  - مراقبة انتهاء الصلاحية
  - تجديد الجلسات
  - تتبع النشاط

### 2. AuthStore المُحدث (stores/authStore.js)

- **إضافات جديدة**:
  - `sessionTimeRemaining`: الوقت المتبقي بالميللي ثانية
  - `showSessionWarning`: عرض تحذير انتهاء الصلاحية
  - `sessionTrackingInterval`: معرف فترة التتبع
- **دوال جديدة**:
  - `startSessionTracking()`: بدء مراقبة الجلسة
  - `renewSession()`: تجديد الجلسة
  - `updateActivity()`: تحديث نشاط المستخدم

### 3. SessionWarning Component (components/ui/SessionWarning.jsx)

- **الغرض**: عرض تحذير عند اقتراب انتهاء الجلسة
- **التفعيل**: يظهر عند بقاء أقل من 15 دقيقة
- **الخيارات**:
  - تجديد الجلسة
  - تسجيل خروج فوري
  - إخفاء التحذير مؤقتاً

### 4. SessionTimer Component (components/ui/SessionTimer.jsx)

- **الغرض**: عرض الوقت المتبقي في الرأس
- **الألوان**:
  - أخضر: أكثر من 15 دقيقة
  - أصفر: أقل من 15 دقيقة
  - أحمر وامض: أقل من 5 دقائق

### 5. useActivityTracker Hook (hooks/useActivityTracker.js)

- **الغرض**: تتبع نشاط المستخدم
- **الأحداث المراقبة**:
  - حركة الماوس
  - الكتابة
  - التمرير
  - اللمس (الأجهزة المحمولة)
- **التحديث**: كل دقيقة كحد أقصى

### 6. SessionProvider (providers/SessionProvider.jsx)

- **الغرض**: مزود السياق للجلسة
- **المسؤوليات**:
  - تهيئة النظام
  - عرض التحذيرات
  - تفعيل تتبع النشاط

## كيفية العمل

### 1. تسجيل الدخول

```javascript
// عند تسجيل الدخول بنجاح
sessionManager.createSession(token, onExpired);
// يتم حفظ الجلسة لمدة 3 ساعات بالضبط
```

### 2. مراقبة الجلسة

```javascript
// فحص كل 30 ثانية
setInterval(() => {
  if (!sessionManager.isSessionValid()) {
    logout(); // تسجيل خروج تلقائي
  }
}, 30000);
```

### 3. تحذيرات انتهاء الصلاحية

- **15 دقيقة**: تحذير أول
- **5 دقائق**: تحذير حرج مع وميض
- **0 دقيقة**: تسجيل خروج تلقائي

### 4. تتبع النشاط

```javascript
// تحديث النشاط عند:
- حركة الماوس
- الكتابة
- التمرير
- تغيير النافذة النشطة
```

## الاستخدام في المكونات

### عرض معلومات الجلسة

```jsx
import { useAuthStore } from "../stores/authStore";

const MyComponent = () => {
  const { getSessionInfo } = useAuthStore();
  const sessionInfo = getSessionInfo();

  return <div>الوقت المتبقي: {sessionInfo.timeRemainingFormatted}</div>;
};
```

### تجديد الجلسة يدوياً

```jsx
const { renewSession } = useAuthStore();

const handleRenew = () => {
  const success = renewSession();
  if (success) {
    console.log("تم تجديد الجلسة");
  }
};
```

## الإعدادات القابلة للتخصيص

### في sessionManager.js

```javascript
this.SESSION_DURATION = 3 * 60 * 60 * 1000; // 3 ساعات
this.CHECK_INTERVAL = 30 * 1000; // فحص كل 30 ثانية
```

### في SessionWarning.jsx

```javascript
const WARNING_TIME = 15 * 60 * 1000; // تحذير عند 15 دقيقة
const CRITICAL_TIME = 5 * 60 * 1000; // حرج عند 5 دقائق
```

## الأمان والأداء

### الأمان

- حفظ آمن في الكوكيز مع `httpOnly` و `secure`
- التحقق من صحة الجلسة مع الخادم
- تشفير الرموز المميزة
- إزالة فورية عند انتهاء الصلاحية

### الأداء

- فحص كل 30 ثانية (ليس كل ثانية)
- تحديث النشاط محدود (مرة واحدة في الدقيقة)
- تنظيف الذاكرة عند إنهاء الجلسة
- استخدام `localStorage` للبيانات المؤقتة

## استكشاف الأخطاء

### الجلسة لا تعمل

1. تحقق من وجود `SessionProvider` في App.jsx
2. تأكد من تهيئة `sessionManager`
3. فحص الكوكيز في Developer Tools

### التحذيرات لا تظهر

1. تحقق من `showSessionWarning` في AuthStore
2. تأكد من وجود `SessionWarning` component
3. فحص `shouldShowWarning()` function

### النشاط لا يُتتبع

1. تحقق من `useActivityTracker` hook
2. تأكد من عمل event listeners
3. فحص `updateActivity()` calls

## التطوير المستقبلي

### تحسينات مقترحة

- دعم "تذكرني" لمدد أطول
- إعدادات مخصصة لكل مستخدم
- تسجيل أنشطة الجلسة
- دعم عدة جلسات متزامنة
- تحذيرات صوتية

### التكامل مع Backend

- تزامن انتهاء الجلسة مع الخادم
- تسجيل أحداث الجلسة
- إحصائيات استخدام الجلسات
