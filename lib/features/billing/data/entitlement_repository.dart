import '../domain/entitlement.dart';

abstract class EntitlementRepository {
  Stream<Entitlement?> watchEntitlement(String uid);
  Future<Entitlement?> fetchEntitlement(String uid);
}
