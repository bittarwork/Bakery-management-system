import 'delivery_item.dart';
import 'gift.dart';
import 'return_item.dart';

class Delivery {
  final int id;
  final int storeId;
  final List<DeliveryItem> items;
  final List<Gift> gifts;
  final List<ReturnItem> returns;
  final String status;

  Delivery({
    required this.id,
    required this.storeId,
    required this.items,
    required this.gifts,
    required this.returns,
    required this.status,
  });

  factory Delivery.fromJson(Map<String, dynamic> json) => Delivery(
    id: json['id'],
    storeId: json['storeId'],
    items: (json['items'] as List).map((e) => DeliveryItem.fromJson(e)).toList(),
    gifts: (json['gifts'] as List).map((e) => Gift.fromJson(e)).toList(),
    returns: (json['returns'] as List).map((e) => ReturnItem.fromJson(e)).toList(),
    status: json['status'],
  );
} 