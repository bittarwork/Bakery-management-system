import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_constants.dart';
import '../error/exceptions.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  late Dio _dio;
  final _storage = const FlutterSecureStorage();

  void initialize() {
    _dio = Dio();
    
    // Base options
    _dio.options = BaseOptions(
      baseUrl: AppConstants.baseUrl + AppConstants.mobileApiPrefix,
      connectTimeout: const Duration(seconds: AppConstants.requestTimeoutDuration),
      receiveTimeout: const Duration(seconds: AppConstants.requestTimeoutDuration),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    );

    // Add interceptors
    _addInterceptors();
  }

  void _addInterceptors() {
    // Request interceptor - add auth token
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add auth token if available
          final token = await _storage.read(key: AppConstants.tokenKey);
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          
          // Add timestamp
          options.headers['X-Request-Time'] = DateTime.now().toIso8601String();
          
          handler.next(options);
        },
        onError: (error, handler) {
          // Handle common errors
          if (error.response?.statusCode == 401) {
            // Token expired or invalid
            _handleUnauthorized();
          }
          
          handler.next(error);
        },
      ),
    );

    // Logging interceptor (only in debug mode)
    if (const bool.fromEnvironment('dart.vm.product') == false) {
      _dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
        requestHeader: true,
        responseHeader: false,
        error: true,
      ));
    }
  }

  Future<void> _handleUnauthorized() async {
    // Clear stored token
    await _storage.delete(key: AppConstants.tokenKey);
    await _storage.delete(key: AppConstants.userDataKey);
    
    // TODO: Navigate to login screen
    // This should be handled by the app's navigation system
  }

  // Authentication methods
  Future<Map<String, dynamic>> login({
    required String username,
    required String password,
  }) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'username': username,
        'password': password,
      });

      if (response.data['success'] == true) {
        // Store token
        final token = response.data['data']['token'];
        await _storage.write(key: AppConstants.tokenKey, value: token);
        
        // Store user data
        final userData = response.data['data']['user'];
        await _storage.write(
          key: AppConstants.userDataKey, 
          value: userData.toString()
        );
      }

      return response.data;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Dashboard methods
  Future<Map<String, dynamic>> getDashboardSummary() async {
    try {
      final response = await _dio.get('/dashboard/summary');
      return response.data;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Orders methods
  Future<Map<String, dynamic>> getTodayOrders() async {
    try {
      final response = await _dio.get('/orders/today');
      return response.data;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Map<String, dynamic>> updateOrderStatus({
    required int orderId,
    required String status,
    String? notes,
  }) async {
    try {
      final response = await _dio.put('/orders/$orderId/status', data: {
        'status': status,
        'notes': notes,
      });
      return response.data;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Payments methods
  Future<Map<String, dynamic>> recordPayment({
    required int orderId,
    double? amountEur,
    double? amountSyp,
    required String paymentMethod,
    String? notes,
  }) async {
    try {
      final response = await _dio.post('/payments', data: {
        'order_id': orderId,
        'amount_eur': amountEur,
        'amount_syp': amountSyp,
        'payment_method': paymentMethod,
        'notes': notes,
      });
      return response.data;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Profile methods
  Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await _dio.get('/profile');
      return response.data;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Error handling
  ApiException _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return NetworkException('Connection timeout. Please check your internet connection.');
        
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final message = error.response?.data?['message'] ?? 'Unknown error occurred';
        
        switch (statusCode) {
          case 400:
            return BadRequestException(message);
          case 401:
            return UnauthorizedException('Invalid credentials or session expired');
          case 403:
            return ForbiddenException('Access denied');
          case 404:
            return NotFoundException('Resource not found');
          case 500:
            return ServerException('Server error. Please try again later.');
          default:
            return ApiException('Error: $message');
        }
        
      case DioExceptionType.cancel:
        return ApiException('Request was cancelled');
        
      case DioExceptionType.unknown:
      default:
        return NetworkException('Network error. Please check your connection.');
    }
  }

  // Utility methods
  Future<void> clearAuthData() async {
    await _storage.delete(key: AppConstants.tokenKey);
    await _storage.delete(key: AppConstants.userDataKey);
  }

  Future<String?> getStoredToken() async {
    return await _storage.read(key: AppConstants.tokenKey);
  }

  Future<bool> isLoggedIn() async {
    final token = await getStoredToken();
    return token != null && token.isNotEmpty;
  }
} 