import 'package:flutter/material.dart';

class InventoryScreen extends StatelessWidget {
  const InventoryScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('مخزون السيارة')),
      body: const Center(
        child: Text('عرض محتوى السيارة الحالي', style: TextStyle(fontSize: 22)),
      ),
    );
  }
} 