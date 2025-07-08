# 🛡️ دليل إدارة الجلسات وتفضيلات المستخدم

## 📖 نظرة عامة

تم إضافة نظامين جديدين للمشروع لتحسين الأمان وتجربة المستخدم:

1. **نظام إدارة الجلسات** - لمراقبة الجلسات النشطة والتحكم بالأمان
2. **نظام تفضيلات المستخدم** - لحفظ الإعدادات الشخصية

---

## 🛡️ نظام إدارة الجلسات

### الميزات الرئيسية

- **تتبع الجلسات النشطة** لكل مستخدم
- **معلومات الجهاز والموقع** لكل جلسة
- **إنهاء الجلسات عن بعد** من أجهزة أخرى
- **انتهاء صلاحية تلقائي** للجلسات
- **تسجيل الخروج من جميع الأجهزة**

### 🔧 استخدام API

#### تسجيل الدخول مع إنشاء جلسة

```javascript
// POST /api/sessions/login
{
  "username": "username",
  "password": "password",
  "remember_me": false  // اختياري
}
```

#### الحصول على الجلسات النشطة

```javascript
// GET /api/sessions/active
// الاستجابة:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "device_info": {
        "userAgent": "Mozilla/5.0...",
        "browser": "Chrome",
        "platform": "Windows"
      },
      "ip_address": "192.168.1.100",
      "login_time": "2024-01-15T10:30:00Z",
      "last_activity": "2024-01-15T14:20:00Z",
      "is_current": true
    }
  ]
}
```

#### إنهاء جلسة محددة

```javascript
// DELETE /api/sessions/{sessionId}
```

#### تسجيل الخروج من جميع الأجهزة

```javascript
// POST /api/sessions/logout-all
```

### 🎨 استخدام الواجهة الأمامية

```jsx
import SessionManager from "../components/SessionManager.jsx";

function App() {
  const [showSessionManager, setShowSessionManager] = useState(false);

  return (
    <div>
      <button onClick={() => setShowSessionManager(true)}>إدارة الجلسات</button>

      <SessionManager
        isOpen={showSessionManager}
        onClose={() => setShowSessionManager(false)}
      />
    </div>
  );
}
```

---

## ⚙️ نظام تفضيلات المستخدم

### الإعدادات المدعومة

#### الإعدادات العامة

- **اللغة**: العربية، الإنجليزية، الفرنسية، الهولندية
- **المظهر**: فاتح، داكن، تلقائي
- **المنطقة الزمنية**: Europe/Brussels (افتراضي)
- **العملة**: EUR (افتراضي)
- **تنسيق التاريخ**: DD/MM/YYYY، MM/DD/YYYY، YYYY-MM-DD
- **تنسيق الوقت**: 12h، 24h
- **تسجيل الخروج التلقائي**: بالدقائق (30-1440)

#### إعدادات الإشعارات

- **البريد الإلكتروني**: تشغيل/إيقاف
- **الإشعارات المدفوعة**: تشغيل/إيقاف
- **الرسائل النصية**: تشغيل/إيقاف
- **إشعارات الطلبات**: تشغيل/إيقاف
- **إشعارات المدفوعات**: تشغيل/إيقاف
- **إشعارات النظام**: تشغيل/إيقاف

#### تفضيلات العرض

- **عدد العناصر في الصفحة**: 10-100
- **عرض الصور**: تشغيل/إيقاف
- **عرض الأوصاف**: تشغيل/إيقاف
- **العرض الافتراضي**: جدول، شبكة، قائمة

#### إعدادات إمكانية الوصول

- **التباين العالي**: تشغيل/إيقاف
- **النص الكبير**: تشغيل/إيقاف
- **قارئ الشاشة**: تشغيل/إيقاف
- **التنقل بلوحة المفاتيح**: تشغيل/إيقاف

#### إعدادات الخصوصية

- **مشاركة النشاط**: تشغيل/إيقاف
- **التحليلات**: تشغيل/إيقاف
- **التسويق**: تشغيل/إيقاف

### 🔧 استخدام API

#### الحصول على تفضيلات المستخدم

```javascript
// GET /api/preferences
// الاستجابة:
{
  "success": true,
  "data": {
    "general": {
      "language": "ar",
      "theme": "light",
      "timezone": "Europe/Brussels",
      "currency": "EUR",
      "date_format": "DD/MM/YYYY",
      "time_format": "24h",
      "auto_logout": 480
    },
    "notifications": {
      "email": true,
      "push": true,
      "sms": false,
      "orders": true,
      "payments": true,
      "system": true
    }
    // ... باقي الإعدادات
  }
}
```

#### تحديث الإعدادات العامة

```javascript
// PUT /api/preferences/general
{
  "language": "en",
  "theme": "dark",
  "date_format": "MM/DD/YYYY"
}
```

#### تحديث اللغة سريعاً

