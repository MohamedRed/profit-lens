import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:uuid/uuid.dart';

import '../../../app/app_scope.dart';
import '../../../core/design_system/shadcn_tokens.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../data/help_attachment_picker_service.dart';
import '../data/help_audio_transcription_service.dart';
import '../data/help_ticket_repository.dart';
import '../domain/help_ticket_attachment_type.dart';
import '../domain/help_ticket_draft.dart';
import '../presentation/controllers/help_audio_capture.dart';
import '../presentation/controllers/help_audio_recorder_controller.dart';
import '../presentation/controllers/help_ticket_form_controller.dart';
import '../presentation/models/help_local_attachment.dart';
import 'help_screen_helpers.dart';
import 'help_tickets_screen.dart';
import 'widgets/help_intro_section.dart';
import 'widgets/help_ticket_form_section.dart';

part 'help_screen_actions.dart';

class HelpScreen extends StatefulWidget {
  final AuthUser user;

  const HelpScreen({super.key, required this.user});

  @override
  State<HelpScreen> createState() => _HelpScreenState();
}

class _HelpScreenState extends State<HelpScreen> with _HelpScreenActions {
  static const int maxScreenshots = 5;
  static const bool _audioEnabled = false;

  final _formKey = GlobalKey<FormState>();
  final _uuid = const Uuid();
  late final HelpTicketFormController _formController;
  late final HelpAudioRecorderController _audioController;

  HelpTicketRepository? _ticketRepository;
  HelpAttachmentPickerService? _attachmentPicker;
  HelpAudioTranscriptionService? _audioTranscriptionService;

  final List<HelpLocalAttachment> _screenshots = [];
  bool _isSubmitting = false;
  bool _isTranscribingAudio = false;
  String? _lastTranscribedRecording;
  int _transcriptionRequestId = 0;

  @override
  void initState() {
    super.initState();
    _formController = HelpTicketFormController.empty();
    _audioController = HelpAudioRecorderController();
    if (_audioEnabled) {
      _audioController.state.addListener(_handleAudioStateChanged);
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_ticketRepository != null) return;
    final services = AppScope.of(context);
    _ticketRepository = services.helpTicketRepository;
    _attachmentPicker = services.helpAttachmentPickerService;
    _audioTranscriptionService = services.helpAudioTranscriptionService;
  }

  @override
  void dispose() {
    if (_audioEnabled) {
      _audioController.state.removeListener(_handleAudioStateChanged);
    }
    _formController.dispose();
    _audioController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.helpTabLabel),
        actions: [
          IconButton(
            onPressed: _openTickets,
            icon: const Icon(Icons.list_alt),
            tooltip: l10n.helpViewTicketsButton,
          ),
        ],
      ),
      backgroundColor: ShadcnColors.background,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final isWide = constraints.maxWidth >= 900;
            final introSection = const HelpIntroSection();
            final formSection = ValueListenableBuilder<HelpAudioRecorderState>(
              valueListenable: _audioController.state,
              builder: (context, audioState, __) {
                return HelpTicketFormSection(
                  formKey: _formKey,
                  controller: _formController,
                  screenshots: List.unmodifiable(_screenshots),
                  enableAudio: _audioEnabled,
                  isAudioSupported: _audioEnabled && _audioController.isSupported,
                  isAudioRecording: _audioEnabled && audioState.isRecording,
                  isAudioProcessing: _audioEnabled && audioState.isProcessing,
                  isAudioTranscribing: _audioEnabled && _isTranscribingAudio,
                  hasAudioRecording:
                      _audioEnabled && audioState.recording != null,
                  audioDuration:
                      _audioEnabled ? audioState.recording?.duration : null,
                  isSubmitting: _isSubmitting,
                  onAddFromCamera: _addScreenshotFromCamera,
                  onAddFromGallery: _addScreenshotsFromGallery,
                  onRemoveScreenshot: _removeScreenshot,
                  onToggleAudio: _toggleAudioRecording,
                  onClearAudio: _clearAudioRecording,
                  onSubmit: _submitTicket,
                );
              },
            );

            if (!isWide) {
              return ListView(
                padding: const EdgeInsets.all(ShadcnSpacing.lg),
                children: [
                  introSection,
                  const SizedBox(height: ShadcnSpacing.lg),
                  formSection,
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
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  void _handleAudioStateChanged() {
    if (!mounted) return;
    final state = _audioController.state.value;
    if (state.recording != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        _formKey.currentState?.validate();
      });
      _maybeTranscribeRecording(state.recording!);
    }
  }

  Future<void> _maybeTranscribeRecording(HelpAudioRecording recording) async {
    if (_isTranscribingAudio) return;
    if (_lastTranscribedRecording == recording.filename) return;
    final service = _audioTranscriptionService;
    if (service == null) return;
    _lastTranscribedRecording = recording.filename;
    final requestId = ++_transcriptionRequestId;
    setState(() => _isTranscribingAudio = true);
    try {
      final localeTag = Localizations.localeOf(context).toLanguageTag();
      final transcript = await service.transcribeAudio(
        bytes: recording.bytes,
        contentType: recording.contentType,
        locale: localeTag,
      );
      if (!mounted || requestId != _transcriptionRequestId) return;
      if (transcript == null || transcript.isEmpty) {
        final l10n = AppLocalizations.of(context)!;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.helpAudioTranscriptionFailed)),
        );
        return;
      }
      final current = _formController.descriptionController.text.trim();
      final next = current.isEmpty ? transcript : '$current\n\n$transcript';
      _formController.descriptionController.value =
          _formController.descriptionController.value.copyWith(
        text: next,
        selection: TextSelection.collapsed(offset: next.length),
      );
    } catch (_) {
      if (mounted && requestId == _transcriptionRequestId) {
        final l10n = AppLocalizations.of(context)!;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.helpAudioTranscriptionFailed)),
        );
      }
    } finally {
      if (mounted && requestId == _transcriptionRequestId) {
        setState(() => _isTranscribingAudio = false);
        _formKey.currentState?.validate();
      }
    }
  }
}
