import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubits/delivery_cubit.dart';
import '../core/api/api_service.dart';
import '../core/models/delivery.dart';
import '../main.dart';

class DeliveryScreen extends StatefulWidget {
  final int storeId;
  const DeliveryScreen({Key? key, required this.storeId}) : super(key: key);

  @override
  State<DeliveryScreen> createState() => _DeliveryScreenState();
}

class _DeliveryScreenState extends State<DeliveryScreen> {
  final Map<int, TextEditingController> _controllers = {};

  @override
  void dispose() {
    for (var c in _controllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => DeliveryCubit(ApiService())..fetchDelivery(widget.storeId),
      child: BlocConsumer<DeliveryCubit, DeliveryState>(
        listener: (context, state) {
          if (state is DeliveryUpdateSuccess) {
            rootScaffoldMessengerKey.currentState?.showSnackBar(
              const SnackBar(content: Text('تم تحديث الكميات بنجاح')),
            );
          } else if (state is DeliveryUpdateError) {
            rootScaffoldMessengerKey.currentState?.showSnackBar(
              SnackBar(content: Text(state.message)),
            );
          }
        },
        builder: (context, state) {
          if (state is DeliveryLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is DeliveryLoaded) {
            final Delivery delivery = state.delivery;
            for (var item in delivery.items) {
              _controllers[item.id] ??= TextEditingController(text: item.deliveredQuantity.toString());
            }
            return Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('تسليم الطلب', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Expanded(
                    child: ListView(
                      children: delivery.items.map((item) {
                        return ListTile(
                          title: Text(item.productName),
                          subtitle: Text('المطلوب: ${item.quantity} ${item.unit}'),
                          trailing: SizedBox(
                            width: 80,
                            child: TextField(
                              controller: _controllers[item.id],
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(labelText: 'المسلّم'),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () {
                      final items = delivery.items.map((item) => {
                        'id': item.id,
                        'deliveredQuantity': int.tryParse(_controllers[item.id]?.text ?? '') ?? item.deliveredQuantity,
                      }).toList();
                      context.read<DeliveryCubit>().updateQuantities(delivery.id, items);
                    },
                    child: const Text('حفظ الكميات'),
                  ),
                  // يمكن إضافة أقسام للهدايا والمرتجعات هنا
                ],
              ),
            );
          } else if (state is DeliveryError) {
            return Center(child: Text(state.message));
          }
          return const Center(child: Text('لا يوجد بيانات'));
        },
      ),
    );
  }
} 