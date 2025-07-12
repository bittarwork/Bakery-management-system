import 'package:flutter/material.dart';
import '../core/models/store.dart';
import 'delivery_screen.dart';
import 'payment_screen.dart';

class StoreDetailsScreen extends StatelessWidget {
  final Store store;
  const StoreDetailsScreen({Key? key, required this.store}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(store.name)),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('العنوان: ${store.address}', style: const TextStyle(fontSize: 18)),
            const SizedBox(height: 12),
            Text('الرصيد الحالي: ${store.balance.toStringAsFixed(2)}', style: const TextStyle(fontSize: 18)),
            const SizedBox(height: 12),
            if (store.giftPolicy != null)
              Text('سياسة الهدايا: ${store.giftPolicy}', style: const TextStyle(fontSize: 18)),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.delivery_dining),
                    label: const Text('تسليم الطلب'),
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => DeliveryScreen(storeId: store.id),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.payment),
                    label: const Text('المدفوعات'),
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const PaymentScreen(), // يمكن تمرير storeId عند الحاجة
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
} 