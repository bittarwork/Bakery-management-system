/// Delivery Schedule Model
/// Represents a scheduled delivery with all relevant information
class DeliverySchedule {
  final int id;
  final int orderId;
  final String orderNumber;
  final int storeId;
  final String storeName;
  final DateTime scheduledDate;
  final String scheduledTimeStart;
  final String? scheduledTimeEnd;
  final String? timeSlot;
  final String? deliveryType;
  final String status;
  final String priority;
  final String? deliveryAddress;
  final String? contactPerson;
  final String? contactPhone;
  final String? specialInstructions;
  final Order? order;
  final Store? store;

  DeliverySchedule({
    required this.id,
    required this.orderId,
    required this.orderNumber,
    required this.storeId,
    required this.storeName,
    required this.scheduledDate,
    required this.scheduledTimeStart,
    this.scheduledTimeEnd,
    this.timeSlot,
    this.deliveryType,
    required this.status,
    required this.priority,
    this.deliveryAddress,
    this.contactPerson,
    this.contactPhone,
    this.specialInstructions,
    this.order,
    this.store,
  });

  factory DeliverySchedule.fromJson(Map<String, dynamic> json) {
    return DeliverySchedule(
      id: json['id'] ?? 0,
      orderId: json['order_id'] ?? 0,
      orderNumber: json['order_number'] ?? '',
      storeId: json['store_id'] ?? 0,
      storeName: json['store_name'] ?? '',
      scheduledDate: DateTime.parse(json['scheduled_date'] ?? DateTime.now().toIso8601String()),
      scheduledTimeStart: json['scheduled_time_start'] ?? '',
      scheduledTimeEnd: json['scheduled_time_end'],
      timeSlot: json['time_slot'],
      deliveryType: json['delivery_type'],
      status: json['status'] ?? 'scheduled',
      priority: json['priority'] ?? 'normal',
      deliveryAddress: json['delivery_address'],
      contactPerson: json['contact_person'],
      contactPhone: json['contact_phone'],
      specialInstructions: json['special_instructions'],
      order: json['order'] != null ? Order.fromJson(json['order']) : null,
      store: json['store'] != null ? Store.fromJson(json['store']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'order_id': orderId,
      'order_number': orderNumber,
      'store_id': storeId,
      'store_name': storeName,
      'scheduled_date': scheduledDate.toIso8601String().split('T')[0],
      'scheduled_time_start': scheduledTimeStart,
      'scheduled_time_end': scheduledTimeEnd,
      'time_slot': timeSlot,
      'delivery_type': deliveryType,
      'status': status,
      'priority': priority,
      'delivery_address': deliveryAddress,
      'contact_person': contactPerson,
      'contact_phone': contactPhone,
      'special_instructions': specialInstructions,
      'order': order?.toJson(),
      'store': store?.toJson(),
    };
  }

  // Helper methods
  bool get isCompleted => status == 'delivered';
  bool get isCancelled => status == 'cancelled';
  bool get isInProgress => status == 'in_progress';
  bool get isScheduled => status == 'scheduled' || status == 'confirmed';

  String get statusText {
    switch (status) {
      case 'scheduled':
        return 'مجدول';
      case 'confirmed':
        return 'مؤكد';
      case 'in_progress':
        return 'قيد التسليم';
      case 'delivered':
        return 'تم التسليم';
      case 'missed':
        return 'فائت';
      case 'cancelled':
        return 'ملغي';
      case 'rescheduled':
        return 'معاد جدولة';
      default:
        return status;
    }
  }

  String get priorityText {
    switch (priority) {
      case 'low':
        return 'منخفض';
      case 'normal':
        return 'عادي';
      case 'high':
        return 'عالي';
      case 'urgent':
        return 'عاجل';
      default:
        return priority;
    }
  }
}

/// Order Model for delivery schedule
class Order {
  final int id;
  final String orderNumber;
  final double totalAmountEur;
  final String status;

  Order({
    required this.id,
    required this.orderNumber,
    required this.totalAmountEur,
    required this.status,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] ?? 0,
      orderNumber: json['order_number'] ?? '',
      totalAmountEur: (json['total_amount_eur'] ?? 0).toDouble(),
      status: json['status'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'order_number': orderNumber,
      'total_amount_eur': totalAmountEur,
      'status': status,
    };
  }
}

/// Store Model for delivery schedule
class Store {
  final int id;
  final String name;
  final String? address;
  final String? phone;

  Store({
    required this.id,
    required this.name,
    this.address,
    this.phone,
  });

  factory Store.fromJson(Map<String, dynamic> json) {
    return Store(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      address: json['address'],
      phone: json['phone'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'phone': phone,
    };
  }
} 