import 'package:dio/dio.dart';
import '../storage/local_storage.dart';
import '../models/distribution_schedule.dart';
import '../models/delivery.dart';
import '../models/payment.dart';
import '../models/payment_method.dart';
import '../models/inventory.dart';
import '../models/expense.dart';
import '../models/expense_type.dart';
import '../models/daily_report.dart';
import '../models/notification.dart';

class ApiService {
  final Dio _dio = Dio();

  // مثال: تسجيل الدخول
  Future<Response> login(String username, String password) async {
    // هنا تضع عنوان الـ API الحقيقي
    // return await _dio.post('https://your.api/login', data: { ... });
    return Response(
      requestOptions: RequestOptions(path: ''),
      statusCode: 200,
      data: {'token': 'dummy_token'},
    );
  }

  Future<DistributionSchedule> getDistributionSchedule(String date) async {
    final token = await LocalStorage.getToken();
    final response = await _dio.get(
      'https://your.api/distribution/schedule/daily',
      queryParameters: {'date': date},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return DistributionSchedule.fromJson(response.data);
  }

  Future<Delivery> getStoreDeliveryDetails(int storeId) async {
    final token = await LocalStorage.getToken();
    final response = await _dio.get(
      'https://your.api/distribution/store/$storeId/details',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return Delivery.fromJson(response.data);
  }

  Future<void> updateDeliveryQuantities(int deliveryId, List<Map<String, dynamic>> items) async {
    final token = await LocalStorage.getToken();
    await _dio.patch(
      'https://your.api/distribution/delivery/$deliveryId/quantities',
      data: {'items': items},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<List<Payment>> getPayments(int storeId) async {
    final token = await LocalStorage.getToken();
    final response = await _dio.get(
      'https://your.api/payments',
      queryParameters: {'storeId': storeId},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return (response.data as List).map((e) => Payment.fromJson(e)).toList();
  }

  Future<void> recordPayment({
    required int storeId,
    required double amount,
    required String currency,
    required String method,
    String? note,
  }) async {
    final token = await LocalStorage.getToken();
    await _dio.post(
      'https://your.api/payments/flexible',
      data: {
        'storeId': storeId,
        'amount': amount,
        'currency': currency,
        'method': method,
        if (note != null) 'note': note,
      },
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Inventory> getInventory(int vehicleId) async {
    final token = await LocalStorage.getToken();
    final response = await _dio.get(
      'https://your.api/distribution/vehicle/inventory',
      queryParameters: {'vehicleId': vehicleId},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return Inventory.fromJson(response.data);
  }

  Future<void> updateInventory(int vehicleId, List<Map<String, dynamic>> items) async {
    final token = await LocalStorage.getToken();
    await _dio.patch(
      'https://your.api/distribution/vehicle/inventory',
      data: {'vehicleId': vehicleId, 'items': items},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<List<Expense>> getExpenses(int vehicleId) async {
    final token = await LocalStorage.getToken();
    final response = await _dio.get(
      'https://your.api/expenses',
      queryParameters: {'vehicleId': vehicleId},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return (response.data as List).map((e) => Expense.fromJson(e)).toList();
  }

  Future<void> recordExpense({
    required int vehicleId,
    required double amount,
    required String type,
    String? note,
    String? date,
    String? receiptPath,
  }) async {
    final token = await LocalStorage.getToken();
    FormData formData = FormData.fromMap({
      'vehicleId': vehicleId,
      'amount': amount,
      'type': type,
      if (note != null) 'note': note,
      if (date != null) 'date': date,
      if (receiptPath != null) 'receipt': await MultipartFile.fromFile(receiptPath),
    });
    await _dio.post(
      'https://your.api/expenses/record',
      data: formData,
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<List<DailyReport>> getDailyReports(int vehicleId) async {
    final token = await LocalStorage.getToken();
    final response = await _dio.get(
      'https://your.api/reports/daily',
      queryParameters: {'vehicleId': vehicleId},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return (response.data as List).map((e) => DailyReport.fromJson(e)).toList();
  }

  Future<void> submitDailyReport({
    required int vehicleId,
    required String date,
    required int totalDeliveries,
    required double totalPayments,
    required double totalExpenses,
    String? notes,
  }) async {
    final token = await LocalStorage.getToken();
    await _dio.post(
      'https://your.api/distribution/report/daily/submit',
      data: {
        'vehicleId': vehicleId,
        'date': date,
        'totalDeliveries': totalDeliveries,
        'totalPayments': totalPayments,
        'totalExpenses': totalExpenses,
        if (notes != null) 'notes': notes,
      },
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<List<NotificationModel>> getNotifications(int userId) async {
    final token = await LocalStorage.getToken();
    final response = await _dio.get(
      'https://your.api/notifications',
      queryParameters: {'userId': userId},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return (response.data as List).map((e) => NotificationModel.fromJson(e)).toList();
  }
} 