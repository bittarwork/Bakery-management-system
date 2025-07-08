import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubits/returns_cubit.dart';
import '../models/return_model.dart';
import '../cubits/orders_cubit.dart';
import '../models/order_model.dart';
import 'package:uuid/uuid.dart';

class ReturnsScreen extends StatefulWidget {
  const ReturnsScreen({Key? key}) : super(key: key);

  @override
  State<ReturnsScreen> createState() => _ReturnsScreenState();
}

class _ReturnsScreenState extends State<ReturnsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<ReturnsCubit>().fetchReturns());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('المرتجعات'),
        centerTitle: true,
      ),
      body: BlocBuilder<ReturnsCubit, List<ReturnModel>>(
        builder: (context, returns) {
          if (returns.isEmpty) {
            return const Center(child: Text('لا توجد مرتجعات حالياً.'));
          }
          return ListView.builder(
            itemCount: returns.length,
            itemBuilder: (context, index) {
              final ret = returns[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  title: Text('منتج: ${ret.productName}'),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('الكمية: ${ret.quantity}'),
                      Text('المتجر: ${ret.branchName}'),
                      Text('رقم الطلب: ${ret.orderId}'),
                      Text('السبب: ${ret.reason}'),
                      Text('التاريخ: ${ret.date.toString().split(" ")[0]}'),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final orders = context.read<OrdersCubit>().state.orders.where((o) => o.isDelivered).toList();
          if (orders.isEmpty) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('لا يوجد طلبات مسلمة للاختيار منها!')));
            return;
          }
          String? selectedOrderId;
          String? selectedProduct;
          int? quantity;
          String? reason;
          final result = await showDialog<bool>(
            context: context,
            builder: (context) {
              return AlertDialog(
                title: const Text('إضافة مرتجع جديد'),
                content: StatefulBuilder(
                  builder: (context, setState) {
                    final selectedOrder = orders.firstWhere((o) => o.id == selectedOrderId, orElse: () => orders.first);
                    return SingleChildScrollView(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          DropdownButtonFormField<String>(
                            value: selectedOrderId,
                            items: orders.map((o) => DropdownMenuItem(
                              value: o.id,
                              child: Text('${o.branchName} - ${o.bakeryName}'),
                            )).toList(),
                            onChanged: (v) => setState(() => selectedOrderId = v),
                            decoration: const InputDecoration(labelText: 'اختر الطلب'),
                          ),
                          const SizedBox(height: 8),
                          TextFormField(
                            decoration: const InputDecoration(labelText: 'اسم المنتج'),
                            initialValue: selectedOrder.bakeryName,
                            onChanged: (v) => selectedProduct = v,
                          ),
                          const SizedBox(height: 8),
                          TextFormField(
                            decoration: const InputDecoration(labelText: 'الكمية'),
                            keyboardType: TextInputType.number,
                            onChanged: (v) => quantity = int.tryParse(v),
                          ),
                          const SizedBox(height: 8),
                          TextFormField(
                            decoration: const InputDecoration(labelText: 'سبب الإرجاع'),
                            onChanged: (v) => reason = v,
                          ),
                        ],
                      ),
                    );
                  },
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context, false),
                    child: const Text('إلغاء'),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      if (selectedOrderId != null && selectedProduct != null && quantity != null && reason != null && quantity! > 0) {
                        Navigator.pop(context, true);
                      }
                    },
                    child: const Text('إضافة'),
                  ),
                ],
              );
            },
          );
          if (result == true) {
            final selectedOrder = orders.firstWhere((o) => o.id == selectedOrderId);
            final ret = ReturnModel(
              id: const Uuid().v4(),
              orderId: selectedOrder.id,
              branchName: selectedOrder.branchName,
              productName: selectedProduct ?? selectedOrder.bakeryName,
              quantity: quantity!,
              reason: reason!,
              date: DateTime.now(),
            );
            final success = await context.read<ReturnsCubit>().addReturn(ret);
            if (context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(success ? 'تمت إضافة المرتجع بنجاح' : 'فشل في إضافة المرتجع!'),
                  backgroundColor: success ? Colors.green : Colors.red,
                ),
              );
            }
          }
        },
        child: const Icon(Icons.add),
        tooltip: 'إضافة مرتجع جديد',
      ),
    );
  }
} 