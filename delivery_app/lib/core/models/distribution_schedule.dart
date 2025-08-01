import 'store.dart';

class DistributionSchedule {
  final String date;
  final List<Store> stores;

  DistributionSchedule({required this.date, required this.stores});

  factory DistributionSchedule.fromJson(Map<String, dynamic> json) => DistributionSchedule(
    date: json['date'],
    stores: (json['stores'] as List).map((s) => Store.fromJson(s)).toList(),
  );
} 