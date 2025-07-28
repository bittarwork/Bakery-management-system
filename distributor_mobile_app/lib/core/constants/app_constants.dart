class AppConstants {
  // App Information
  static const String appName = 'نظام توزيع المخبزة';
  static const String version = '1.0.0';
  
  // API Configuration
  static const String baseUrl = 'https://bakery-management-system-production.up.railway.app/api';
  static const String mobileApiPrefix = '/mobile';
  
  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userDataKey = 'user_data';
  static const String settingsKey = 'app_settings';
  
  // Supported Currencies
  static const List<String> supportedCurrencies = ['EUR', 'SYP'];
  static const String defaultCurrency = 'EUR';
  
  // App Settings
  static const int requestTimeoutDuration = 30; // seconds
  static const int locationUpdateInterval = 30; // seconds
  static const int maxRetryAttempts = 3;
  
  // Order Status
  static const String orderStatusPending = 'pending';
  static const String orderStatusInTransit = 'in_transit';
  static const String orderStatusDelivered = 'delivered';
  static const String orderStatusReturned = 'returned';
  static const String orderStatusCancelled = 'cancelled';
  
  // Payment Methods
  static const String paymentMethodCash = 'cash';
  static const String paymentMethodBank = 'bank';
  static const String paymentMethodMixed = 'mixed';
  
  // User Roles
  static const String roleDistributor = 'distributor';
  static const String roleAdmin = 'admin';
  static const String roleManager = 'manager';
  
  // Image Quality Settings
  static const int imageQualityHigh = 90;
  static const int imageQualityMedium = 70;
  static const int imageQualityLow = 50;
  
  // Date Formats
  static const String dateFormat = 'yyyy-MM-dd';
  static const String timeFormat = 'HH:mm';
  static const String dateTimeFormat = 'yyyy-MM-dd HH:mm:ss';
} 