// 🛠️ ملف التحقق من إعداد المشروع
// استخدم هذا الملف للتأكد من أن كل شيء يعمل بشكل صحيح

import 'dart:io';
import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  print('🚀 بدء فحص إعداد تطبيق الموبايل...\n');
  
  // 1. فحص Flutter
  await checkFlutter();
  
  // 2. فحص المتطلبات
  await checkDependencies();
  
  // 3. فحص الاتصال بالخادم
  await checkServerConnection();
  
  // 4. فحص إعدادات المشروع
  await checkProjectSettings();
  
  print('\n✅ تم الانتهاء من فحص الإعداد!');
  print('📱 يمكنك الآن تشغيل التطبيق باستخدام: flutter run');
}

// فحص Flutter
Future<void> checkFlutter() async {
  print('📋 فحص Flutter...');
  
  try {
    final result = await Process.run('flutter', ['--version']);
    if (result.exitCode == 0) {
      final version = result.stdout.toString();
      if (version.contains('Flutter 3.')) {
        print('✅ Flutter مثبت بنجاح - ${version.split('\n')[0]}');
      } else {
        print('⚠️  Flutter مثبت ولكن قد تحتاج إلى تحديث للإصدار 3.10+');
      }
    } else {
      print('❌ Flutter غير مثبت أو غير متاح في PATH');
      print('   قم بتثبيت Flutter من: https://flutter.dev');
    }
  } catch (e) {
    print('❌ خطأ في فحص Flutter: $e');
  }
  
  print('');
}

// فحص المتطلبات
Future<void> checkDependencies() async {
  print('📦 فحص Dependencies...');
  
  // فحص pubspec.yaml
  final pubspecFile = File('pubspec.yaml');
  if (await pubspecFile.exists()) {
    print('✅ ملف pubspec.yaml موجود');
    
    // فحص flutter pub get
    try {
      final result = await Process.run('flutter', ['pub', 'deps'], 
          workingDirectory: Directory.current.path);
      if (result.exitCode == 0) {
        print('✅ جميع dependencies مثبتة بنجاح');
      } else {
        print('⚠️  قد تحتاج إلى تشغيل: flutter pub get');
      }
    } catch (e) {
      print('⚠️  تحقق من تثبيت dependencies: flutter pub get');
    }
  } else {
    print('❌ ملف pubspec.yaml غير موجود - تأكد من أنك في مجلد المشروع الصحيح');
  }
  
  // فحص الملفات المهمة
  final importantFiles = [
    'lib/main.dart',
    'lib/core/constants/app_constants.dart',
    'lib/core/api/api_client.dart',
  ];
  
  for (String filePath in importantFiles) {
    final file = File(filePath);
    if (await file.exists()) {
      print('✅ $filePath موجود');
    } else {
      print('❌ $filePath غير موجود');
    }
  }
  
  print('');
}

// فحص الاتصال بالخادم
Future<void> checkServerConnection() async {
  print('🌐 فحص الاتصال بالخادم...');
  
  const String baseUrl = 'https://bakery-management-system-production.up.railway.app';
  
  try {
    // فحص الخادم الأساسي
    final response = await http.get(
      Uri.parse('$baseUrl/api/health'),
      headers: {'Content-Type': 'application/json'},
    ).timeout(Duration(seconds: 10));
    
    if (response.statusCode == 200) {
      print('✅ الخادم متاح ويعمل بشكل طبيعي');
      print('   الاستجابة: ${response.statusCode}');
    } else {
      print('⚠️  الخادم متاح ولكن الاستجابة غير طبيعية: ${response.statusCode}');
    }
  } catch (e) {
    print('❌ خطأ في الاتصال بالخادم: $e');
    print('   تحقق من:');
    print('   - الاتصال بالإنترنت');
    print('   - عنوان الخادم في app_constants.dart');
    
    // اختبار ping
    try {
      final pingResult = await Process.run('ping', ['-c', '3', 'bakery-management-system-production.up.railway.app']);
      if (pingResult.exitCode == 0) {
        print('✅ ping للخادم نجح - المشكلة قد تكون في API');
      } else {
        print('❌ ping للخادم فشل - تحقق من الاتصال بالإنترنت');
      }
    } catch (e) {
      print('   لا يمكن اختبار ping: $e');
    }
  }
  
  print('');
}

// فحص إعدادات المشروع
Future<void> checkProjectSettings() async {
  print('⚙️  فحص إعدادات المشروع...');
  
  // فحص Android manifest
  final androidManifest = File('android/app/src/main/AndroidManifest.xml');
  if (await androidManifest.exists()) {
    final content = await androidManifest.readAsString();
    if (content.contains('android.permission.INTERNET')) {
      print('✅ إذن الإنترنت موجود في Android Manifest');
    } else {
      print('⚠️  إذن الإنترنت مفقود في Android Manifest');
      print('   أضف: <uses-permission android:name="android.permission.INTERNET" />');
    }
    
    if (content.contains('android.permission.ACCESS_FINE_LOCATION')) {
      print('✅ إذن الموقع موجود في Android Manifest');
    } else {
      print('⚠️  إذن الموقع مفقود - قد تحتاجه لميزات الخرائط');
    }
  } else {
    print('⚠️  ملف Android Manifest غير موجود');
  }
  
  // فحص ملف الثوابت
  final constantsFile = File('lib/core/constants/app_constants.dart');
  if (await constantsFile.exists()) {
    print('✅ ملف الثوابت موجود');
    final content = await constantsFile.readAsString();
    if (content.contains('bakery-management-system-production.up.railway.app')) {
      print('✅ عنوان الخادم محدد بشكل صحيح');
    } else {
      print('⚠️  تحقق من عنوان الخادم في app_constants.dart');
    }
  }
  
  print('');
} 