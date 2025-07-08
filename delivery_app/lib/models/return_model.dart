class ReturnModel {
  final String id;
  final String orderId;
  final String branchName;
  final String productName;
  final int quantity;
  final String reason;
  final DateTime date;

  ReturnModel({
    required this.id,
    required this.orderId,
    required this.branchName,
    required this.productName,
    required this.quantity,
    required this.reason,
    required this.date,
  });
} 