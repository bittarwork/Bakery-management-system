class DamageItem {
  final int id;
  final int productId;
  final String productName;
  final int quantity;
  final String reason;

  DamageItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.reason,
  });

  factory DamageItem.fromJson(Map<String, dynamic> json) => DamageItem(
    id: json['id'],
    productId: json['productId'],
    productName: json['productName'],
    quantity: json['quantity'],
    reason: json['reason'],
  );
} 