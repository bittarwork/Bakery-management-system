import 'package:flutter/material.dart';
import 'orders_screen.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubits/orders_cubit.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('تسجيل دخول الموزع'),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Center(
              child: Column(
                children: [
                  Image.asset(
                    'assets/logo.png',
                    height: 100,
                    width: 100,
                    fit: BoxFit.contain,
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
            TextField(
              decoration: const InputDecoration(
                labelText: 'البريد الإلكتروني',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            TextField(
              decoration: const InputDecoration(
                labelText: 'كلمة المرور',
                border: OutlineInputBorder(),
              ),
              obscureText: true,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  // استدعاء جلب الطلبات من API
                  await context.read<OrdersCubit>().fetchOrders();
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (context) => const OrdersScreen()),
                  );
                },
                child: const Text('تسجيل الدخول'),
              ),
            ),
          ],
        ),
      ),
    );
  }
} 