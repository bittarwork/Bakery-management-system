@echo off
chcp 65001 >nul
echo.
echo 🚀 مرحباً بك في تطبيق توزيع المخبزة
echo ====================================
echo.

:menu
echo اختر العملية التي تريد تنفيذها:
echo.
echo 1. تثبيت Dependencies
echo 2. فحص الإعداد
echo 3. تشغيل التطبيق
echo 4. تشغيل التطبيق مع تسجيل مفصل
echo 5. تنظيف المشروع
echo 6. فحص الأجهزة المتصلة
echo 7. بناء APK للاختبار
echo 8. خروج
echo.
set /p choice="أدخل رقم الخيار (1-8): "

if "%choice%"=="1" goto install_deps
if "%choice%"=="2" goto check_setup
if "%choice%"=="3" goto run_app
if "%choice%"=="4" goto run_verbose
if "%choice%"=="5" goto clean_project
if "%choice%"=="6" goto check_devices
if "%choice%"=="7" goto build_apk
if "%choice%"=="8" goto exit
echo خيار غير صحيح، حاول مرة أخرى
goto menu

:install_deps
echo.
echo 📦 جاري تثبيت Dependencies...
flutter pub get
if %errorlevel% equ 0 (
    echo ✅ تم تثبيت Dependencies بنجاح
) else (
    echo ❌ خطأ في تثبيت Dependencies
)
pause
goto menu

:check_setup
echo.
echo 🔍 جاري فحص الإعداد...
dart setup_check.dart
pause
goto menu

:run_app
echo.
echo 🚀 جاري تشغيل التطبيق...
echo يمكنك الضغط على 'r' لإعادة التحميل السريع أو 'q' للخروج
flutter run
pause
goto menu

:run_verbose
echo.
echo 🚀 جاري تشغيل التطبيق مع تسجيل مفصل...
flutter run --verbose
pause
goto menu

:clean_project
echo.
echo 🧹 جاري تنظيف المشروع...
flutter clean
echo تم تنظيف المشروع
echo جاري إعادة تثبيت Dependencies...
flutter pub get
if %errorlevel% equ 0 (
    echo ✅ تم تنظيف المشروع وإعادة التثبيت بنجاح
) else (
    echo ❌ خطأ في إعادة التثبيت
)
pause
goto menu

:check_devices
echo.
echo 📱 جاري فحص الأجهزة المتصلة...
flutter devices
pause
goto menu

:build_apk
echo.
echo 🔨 جاري بناء APK للاختبار...
flutter build apk --debug
if %errorlevel% equ 0 (
    echo ✅ تم بناء APK بنجاح
    echo يمكنك العثور على الملف في: build\app\outputs\flutter-apk\
) else (
    echo ❌ خطأ في بناء APK
)
pause
goto menu

:exit
echo.
echo 👋 شكراً لاستخدام التطبيق!
exit 