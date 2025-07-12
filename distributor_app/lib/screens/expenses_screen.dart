import 'package:flutter/material.dart';

class ExpensesScreen extends StatelessWidget {
  const ExpensesScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تسجيل المصاريف اليومية')),
      body: const Center(
        child: Text('تسجيل مصاريف السيارة ورفع الإيصالات', style: TextStyle(fontSize: 22)),
      ),
    );
  }
} 