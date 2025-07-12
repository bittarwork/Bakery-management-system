import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'screens/login_screen.dart';
import 'theme/app_theme.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'cubits/payment_cubit.dart';
import 'cubits/inventory_cubit.dart';
import 'cubits/expenses_cubit.dart';
import 'cubits/daily_report_cubit.dart';
import 'cubits/notifications_cubit.dart';
// سيتم استيراد LoginScreen لاحقًا من screens/login_screen.dart
final GlobalKey<ScaffoldMessengerState> rootScaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

void main() {
  runApp(const BakeryDistributorApp());
}

class BakeryDistributorApp extends StatelessWidget {
  const BakeryDistributorApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ConnectivityListener(
      child: MaterialApp(
        title: 'تطبيق الموزعين',
        theme: AppTheme.lightTheme,
        scaffoldMessengerKey: rootScaffoldMessengerKey,
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [Locale('ar', ''), Locale('en', '')],
        locale: const Locale('ar', ''),
        builder: (context, child) => Directionality(
          textDirection: TextDirection.rtl,
          child: child!,
        ),
        home: const LoginScreen(),
      ),
    );
  }
}

class ConnectivityListener extends StatefulWidget {
  final Widget child;
  const ConnectivityListener({Key? key, required this.child}) : super(key: key);

  @override
  State<ConnectivityListener> createState() => _ConnectivityListenerState();
}

class _ConnectivityListenerState extends State<ConnectivityListener> {
  late final Connectivity _connectivity;
  late final Stream<ConnectivityResult> _stream;
  bool _wasOffline = false;

  @override
  void initState() {
    super.initState();
    _connectivity = Connectivity();
    _stream = _connectivity.onConnectivityChanged;
    _stream.listen((result) async {
      final isOffline = result == ConnectivityResult.none;
      if (isOffline && !_wasOffline) {
        rootScaffoldMessengerKey.currentState?.showSnackBar(
          const SnackBar(content: Text('لا يوجد اتصال بالإنترنت'), backgroundColor: Colors.red),
        );
      } else if (!isOffline && _wasOffline) {
        rootScaffoldMessengerKey.currentState?.showSnackBar(
          const SnackBar(content: Text('تم استعادة الاتصال بالإنترنت'), backgroundColor: Colors.green),
        );
        // عند عودة الاتصال: مزامنة جميع الكيانات
        final ctx = context;
        // Payments
        final paymentCubit = BlocProvider.of<PaymentCubit?>(ctx, listen: false);
        paymentCubit?.synchronizePendingOps();
        // Inventory
        final inventoryCubit = BlocProvider.of<InventoryCubit?>(ctx, listen: false);
        inventoryCubit?.synchronizePendingOps();
        // Expenses
        final expensesCubit = BlocProvider.of<ExpensesCubit?>(ctx, listen: false);
        expensesCubit?.synchronizePendingOps();
        // Daily Reports
        final dailyReportCubit = BlocProvider.of<DailyReportCubit?>(ctx, listen: false);
        dailyReportCubit?.synchronizePendingOps();
        // Notifications (للاتساق)
        final notificationsCubit = BlocProvider.of<NotificationsCubit?>(ctx, listen: false);
        notificationsCubit?.synchronizePendingOps();
      }
      _wasOffline = isOffline;
    });
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
