import 'package:flutter_bloc/flutter_bloc.dart';
import '../core/api/api_service.dart';
import '../core/models/distribution_schedule.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../core/storage/offline_caches.dart';
import '../core/storage/session_manager.dart';

abstract class DistributionScheduleState {}
class DistributionScheduleInitial extends DistributionScheduleState {}
class DistributionScheduleLoading extends DistributionScheduleState {}
class DistributionScheduleLoaded extends DistributionScheduleState {
  final DistributionSchedule schedule;
  DistributionScheduleLoaded(this.schedule);
}
class DistributionScheduleError extends DistributionScheduleState {
  final String message;
  DistributionScheduleError(this.message);
}

class DistributionScheduleCubit extends Cubit<DistributionScheduleState> {
  final ApiService apiService;
  DistributionScheduleCubit(this.apiService) : super(DistributionScheduleInitial());

  Future<void> fetchScheduleForUser() async {
    emit(DistributionScheduleLoading());
    
    // الحصول على userId من SessionManager
    final userId = await SessionManager.getUserId();
    if (userId == null) {
      emit(DistributionScheduleError('لم يتم العثور على معرف المستخدم'));
      return;
    }
    
    print('DistributionScheduleCubit: Fetching schedule for userId: $userId');
    
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) {
      // Offline: جلب من الكاش
      final cached = await distributionScheduleOfflineCache.get();
      if (cached != null) {
        emit(DistributionScheduleLoaded(cached));
      } else {
        emit(DistributionScheduleError('لا يوجد اتصال ولا بيانات محلية'));
      }
      return;
    }
    try {
      final schedule = await apiService.getDistributionScheduleForUser(userId);
      await distributionScheduleOfflineCache.save(schedule);
      emit(DistributionScheduleLoaded(schedule));
    } catch (e) {
      print('DistributionScheduleCubit error: ' + e.toString());
      emit(DistributionScheduleError('فشل في جلب جدول التوزيع'));
    }
  }
} 