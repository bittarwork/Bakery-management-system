import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../core/api/api_service.dart';
import '../core/models/delivery_schedule.dart';

/// States for delivery schedule operations
abstract class DeliveryScheduleState extends Equatable {
  const DeliveryScheduleState();

  @override
  List<Object?> get props => [];
}

class DeliveryScheduleInitial extends DeliveryScheduleState {}

class DeliveryScheduleLoading extends DeliveryScheduleState {}

class DeliveryScheduleLoaded extends DeliveryScheduleState {
  final List<DeliverySchedule> schedules;
  final int currentPage;
  final int totalPages;
  final int totalItems;

  const DeliveryScheduleLoaded({
    required this.schedules,
    required this.currentPage,
    required this.totalPages,
    required this.totalItems,
  });

  @override
  List<Object?> get props => [schedules, currentPage, totalPages, totalItems];
}

class DeliveryScheduleError extends DeliveryScheduleState {
  final String message;

  const DeliveryScheduleError(this.message);

  @override
  List<Object?> get props => [message];
}

class DeliveryScheduleStatusUpdated extends DeliveryScheduleState {
  final DeliverySchedule updatedSchedule;

  const DeliveryScheduleStatusUpdated(this.updatedSchedule);

  @override
  List<Object?> get props => [updatedSchedule];
}

/// Cubit for managing delivery schedules
class DeliveryScheduleCubit extends Cubit<DeliveryScheduleState> {
  final ApiService _apiService;
  List<DeliverySchedule> _allSchedules = [];
  int _currentPage = 1;
  int _totalPages = 1;
  int _totalItems = 0;

  DeliveryScheduleCubit(this._apiService) : super(DeliveryScheduleInitial());

  /// Fetch delivery schedules with pagination and filters
  Future<void> fetchDeliverySchedules({
    int page = 1,
    int limit = 10,
    String? status,
    String? dateFrom,
    String? dateTo,
    String? search,
  }) async {
    try {
      emit(DeliveryScheduleLoading());

      // Build query parameters
      final Map<String, dynamic> params = {
        'page': page.toString(),
        'limit': limit.toString(),
      };

      if (status != null && status.isNotEmpty) params['status'] = status;
      if (dateFrom != null && dateFrom.isNotEmpty) params['date_from'] = dateFrom;
      if (dateTo != null && dateTo.isNotEmpty) params['date_to'] = dateTo;
      if (search != null && search.isNotEmpty) params['search'] = search;

      final response = await _apiService.get('/delivery/schedules', params: params);

      if (response['success'] == true) {
        final data = response['data'];
        final schedulesData = data['schedules'] as List;
        final pagination = data['pagination'];

        _allSchedules = schedulesData
            .map((json) => DeliverySchedule.fromJson(json))
            .toList();

        _currentPage = pagination['currentPage'] ?? 1;
        _totalPages = pagination['totalPages'] ?? 1;
        _totalItems = pagination['totalItems'] ?? 0;

        emit(DeliveryScheduleLoaded(
          schedules: _allSchedules,
          currentPage: _currentPage,
          totalPages: _totalPages,
          totalItems: _totalItems,
        ));
      } else {
        emit(DeliveryScheduleError(response['message'] ?? 'خطأ في جلب البيانات'));
      }
    } catch (e) {
      emit(DeliveryScheduleError('خطأ في الاتصال: ${e.toString()}'));
    }
  }

  /// Update delivery status (for delivery personnel)
  Future<void> updateDeliveryStatus(int scheduleId, String newStatus) async {
    try {
      final response = await _apiService.put('/delivery/tracking/$scheduleId/status', {
        'status': newStatus,
      });

      if (response['success'] == true) {
        // Update local schedule
        final scheduleIndex = _allSchedules.indexWhere((s) => s.id == scheduleId);
        if (scheduleIndex != -1) {
          final updatedSchedule = DeliverySchedule(
            id: _allSchedules[scheduleIndex].id,
            orderId: _allSchedules[scheduleIndex].orderId,
            orderNumber: _allSchedules[scheduleIndex].orderNumber,
            storeId: _allSchedules[scheduleIndex].storeId,
            storeName: _allSchedules[scheduleIndex].storeName,
            scheduledDate: _allSchedules[scheduleIndex].scheduledDate,
            scheduledTimeStart: _allSchedules[scheduleIndex].scheduledTimeStart,
            scheduledTimeEnd: _allSchedules[scheduleIndex].scheduledTimeEnd,
            timeSlot: _allSchedules[scheduleIndex].timeSlot,
            deliveryType: _allSchedules[scheduleIndex].deliveryType,
            status: newStatus, // Updated status
            priority: _allSchedules[scheduleIndex].priority,
            deliveryAddress: _allSchedules[scheduleIndex].deliveryAddress,
            contactPerson: _allSchedules[scheduleIndex].contactPerson,
            contactPhone: _allSchedules[scheduleIndex].contactPhone,
            specialInstructions: _allSchedules[scheduleIndex].specialInstructions,
            order: _allSchedules[scheduleIndex].order,
            store: _allSchedules[scheduleIndex].store,
          );

          _allSchedules[scheduleIndex] = updatedSchedule;

          emit(DeliveryScheduleStatusUpdated(updatedSchedule));
          
          // Refresh the list
          emit(DeliveryScheduleLoaded(
            schedules: _allSchedules,
            currentPage: _currentPage,
            totalPages: _totalPages,
            totalItems: _totalItems,
          ));
        }
      } else {
        emit(DeliveryScheduleError(response['message'] ?? 'خطأ في تحديث الحالة'));
      }
    } catch (e) {
      emit(DeliveryScheduleError('خطأ في تحديث الحالة: ${e.toString()}'));
    }
  }

  /// Get today's deliveries for delivery personnel
  Future<void> fetchTodayDeliveries() async {
    final today = DateTime.now();
    final todayString = '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';
    
    await fetchDeliverySchedules(
      dateFrom: todayString,
      dateTo: todayString,
      status: 'confirmed', // Only confirmed deliveries
    );
  }

  /// Get deliveries for a specific date range
  Future<void> fetchDeliveriesForDateRange(DateTime startDate, DateTime endDate) async {
    final startString = '${startDate.year}-${startDate.month.toString().padLeft(2, '0')}-${startDate.day.toString().padLeft(2, '0')}';
    final endString = '${endDate.year}-${endDate.month.toString().padLeft(2, '0')}-${endDate.day.toString().padLeft(2, '0')}';
    
    await fetchDeliverySchedules(
      dateFrom: startString,
      dateTo: endString,
    );
  }

  /// Get schedules by status
  Future<void> fetchSchedulesByStatus(String status) async {
    await fetchDeliverySchedules(status: status);
  }

  /// Search schedules
  Future<void> searchSchedules(String query) async {
    await fetchDeliverySchedules(search: query);
  }

  /// Load more schedules (pagination)
  Future<void> loadMore() async {
    if (_currentPage < _totalPages) {
      await fetchDeliverySchedules(page: _currentPage + 1);
    }
  }

  /// Refresh schedules
  Future<void> refresh() async {
    await fetchDeliverySchedules(page: 1);
  }

  /// Get current schedules list
  List<DeliverySchedule> get currentSchedules => _allSchedules;

  /// Get pagination info
  Map<String, int> get paginationInfo => {
    'currentPage': _currentPage,
    'totalPages': _totalPages,
    'totalItems': _totalItems,
  };

  /// Check if there are more pages to load
  bool get hasMorePages => _currentPage < _totalPages;
} 