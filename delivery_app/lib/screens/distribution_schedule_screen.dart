import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubits/distribution_schedule_cubit.dart';
import '../core/api/api_service.dart';
import '../core/models/store.dart';
import 'store_details_screen.dart';
import 'package:intl/intl.dart';
import '../core/storage/session_manager.dart';

class DistributionScheduleScreen extends StatelessWidget {
  const DistributionScheduleScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
    return FutureBuilder<int?>(
      future: SessionManager.getUserId(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Center(child: CircularProgressIndicator());
        }
        // يمكن استخدام userId أو vehicleId هنا حسب الحاجة
        return BlocProvider(
          create: (_) => DistributionScheduleCubit(ApiService())..fetchSchedule(today),
          child: BlocBuilder<DistributionScheduleCubit, DistributionScheduleState>(
            builder: (context, state) {
              if (state is DistributionScheduleLoading) {
                return const Center(child: CircularProgressIndicator());
              } else if (state is DistributionScheduleLoaded) {
                final stores = state.schedule.stores;
                return RefreshIndicator(
                  onRefresh: () async {
                    context.read<DistributionScheduleCubit>().fetchSchedule(today);
                  },
                  child: ListView.builder(
                    itemCount: stores.length,
                    itemBuilder: (context, index) {
                      final Store store = stores[index];
                      return ListTile(
                        title: Text(store.name),
                        subtitle: Text('الرصيد: ${store.balance.toStringAsFixed(2)}'),
                        trailing: const Icon(Icons.arrow_forward_ios),
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => StoreDetailsScreen(store: store),
                            ),
                          );
                        },
                      );
                    },
                  ),
                );
              } else if (state is DistributionScheduleError) {
                return Center(child: Text(state.message));
              }
              return const Center(child: Text('لا يوجد بيانات'));
            },
          ),
        );
      },
    );
  }
} 