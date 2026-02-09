import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../controllers/help_ticket_form_controller.dart';
import '../models/help_local_attachment.dart';
import 'help_attachment_section.dart';
import 'help_audio_section.dart';

class HelpTicketFormSection extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final HelpTicketFormController controller;
  final List<HelpLocalAttachment> screenshots;
  final bool isListening;
  final bool showVoiceInput;
  final bool isAudioSupported;
  final bool isAudioRecording;
  final bool hasAudioRecording;
  final Duration? audioDuration;
  final bool isSubmitting;
  final VoidCallback onAddFromCamera;
  final VoidCallback onAddFromGallery;
  final ValueChanged<String> onRemoveScreenshot;
  final VoidCallback onToggleVoice;
  final VoidCallback onToggleAudio;
  final VoidCallback onClearAudio;
  final VoidCallback onSubmit;

  const HelpTicketFormSection({
    super.key,
    required this.formKey,
    required this.controller,
    required this.screenshots,
    required this.isListening,
    required this.showVoiceInput,
    required this.isAudioSupported,
    required this.isAudioRecording,
    required this.hasAudioRecording,
    required this.audioDuration,
    required this.isSubmitting,
    required this.onAddFromCamera,
    required this.onAddFromGallery,
    required this.onRemoveScreenshot,
    required this.onToggleVoice,
    required this.onToggleAudio,
    required this.onClearAudio,
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
                controller: controller.descriptionController,
                maxLines: 6,
                minLines: 4,
                decoration: InputDecoration(
                  labelText: l10n.helpDescriptionLabel,
                  hintText: l10n.helpDescriptionHint,
                  suffixIcon: showVoiceInput
                      ? IconButton(
                          onPressed: isSubmitting ? null : onToggleVoice,
                          icon: Icon(
                            isListening ? Icons.mic : Icons.mic_none,
                            color: isListening
                                ? ShadcnColors.purple
                                : ShadcnColors.textSecondary,
                          ),
                          tooltip: isListening
                              ? l10n.helpVoiceListeningLabel
                              : l10n.helpVoiceInputTooltip,
                        )
                      : null,
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    if (hasAudioRecording) {
                      return null;
                    }
                    return l10n.helpDescriptionRequired;
                  }
                  return null;
                },
              ),
              if (isListening) ...[
                const SizedBox(height: ShadcnSpacing.sm),
                Row(
                  children: [
                    const Icon(Icons.mic, size: 16, color: ShadcnColors.pink),
                    const SizedBox(width: ShadcnSpacing.sm),
                    Text(
                      l10n.helpVoiceListeningLabel,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: ShadcnColors.textSecondary,
                          ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: ShadcnSpacing.lg),
              HelpAudioSection(
                isSupported: isAudioSupported,
                isRecording: isAudioRecording,
                hasRecording: hasAudioRecording,
                recordedDuration: audioDuration,
                onToggleRecording: isSubmitting ? null : onToggleAudio,
                onClearRecording: isSubmitting ? null : onClearAudio,
              ),
              const SizedBox(height: ShadcnSpacing.lg),
              HelpAttachmentSection(
                screenshots: screenshots,
                isSubmitting: isSubmitting,
                onAddFromCamera: onAddFromCamera,
                onAddFromGallery: onAddFromGallery,
                onRemove: onRemoveScreenshot,
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
