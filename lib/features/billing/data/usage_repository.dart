import '../domain/offer_usage.dart';

abstract class UsageRepository {
  Stream<OfferUsage?> watchUsage(String uid, String periodKey);
  Future<OfferUsage?> fetchUsage(String uid, String periodKey);
}
