class NotificationModel {
  final int id;
  final String title;
  final String body;
  final String date;
  final bool isRead;
  final String type;

  NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    required this.date,
    required this.isRead,
    required this.type,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) => NotificationModel(
    id: json['id'],
    title: json['title'],
    body: json['body'],
    date: json['date'],
    isRead: json['isRead'] ?? false,
    type: json['type'] ?? '',
  );
} 