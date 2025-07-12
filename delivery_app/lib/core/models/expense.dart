class Expense {
  final int id;
  final int vehicleId;
  final double amount;
  final String type;
  final String date;
  final String? note;
  final String? receiptUrl;

  Expense({
    required this.id,
    required this.vehicleId,
    required this.amount,
    required this.type,
    required this.date,
    this.note,
    this.receiptUrl,
  });

  factory Expense.fromJson(Map<String, dynamic> json) => Expense(
    id: json['id'],
    vehicleId: json['vehicleId'],
    amount: (json['amount'] ?? 0).toDouble(),
    type: json['type'],
    date: json['date'],
    note: json['note'],
    receiptUrl: json['receiptUrl'],
  );
} 