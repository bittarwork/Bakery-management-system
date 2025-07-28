# 🚀 دليل تشغيل تطبيق الموبايل على Android Studio

> **دليل شامل لتعلم كيفية تشغيل وتجربة تطبيق توزيع المخبزة على Android Studio**

---

## 📋 جدول المحتويات

1. [المتطلبات الأساسية](#المتطلبات-الأساسية)
2. [إعداد بيئة التطوير](#إعداد-بيئة-التطوير)
3. [تحضير المشروع](#تحضير-المشروع)
4. [تشغيل التطبيق](#تشغيل-التطبيق)
5. [اختبار التطبيق](#اختبار-التطبيق)
6. [حل المشاكل الشائعة](#حل-المشاكل-الشائعة)
7. [نصائح للتطوير](#نصائح-للتطوير)

---

## 🔧 المتطلبات الأساسية

### 1. متطلبات النظام

- **نظام التشغيل**: Windows 10/11, macOS 10.14+, أو Linux
- **ذاكرة RAM**: 8 GB كحد أدنى (16 GB مُوصى به)
- **مساحة التخزين**: 10 GB مساحة فارغة على الأقل
- **معالج**: Intel i5 أو AMD Ryzen 5 أو أعلى

### 2. البرامج المطلوبة

✅ **Android Studio** (أحدث إصدار)  
✅ **Flutter SDK** (الإصدار 3.10.0 أو أحدث)  
✅ **Dart SDK** (الإصدار 3.0.0 أو أحدث)  
✅ **Git** لإدارة الكود المصدري  
✅ **Java JDK** (الإصدار 11 أو أحدث)

---

## 🛠️ إعداد بيئة التطوير

### الخطوة 1: تثبيت Android Studio

1. **تحميل Android Studio**:

   - اذهب إلى: https://developer.android.com/studio
   - حمل النسخة المناسبة لنظام التشغيل الخاص بك
   - اتبع خطوات التثبيت

2. **إعداد Android Studio**:
   ```
   - افتح Android Studio
   - اختر "More Actions" > "SDK Manager"
   - تأكد من تثبيت:
     • Android SDK (API 29 أو أحدث)
     • Android SDK Build-Tools
     • Android Emulator
     • Intel x86 Emulator Accelerator (HAXM)
   ```

### الخطوة 2: تثبيت Flutter SDK

#### على Windows:

1. **تحميل Flutter**:

   ```powershell
   # انتقل إلى مجلد C:\
   cd C:\

   # قم بتحميل Flutter من الموقع الرسمي
   # https://flutter.dev/docs/get-started/install/windows
   ```

2. **إضافة Flutter إلى PATH**:
   ```
   - افتح "Environment Variables"
   - أضف C:\flutter\bin إلى متغير PATH
   - أعد تشغيل Terminal
   ```

#### على macOS/Linux:

```bash
# تحميل Flutter
git clone https://github.com/flutter/flutter.git -b stable

# إضافة إلى PATH في ~/.bashrc أو ~/.zshrc
export PATH="$PATH:`pwd`/flutter/bin"

# إعادة تحميل الـ profile
source ~/.bashrc  # أو ~/.zshrc
```

### الخطوة 3: التحقق من التثبيت

```bash
# تحقق من تثبيت Flutter
flutter doctor

# يجب أن ترى نتيجة مشابهة لهذه:
# ✓ Flutter (Channel stable, 3.x.x)
# ✓ Android toolchain
# ✓ Connected device
```

---

## 📱 تحضير المشروع

### الخطوة 1: فتح المشروع في Android Studio

1. **فتح المشروع**:

   ```
   - افتح Android Studio
   - اختر "Open an existing project"
   - انتقل إلى مجلد المشروع: distributor_mobile_app/
   - اضغط "OK"
   ```

2. **التحقق من إعدادات Flutter**:
   ```
   - اذهب إلى File > Settings (أو Preferences على Mac)
   - ابحث عن "Flutter"
   - تأكد من تحديد مسار Flutter SDK الصحيح
   ```

### الخطوة 2: تثبيت Dependencies

1. **فتح Terminal في Android Studio**:

   ```
   - اذهب إلى View > Tool Windows > Terminal
   - تأكد من أنك في مجلد distributor_mobile_app/
   ```

2. **تثبيت الحزم**:

   ```bash
   # تثبيت جميع dependencies
   flutter pub get

   # تحديث الحزم (اختياري)
   flutter pub upgrade
   ```

### الخطوة 3: إعداد المحاكي أو الجهاز

#### خيار أ: استخدام المحاكي (Emulator)

1. **إنشاء محاكي جديد**:

   ```
   - في Android Studio: Tools > AVD Manager
   - اضغط "+ Create Virtual Device"
   - اختر جهاز (مثل Pixel 4)
   - اختر نظام التشغيل (API 29 أو أحدث)
   - اضغط "Finish"
   ```

2. **تشغيل المحاكي**:
   ```
   - اضغط على زر التشغيل بجانب المحاكي المُنشأ
   - انتظر حتى يتم تحميل النظام بالكامل
   ```

#### خيار ب: استخدام جهاز حقيقي

1. **تفعيل وضع المطور**:

   ```
   - اذهب إلى Settings > About Phone
   - اضغط على "Build Number" 7 مرات
   - ارجع إلى Settings > Developer Options
   - فعّل "USB Debugging"
   ```

2. **توصيل الجهاز**:
   ```
   - صل الجهاز بالكمبيوتر عبر USB
   - اقبل طلب الموافقة على الاتصال
   - تحقق من ظهور الجهاز في قائمة الأجهزة في Android Studio
   ```

---

## 🚀 تشغيل التطبيق

### الطريقة الأولى: عبر Android Studio

1. **اختيار الجهاز**:

   ```
   - في شريط الأدوات العلوي
   - اختر الجهاز أو المحاكي من القائمة المنسدلة
   ```

2. **تشغيل التطبيق**:
   ```
   - اضغط على زر "Run" (الرمز الأخضر ▶️)
   - أو استخدم الاختصار: Shift + F10 (Windows) / Ctrl + R (Mac)
   ```

### الطريقة الثانية: عبر Terminal

```bash
# التأكد من الأجهزة المتاحة
flutter devices

# تشغيل التطبيق على الجهاز المتصل
flutter run

# تشغيل التطبيق في وضع Debug
flutter run --debug

# تشغيل التطبيق في وضع Release (للاختبار النهائي)
flutter run --release
```

### الخطوة 3: التحقق من التشغيل الناجح

عند التشغيل الناجح، ستلاحظ:

- ✅ ظهور شاشة تسجيل الدخول
- ✅ النصوص باللغة العربية تظهر بشكل صحيح
- ✅ عدم وجود أخطاء في Console
- ✅ التطبيق يستجيب للمس

---

## 🧪 اختبار التطبيق

### 1. اختبار تسجيل الدخول

**بيانات اختبار للموزع**:

```
اسم المستخدم: distributor1
كلمة المرور: password123
```

**بيانات اختبار للمدير**:

```
اسم المستخدم: admin
كلمة المرور: admin123
```

### 2. اختبار الميزات الأساسية

1. **تسجيل الدخول**:

   - أدخل بيانات المستخدم
   - تحقق من نجاح تسجيل الدخول
   - تحقق من ظهور الشاشة الرئيسية

2. **لوحة التحكم**:

   - تحقق من ظهور إحصائيات اليوم
   - تحقق من عدد الطلبات
   - تحقق من المبالغ المجمعة

3. **قائمة الطلبات**:

   - اضغط على "طلبات اليوم"
   - تحقق من ظهور قائمة الطلبات
   - اضغط على طلب لعرض التفاصيل

4. **تحديث حالة الطلب**:
   - في تفاصيل الطلب، غيّر الحالة
   - تحقق من حفظ التغيير
   - تحقق من ظهور رسالة التأكيد

### 3. اختبار الاتصال بالخادم

```bash
# تشغيل التطبيق مع تسجيل شبكة مفصل
flutter run --verbose
```

تحقق من:

- ✅ نجاح الاتصال بـ API
- ✅ استقبال البيانات من الخادم
- ✅ إرسال التحديثات بنجاح

---

## 🔧 حل المشاكل الشائعة

### مشكلة 1: خطأ في تثبيت Dependencies

**الأعراض**:

```
Running "flutter pub get" in distributor_mobile_app...
Error: Could not resolve dependencies
```

**الحل**:

```bash
# مسح cache
flutter clean

# إعادة تثبيت
flutter pub get

# في حالة استمرار المشكلة
flutter pub deps --json
```

### مشكلة 2: المحاكي لا يعمل

**الأعراض**:

- المحاكي يتوقف عند التشغيل
- رسالة خطأ HAXM

**الحل**:

```
1. تأكد من تفعيل Virtualization في BIOS
2. تثبيت Intel HAXM:
   - اذهب إلى SDK Manager
   - تثبيت Intel x86 Emulator Accelerator
3. إعادة تشغيل الكمبيوتر
```

### مشكلة 3: خطأ في الاتصال بـ API

**الأعراض**:

```
DioError [DioErrorType.connectTimeout]: Connecting timeout
```

**الحل**:

1. **تحقق من عنوان الخادم**:

   ```dart
   // في ملف lib/core/constants/app_constants.dart
   static const String baseUrl = 'https://bakery-management-system-production.up.railway.app/api';
   ```

2. **تحقق من الاتصال بالإنترنت**:

   ```bash
   # اختبار الاتصال
   ping bakery-management-system-production.up.railway.app
   ```

3. **تحقق من أذونات الشبكة**:
   ```xml
   <!-- في android/app/src/main/AndroidManifest.xml -->
   <uses-permission android:name="android.permission.INTERNET" />
   ```

### مشكلة 4: مشاكل النصوص العربية

**الأعراض**:

- النصوص تظهر كمربعات فارغة
- اتجاه النص خاطئ

**الحل**:

1. **تحقق من إعدادات اللغة**:

   ```dart
   // في lib/main.dart
   locale: const Locale('ar', 'SA'),
   ```

2. **تحقق من الخطوط**:
   ```yaml
   # في pubspec.yaml
   fonts:
     - family: Cairo
       fonts:
         - asset: assets/fonts/Cairo-Regular.ttf
   ```

### مشكلة 5: أخطاء البناء (Build Errors)

**الأعراض**:

```
FAILURE: Build failed with an exception.
```

**الحلول**:

```bash
# 1. تنظيف المشروع
flutter clean

# 2. إعادة بناء
flutter pub get

# 3. إعادة بناء كاملة
flutter run --verbose

# 4. في حالة أخطاء Android
cd android
./gradlew clean
cd ..
flutter run
```

---

## 💡 نصائح للتطوير

### 1. استخدام Hot Reload

```bash
# أثناء تشغيل التطبيق، اضغط:
r    # لإعادة تحميل التطبيق
R    # لإعادة تشغيل التطبيق كاملاً
q    # للخروج من وضع التشغيل
```

### 2. تصحيح الأخطاء (Debugging)

1. **استخدام Breakpoints**:

   ```
   - اضغط بجانب رقم السطر لإضافة breakpoint
   - شغّل التطبيق في وضع Debug
   - استخدم Debug Console لفحص المتغيرات
   ```

2. **استخدام Flutter Inspector**:
   ```
   - اذهب إلى View > Tool Windows > Flutter Inspector
   - فحص شجرة Widget
   - تحليل مشاكل الأداء
   ```

### 3. مراقبة الأداء

```bash
# مراقبة استهلاك الذاكرة
flutter run --profile

# تحليل حجم التطبيق
flutter build apk --analyze-size
```

### 4. اختبار على أجهزة مختلفة

1. **أحجام شاشات مختلفة**:

   - اختبر على محاكيات بأحجام مختلفة
   - تحقق من responsive design

2. **إصدارات Android مختلفة**:
   - اختبر على API 28, 29, 30+
   - تحقق من compatibility

### 5. فحص الكود

```bash
# تحليل جودة الكود
flutter analyze

# تشغيل الاختبارات
flutter test

# فحص أمان التطبيق
flutter build apk --obfuscate --split-debug-info=debug-info
```

---

## 📊 مراقبة حالة التطبيق أثناء التطوير

### 1. فحص حالة الاتصال

```dart
// إضافة هذا الكود لمراقبة API calls
print('API Call: ${response.requestOptions.uri}');
print('Response: ${response.statusCode}');
```

### 2. مراقبة استهلاك البطارية

```bash
# تشغيل مع مراقبة الأداء
flutter run --profile
```

### 3. فحص التخزين المحلي

```dart
// للتحقق من البيانات المخزنة
final prefs = await SharedPreferences.getInstance();
print('Stored data: ${prefs.getString('user_data')}');
```

---

## 🎯 الخلاصة

باتباع هذا الدليل، ستتمكن من:

✅ **إعداد بيئة التطوير بشكل صحيح**  
✅ **تشغيل التطبيق على Android Studio**  
✅ **اختبار جميع ميزات التطبيق**  
✅ **حل المشاكل الشائعة**  
✅ **تطوير وتحسين التطبيق**

---

## 📞 طلب المساعدة

إذا واجهت مشاكل لم تُذكر في هذا الدليل:

1. **تحقق من Flutter Doctor**:

   ```bash
   flutter doctor -v
   ```

2. **راجع سجلات الأخطاء**:

   ```bash
   flutter logs
   ```

3. **راجع الوثائق الرسمية**:
   - [Flutter Documentation](https://flutter.dev/docs)
   - [Android Studio Guide](https://developer.android.com/studio/intro)

---

**تم إعداد هذا الدليل بواسطة**: فريق تطوير نظام إدارة المخبزة  
**تاريخ آخر تحديث**: يناير 2025  
**الإصدار**: 1.0.0

---

> 💡 **نصيحة مهمة**: احتفظ بهذا الملف مرجعاً لك أثناء التطوير، وتأكد من متابعة التحديثات الجديدة للأدوات والمكتبات المستخدمة.
