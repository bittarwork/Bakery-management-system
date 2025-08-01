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
    return await _dio.post(
      'https://bakery-management-system-production.up.railway.app/api/auth/login',
      data: {
        'username': username,
        'password': password,
      },
    );
  }

  Future<DistributionSchedule> getDistributionScheduleForUser(int userId) async {
    final token = await LocalStorage.getToken();
    print('ApiService: Fetching distribution schedule for userId: $userId');
    try {
      final response = await _dio.get(
        'https://bakery-management-system-production.up.railway.app/api/distribution/schedules/distributor/$userId',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      print('ApiService: Distribution schedule response: ${response.statusCode}');
      return DistributionSchedule.fromJson(response.data);
    } catch (e) {
      print('ApiService: Error fetching distribution schedule: $e');
      rethrow;
    }
  }

  Future<Delivery> getStoreDeliveryDetails(int storeId) async {
    final token = await LocalStorage.getToken();
    final response = await _dio.get(
      'https://bakery-management-system-production.up.railway.app/api/distribution/store/$storeId/details',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return Delivery.fromJson(response.data);
  }

  Future<void> updateDeliveryQuantities(int deliveryId, List<Map<String, dynamic>> items) async {
    final token = await LocalStorage.getToken();
    await _dio.patch(
      'https://bakery-management-system-production.up.railway.app/api/distribution/delivery/$deliveryId/quantities',
      data: {'items': items},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<List<Payment>> getPayments(int storeId) async {
    final token = await LocalStorage.getToken();
    final response = await _dio.get(
      'https://bakery-management-system-production.up.railway.app/api/payments',
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
    print('ApiService: Recording payment with token: ${token?.substring(0, 20)}...');
    print('ApiService: storeId = $storeId, amount = $amount, currency = $currency, method = $method');
    
    try {
      // تحضير البيانات حسب controller الخادم
      final Map<String, dynamic> paymentData = {
        'store_id': int.parse(storeId.toString()),
        'payment_method': method.toString(),
        'payment_type': 'payment', // كما في controller
        'payment_date': DateTime.now().toIso8601String(),
        if (note != null) 'notes': note.toString(),
      };

      // إضافة المبلغ حسب العملة
      if (currency == 'EUR') {
        paymentData['amount_eur'] = double.parse(amount.toString());
        paymentData['amount_syp'] = 0;
      } else if (currency == 'SYP') {
        paymentData['amount_syp'] = double.parse(amount.toString());
        paymentData['amount_eur'] = 0;
      }

      print('ApiService: Sending payment data: $paymentData');
      print('ApiService: store_id = ${paymentData['store_id']} (${paymentData['store_id'].runtimeType})');
      print('ApiService: amount_eur = ${paymentData['amount_eur']} (${paymentData['amount_eur'].runtimeType})');
      print('ApiService: amount_syp = ${paymentData['amount_syp']} (${paymentData['amount_syp'].runtimeType})');
      print('ApiService: payment_method = ${paymentData['payment_method']} (${paymentData['payment_method'].runtimeType})');
      print('ApiService: payment_type = ${paymentData['payment_type']} (${paymentData['payment_type'].runtimeType})');
      print('ApiService: payment_date = ${paymentData['payment_date']} (${paymentData['payment_date'].runtimeType})');

      // طباعة البيانات كـ JSON للتأكد
      print('ApiService: JSON data: ${paymentData.toString()}');

      final response = await _dio.post(
        'https://bakery-management-system-production.up.railway.app/api/payments',
        data: paymentData,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
        ),
      );
      print('ApiService: Payment recorded successfully. Response status: ${response.statusCode}');
    } catch (e) {
      print('ApiService: Error recording payment: $e');
      if (e is DioException) {
        print('ApiService: DioException type: ${e.type}');
        print('ApiService: Response status: ${e.response?.statusCode}');
        print('ApiService: Response data: ${e.response?.data}');
      }
      rethrow;
    }
  }

  Future<Inventory> getInventory(int vehicleId) async {
    final token = await LocalStorage.getToken();
    final response = await _dio.get(
      'https://bakery-management-system-production.up.railway.app/api/distribution/vehicle/inventory',
      queryParameters: {'vehicleId': vehicleId},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return Inventory.fromJson(response.data);
  }

  Future<void> updateInventory(int vehicleId, List<Map<String, dynamic>> items) async {
    final token = await LocalStorage.getToken();
    await _dio.patch(
      'https://bakery-management-system-production.up.railway.app/api/distribution/vehicle/inventory',
      data: {'vehicleId': vehicleId, 'items': items},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<List<Expense>> getExpenses(int vehicleId) async {
    final token = await LocalStorage.getToken();
    final response = await _dio.get(
      'https://bakery-management-system-production.up.railway.app/api/expenses',
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
      'https://bakery-management-system-production.up.railway.app/api/expenses/record',
      data: formData,
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<List<DailyReport>> getDailyReports(int vehicleId) async {
    final token = await LocalStorage.getToken();
    final response = await _dio.get(
      'https://bakery-management-system-production.up.railway.app/api/reports/daily',
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
      'https://bakery-management-system-production.up.railway.app/api/distribution/report/daily/submit',
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
      'https://bakery-management-system-production.up.railway.app/api/notifications',
      queryParameters: {'userId': userId},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return (response.data as List).map((e) => NotificationModel.fromJson(e)).toList();
  }
} 