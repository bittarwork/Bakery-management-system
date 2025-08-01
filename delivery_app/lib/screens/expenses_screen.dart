import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import '../cubits/expenses_cubit.dart';
import '../core/api/api_service.dart';
import '../core/models/expense.dart';
import '../core/models/expense_type.dart';
import 'dart:io';
import '../core/storage/session_manager.dart';
import '../main.dart';

class ExpensesScreen extends StatefulWidget {
  const ExpensesScreen({Key? key}) : super(key: key);

  @override
  State<ExpensesScreen> createState() => _ExpensesScreenState();
}

class _ExpensesScreenState extends State<ExpensesScreen> {
  final _amountController = TextEditingController();
  final _noteController = TextEditingController();
  String _type = ExpenseType.commonTypes.first.name;
  int _vehicleId = 1; // مؤقتًا
  File? _receiptFile;

  @override
  void dispose() {
    _amountController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  Future<void> _pickReceipt() async {
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery);
    if (picked != null) {
      setState(() {
        _receiptFile = File(picked.path);
      });
    }
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
          create: (_) => ExpensesCubit(ApiService())..fetchExpenses(vehicleId),
          child: BlocConsumer<ExpensesCubit, ExpensesState>(
            listener: (context, state) {
              if (state is ExpenseRecordSuccess) {
                rootScaffoldMessengerKey.currentState?.showSnackBar(
                  const SnackBar(content: Text('تم تسجيل المصروف بنجاح')),
                );
                context.read<ExpensesCubit>().fetchExpenses(vehicleId);
                _amountController.clear();
                _noteController.clear();
                setState(() => _receiptFile = null);
              } else if (state is ExpenseRecordError) {
                rootScaffoldMessengerKey.currentState?.showSnackBar(
                  SnackBar(content: Text(state.message)),
                );
              }
            },
            builder: (context, state) {
              return Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('تسجيل مصروف جديد', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _amountController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'المبلغ'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        DropdownButton<String>(
                          value: _type,
                          items: ExpenseType.commonTypes.map((t) => DropdownMenuItem(
                            value: t.name,
                            child: Text(t.label),
                          )).toList(),
                          onChanged: (v) => setState(() => _type = v!),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _noteController,
                      decoration: const InputDecoration(labelText: 'ملاحظة (اختياري)'),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        ElevatedButton.icon(
                          onPressed: _pickReceipt,
                          icon: const Icon(Icons.attach_file),
                          label: const Text('إرفاق إيصال'),
                        ),
                        if (_receiptFile != null) ...[
                          const SizedBox(width: 8),
                          Text('تم اختيار إيصال', style: TextStyle(color: Colors.green)),
                        ]
                      ],
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          final amount = double.tryParse(_amountController.text) ?? 0;
                          if (amount > 0) {
                            context.read<ExpensesCubit>().recordExpense(
                              vehicleId: vehicleId,
                              amount: amount,
                              type: _type,
                              note: _noteController.text.isNotEmpty ? _noteController.text : null,
                              receiptPath: _receiptFile?.path,
                            );
                          }
                        },
                        child: const Text('تسجيل المصروف'),
                      ),
                    ),
                    const Divider(height: 32),
                    const Text('المصاريف السابقة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Expanded(
                      child: state is ExpensesLoading
                          ? const Center(child: CircularProgressIndicator())
                          : state is ExpensesLoaded
                              ? ListView.builder(
                                  itemCount: state.expenses.length,
                                  itemBuilder: (context, index) {
                                    final Expense e = state.expenses[index];
                                    return ListTile(
                                      title: Text('${e.amount} - ${e.type}'),
                                      subtitle: Text('${e.date}${e.note != null ? ' - ${e.note}' : ''}'),
                                      trailing: e.receiptUrl != null
                                          ? Icon(Icons.receipt, color: Colors.blue)
                                          : null,
                                    );
                                  },
                                )
                              : state is ExpensesError
                                  ? Center(child: Text(state.message))
                                  : const Center(child: Text('لا يوجد بيانات')),
                    ),
                  ],
                ),
              );
            },
          ),
        );
      },
    );
  }
} 