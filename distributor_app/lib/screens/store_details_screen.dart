import 'package:flutter/material.dart';

class StoreDetailsScreen extends StatelessWidget {
  const StoreDetailsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تفاصيل المحل')),
      body: const Center(
        child: Text('رصيد، سياسة هدايا، سجل الطلبات', style: TextStyle(fontSize: 22)),
      ),
    );
  }
} 