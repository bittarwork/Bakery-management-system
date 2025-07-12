import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubits/notifications_cubit.dart';
import '../core/api/api_service.dart';
import '../core/models/notification.dart';
import '../core/storage/session_manager.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<int?>(
      future: SessionManager.getUserId(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Center(child: CircularProgressIndicator());
        }
        final userId = snapshot.data!;
        return BlocProvider(
          create: (_) => NotificationsCubit(ApiService())..fetchNotifications(userId),
          child: BlocBuilder<NotificationsCubit, NotificationsState>(
            builder: (context, state) {
              if (state is NotificationsLoading) {
                return const Center(child: CircularProgressIndicator());
              } else if (state is NotificationsLoaded) {
                if (state.notifications.isEmpty) {
                  return const Center(child: Text('لا يوجد إشعارات'));
                }
                return ListView.builder(
                  itemCount: state.notifications.length,
                  itemBuilder: (context, index) {
                    final NotificationModel n = state.notifications[index];
                    return ListTile(
                      leading: Icon(
                        n.isRead ? Icons.notifications : Icons.notifications_active,
                        color: n.isRead ? Colors.grey : Colors.blue,
                      ),
                      title: Text(n.title),
                      subtitle: Text(n.body),
                      trailing: Text(n.date, style: const TextStyle(fontSize: 12)),
                    );
                  },
                );
              } else if (state is NotificationsError) {
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