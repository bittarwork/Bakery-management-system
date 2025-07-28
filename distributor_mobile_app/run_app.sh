#!/bin/bash

# تعيين الترميز للعربية
export LC_ALL=en_US.UTF-8

echo ""
echo "🚀 مرحباً بك في تطبيق توزيع المخبزة"
echo "===================================="
echo ""

show_menu() {
    echo "اختر العملية التي تريد تنفيذها:"
    echo ""
    echo "1. تثبيت Dependencies"
    echo "2. فحص الإعداد"
    echo "3. تشغيل التطبيق"
    echo "4. تشغيل التطبيق مع تسجيل مفصل"
    echo "5. تنظيف المشروع"
    echo "6. فحص الأجهزة المتصلة"
    echo "7. بناء APK للاختبار"
    echo "8. خروج"
    echo ""
    read -p "أدخل رقم الخيار (1-8): " choice
}

install_deps() {
    echo ""
    echo "📦 جاري تثبيت Dependencies..."
    flutter pub get
    if [ $? -eq 0 ]; then
        echo "✅ تم تثبيت Dependencies بنجاح"
    else
        echo "❌ خطأ في تثبيت Dependencies"
    fi
    read -p "اضغط Enter للمتابعة..."
}

check_setup() {
    echo ""
    echo "🔍 جاري فحص الإعداد..."
    dart setup_check.dart
    read -p "اضغط Enter للمتابعة..."
}

run_app() {
    echo ""
    echo "🚀 جاري تشغيل التطبيق..."
    echo "يمكنك الضغط على 'r' لإعادة التحميل السريع أو 'q' للخروج"
    flutter run
    read -p "اضغط Enter للمتابعة..."
}

run_verbose() {
    echo ""
    echo "🚀 جاري تشغيل التطبيق مع تسجيل مفصل..."
    flutter run --verbose
    read -p "اضغط Enter للمتابعة..."
}

clean_project() {
    echo ""
    echo "🧹 جاري تنظيف المشروع..."
    flutter clean
    echo "تم تنظيف المشروع"
    echo "جاري إعادة تثبيت Dependencies..."
    flutter pub get
    if [ $? -eq 0 ]; then
        echo "✅ تم تنظيف المشروع وإعادة التثبيت بنجاح"
    else
        echo "❌ خطأ في إعادة التثبيت"
    fi
    read -p "اضغط Enter للمتابعة..."
}

check_devices() {
    echo ""
    echo "📱 جاري فحص الأجهزة المتصلة..."
    flutter devices
    read -p "اضغط Enter للمتابعة..."
}

build_apk() {
    echo ""
    echo "🔨 جاري بناء APK للاختبار..."
    flutter build apk --debug
    if [ $? -eq 0 ]; then
        echo "✅ تم بناء APK بنجاح"
        echo "يمكنك العثور على الملف في: build/app/outputs/flutter-apk/"
    else
        echo "❌ خطأ في بناء APK"
    fi
    read -p "اضغط Enter للمتابعة..."
}

# الحلقة الرئيسية
while true; do
    show_menu
    case $choice in
        1)
            install_deps
            ;;
        2)
            check_setup
            ;;
        3)
            run_app
            ;;
        4)
            run_verbose
            ;;
        5)
            clean_project
            ;;
        6)
            check_devices
            ;;
        7)
            build_apk
            ;;
        8)
            echo ""
            echo "👋 شكراً لاستخدام التطبيق!"
            exit 0
            ;;
        *)
            echo "خيار غير صحيح، حاول مرة أخرى"
            sleep 1
            ;;
    esac
done 