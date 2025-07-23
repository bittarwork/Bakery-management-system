import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubits/delivery_schedule_cubit.dart';
import '../core/api/api_service.dart';
import '../core/models/delivery_schedule.dart';
import '../main.dart';

/// Enhanced Delivery Scheduling Screen
/// Shows delivery schedules with filtering and status updates
class DeliverySchedulingScreen extends StatefulWidget {
  const DeliverySchedulingScreen({Key? key}) : super(key: key);

  @override
  State<DeliverySchedulingScreen> createState() => _DeliverySchedulingScreenState();
}

class _DeliverySchedulingScreenState extends State<DeliverySchedulingScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  String? _selectedStatus;
  DateTime? _selectedDate;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => DeliveryScheduleCubit(ApiService())..fetchTodayDeliveries(),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('جدولة التسليم'),
          backgroundColor: Colors.blue[800],
          foregroundColor: Colors.white,
          bottom: TabBar(
            controller: _tabController,
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white70,
            indicatorColor: Colors.white,
            tabs: const [
              Tab(text: 'اليوم', icon: Icon(Icons.today)),
              Tab(text: 'مجدول', icon: Icon(Icons.schedule)),
              Tab(text: 'قيد التسليم', icon: Icon(Icons.local_shipping)),
              Tab(text: 'مكتمل', icon: Icon(Icons.check_circle)),
            ],
          ),
        ),
        body: Column(
          children: [
            _buildFilterSection(),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildSchedulesList('today'),
                  _buildSchedulesList('scheduled'),
                  _buildSchedulesList('in_progress'),
                  _buildSchedulesList('delivered'),
                ],
              ),
            ),
          ],
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () => _refreshCurrentTab(),
          backgroundColor: Colors.blue[800],
          child: const Icon(Icons.refresh, color: Colors.white),
        ),
      ),
    );
  }

  Widget _buildFilterSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        border: Border(bottom: BorderSide(color: Colors.grey[300]!)),
      ),
      child: Column(
        children: [
          // Search bar
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'البحث في الطلبات...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchController.clear();
                        _performSearch();
                      },
                    )
                  : null,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide.none,
              ),
              filled: true,
              fillColor: Colors.white,
            ),
            onChanged: (_) => _performSearch(),
          ),
          const SizedBox(height: 12),
          // Quick filters
          Row(
            children: [
              Expanded(
                child: _buildQuickFilterChip('عالي الأولوية', 'high', Colors.red),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildQuickFilterChip('تسليم سريع', 'express', Colors.orange),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildDateFilterChip(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickFilterChip(String label, String filter, Color color) {
    return FilterChip(
      label: Text(label),
      selected: _selectedStatus == filter,
      onSelected: (selected) {
        setState(() {
          _selectedStatus = selected ? filter : null;
        });
        _applyFilters();
      },
      selectedColor: color.withOpacity(0.2),
      checkmarkColor: color,
    );
  }

  Widget _buildDateFilterChip() {
    return FilterChip(
      label: Text(_selectedDate != null 
          ? '${_selectedDate!.day}/${_selectedDate!.month}' 
          : 'تاريخ محدد'),
      selected: _selectedDate != null,
      onSelected: (selected) async {
        if (selected) {
          final date = await showDatePicker(
            context: context,
            initialDate: DateTime.now(),
            firstDate: DateTime.now().subtract(const Duration(days: 30)),
            lastDate: DateTime.now().add(const Duration(days: 30)),
          );
          if (date != null) {
            setState(() {
              _selectedDate = date;
            });
            _applyFilters();
          }
        } else {
          setState(() {
            _selectedDate = null;
          });
          _applyFilters();
        }
      },
      selectedColor: Colors.blue.withOpacity(0.2),
    );
  }

  Widget _buildSchedulesList(String filterType) {
    return BlocConsumer<DeliveryScheduleCubit, DeliveryScheduleState>(
      listener: (context, state) {
        if (state is DeliveryScheduleError) {
          rootScaffoldMessengerKey.currentState?.showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: Colors.red,
            ),
          );
        } else if (state is DeliveryScheduleStatusUpdated) {
          rootScaffoldMessengerKey.currentState?.showSnackBar(
            const SnackBar(
              content: Text('تم تحديث حالة التسليم بنجاح'),
              backgroundColor: Colors.green,
            ),
          );
        }
      },
      builder: (context, state) {
        if (state is DeliveryScheduleLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        if (state is DeliveryScheduleLoaded) {
          final schedules = _filterSchedulesByType(state.schedules, filterType);
          
          if (schedules.isEmpty) {
            return _buildEmptyState(filterType);
          }

          return RefreshIndicator(
            onRefresh: () => _refreshCurrentTab(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: schedules.length,
              itemBuilder: (context, index) {
                return _buildScheduleCard(schedules[index]);
              },
            ),
          );
        }

        return _buildEmptyState(filterType);
      },
    );
  }

  Widget _buildScheduleCard(DeliverySchedule schedule) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with order number and status
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'طلب #${schedule.orderNumber}',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                _buildStatusChip(schedule.status),
              ],
            ),
            const SizedBox(height: 12),
            
            // Store info
            Row(
              children: [
                const Icon(Icons.store, size: 20, color: Colors.blue),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    schedule.storeName,
                    style: const TextStyle(fontSize: 16),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            
            // Schedule info
            Row(
              children: [
                const Icon(Icons.schedule, size: 20, color: Colors.green),
                const SizedBox(width: 8),
                Text(
                  '${schedule.scheduledDate.day}/${schedule.scheduledDate.month} - ${schedule.scheduledTimeStart}',
                  style: const TextStyle(fontSize: 16),
                ),
                if (schedule.scheduledTimeEnd != null)
                  Text(' حتى ${schedule.scheduledTimeEnd}'),
              ],
            ),
            
            // Contact info
            if (schedule.contactPerson != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.person, size: 20, color: Colors.orange),
                  const SizedBox(width: 8),
                  Text(schedule.contactPerson!),
                  if (schedule.contactPhone != null) ...[
                    const SizedBox(width: 16),
                    const Icon(Icons.phone, size: 20, color: Colors.orange),
                    const SizedBox(width: 4),
                    Text(schedule.contactPhone!),
                  ],
                ],
              ),
            ],
            
            // Special instructions
            if (schedule.specialInstructions != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.yellow[50],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.yellow[300]!),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.info, size: 20, color: Colors.amber),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        schedule.specialInstructions!,
                        style: const TextStyle(fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            
            const SizedBox(height: 16),
            
            // Action buttons
            _buildActionButtons(schedule),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color color;
    String text;
    
    switch (status) {
      case 'scheduled':
        color = Colors.blue;
        text = 'مجدول';
        break;
      case 'confirmed':
        color = Colors.green;
        text = 'مؤكد';
        break;
      case 'in_progress':
        color = Colors.orange;
        text = 'قيد التسليم';
        break;
      case 'delivered':
        color = Colors.green[700]!;
        text = 'مكتمل';
        break;
      case 'cancelled':
        color = Colors.red;
        text = 'ملغي';
        break;
      default:
        color = Colors.grey;
        text = status;
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildActionButtons(DeliverySchedule schedule) {
    List<Widget> buttons = [];
    
    // Actions based on status
    switch (schedule.status) {
      case 'confirmed':
        buttons.add(
          ElevatedButton.icon(
            onPressed: () => _updateStatus(schedule.id, 'in_progress'),
            icon: const Icon(Icons.play_arrow, size: 18),
            label: const Text('بدء التسليم'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
          ),
        );
        break;
        
      case 'in_progress':
        buttons.addAll([
          ElevatedButton.icon(
            onPressed: () => _updateStatus(schedule.id, 'delivered'),
            icon: const Icon(Icons.check, size: 18),
            label: const Text('تم التسليم'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green[700],
              foregroundColor: Colors.white,
            ),
          ),
          const SizedBox(width: 8),
          OutlinedButton.icon(
            onPressed: () => _updateStatus(schedule.id, 'missed'),
            icon: const Icon(Icons.close, size: 18),
            label: const Text('فشل التسليم'),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.red,
              side: const BorderSide(color: Colors.red),
            ),
          ),
        ]);
        break;
    }
    
    if (buttons.isEmpty) {
      return const SizedBox.shrink();
    }
    
    return Row(
      children: buttons,
    );
  }

  Widget _buildEmptyState(String filterType) {
    String message;
    IconData icon;
    
    switch (filterType) {
      case 'today':
        message = 'لا توجد مهام تسليم اليوم';
        icon = Icons.today;
        break;
      case 'scheduled':
        message = 'لا توجد مهام مجدولة';
        icon = Icons.schedule;
        break;
      case 'in_progress':
        message = 'لا توجد مهام قيد التنفيذ';
        icon = Icons.local_shipping;
        break;
      case 'delivered':
        message = 'لا توجد مهام مكتملة';
        icon = Icons.check_circle;
        break;
      default:
        message = 'لا توجد بيانات';
        icon = Icons.inbox;
    }
    
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            message,
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => _refreshCurrentTab(),
            icon: const Icon(Icons.refresh),
            label: const Text('تحديث'),
          ),
        ],
      ),
    );
  }

  // Helper methods
  List<DeliverySchedule> _filterSchedulesByType(List<DeliverySchedule> schedules, String filterType) {
    switch (filterType) {
      case 'today':
        final today = DateTime.now();
        return schedules.where((s) => 
          s.scheduledDate.year == today.year &&
          s.scheduledDate.month == today.month &&
          s.scheduledDate.day == today.day
        ).toList();
      case 'scheduled':
        return schedules.where((s) => s.isScheduled).toList();
      case 'in_progress':
        return schedules.where((s) => s.isInProgress).toList();
      case 'delivered':
        return schedules.where((s) => s.isCompleted).toList();
      default:
        return schedules;
    }
  }

  void _performSearch() {
    final query = _searchController.text;
    context.read<DeliveryScheduleCubit>().searchSchedules(query);
  }

  void _applyFilters() {
    // Apply current filters
    if (_selectedDate != null) {
      final endDate = _selectedDate!.add(const Duration(days: 1));
      context.read<DeliveryScheduleCubit>().fetchDeliveriesForDateRange(_selectedDate!, endDate);
    } else if (_selectedStatus != null) {
      context.read<DeliveryScheduleCubit>().fetchSchedulesByStatus(_selectedStatus!);
    } else {
      _refreshCurrentTab();
    }
  }

  void _refreshCurrentTab() {
    final cubit = context.read<DeliveryScheduleCubit>();
    switch (_tabController.index) {
      case 0:
        cubit.fetchTodayDeliveries();
        break;
      case 1:
        cubit.fetchSchedulesByStatus('scheduled');
        break;
      case 2:
        cubit.fetchSchedulesByStatus('in_progress');
        break;
      case 3:
        cubit.fetchSchedulesByStatus('delivered');
        break;
    }
  }

  void _updateStatus(int scheduleId, String newStatus) {
    context.read<DeliveryScheduleCubit>().updateDeliveryStatus(scheduleId, newStatus);
  }
} 