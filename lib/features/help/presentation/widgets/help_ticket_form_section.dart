import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart' as widgets;

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../controllers/help_audio_recorder_controller.dart';
import '../controllers/help_ticket_form_controller.dart';
import '../models/help_local_attachment.dart';
import 'help_attachment_section.dart';
import 'help_audio_section.dart';

class HelpTicketFormSection extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final HelpTicketFormController controller;
  final List<HelpLocalAttachment> screenshots;
  final widgets.ValueListenable<HelpAudioRecorderSnapshot> audioSnapshot;
  final bool isSubmitting;
  final VoidCallback onAddFromCamera;
  final VoidCallback onAddFromGallery;
  final ValueChanged<String> onRemoveScreenshot;
  final VoidCallback onStartRecording;
  final VoidCallback onStopRecording;
  final VoidCallback onClearRecording;
  final VoidCallback onSubmit;

  const HelpTicketFormSection({
    super.key,
    required this.formKey,
    required this.controller,
    required this.screenshots,
    required this.audioSnapshot,
    required this.isSubmitting,
    required this.onAddFromCamera,
    required this.onAddFromGallery,
    required this.onRemoveScreenshot,
    required this.onStartRecording,
    required this.onStopRecording,
    required this.onClearRecording,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SectionCard(
      title: l10n.helpFormTitle,
      children: [
        Form(
          key: formKey,
          child: Column(
            children: [
              TextFormField(
                controller: controller.titleController,
                textInputAction: TextInputAction.next,
                decoration: InputDecoration(
                  labelText: l10n.helpTitleLabel,
                  hintText: l10n.helpTitleHint,
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return l10n.requiredFieldError;
                  }
                  return null;
                },
              ),
              const SizedBox(height: ShadcnSpacing.lg),
              TextFormField(
                controller: controller.descriptionController,
                maxLines: 6,
                minLines: 4,
                decoration: InputDecoration(
                  labelText: l10n.helpDescriptionLabel,
                  hintText: l10n.helpDescriptionHint,
                ),
                validator: (value) {
                  if (audioSnapshot.value.attachment != null) {
                    return null;
                  }
                  if (value == null || value.trim().isEmpty) {
                    return l10n.helpDescriptionRequired;
                  }
                  return null;
                },
              ),
              const SizedBox(height: ShadcnSpacing.lg),
              HelpAttachmentSection(
                screenshots: screenshots,
                isSubmitting: isSubmitting,
                onAddFromCamera: onAddFromCamera,
                onAddFromGallery: onAddFromGallery,
                onRemove: onRemoveScreenshot,
              ),
              const SizedBox(height: ShadcnSpacing.lg),
              HelpAudioSection(
                snapshot: audioSnapshot,
                isSubmitting: isSubmitting,
                onStartRecording: onStartRecording,
                onStopRecording: onStopRecording,
                onClearRecording: onClearRecording,
              ),
              const SizedBox(height: ShadcnSpacing.section),
              PrimaryButton(
                label: isSubmitting
                    ? l10n.helpSubmittingLabel
                    : l10n.helpSubmitButton,
                onPressed: isSubmitting ? null : onSubmit,
                isBusy: isSubmitting,
                showSpinnerWithLabel: true,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
