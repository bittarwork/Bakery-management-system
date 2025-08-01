class Store {
  final int id;
  final String name;
  final String address;
  final double balance;
  final String? giftPolicy;
  final String? phone;
  final String? gpsCoordinates;

  Store({
    required this.id,
    required this.name,
    required this.address,
    required this.balance,
    this.giftPolicy,
    this.phone,
    this.gpsCoordinates,
  });

  factory Store.fromJson(Map<String, dynamic> json) => Store(
    id: json['id'] ?? 0,
    name: json['name'] ?? '',
    address: json['address'] ?? '',
    balance: (json['balance'] ?? 0).toDouble(),
    giftPolicy: json['giftPolicy'],
    phone: json['phone'],
    gpsCoordinates: json['gps_coordinates'],
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'address': address,
    'balance': balance,
    'giftPolicy': giftPolicy,
    'phone': phone,
    'gps_coordinates': gpsCoordinates,
  };
} 