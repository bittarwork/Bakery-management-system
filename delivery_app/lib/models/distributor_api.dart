import 'dart:convert';
import 'package:http/http.dart' as http;
import 'order_model.dart';
import 'return_model.dart';

class DistributorApi {
  final String baseUrl;
  final String token;

  DistributorApi({required this.baseUrl, required this.token});

  Future<List<OrderModel>> fetchOrders() async {
    final response = await http.get(
      Uri.parse('$baseUrl/orders'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final orders = data['data']['orders'] as List;
      return orders.map((order) {
        final store = order['store'] ?? {};
        return OrderModel(
          id: order['id'].toString(),
          bakeryName: order['items'] != null && order['items'].isNotEmpty ? order['items'][0]['product']['name'] : '',
          quantity: order['items'] != null && order['items'].isNotEmpty ? order['items'][0]['quantity'] : 0,
          branchName: store['name'] ?? '',
          branchAddress: store['address'] ?? '',
          branchPhone: store['phone'] ?? '',
          paymentMethod: order['payment_method'],
          latitude: store['latitude'] != null ? double.tryParse(store['latitude'].toString()) : null,
          longitude: store['longitude'] != null ? double.tryParse(store['longitude'].toString()) : null,
        );
      }).toList();
    } else {
      throw Exception('فشل في جلب الطلبات');
    }
  }

  Future<void> updateOrderPaymentMethod(String orderId, String paymentMethod) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/orders/$orderId'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: json.encode({'payment_method': paymentMethod}),
    );
    if (response.statusCode != 200) {
      throw Exception('فشل في تحديث طريقة الدفع');
    }
  }

  Future<void> addReturn(ReturnModel ret) async {
    final response = await http.post(
      Uri.parse('$baseUrl/returns'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: json.encode({
        'order_id': ret.orderId,
        'branch_name': ret.branchName,
        'product_name': ret.productName,
        'quantity': ret.quantity,
        'reason': ret.reason,
        'date': ret.date.toIso8601String(),
      }),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('فشل في إضافة المرتجع');
    }
  }

  Future<List<ReturnModel>> fetchReturns() async {
    final response = await http.get(
      Uri.parse('$baseUrl/returns'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final returns = data['data']['returns'] as List;
      return returns.map((ret) {
        return ReturnModel(
          id: ret['id'].toString(),
          orderId: ret['order_id'].toString(),
          branchName: ret['branch_name'] ?? '',
          productName: ret['product_name'] ?? '',
          quantity: ret['quantity'] ?? 0,
          reason: ret['reason'] ?? '',
          date: DateTime.tryParse(ret['date'] ?? '') ?? DateTime.now(),
        );
      }).toList();
    } else {
      throw Exception('فشل في جلب المرتجعات');
    }
  }
} 