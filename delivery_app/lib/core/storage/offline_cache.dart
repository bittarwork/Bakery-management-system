import 'package:hive/hive.dart';

typedef FromJson<T> = T Function(Map<String, dynamic> json);
typedef ToJson<T> = Map<String, dynamic> Function(T obj);

class OfflineCache<T> {
  final String boxName;
  final String pendingOpsBoxName;
  final String cacheKey;
  final FromJson<T> fromJson;
  final ToJson<T> toJson;

  OfflineCache({
    required this.boxName,
    required this.pendingOpsBoxName,
    required this.cacheKey,
    required this.fromJson,
    required this.toJson,
  });

  Future<void> save(T data) async {
    final box = await Hive.openBox(boxName);
    await box.put(cacheKey, toJson(data));
  }

  Future<T?> get() async {
    final box = await Hive.openBox(boxName);
    final json = box.get(cacheKey);
    if (json == null) return null;
    return fromJson(Map<String, dynamic>.from(json));
  }

  // العمليات المؤقتة (add/update/delete)
  Future<void> addPendingOp(Map<String, dynamic> op) async {
    final box = await Hive.openBox(pendingOpsBoxName);
    final List list = box.get('ops', defaultValue: []) as List;
    list.add(op);
    await box.put('ops', list);
  }

  Future<List<Map<String, dynamic>>> getPendingOps() async {
    final box = await Hive.openBox(pendingOpsBoxName);
    return (box.get('ops', defaultValue: []) as List).cast<Map<String, dynamic>>();
  }

  Future<void> clearPendingOps() async {
    final box = await Hive.openBox(pendingOpsBoxName);
    await box.put('ops', []);
  }
} 