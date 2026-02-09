import 'dart:async';

import 'package:profit_lens/features/billing/data/entitlement_repository.dart';
import 'package:profit_lens/features/billing/domain/entitlement.dart';

class InMemoryEntitlementRepository implements EntitlementRepository {
  InMemoryEntitlementRepository({Entitlement? initialEntitlement})
    : _entitlement = initialEntitlement;

  Entitlement? _entitlement;
  final StreamController<Entitlement?> _controller =
      StreamController<Entitlement?>.broadcast();

  void setEntitlement(Entitlement? entitlement) {
    _entitlement = entitlement;
    _controller.add(entitlement);
  }

  @override
  Future<Entitlement?> fetchEntitlement(String uid) async => _entitlement;

  @override
  Stream<Entitlement?> watchEntitlement(String uid) async* {
    yield _entitlement;
    yield* _controller.stream;
  }
}
