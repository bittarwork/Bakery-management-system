# 🗺️ إعداد Google Maps API

## 📋 **الخطوات المطلوبة للحصول على Google Maps API Key**

### 1. **إنشاء حساب Google Cloud**

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. سجل دخول بحساب Google الخاص بك
3. أنشئ مشروع جديد أو اختر مشروع موجود

### 2. **تفعيل Maps JavaScript API**

1. في Google Cloud Console، اذهب إلى **"APIs & Services"** > **"Library"**
2. ابحث عن **"Maps JavaScript API"**
3. اضغط على **"Maps JavaScript API"**
4. اضغط **"Enable"**

### 3. **إنشاء API Key**

1. اذهب إلى **"APIs & Services"** > **"Credentials"**
2. اضغط **"Create Credentials"** > **"API Key"**
3. سيتم إنشاء API Key جديد

### 4. **تقييد API Key (مهم للأمان)**

1. اضغط على API Key الذي أنشأته
2. في **"Application restrictions"**:
   - اختر **"HTTP referrers (web sites)"**
   - أضف نطاقاتك:
     ```
     localhost:3000/*
     yourdomain.com/*
     *.yourdomain.com/*
     ```
3. في **"API restrictions"**:
   - اختر **"Restrict key"**
   - اختر **"Maps JavaScript API"**
4. اضغط **"Save"**

### 5. **استخدام API Key في التطبيق**

#### **الطريقة الأولى: متغيرات البيئة**

1. أنشئ ملف `.env` في مجلد `dashboard`:

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

2. استخدم المفتاح في المكون:

```jsx
<StoreMap
  stores={stores}
  mapProvider="google"
  googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
/>
```

#### **الطريقة الثانية: مباشرة في الكود**

```jsx
<StoreMap
  stores={stores}
  mapProvider="google"
  googleMapsApiKey="your_api_key_here"
/>
```

### 6. **إعدادات إضافية (اختيارية)**

#### **تفعيل APIs إضافية:**

- **Places API**: للبحث عن الأماكن
- **Geocoding API**: لتحويل العناوين إلى إحداثيات
- **Directions API**: للحصول على الاتجاهات

#### **إعدادات الفوترة:**

1. اذهب إلى **"Billing"** في Google Cloud Console
2. أضف بطاقة ائتمان (مطلوب حتى مع الاستخدام المجاني)
3. Google يوفر $200 شهرياً مجاناً

---

## 🔧 **استخدام المكون المحسن**

### **مع Leaflet (افتراضي - مجاني):**

```jsx
<StoreMap
  stores={stores}
  mapProvider="leaflet"
  height="400px"
  interactive={true}
/>
```

### **مع Google Maps (يتطلب API Key):**

```jsx
<StoreMap
  stores={stores}
  mapProvider="google"
  googleMapsApiKey="your_api_key_here"
  height="400px"
  interactive={true}
/>
```

---

## ⚠️ **ملاحظات مهمة**

### **الأمان:**

- **لا تشارك API Key** في الكود العام
- استخدم **تقييد النطاقات** دائماً
- راقب **استخدام API** في Google Cloud Console

### **التكلفة:**

- **Leaflet**: مجاني تماماً
- **Google Maps**: $200 شهرياً مجاناً، ثم $7 لكل 1000 طلب

### **الأداء:**

- **Leaflet**: أسرع في التحميل
- **Google Maps**: ميزات أكثر تقدماً

---

## 🚀 **الخطوات السريعة**

### **للحصول على API Key:**

1. https://console.cloud.google.com/
2. إنشاء مشروع جديد
3. تفعيل Maps JavaScript API
4. إنشاء API Key
5. تقييد النطاقات
6. إضافة المفتاح للتطبيق

### **للاختبار:**

```jsx
// في أي صفحة
<StoreMap
  stores={[]}
  mapProvider="google"
  googleMapsApiKey="your_key"
  center={{ lat: 33.3152, lng: 44.3661 }}
  zoom={12}
/>
```

---

## 📞 **الدعم**

إذا واجهت مشاكل:

1. تحقق من تقييدات API Key
2. تأكد من تفعيل Maps JavaScript API
3. راجع logs في Google Cloud Console
4. تأكد من صحة النطاقات المضافة

**النظام يدعم كلا الخيارين: Leaflet (مجاني) و Google Maps (مميز)! 🎯**
