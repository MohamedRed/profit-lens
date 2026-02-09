import 'dart:async';

import 'package:profit_lens/features/billing/data/usage_repository.dart';
import 'package:profit_lens/features/billing/domain/offer_usage.dart';

class InMemoryUsageRepository implements UsageRepository {
  InMemoryUsageRepository({OfferUsage? initialUsage}) : _usage = initialUsage;

  OfferUsage? _usage;
  final StreamController<OfferUsage?> _controller =
      StreamController<OfferUsage?>.broadcast();

  void setUsage(OfferUsage? usage) {
    _usage = usage;
    _controller.add(usage);
  }

  @override
  Future<OfferUsage?> fetchUsage(String uid, String periodKey) async => _usage;

  @override
  Stream<OfferUsage?> watchUsage(String uid, String periodKey) async* {
    yield _usage;
    yield* _controller.stream;
  }
}
