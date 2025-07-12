import 'package:flutter_bloc/flutter_bloc.dart';
import '../core/storage/session_manager.dart';

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
    await Future.delayed(const Duration(seconds: 1));
    // منطق تسجيل دخول وهمي
    if (username == 'distributor' && password == '1234') {
      await SessionManager.saveUserId(1); // مؤقتًا
      await SessionManager.saveVehicleId(1); // مؤقتًا
      emit(AuthSuccess());
    } else {
      emit(AuthFailure('بيانات الدخول غير صحيحة'));
    }
  }
} 