import 'package:flutter/material.dart';

class DeliveryScreen extends StatelessWidget {
  const DeliveryScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تسليم الطلب')),
      body: const Center(
        child: Text('تعديل الكميات، تسجيل الهدايا، المرتجعات', style: TextStyle(fontSize: 22)),
      ),
    );
  }
} 