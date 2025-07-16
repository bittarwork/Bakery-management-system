import 'package:flutter/material.dart';
import 'distribution_schedule_screen.dart';
import 'payment_screen.dart';
import 'inventory_screen.dart';
import 'notifications_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  static final List<Widget> _screens = [
    DistributionScheduleScreen(),
    PaymentScreen(),
    InventoryScreen(),
    SettingsScreen(),
  ];

  static final List<String> _titles = [
    'جدول التوزيع',
    'المدفوعات',
    'المخزون',
    'الإعدادات',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_titles[_selectedIndex])),
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Theme.of(context).primaryColor,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.route),
            label: 'التوزيع',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.payment),
            label: 'المدفوعات',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.inventory),
            label: 'المخزون',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'الإعدادات',
          ),
        ],
      ),
    );
  }
} 