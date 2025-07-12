class InventoryItem {
  final int id;
  final int productId;
  final String productName;
  final int quantity;
  final String unit;

  InventoryItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.unit,
  });

  factory InventoryItem.fromJson(Map<String, dynamic> json) => InventoryItem(
    id: json['id'],
    productId: json['productId'],
    productName: json['productName'],
    quantity: json['quantity'],
    unit: json['unit'],
  );
} 