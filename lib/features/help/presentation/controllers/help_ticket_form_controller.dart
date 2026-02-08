import 'package:flutter/material.dart';

class HelpTicketFormController {
  final TextEditingController titleController;
  final TextEditingController descriptionController;

  HelpTicketFormController({
    required this.titleController,
    required this.descriptionController,
  });

  factory HelpTicketFormController.empty() {
    return HelpTicketFormController(
      titleController: TextEditingController(),
      descriptionController: TextEditingController(),
    );
  }

  void reset() {
    titleController.clear();
    descriptionController.clear();
  }

  void dispose() {
    titleController.dispose();
    descriptionController.dispose();
  }
}
