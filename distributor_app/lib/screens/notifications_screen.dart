import 'package:flutter/material.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الإشعارات والتنبيهات')),
      body: const Center(
        child: Text('قائمة الإشعارات والتنبيهات', style: TextStyle(fontSize: 22)),
      ),
    );
  }
} 