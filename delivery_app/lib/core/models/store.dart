class Store {
  final int id;
  final String name;
  final String address;
  final double balance;
  final String? giftPolicy;

  Store({
    required this.id,
    required this.name,
    required this.address,
    required this.balance,
    this.giftPolicy,
  });

  factory Store.fromJson(Map<String, dynamic> json) => Store(
    id: json['id'],
    name: json['name'],
    address: json['address'],
    balance: (json['balance'] ?? 0).toDouble(),
    giftPolicy: json['giftPolicy'],
  );
} 