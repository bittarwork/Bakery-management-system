class Payment {
  final int id;
  final int storeId;
  final double amount;
  final String currency;
  final String method;
  final String date;
  final String? note;

  Payment({
    required this.id,
    required this.storeId,
    required this.amount,
    required this.currency,
    required this.method,
    required this.date,
    this.note,
  });

  factory Payment.fromJson(Map<String, dynamic> json) => Payment(
    id: json['id'],
    storeId: json['storeId'],
    amount: (json['amount'] ?? 0).toDouble(),
    currency: json['currency'],
    method: json['method'],
    date: json['date'],
    note: json['note'],
  );
} 