```javascript
// PUT /api/preferences/language
{
  "language": "en"
}
```

#### إعادة تعيين التفضيلات

```javascript
// POST /api/preferences/reset
{
  "section": "general"  // أو notifications، display، accessibility، privacy
}
// أو لإعادة تعيين جميع التفضيلات:
{
  "section": null
}
```

### 🎨 استخدام الواجهة الأمامية

```jsx
import PreferencesSettings from "../components/PreferencesSettings.jsx";

function App() {
  const [showPreferences, setShowPreferences] = useState(false);

  return (
    <div>
      <button onClick={() => setShowPreferences(true)}>الإعدادات</button>

      <PreferencesSettings
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </div>
  );
}
```

---

## 🔒 اعتبارات الأمان

### إدارة الجلسات

- **تشفير التوكنات**: جميع session tokens مشفرة
- **انتهاء الصلاحية**: جلسات تنتهي تلقائياً
- **تتبع IP**: مراقبة عناوين IP للجلسات
- **معلومات الجهاز**: تسجيل معلومات المتصفح ونظام التشغيل

### تفضيلات المستخدم

- **التحقق من الصحة**: جميع البيانات المدخلة محققة
- **الصلاحيات**: كل مستخدم يصل لتفضيلاته فقط
- **قيم افتراضية آمنة**: إعدادات افتراضية محافظة على الخصوصية

---

## 🛠️ التطوير والصيانة

### تنظيف الجلسات المنتهية

```javascript
// تشغيل دوري (cron job مقترح)
// POST /api/sessions/cleanup
```

### مراقبة الأداء

```javascript
// إحصائيات الجلسات النشطة
const activeSessionsCount = await UserSession.count({
  where: { is_active: true },
});

// إحصائيات التفضيلات
const preferencesStats = await UserPreferences.findAll({
  attributes: [
    "language",
    [sequelize.fn("COUNT", sequelize.col("language")), "count"],
  ],
  group: ["language"],
});
```

### قاعدة البيانات

#### جدول user_sessions

```sql
CREATE TABLE user_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  device_info JSON,
  ip_address VARCHAR(45),
  location JSON,
  login_time DATETIME NOT NULL,
  last_activity DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  logout_time DATETIME,
  logout_reason ENUM('manual', 'timeout', 'forced', 'security'),
  created_at DATETIME,
  updated_at DATETIME
);
```

#### جدول user_preferences

```sql
CREATE TABLE user_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  language ENUM('ar', 'en', 'fr', 'nl') DEFAULT 'ar',
  theme ENUM('light', 'dark', 'auto') DEFAULT 'light',
  timezone VARCHAR(50) DEFAULT 'Europe/Brussels',
  currency VARCHAR(3) DEFAULT 'EUR',
  date_format ENUM('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD') DEFAULT 'DD/MM/YYYY',
  time_format ENUM('12h', '24h') DEFAULT '24h',
  notifications JSON,
  dashboard_layout JSON,
  display_preferences JSON,
  accessibility JSON,
  privacy_settings JSON,
  auto_logout INT DEFAULT 480,
  created_at DATETIME,
  updated_at DATETIME
);
```

---

## 📱 أفضل الممارسات

1. **للمطورين**:

   - استخدم `sessionAPI` و `preferencesAPI` للتفاعل مع النظام
   - اختبر انتهاء صلاحية الجلسات بانتظام
   - تأكد من التحقق من صحة البيانات قبل الإرسال

2. **للمستخدمين**:

   - راجع الجلسات النشطة بشكل دوري
   - استخدم "تذكرني" بحذر على الأجهزة المشتركة
   - اضبط إعدادات الخصوصية حسب احتياجاتك

3. **للمسؤولين**:
   - راقب الجلسات المشبوهة
   - فعّل تنظيف الجلسات المنتهية
   - احتفظ بنسخ احتياطية من إعدادات المستخدمين

---

## 🆘 استكشاف الأخطاء

### مشاكل شائعة

1. **"الجلسة منتهية الصلاحية"**

   - الحل: تسجيل دخول جديد أو تمديد الجلسة

2. **"فشل في حفظ التفضيلات"**

   - تحقق من صحة البيانات المرسلة
   - تأكد من وجود اتصال بالإنترنت

3. **"لا يمكن إنهاء الجلسة"**
   - تحقق من صلاحيات المستخدم
   - تأكد من أن الجلسة لا تزال نشطة

### رسائل الخطأ

```javascript
// أمثلة على معالجة الأخطاء
try {
  await sessionAPI.terminateSession(sessionId);
} catch (error) {
  if (error.error_code === "SESSION_EXPIRED") {
    // إعادة توجيه لتسجيل الدخول
    window.location.href = "/login";
  } else {
    // عرض رسالة خطأ عامة
    alert(error.message);
  }
}
```

---

_آخر تحديث: يناير 2024_
