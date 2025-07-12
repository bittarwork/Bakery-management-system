import 'inventory_item.dart';
import 'damage_item.dart';
import 'return_item.dart';

class Inventory {
  final int id;
  final int vehicleId;
  final List<InventoryItem> items;
  final List<DamageItem> damages;
  final List<ReturnItem> returns;

  Inventory({
    required this.id,
    required this.vehicleId,
    required this.items,
    required this.damages,
    required this.returns,
  });

  factory Inventory.fromJson(Map<String, dynamic> json) => Inventory(
    id: json['id'],
    vehicleId: json['vehicleId'],
    items: (json['items'] as List).map((e) => InventoryItem.fromJson(e)).toList(),
    damages: (json['damages'] as List).map((e) => DamageItem.fromJson(e)).toList(),
    returns: (json['returns'] as List).map((e) => ReturnItem.fromJson(e)).toList(),
  );
} 