class Product {
  final int id;
  final String name;
  final int quantity;
  final String unit;

  Product({
    required this.id,
    required this.name,
    required this.quantity,
    required this.unit,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
    id: json['id'],
    name: json['name'],
    quantity: json['quantity'],
    unit: json['unit'],
  );
} 