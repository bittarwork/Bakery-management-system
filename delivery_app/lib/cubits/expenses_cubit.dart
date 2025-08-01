import 'package:flutter_bloc/flutter_bloc.dart';
import '../core/api/api_service.dart';
import '../core/models/expense.dart';
import '../core/storage/offline_caches.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

abstract class ExpensesState {}
class ExpensesInitial extends ExpensesState {}
class ExpensesLoading extends ExpensesState {}
class ExpensesLoaded extends ExpensesState {
  final List<Expense> expenses;
  ExpensesLoaded(this.expenses);
}
class ExpensesError extends ExpensesState {
  final String message;
  ExpensesError(this.message);
}
class ExpenseRecording extends ExpensesState {}
class ExpenseRecordSuccess extends ExpensesState {}
class ExpenseRecordError extends ExpensesState {
  final String message;
  ExpenseRecordError(this.message);
}

class ExpensesCubit extends Cubit<ExpensesState> {
  final ApiService apiService;
  ExpensesCubit(this.apiService) : super(ExpensesInitial());

  Future<void> fetchExpenses(int vehicleId) async {
    emit(ExpensesLoading());
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) {
      final cached = await expensesOfflineCache.get();
      if (cached != null) {
        emit(ExpensesLoaded([cached]));
      } else {
        emit(ExpensesError('لا يوجد بيانات محلية'));
      }
      return;
    }
    try {
      final expenses = await apiService.getExpenses(vehicleId);
      if (expenses.isNotEmpty) {
        await expensesOfflineCache.save(expenses.first);
      }
      emit(ExpensesLoaded(expenses));
    } catch (e) {
      emit(ExpensesError('فشل في جلب المصاريف'));
    }
  }

  Future<void> recordExpense({
    required int vehicleId,
    required double amount,
    required String type,
    String? note,
    String? date,
    String? receiptPath,
  }) async {
    emit(ExpenseRecording());
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) {
      await expensesOfflineCache.addPendingOp({
        'action': 'add',
        'vehicleId': vehicleId,
        'amount': amount,
        'type': type,
        'note': note,
        'date': date,
        'receiptPath': receiptPath,
      });
      emit(ExpenseRecordSuccess());
      return;
    }
    try {
      await apiService.recordExpense(
        vehicleId: vehicleId,
        amount: amount,
        type: type,
        note: note,
        date: date,
        receiptPath: receiptPath,
      );
      emit(ExpenseRecordSuccess());
    } catch (e) {
      emit(ExpenseRecordError('فشل في تسجيل المصروف'));
    }
  }

  Future<void> synchronizePendingOps() async {
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) return;
    final ops = await expensesOfflineCache.getPendingOps();
    for (final op in ops) {
      if (op['action'] == 'add') {
        try {
          await apiService.recordExpense(
            vehicleId: op['vehicleId'],
            amount: op['amount'],
            type: op['type'],
            note: op['note'],
            date: op['date'],
            receiptPath: op['receiptPath'],
          );
        } catch (_) {}
      }
    }
    await expensesOfflineCache.clearPendingOps();
  }
} 