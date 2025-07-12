import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubits/payment_cubit.dart';
import '../core/api/api_service.dart';
import '../core/models/payment.dart';
import '../core/models/payment_method.dart';
import '../core/storage/session_manager.dart';
import '../main.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({Key? key}) : super(key: key);

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final _amountController = TextEditingController();
  String _currency = 'EUR';
  String _method = PaymentMethod.globalMethods.first.name;
  int _storeId = 1; // مؤقتًا، يجب ربطه بالمحل الحالي

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<int?>(
      future: SessionManager.getUserId(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Center(child: CircularProgressIndicator());
        }
        final storeId = snapshot.data!; // مؤقتًا نستخدم userId كمحاكاة للـ storeId
        return BlocProvider(
          create: (_) => PaymentCubit(ApiService())..fetchPayments(storeId),
          child: BlocConsumer<PaymentCubit, PaymentState>(
            listener: (context, state) {
              if (state is PaymentRecordSuccess) {
                rootScaffoldMessengerKey.currentState?.showSnackBar(
                  const SnackBar(content: Text('تم تسجيل الدفعة بنجاح')),
                );
                context.read<PaymentCubit>().fetchPayments(storeId);
              } else if (state is PaymentRecordError) {
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
                    const Text('تسجيل دفعة جديدة', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
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
                          value: _currency,
                          items: const [
                            DropdownMenuItem(value: 'EUR', child: Text('يورو')),
                            DropdownMenuItem(value: 'SYP', child: Text('ليرة سورية')),
                          ],
                          onChanged: (v) => setState(() => _currency = v!),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    DropdownButton<String>(
                      value: _method,
                      items: PaymentMethod.globalMethods.map((m) => DropdownMenuItem(
                        value: m.name,
                        child: Text(m.description ?? m.name),
                      )).toList(),
                      onChanged: (v) => setState(() => _method = v!),
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          final amount = double.tryParse(_amountController.text) ?? 0;
                          if (amount > 0) {
                            context.read<PaymentCubit>().recordPayment(
                              storeId: storeId,
                              amount: amount,
                              currency: _currency,
                              method: _method,
                            );
                            _amountController.clear();
                          }
                        },
                        child: const Text('تسجيل الدفعة'),
                      ),
                    ),
                    const Divider(height: 32),
                    const Text('الدفعات السابقة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Expanded(
                      child: state is PaymentLoading
                          ? const Center(child: CircularProgressIndicator())
                          : state is PaymentLoaded
                              ? ListView.builder(
                                  itemCount: state.payments.length,
                                  itemBuilder: (context, index) {
                                    final Payment p = state.payments[index];
                                    return ListTile(
                                      title: Text('${p.amount} ${p.currency}'),
                                      subtitle: Text('${p.method} - ${p.date}'),
                                      trailing: p.note != null ? Text(p.note!) : null,
                                    );
                                  },
                                )
                              : state is PaymentError
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