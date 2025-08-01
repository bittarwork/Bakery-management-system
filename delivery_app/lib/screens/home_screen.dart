import 'package:flutter/material.dart';
import 'distribution_schedule_screen.dart';
import 'payment_screen.dart';
import 'inventory_screen.dart';
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
    final screenWidth = MediaQuery.of(context).size.width;
    final isTablet = screenWidth > 600; // تعريف التابلت

    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_selectedIndex]),
        centerTitle: true,
      ),
      body: Row(
        children: [
          // Sidebar للتابلت
          if (isTablet)
            Container(
              width: 200,
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor.withOpacity(0.1),
                border: Border(
                  right: BorderSide(
                    color: Theme.of(context).dividerColor,
                    width: 1,
                  ),
                ),
              ),
              child: Column(
                children: [
                  const SizedBox(height: 20),
                  ...List.generate(_titles.length, (index) {
                    return Container(
                      width: double.infinity,
                      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      child: ListTile(
                        leading: Icon(_getIcon(index)),
                        title: Text(_titles[index]),
                        selected: _selectedIndex == index,
                        onTap: () => setState(() => _selectedIndex = index),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
          // المحتوى الرئيسي
          Expanded(
            child: _screens[_selectedIndex],
          ),
        ],
      ),
      // Bottom Navigation للموبايل فقط
      bottomNavigationBar: isTablet
          ? null
          : BottomNavigationBar(
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

  IconData _getIcon(int index) {
    switch (index) {
      case 0:
        return Icons.route;
      case 1:
        return Icons.payment;
      case 2:
        return Icons.inventory;
      case 3:
        return Icons.settings;
      default:
        return Icons.home;
    }
  }
} 