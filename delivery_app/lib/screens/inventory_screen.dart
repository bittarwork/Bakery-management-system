import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubits/inventory_cubit.dart';
import '../core/api/api_service.dart';
import '../core/models/inventory.dart';
import '../core/storage/session_manager.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({Key? key}) : super(key: key);

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  final Map<int, TextEditingController> _controllers = {};
  int _vehicleId = 1; // مؤقتًا، يجب ربطه بالسيارة الحالية

  @override
  void dispose() {
    for (var c in _controllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<int?>(
      future: SessionManager.getVehicleId(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Center(child: CircularProgressIndicator());
        }
        final vehicleId = snapshot.data!;
        return BlocProvider(
          create: (_) => InventoryCubit(ApiService())..fetchInventory(vehicleId),
          child: BlocConsumer<InventoryCubit, InventoryState>(
            listener: (context, state) {
              if (state is InventoryUpdateSuccess) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم تحديث المخزون بنجاح')));
                context.read<InventoryCubit>().fetchInventory(vehicleId);
              } else if (state is InventoryUpdateError) {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.message)));
              }
            },
            builder: (context, state) {
              if (state is InventoryLoading) {
                return const Center(child: CircularProgressIndicator());
              } else if (state is InventoryLoaded) {
                final Inventory inventory = state.inventory;
                for (var item in inventory.items) {
                  _controllers[item.id] ??= TextEditingController(text: item.quantity.toString());
                }
                return Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('مخزون السيارة', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 16),
                      Expanded(
                        child: ListView(
                          children: inventory.items.map((item) {
                            return ListTile(
                              title: Text(item.productName),
                              trailing: SizedBox(
                                width: 80,
                                child: TextField(
                                  controller: _controllers[item.id],
                                  keyboardType: TextInputType.number,
                                  decoration: const InputDecoration(labelText: 'الكمية'),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () {
                          final items = inventory.items.map((item) => {
                            'id': item.id,
                            'quantity': int.tryParse(_controllers[item.id]?.text ?? '') ?? item.quantity,
                          }).toList();
                          context.read<InventoryCubit>().updateInventory(vehicleId, items);
                        },
                        child: const Text('حفظ الكميات'),
                      ),
                      const Divider(height: 32),
                      const Text('الأضرار', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      ...inventory.damages.map((d) => ListTile(
                            title: Text(d.productName),
                            subtitle: Text('الكمية: ${d.quantity} - السبب: ${d.reason}'),
                          )),
                      const Divider(height: 32),
                      const Text('المرتجعات', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      ...inventory.returns.map((r) => ListTile(
                            title: Text(r.productName),
                            subtitle: Text('الكمية: ${r.quantity} - السبب: ${r.reason}'),
                          )),
                    ],
                  ),
                );
              } else if (state is InventoryError) {
                return Center(child: Text(state.message));
              }
              return const Center(child: Text('لا يوجد بيانات'));
            },
          ),
        );
      },
    );
  }
} 