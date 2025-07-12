import 'offline_cache.dart';
import '../models/payment.dart';
import '../models/inventory.dart';
import '../models/expense.dart';
import '../models/daily_report.dart';
import '../models/notification.dart';

final paymentsOfflineCache = OfflineCache<Payment>(
  boxName: 'paymentsBox',
  pendingOpsBoxName: 'paymentsPendingOpsBox',
  cacheKey: 'payments',
  fromJson: (json) => Payment.fromJson(json),
  toJson: (p) => {
    'id': p.id,
    'storeId': p.storeId,
    'amount': p.amount,
    'currency': p.currency,
    'method': p.method,
    'date': p.date,
    'note': p.note,
  },
);

final inventoryOfflineCache = OfflineCache<Inventory>(
  boxName: 'inventoryBox',
  pendingOpsBoxName: 'inventoryPendingOpsBox',
  cacheKey: 'inventory',
  fromJson: (json) => Inventory.fromJson(json),
  toJson: (inv) => {
    'id': inv.id,
    'vehicleId': inv.vehicleId,
    'items': inv.items.map((e) => e.toJson()).toList(),
    'damages': inv.damages.map((e) => e.toJson()).toList(),
    'returns': inv.returns.map((e) => e.toJson()).toList(),
  },
);

final expensesOfflineCache = OfflineCache<Expense>(
  boxName: 'expensesBox',
  pendingOpsBoxName: 'expensesPendingOpsBox',
  cacheKey: 'expenses',
  fromJson: (json) => Expense.fromJson(json),
  toJson: (e) => {
    'id': e.id,
    'vehicleId': e.vehicleId,
    'amount': e.amount,
    'type': e.type,
    'date': e.date,
    'note': e.note,
    'receiptUrl': e.receiptUrl,
  },
);

final dailyReportsOfflineCache = OfflineCache<DailyReport>(
  boxName: 'dailyReportsBox',
  pendingOpsBoxName: 'dailyReportsPendingOpsBox',
  cacheKey: 'dailyReport',
  fromJson: (json) => DailyReport.fromJson(json),
  toJson: (r) => {
    'id': r.id,
    'vehicleId': r.vehicleId,
    'date': r.date,
    'totalDeliveries': r.totalDeliveries,
    'totalPayments': r.totalPayments,
    'totalExpenses': r.totalExpenses,
    'notes': r.notes,
    'status': r.status,
  },
);

final notificationsOfflineCache = OfflineCache<NotificationModel>(
  boxName: 'notificationsBox',
  pendingOpsBoxName: 'notificationsPendingOpsBox',
  cacheKey: 'notifications',
  fromJson: (json) => NotificationModel.fromJson(json),
  toJson: (n) => {
    'id': n.id,
    'title': n.title,
    'body': n.body,
    'date': n.date,
    'isRead': n.isRead,
    'type': n.type,
  },
); 