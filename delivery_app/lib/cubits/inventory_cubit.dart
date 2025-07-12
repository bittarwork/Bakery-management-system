import 'package:flutter_bloc/flutter_bloc.dart';
import '../core/api/api_service.dart';
import '../core/models/inventory.dart';
import '../core/storage/offline_caches.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

abstract class InventoryState {}
class InventoryInitial extends InventoryState {}
class InventoryLoading extends InventoryState {}
class InventoryLoaded extends InventoryState {
  final Inventory inventory;
  InventoryLoaded(this.inventory);
}
class InventoryError extends InventoryState {
  final String message;
  InventoryError(this.message);
}
class InventoryUpdating extends InventoryState {}
class InventoryUpdateSuccess extends InventoryState {}
class InventoryUpdateError extends InventoryState {
  final String message;
  InventoryUpdateError(this.message);
}

class InventoryCubit extends Cubit<InventoryState> {
  final ApiService apiService;
  InventoryCubit(this.apiService) : super(InventoryInitial());

  Future<void> fetchInventory(int vehicleId) async {
    emit(InventoryLoading());
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) {
      final cached = await inventoryOfflineCache.get();
      if (cached != null) {
        emit(InventoryLoaded(cached));
      } else {
        emit(InventoryError('لا يوجد بيانات محلية'));
      }
      return;
    }
    try {
      final inventory = await apiService.getInventory(vehicleId);
      await inventoryOfflineCache.save(inventory);
      emit(InventoryLoaded(inventory));
    } catch (e) {
      emit(InventoryError('فشل في جلب المخزون'));
    }
  }

  Future<void> updateInventory(int vehicleId, List<Map<String, dynamic>> items) async {
    emit(InventoryUpdating());
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) {
      await inventoryOfflineCache.addPendingOp({
        'action': 'update',
        'vehicleId': vehicleId,
        'items': items,
      });
      emit(InventoryUpdateSuccess());
      return;
    }
    try {
      await apiService.updateInventory(vehicleId, items);
      emit(InventoryUpdateSuccess());
    } catch (e) {
      emit(InventoryUpdateError('فشل في تحديث المخزون'));
    }
  }

  Future<void> synchronizePendingOps() async {
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) return;
    final ops = await inventoryOfflineCache.getPendingOps();
    for (final op in ops) {
      if (op['action'] == 'update') {
        try {
          await apiService.updateInventory(op['vehicleId'], List<Map<String, dynamic>>.from(op['items']));
        } catch (_) {}
      }
    }
    await inventoryOfflineCache.clearPendingOps();
  }
} 