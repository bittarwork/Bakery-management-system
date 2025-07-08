class OrderModel {
  final String id;
  final String bakeryName;
  final int quantity;
  final String branchName;
  final String branchAddress;
  final String branchPhone;
  final bool isDelivered;
  final String? paymentMethod;
  final double? latitude;
  final double? longitude;

  OrderModel({
    required this.id,
    required this.bakeryName,
    required this.quantity,
    required this.branchName,
    required this.branchAddress,
    required this.branchPhone,
    this.isDelivered = false,
    this.paymentMethod,
    this.latitude,
    this.longitude,
  });
} 