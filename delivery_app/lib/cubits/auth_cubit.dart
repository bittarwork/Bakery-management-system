import 'package:flutter_bloc/flutter_bloc.dart';
import '../core/storage/session_manager.dart';
import '../core/api/api_service.dart';
import '../core/storage/local_storage.dart';

abstract class AuthState {}
class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class AuthSuccess extends AuthState {}
class AuthFailure extends AuthState {
  final String message;
  AuthFailure(this.message);
}

class AuthCubit extends Cubit<AuthState> {
  AuthCubit() : super(AuthInitial());

  Future<void> login(String username, String password) async {
    emit(AuthLoading());
    try {
      final response = await ApiService().login(username, password);
      final data = response.data;
      print('API login response: ' + data.toString());
      if (data['success'] == true && data['data'] != null && data['data']['token'] != null) {
        await LocalStorage.saveToken(data['data']['token']);
        // إذا كان الـ backend يرجع userId أو vehicleId أضفهم هنا
        if (data['data']['user'] != null && data['data']['user']['id'] != null) {
          await SessionManager.saveUserId(data['data']['user']['id']);
        }
        if (data['data']['user'] != null && data['data']['user']['vehicleId'] != null) {
          await SessionManager.saveVehicleId(data['data']['user']['vehicleId']);
        }
        emit(AuthSuccess());
      } else {
        emit(AuthFailure(data['message'] ?? 'بيانات الدخول غير صحيحة'));
      }
    } catch (e) {
      emit(AuthFailure('فشل الاتصال بالخادم أو بيانات الدخول غير صحيحة'));
    }
  }
} 