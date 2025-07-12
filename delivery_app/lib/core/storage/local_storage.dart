import 'package:hive/hive.dart';

class LocalStorage {
  static const String _tokenBox = 'tokenBox';
  static const String _tokenKey = 'jwtToken';

  static Future<void> saveToken(String token) async {
    final box = await Hive.openBox(_tokenBox);
    await box.put(_tokenKey, token);
  }

  static Future<String?> getToken() async {
    final box = await Hive.openBox(_tokenBox);
    return box.get(_tokenKey);
  }

  static Future<void> clearToken() async {
    final box = await Hive.openBox(_tokenBox);
    await box.delete(_tokenKey);
  }
} 