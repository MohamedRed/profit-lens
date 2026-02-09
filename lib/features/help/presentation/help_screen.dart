import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:uuid/uuid.dart';

import '../../../app/app_scope.dart';
import '../../../core/design_system/shadcn_tokens.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../data/help_attachment_picker_service.dart';
import '../data/help_ticket_repository.dart';
import '../domain/help_ticket_attachment_type.dart';
import '../domain/help_ticket_draft.dart';
import '../presentation/controllers/help_audio_recorder_controller.dart';
import '../presentation/controllers/help_ticket_form_controller.dart';
import '../presentation/models/help_local_attachment.dart';
import 'help_screen_helpers.dart';
import 'widgets/help_intro_section.dart';
import 'widgets/help_ticket_form_section.dart';
import 'widgets/help_ticket_list_section.dart';

part 'help_screen_actions.dart';

class HelpScreen extends StatefulWidget {
  final AuthUser user;

  const HelpScreen({super.key, required this.user});

  @override
  State<HelpScreen> createState() => _HelpScreenState();
}

class _HelpScreenState extends State<HelpScreen> with _HelpScreenActions {
  static const int maxScreenshots = 5;

  final _formKey = GlobalKey<FormState>();
  final _uuid = const Uuid();
  late final HelpTicketFormController _formController;
  late final HelpAudioRecorderController _audioController;

  HelpTicketRepository? _ticketRepository;
  HelpAttachmentPickerService? _attachmentPicker;

  final List<HelpLocalAttachment> _screenshots = [];
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _formController = HelpTicketFormController.empty();
    _audioController = HelpAudioRecorderController();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_ticketRepository != null) return;
    final services = AppScope.of(context);
    _ticketRepository = services.helpTicketRepository;
    _attachmentPicker = services.helpAttachmentPickerService;
  }

  @override
  void dispose() {
    _formController.dispose();
    _audioController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ticketRepository = _ticketRepository;
    final ticketStream = ticketRepository?.watchTickets(widget.user.uid);

    return Scaffold(
      backgroundColor: ShadcnColors.background,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final isWide = constraints.maxWidth >= 900;
            final introSection = const HelpIntroSection();
            final formSection = HelpTicketFormSection(
              formKey: _formKey,
              controller: _formController,
              screenshots: List.unmodifiable(_screenshots),
              audioSnapshot: _audioController.snapshot,
              isSubmitting: _isSubmitting,
              onAddFromCamera: _addScreenshotFromCamera,
              onAddFromGallery: _addScreenshotsFromGallery,
              onRemoveScreenshot: _removeScreenshot,
              onStartRecording: _startRecording,
              onStopRecording: _stopRecording,
              onClearRecording: _clearRecording,
              onSubmit: _submitTicket,
            );
            final listSection = HelpTicketListSection(
              ticketStream: ticketStream ?? const Stream.empty(),
            );

            if (!isWide) {
              return ListView(
                padding: const EdgeInsets.all(ShadcnSpacing.lg),
                children: [
                  introSection,
                  const SizedBox(height: ShadcnSpacing.lg),
                  formSection,
                  const SizedBox(height: ShadcnSpacing.lg),
                  listSection,
                ],
              );
            }

            return SingleChildScrollView(
              padding: const EdgeInsets.all(ShadcnSpacing.lg),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        introSection,
                        const SizedBox(height: ShadcnSpacing.lg),
                        formSection,
                      ],
                    ),
                  ),
                  const SizedBox(width: ShadcnSpacing.section),
                  Expanded(child: listSection),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
