class PaymentMethod {
  final int id;
  final String name;
  final String? description;

  PaymentMethod({required this.id, required this.name, this.description});

  factory PaymentMethod.fromJson(Map<String, dynamic> json) => PaymentMethod(
    id: json['id'],
    name: json['name'],
    description: json['description'],
  );

  // قائمة طرق الدفع العالمية الأكثر شيوعًا
  static List<PaymentMethod> globalMethods = [
    PaymentMethod(id: 1, name: 'cash', description: 'نقدي'),
    PaymentMethod(id: 2, name: 'bank', description: 'بنكي'),
    PaymentMethod(id: 3, name: 'mixed', description: 'مختلط'),
    PaymentMethod(id: 4, name: 'credit_card', description: 'بطاقة ائتمان'),
    PaymentMethod(id: 5, name: 'debit_card', description: 'بطاقة خصم'),
    PaymentMethod(id: 6, name: 'paypal', description: 'PayPal'),
    PaymentMethod(id: 7, name: 'cheque', description: 'شيك'),
    PaymentMethod(id: 8, name: 'mobile_payment', description: 'دفع عبر الجوال'),
    PaymentMethod(id: 9, name: 'crypto', description: 'عملة رقمية'),
  ];
} 