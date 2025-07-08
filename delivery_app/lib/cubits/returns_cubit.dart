import 'package:flutter_bloc/flutter_bloc.dart';
import '../models/return_model.dart';
import '../models/distributor_api.dart';

class ReturnsCubit extends Cubit<List<ReturnModel>> {
  final DistributorApi api;
  ReturnsCubit(this.api) : super([]);

  Future<bool> addReturn(ReturnModel ret) async {
    try {
      await api.addReturn(ret);
      emit(List.from(state)..add(ret));
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<void> fetchReturns() async {
    try {
      final returns = await api.fetchReturns();
      emit(returns);
    } catch (e) {
      // يمكن عرض رسالة خطأ إذا لزم الأمر
      emit([]);
    }
  }
} 