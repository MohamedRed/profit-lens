import 'package:flutter/material.dart';

class HelpTicketFormController {
  final TextEditingController descriptionController;

  HelpTicketFormController({
    required this.descriptionController,
  });

  factory HelpTicketFormController.empty() {
    return HelpTicketFormController(
      descriptionController: TextEditingController(),
    );
  }

  void reset() {
    descriptionController.clear();
  }

  void dispose() {
    descriptionController.dispose();
  }
}
