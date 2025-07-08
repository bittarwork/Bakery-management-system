import 'package:flutter_bloc/flutter_bloc.dart';
import '../models/order_model.dart';
import '../models/distributor_api.dart';
import 'dart:math';

enum OrdersStateStatus { initial, loading, loaded, error }

class OrdersState {
  final OrdersStateStatus status;
  final List<OrderModel> orders;
  final String? errorMessage;

  OrdersState({
    this.status = OrdersStateStatus.initial,
    this.orders = const [],
    this.errorMessage,
  });

  OrdersState copyWith({
    OrdersStateStatus? status,
    List<OrderModel>? orders,
    String? errorMessage,
  }) {
    return OrdersState(
      status: status ?? this.status,
      orders: orders ?? this.orders,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class OrdersCubit extends Cubit<OrdersState> {
  final DistributorApi api;
  double? userLat;
  double? userLng;

  OrdersCubit(this.api) : super(OrdersState());

  Future<void> fetchOrders() async {
    emit(state.copyWith(status: OrdersStateStatus.loading));
    try {
      final orders = await api.fetchOrders();
      emit(state.copyWith(status: OrdersStateStatus.loaded, orders: orders));
    } catch (e) {
      emit(state.copyWith(status: OrdersStateStatus.error, errorMessage: e.toString()));
    }
  }

  Future<bool> markAsDelivered(String orderId, String paymentMethod) async {
    try {
      await api.updateOrderPaymentMethod(orderId, paymentMethod);
    } catch (e) {
      return false;
    }
    final updated = state.orders.map((order) {
      if (order.id == orderId) {
        return OrderModel(
          id: order.id,
          bakeryName: order.bakeryName,
          quantity: order.quantity,
          branchName: order.branchName,
          branchAddress: order.branchAddress,
          branchPhone: order.branchPhone,
          isDelivered: true,
          paymentMethod: paymentMethod,
        );
      }
      return order;
    }).toList();
    emit(state.copyWith(orders: updated));
    return true;
  }

  void sortOrdersByDistance(double userLat, double userLng) {
    List<OrderModel> sorted = List.from(state.orders);
    sorted.sort((a, b) {
      double distA = _distance(userLat, userLng, a.latitude, a.longitude);
      double distB = _distance(userLat, userLng, b.latitude, b.longitude);
      return distA.compareTo(distB);
    });
    emit(state.copyWith(orders: sorted));
  }

  double _distance(double lat1, double lng1, double? lat2, double? lng2) {
    if (lat2 == null || lng2 == null) return double.infinity;
    const double R = 6371; // km
    double dLat = _deg2rad(lat2 - lat1);
    double dLng = _deg2rad(lng2 - lng1);
    double a =
        (sin(dLat / 2) * sin(dLat / 2)) +
        cos(_deg2rad(lat1)) * cos(_deg2rad(lat2)) *
        (sin(dLng / 2) * sin(dLng / 2));
    double c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return R * c;
  }

  double _deg2rad(double deg) => deg * (3.141592653589793 / 180.0);

  void setUserLocation(double lat, double lng) {
    userLat = lat;
    userLng = lng;
    emit(state.copyWith()); // لإعادة بناء الواجهة
  }

  double? getOrderDistance(OrderModel order) {
    if (userLat == null || userLng == null) return null;
    return _distance(userLat!, userLng!, order.latitude, order.longitude);
  }
} 