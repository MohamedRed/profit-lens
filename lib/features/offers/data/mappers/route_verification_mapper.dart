import 'package:cloud_firestore/cloud_firestore.dart';

import '../../domain/route_verification.dart';

class RouteVerificationMapper {
  RouteVerification? fromDocument(Map<String, dynamic>? data) {
    if (data == null) return null;
    final distance = (data['distanceKm'] as num?)?.toDouble();
    final duration = (data['durationMinutes'] as num?)?.toDouble();
    final provider = data['provider'] as String?;
    final travelMode = data['travelMode'] as String?;
    final verifiedAt = _parseVerifiedAt(data['verifiedAt']);
    if (distance == null ||
        duration == null ||
        provider == null ||
        travelMode == null ||
        verifiedAt == null) {
      return null;
    }
    return RouteVerification(
      distanceKm: distance,
      durationMinutes: duration,
      provider: provider,
      travelMode: travelMode,
      verifiedAt: verifiedAt,
    );
  }

  DateTime? _parseVerifiedAt(dynamic value) {
    if (value is Timestamp) {
      return value.toDate();
    }
    if (value is DateTime) {
      return value;
    }
    if (value is String) {
      return DateTime.tryParse(value);
    }
    return null;
  }

  Map<String, dynamic> toDocument(RouteVerification verification) {
    return {
      'distanceKm': verification.distanceKm,
      'durationMinutes': verification.durationMinutes,
      'provider': verification.provider,
      'travelMode': verification.travelMode,
      'verifiedAt': Timestamp.fromDate(verification.verifiedAt),
    };
  }
}
