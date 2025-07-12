import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubits/daily_report_cubit.dart';
import '../core/api/api_service.dart';
import '../core/models/daily_report.dart';
import 'package:intl/intl.dart';
import '../core/storage/session_manager.dart';
import '../main.dart';

class DailyReportScreen extends StatefulWidget {
  const DailyReportScreen({Key? key}) : super(key: key);

  @override
  State<DailyReportScreen> createState() => _DailyReportScreenState();
}

class _DailyReportScreenState extends State<DailyReportScreen> {
  final _deliveriesController = TextEditingController();
  final _paymentsController = TextEditingController();
  final _expensesController = TextEditingController();
  final _notesController = TextEditingController();
  int _vehicleId = 1; // مؤقتًا

  @override
  void dispose() {
    _deliveriesController.dispose();
    _paymentsController.dispose();
    _expensesController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
    return FutureBuilder<int?>(
      future: SessionManager.getVehicleId(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Center(child: CircularProgressIndicator());
        }
        final vehicleId = snapshot.data!;
        return BlocProvider(
          create: (_) => DailyReportCubit(ApiService())..fetchReports(vehicleId),
          child: BlocConsumer<DailyReportCubit, DailyReportState>(
            listener: (context, state) {
              if (state is DailyReportSubmitSuccess) {
                rootScaffoldMessengerKey.currentState?.showSnackBar(
                  const SnackBar(content: Text('تم رفع التقرير بنجاح')),
                );
                context.read<DailyReportCubit>().fetchReports(vehicleId);
                _deliveriesController.clear();
                _paymentsController.clear();
                _expensesController.clear();
                _notesController.clear();
              } else if (state is DailyReportSubmitError) {
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
                    const Text('رفع تقرير يومي جديد', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _deliveriesController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'عدد عمليات التسليم'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _paymentsController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'إجمالي المدفوعات'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _expensesController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'إجمالي المصاريف'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _notesController,
                      decoration: const InputDecoration(labelText: 'ملاحظات (اختياري)'),
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          final deliveries = int.tryParse(_deliveriesController.text) ?? 0;
                          final payments = double.tryParse(_paymentsController.text) ?? 0;
                          final expenses = double.tryParse(_expensesController.text) ?? 0;
                          context.read<DailyReportCubit>().submitReport(
                            vehicleId: vehicleId,
                            date: today,
                            totalDeliveries: deliveries,
                            totalPayments: payments,
                            totalExpenses: expenses,
                            notes: _notesController.text.isNotEmpty ? _notesController.text : null,
                          );
                        },
                        child: const Text('رفع التقرير'),
                      ),
                    ),
                    const Divider(height: 32),
                    const Text('التقارير السابقة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Expanded(
                      child: state is DailyReportLoading
                          ? const Center(child: CircularProgressIndicator())
                          : state is DailyReportLoaded
                              ? ListView.builder(
                                  itemCount: state.reports.length,
                                  itemBuilder: (context, index) {
                                    final DailyReport r = state.reports[index];
                                    return ListTile(
                                      title: Text('${r.date} - ${r.status}'),
                                      subtitle: Text('تسليم: ${r.totalDeliveries} | مدفوعات: ${r.totalPayments} | مصاريف: ${r.totalExpenses}'),
                                      trailing: r.notes != null ? Icon(Icons.note, color: Colors.blue) : null,
                                    );
                                  },
                                )
                              : state is DailyReportError
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