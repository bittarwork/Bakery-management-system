import 'package:flutter/material.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('إعدادات الحساب')),
      body: const Center(
        child: Text('تغيير كلمة المرور، تسجيل الخروج', style: TextStyle(fontSize: 22)),
      ),
    );
  }
} 