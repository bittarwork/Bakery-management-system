import 'package:flutter_bloc/flutter_bloc.dart';
import '../core/api/api_service.dart';
import '../core/models/daily_report.dart';
import '../core/storage/offline_caches.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

abstract class DailyReportState {}
class DailyReportInitial extends DailyReportState {}
class DailyReportLoading extends DailyReportState {}
class DailyReportLoaded extends DailyReportState {
  final List<DailyReport> reports;
  DailyReportLoaded(this.reports);
}
class DailyReportError extends DailyReportState {
  final String message;
  DailyReportError(this.message);
}
class DailyReportSubmitting extends DailyReportState {}
class DailyReportSubmitSuccess extends DailyReportState {}
class DailyReportSubmitError extends DailyReportState {
  final String message;
  DailyReportSubmitError(this.message);
}

class DailyReportCubit extends Cubit<DailyReportState> {
  final ApiService apiService;
  DailyReportCubit(this.apiService) : super(DailyReportInitial());

  Future<void> fetchReports(int vehicleId) async {
    emit(DailyReportLoading());
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) {
      final cached = await dailyReportsOfflineCache.get();
      if (cached != null) {
        emit(DailyReportLoaded([cached]));
      } else {
        emit(DailyReportError('لا يوجد بيانات محلية'));
      }
      return;
    }
    try {
      final reports = await apiService.getDailyReports(vehicleId);
      if (reports.isNotEmpty) {
        await dailyReportsOfflineCache.save(reports.first);
      }
      emit(DailyReportLoaded(reports));
    } catch (e) {
      emit(DailyReportError('فشل في جلب التقارير'));
    }
  }

  Future<void> submitReport({
    required int vehicleId,
    required String date,
    required int totalDeliveries,
    required double totalPayments,
    required double totalExpenses,
    String? notes,
  }) async {
    emit(DailyReportSubmitting());
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) {
      await dailyReportsOfflineCache.addPendingOp({
        'action': 'add',
        'vehicleId': vehicleId,
        'date': date,
        'totalDeliveries': totalDeliveries,
        'totalPayments': totalPayments,
        'totalExpenses': totalExpenses,
        'notes': notes,
      });
      emit(DailyReportSubmitSuccess());
      return;
    }
    try {
      await apiService.submitDailyReport(
        vehicleId: vehicleId,
        date: date,
        totalDeliveries: totalDeliveries,
        totalPayments: totalPayments,
        totalExpenses: totalExpenses,
        notes: notes,
      );
      emit(DailyReportSubmitSuccess());
    } catch (e) {
      emit(DailyReportSubmitError('فشل في رفع التقرير'));
    }
  }

  Future<void> synchronizePendingOps() async {
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) return;
    final ops = await dailyReportsOfflineCache.getPendingOps();
    for (final op in ops) {
      if (op['action'] == 'add') {
        try {
          await apiService.submitDailyReport(
            vehicleId: op['vehicleId'],
            date: op['date'],
            totalDeliveries: op['totalDeliveries'],
            totalPayments: op['totalPayments'],
            totalExpenses: op['totalExpenses'],
            notes: op['notes'],
          );
        } catch (_) {}
      }
    }
    await dailyReportsOfflineCache.clearPendingOps();
  }
} 