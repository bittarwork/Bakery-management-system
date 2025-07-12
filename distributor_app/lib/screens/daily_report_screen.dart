import 'package:flutter/material.dart';

class DailyReportScreen extends StatelessWidget {
  const DailyReportScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('رفع التقرير اليومي')),
      body: const Center(
        child: Text('ملخص اليوم وإرسال التقرير', style: TextStyle(fontSize: 22)),
      ),
    );
  }
} 