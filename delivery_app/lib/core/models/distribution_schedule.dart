import 'store.dart';

class DistributionSchedule {
  final String date;
  final List<Store> stores;
  final Map<String, dynamic>? distributor;
  final int totalVisits;

  DistributionSchedule({
    required this.date, 
    required this.stores,
    this.distributor,
    this.totalVisits = 0,
  });

  factory DistributionSchedule.fromJson(Map<String, dynamic> json) {
    // التعامل مع البيانات المعادة من الخادم
    final data = json['data'] ?? json;
    final schedules = data['schedules'] as List? ?? [];
    
    // تحويل schedules إلى stores
    final stores = schedules.map((schedule) {
      final storeData = schedule['store'] ?? {};
      return Store.fromJson({
        'id': storeData['id'],
        'name': storeData['name'] ?? 'غير محدد',
        'address': storeData['address'] ?? '',
        'phone': storeData['phone'] ?? '',
        'balance': 0.0, // سيتم تحديثه لاحقاً من الطلبات
        'gps_coordinates': storeData['gps_coordinates'],
      });
    }).toList();

    return DistributionSchedule(
      date: DateTime.now().toIso8601String().split('T')[0], // تاريخ اليوم
      stores: stores,
      distributor: data['distributor'],
      totalVisits: data['total_visits'] ?? stores.length,
    );
  }
} 