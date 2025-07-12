import 'package:flutter/material.dart';

class DistributionScheduleScreen extends StatelessWidget {
  const DistributionScheduleScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('جدول التوزيع اليومي')),
      body: const Center(
        child: Text('قائمة المحلات + خريطة', style: TextStyle(fontSize: 22)),
      ),
    );
  }
} 