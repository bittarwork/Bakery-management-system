import 'package:flutter_bloc/flutter_bloc.dart';
import '../core/api/api_service.dart';
import '../core/models/payment.dart';
import '../core/storage/offline_caches.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

abstract class PaymentState {}
class PaymentInitial extends PaymentState {}
class PaymentLoading extends PaymentState {}
class PaymentLoaded extends PaymentState {
  final List<Payment> payments;
  PaymentLoaded(this.payments);
}
class PaymentError extends PaymentState {
  final String message;
  PaymentError(this.message);
}
class PaymentRecording extends PaymentState {}
class PaymentRecordSuccess extends PaymentState {}
class PaymentRecordError extends PaymentState {
  final String message;
  PaymentRecordError(this.message);
}

class PaymentCubit extends Cubit<PaymentState> {
  final ApiService apiService;
  PaymentCubit(this.apiService) : super(PaymentInitial());

  Future<void> fetchPayments(int storeId) async {
    emit(PaymentLoading());
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) {
      // Offline: جلب من الكاش
      final cached = await paymentsOfflineCache.get();
      if (cached != null) {
        emit(PaymentLoaded([cached]));
      } else {
        emit(PaymentError('لا يوجد بيانات محلية'));
      }
      return;
    }
    try {
      final payments = await apiService.getPayments(storeId);
      // تحديث الكاش
      if (payments.isNotEmpty) {
        await paymentsOfflineCache.save(payments.first);
      }
      emit(PaymentLoaded(payments));
    } catch (e) {
      emit(PaymentError('فشل في جلب المدفوعات'));
    }
  }

  Future<void> recordPayment({
    required int storeId,
    required double amount,
    required String currency,
    required String method,
    String? note,
  }) async {
    emit(PaymentRecording());
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) {
      // Offline: أضف العملية لقائمة pending ops
      await paymentsOfflineCache.addPendingOp({
        'action': 'add',
        'storeId': storeId,
        'amount': amount,
        'currency': currency,
        'method': method,
        'note': note,
      });
      emit(PaymentRecordSuccess());
      return;
    }
    try {
      await apiService.recordPayment(
        storeId: storeId,
        amount: amount,
        currency: currency,
        method: method,
        note: note,
      );
      emit(PaymentRecordSuccess());
    } catch (e) {
      emit(PaymentRecordError('فشل في تسجيل الدفعة'));
    }
  }

  Future<void> synchronizePendingOps() async {
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) return;
    final ops = await paymentsOfflineCache.getPendingOps();
    for (final op in ops) {
      if (op['action'] == 'add') {
        try {
          await apiService.recordPayment(
            storeId: op['storeId'],
            amount: op['amount'],
            currency: op['currency'],
            method: op['method'],
            note: op['note'],
          );
        } catch (_) {}
      }
    }
    await paymentsOfflineCache.clearPendingOps();
  }
} 