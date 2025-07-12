import 'package:flutter/material.dart';

class PaymentScreen extends StatelessWidget {
  const PaymentScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تحصيل المدفوعات')),
      body: const Center(
        child: Text('اختيار طريقة الدفع، توزيع المبلغ', style: TextStyle(fontSize: 22)),
      ),
    );
  }
} 