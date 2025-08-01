import 'package:flutter_bloc/flutter_bloc.dart';
import '../core/api/api_service.dart';
import '../core/models/delivery.dart';

abstract class DeliveryState {}
class DeliveryInitial extends DeliveryState {}
class DeliveryLoading extends DeliveryState {}
class DeliveryLoaded extends DeliveryState {
  final Delivery delivery;
  DeliveryLoaded(this.delivery);
}
class DeliveryError extends DeliveryState {
  final String message;
  DeliveryError(this.message);
}
class DeliveryUpdating extends DeliveryState {}
class DeliveryUpdateSuccess extends DeliveryState {}
class DeliveryUpdateError extends DeliveryState {
  final String message;
  DeliveryUpdateError(this.message);
}

class DeliveryCubit extends Cubit<DeliveryState> {
  final ApiService apiService;
  DeliveryCubit(this.apiService) : super(DeliveryInitial());

  Future<void> fetchDelivery(int storeId) async {
    emit(DeliveryLoading());
    try {
      final delivery = await apiService.getStoreDeliveryDetails(storeId);
      emit(DeliveryLoaded(delivery));
    } catch (e) {
      emit(DeliveryError('فشل في جلب تفاصيل التسليم'));
    }
  }

  Future<void> updateQuantities(int deliveryId, List<Map<String, dynamic>> items) async {
    emit(DeliveryUpdating());
    try {
      await apiService.updateDeliveryQuantities(deliveryId, items);
      emit(DeliveryUpdateSuccess());
    } catch (e) {
      emit(DeliveryUpdateError('فشل في تحديث الكميات'));
    }
  }
} 