import 'package:flutter/material.dart';

String formatShortDateTime(BuildContext context, DateTime dateTime) {
  final local = dateTime.toLocal();
  final material = MaterialLocalizations.of(context);
  final date = material.formatShortDate(local);
  final time = material.formatTimeOfDay(TimeOfDay.fromDateTime(local));
  return '$date • $time';
}
