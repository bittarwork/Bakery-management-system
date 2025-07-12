import 'package:flutter_bloc/flutter_bloc.dart';
import '../core/api/api_service.dart';
import '../core/models/notification.dart';
import '../core/storage/offline_caches.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

abstract class NotificationsState {}
class NotificationsInitial extends NotificationsState {}
class NotificationsLoading extends NotificationsState {}
class NotificationsLoaded extends NotificationsState {
  final List<NotificationModel> notifications;
  NotificationsLoaded(this.notifications);
}
class NotificationsError extends NotificationsState {
  final String message;
  NotificationsError(this.message);
}

class NotificationsCubit extends Cubit<NotificationsState> {
  final ApiService apiService;
  NotificationsCubit(this.apiService) : super(NotificationsInitial());

  Future<void> fetchNotifications(int userId) async {
    emit(NotificationsLoading());
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) {
      final cached = await notificationsOfflineCache.get();
      if (cached != null) {
        emit(NotificationsLoaded([cached]));
      } else {
        emit(NotificationsError('لا يوجد بيانات محلية'));
      }
      return;
    }
    try {
      final notifications = await apiService.getNotifications(userId);
      if (notifications.isNotEmpty) {
        await notificationsOfflineCache.save(notifications.first);
      }
      emit(NotificationsLoaded(notifications));
    } catch (e) {
      emit(NotificationsError('فشل في جلب الإشعارات'));
    }
  }

  Future<void> synchronizePendingOps() async {
    // غالباً لا يوجد عمليات add للإشعارات، لكن أضفها للاتساق
    await notificationsOfflineCache.clearPendingOps();
  }
} 