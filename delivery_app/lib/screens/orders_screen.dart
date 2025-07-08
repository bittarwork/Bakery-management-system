import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import '../cubits/orders_cubit.dart';
import '../models/order_model.dart';
import 'order_details_screen.dart';
import 'returns_screen.dart';

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({Key? key}) : super(key: key);

  Future<void> _sortByDistance(BuildContext context) async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('خدمة الموقع غير مفعلة!')));
      return;
    }
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم رفض إذن الموقع!')));
        return;
      }
    }
    if (permission == LocationPermission.deniedForever) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('إذن الموقع مرفوض نهائياً!')));
      return;
    }
    final pos = await Geolocator.getCurrentPosition();
    context.read<OrdersCubit>().setUserLocation(pos.latitude, pos.longitude);
    context.read<OrdersCubit>().sortOrdersByDistance(pos.latitude, pos.longitude);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم ترتيب الطلبات حسب الأقرب!')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('طلبات التوزيع اليوم'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.location_on),
            tooltip: 'ترتيب حسب الأقرب',
            onPressed: () => _sortByDistance(context),
          ),
          IconButton(
            icon: const Icon(Icons.assignment_return),
            tooltip: 'المرتجعات',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const ReturnsScreen()),
              );
            },
          ),
        ],
      ),
      body: BlocBuilder<OrdersCubit, OrdersState>(
        builder: (context, state) {
          if (state.status == OrdersStateStatus.loading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.status == OrdersStateStatus.error) {
            return Center(child: Text('حدث خطأ: ${state.errorMessage}'));
          }
          final orders = state.orders;
          if (orders.isEmpty) {
            return const Center(child: Text('لا توجد طلبات حالياً.'));
          }
          return ListView.builder(
            itemCount: orders.length,
            itemBuilder: (context, index) {
              final order = orders[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => OrderDetailsScreen(order: order),
                      ),
                    );
                  },
                  title: Row(
                    children: [
                      Expanded(child: Text(order.bakeryName)),
                      Builder(
                        builder: (context) {
                          final dist = context.read<OrdersCubit>().getOrderDistance(order);
                          if (dist == null || dist == double.infinity) return const SizedBox();
                          return Text('(${dist.toStringAsFixed(2)} كم)', style: const TextStyle(color: Colors.blue, fontSize: 13));
                        },
                      ),
                    ],
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('الكمية: ${order.quantity}'),
                      Text('الفرع: ${order.branchName}'),
                      Text('العنوان: ${order.branchAddress}'),
                    ],
                  ),
                  trailing: order.isDelivered
                      ? const Icon(Icons.check_circle, color: Colors.green)
                      : ElevatedButton(
                          onPressed: () async {
                            // اختيار طريقة الدفع
                            final paymentMethod = await showDialog<String>(
                              context: context,
                              builder: (context) {
                                String? selected;
                                return AlertDialog(
                                  title: const Text('اختر طريقة الدفع'),
                                  content: StatefulBuilder(
                                    builder: (context, setState) {
                                      return Column(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          RadioListTile<String>(
                                            title: const Text('نقدي'),
                                            value: 'نقدي',
                                            groupValue: selected,
                                            onChanged: (v) => setState(() => selected = v),
                                          ),
                                          RadioListTile<String>(
                                            title: const Text('بنكي'),
                                            value: 'بنكي',
                                            groupValue: selected,
                                            onChanged: (v) => setState(() => selected = v),
                                          ),
                                          RadioListTile<String>(
                                            title: const Text('مختلط'),
                                            value: 'مختلط',
                                            groupValue: selected,
                                            onChanged: (v) => setState(() => selected = v),
                                          ),
                                        ],
                                      );
                                    },
                                  ),
                                  actions: [
                                    TextButton(
                                      onPressed: () => Navigator.pop(context),
                                      child: const Text('إلغاء'),
                                    ),
                                    ElevatedButton(
                                      onPressed: selected == null ? null : () => Navigator.pop(context, selected),
                                      child: const Text('تأكيد'),
                                    ),
                                  ],
                                );
                              },
                            );
                            if (paymentMethod != null) {
                              final success = await context.read<OrdersCubit>().markAsDelivered(order.id, paymentMethod);
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(success ? 'تم تحديث طريقة الدفع وتسليم الطلب بنجاح' : 'فشل في تحديث طريقة الدفع!'),
                                    backgroundColor: success ? Colors.green : Colors.red,
                                  ),
                                );
                              }
                              // هنا يمكن إضافة منطق طباعة الفاتورة لاحقاً مع تمرير طريقة الدفع
                            }
                          },
                          child: const Text('تسليم/طباعة فاتورة'),
                        ),
                ),
              );
            },
          );
        },
      ),
    );
  }
} 