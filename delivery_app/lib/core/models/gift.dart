class Gift {
  final int id;
  final int productId;
  final String productName;
  final int quantity;
  final String unit;

  Gift({
    required this.id,
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.unit,
  });

  factory Gift.fromJson(Map<String, dynamic> json) => Gift(
    id: json['id'],
    productId: json['productId'],
    productName: json['productName'],
    quantity: json['quantity'],
    unit: json['unit'],
  );
} 