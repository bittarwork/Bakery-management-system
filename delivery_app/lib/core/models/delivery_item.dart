class DeliveryItem {
  final int id;
  final int productId;
  final String productName;
  final int quantity;
  final int deliveredQuantity;
  final String unit;

  DeliveryItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.deliveredQuantity,
    required this.unit,
  });

  factory DeliveryItem.fromJson(Map<String, dynamic> json) => DeliveryItem(
    id: json['id'],
    productId: json['productId'],
    productName: json['productName'],
    quantity: json['quantity'],
    deliveredQuantity: json['deliveredQuantity'],
    unit: json['unit'],
  );
} 