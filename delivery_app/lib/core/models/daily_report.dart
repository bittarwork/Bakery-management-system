class DailyReport {
  final int id;
  final int vehicleId;
  final String date;
  final int totalDeliveries;
  final double totalPayments;
  final double totalExpenses;
  final String? notes;
  final String status;

  DailyReport({
    required this.id,
    required this.vehicleId,
    required this.date,
    required this.totalDeliveries,
    required this.totalPayments,
    required this.totalExpenses,
    this.notes,
    required this.status,
  });

  factory DailyReport.fromJson(Map<String, dynamic> json) => DailyReport(
    id: json['id'],
    vehicleId: json['vehicleId'],
    date: json['date'],
    totalDeliveries: json['totalDeliveries'],
    totalPayments: (json['totalPayments'] ?? 0).toDouble(),
    totalExpenses: (json['totalExpenses'] ?? 0).toDouble(),
    notes: json['notes'],
    status: json['status'],
  );
} 