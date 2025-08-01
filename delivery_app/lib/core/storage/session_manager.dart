import 'package:hive/hive.dart';

class SessionManager {
  static const String _sessionBox = 'sessionBox';
  static const String _userIdKey = 'userId';
  static const String _vehicleIdKey = 'vehicleId';

  static Future<void> saveUserId(int userId) async {
    final box = await Hive.openBox(_sessionBox);
    await box.put(_userIdKey, userId);
  }

  static Future<int?> getUserId() async {
    final box = await Hive.openBox(_sessionBox);
    return box.get(_userIdKey);
  }

  static Future<void> saveVehicleId(int vehicleId) async {
    final box = await Hive.openBox(_sessionBox);
    await box.put(_vehicleIdKey, vehicleId);
  }

  static Future<int?> getVehicleId() async {
    final box = await Hive.openBox(_sessionBox);
    return box.get(_vehicleIdKey);
  }

  static Future<void> clearSession() async {
    final box = await Hive.openBox(_sessionBox);
    await box.clear();
  }
} 