# دليل استخدام نظام الجلسات - Session Management Guide

## ملخص سريع

تم تطبيق نظام إدارة جلسات شامل مع **مدة صلاحية 3 ساعات** بالضبط كما طُلب.

## الميزات الرئيسية

### ✅ مدة الجلسة: 3 ساعات بالضبط

- تبدأ العد التنازلي من لحظة تسجيل الدخول
- تسجيل خروج تلقائي عند انتهاء المدة

### ✅ تحذيرات ذكية

- تحذير أول عند بقاء 15 دقيقة
- تحذير حرج عند بقاء 5 دقائق
- عداد تنازلي مرئي في الرأس

### ✅ تتبع النشاط

- تحديث تلقائي عند تفاعل المستخدم
- تمديد الجلسة بناءً على النشاط

### ✅ تجديد الجلسة

- إمكانية تجديد الجلسة بـ 3 ساعات إضافية
- تجديد يدوي أو تلقائي

## كيفية الاستخدام

### للمستخدم النهائي

1. **تسجيل الدخول**: الجلسة تبدأ لمدة 3 ساعات
2. **مراقبة الوقت**: شاهد العداد في أعلى الصفحة
3. **التحذيرات**: ستظهر تنبيهات قبل انتهاء الجلسة
4. **التجديد**: انقر "تجديد الجلسة" لإضافة 3 ساعات

### للمطور

```jsx
// استخدام معلومات الجلسة
import { useAuthStore } from "./stores/authStore";

const MyComponent = () => {
  const { getSessionInfo, renewSession } = useAuthStore();

  const handleRenew = () => {
    renewSession(); // تجديد لـ 3 ساعات إضافية
  };

  return (
    <div>
      الوقت المتبقي: {getSessionInfo().timeRemainingFormatted}
      <button onClick={handleRenew}>تجديد</button>
    </div>
  );
};
```

## الملفات المُضافة/المُعدّلة

### ملفات جديدة:

- `utils/sessionManager.js` - إدارة الجلسات الأساسية
- `components/ui/SessionWarning.jsx` - تحذير انتهاء الجلسة
- `components/ui/SessionTimer.jsx` - عداد الوقت في الرأس
- `hooks/useActivityTracker.js` - تتبع نشاط المستخدم
- `providers/SessionProvider.jsx` - مزود السياق

### ملفات معدّلة:

- `stores/authStore.js` - إضافة إدارة الجلسات
- `App.jsx` - إضافة SessionProvider
- `components/layout/DashboardLayout.jsx` - إضافة SessionTimer

## اختبار النظام

### 1. تسجيل الدخول

```bash
# يجب أن ترى في Console:
"Session created - expires at: [DATE_TIME]"
```

### 2. مراقبة العداد

- شاهد العداد في أعلى يمين الصفحة
- يجب أن يظهر الوقت المتبقي بصيغة `HH:MM:SS`

### 3. اختبار التحذيرات

```javascript
// في Console المطور، لاختبار سريع:
sessionManager.SESSION_DURATION = 5 * 60 * 1000; // 5 دقائق للاختبار
```

### 4. اختبار تتبع النشاط

- حرك الماوس أو اكتب
- يجب تحديث `last_activity` في localStorage

## المشاكل الشائعة وحلولها

### المشكلة: العداد لا يظهر

**الحل**: تأكد من وجود `SessionTimer` في `DashboardLayout`

### المشكلة: التحذيرات لا تظهر

**الحل**: تحقق من `SessionWarning` في `SessionProvider`

### المشكلة: الجلسة لا تنتهي تلقائياً

**الحل**: تحقق من `sessionManager.startSessionMonitoring()`

### المشكلة: النشاط لا يُتتبع

**الحل**: تأكد من تشغيل `useActivityTracker` hook

## تخصيص الإعدادات

### تغيير مدة الجلسة:

```javascript
// في sessionManager.js
this.SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 ساعات بدلاً من 3
```

### تغيير وقت التحذير:

```javascript
// في sessionManager.js
shouldShowWarning() {
    const remaining = this.getRemainingTime();
    return remaining > 0 && remaining <= 10 * 60 * 1000; // 10 دقائق بدلاً من 15
}
```

## الدعم والصيانة

### سجلات التطبيق (Console Logs):

- `"Session created"` - إنشاء جلسة جديدة
- `"Session expired"` - انتهاء الجلسة
- `"Session monitoring started"` - بدء المراقبة
- `"Session renewed"` - تجديد الجلسة

### البيانات المحفوظة:

- **Cookies**: `auth_token` (مع انتهاء صلاحية)
- **localStorage**: `session_data` (معلومات الجلسة)

### تنظيف البيانات:

```javascript
// تنظيف يدوي للجلسة
sessionManager.destroySession();
```

---

**ملاحظة**: النظام مطبق بالكامل ويعمل بمدة 3 ساعات بالضبط كما طُلب. 🚀
