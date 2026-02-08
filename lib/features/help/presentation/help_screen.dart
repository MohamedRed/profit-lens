import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:uuid/uuid.dart';

import '../../../app/app_scope.dart';
import '../../../core/design_system/shadcn_tokens.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../data/help_attachment_picker_service.dart';
import '../data/help_ticket_repository.dart';
import '../domain/help_ticket.dart';
import '../domain/help_ticket_attachment_type.dart';
import '../domain/help_ticket_draft.dart';
import '../presentation/controllers/help_audio_recorder_controller.dart';
import '../presentation/controllers/help_ticket_form_controller.dart';
import '../presentation/models/help_local_attachment.dart';
import 'help_screen_helpers.dart';
import 'help_ticket_detail_screen.dart';
import 'widgets/help_intro_section.dart';
import 'widgets/help_ticket_form_section.dart';
import 'widgets/help_ticket_list_section.dart';

class HelpScreen extends StatefulWidget {
  final AuthUser user;

  const HelpScreen({super.key, required this.user});

  @override
  State<HelpScreen> createState() => _HelpScreenState();
}

class _HelpScreenState extends State<HelpScreen> {
  static const int _maxScreenshots = 5;
  static const int _maxTitleLength = 120;

  final _formKey = GlobalKey<FormState>();
  final _uuid = const Uuid();
  late final HelpTicketFormController _formController;
  late final HelpAudioRecorderController _audioController;

  HelpTicketRepository? _ticketRepository;
  HelpAttachmentPickerService? _attachmentPicker;
  Stream<List<HelpTicket>>? _ticketStream;

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
    _ticketStream = _ticketRepository!.watchTickets(widget.user.uid);
  }

  @override
  void dispose() {
    _formController.dispose();
    _audioController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ticketStream = _ticketStream;
    if (ticketStream == null) {
      return const Scaffold(
        body: SafeArea(child: Center(child: CircularProgressIndicator())),
      );
    }

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
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
              ticketStream: ticketStream,
              onSelected: _openTicketDetail,
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

  Future<void> _addScreenshotFromCamera() async {
    if (_isSubmitting) return;
    final l10n = AppLocalizations.of(context)!;
    if (_screenshots.length >= _maxScreenshots) {
      _showSnackBar(l10n.helpAttachmentLimitReached);
      return;
    }
    final picker = _attachmentPicker;
    if (picker == null) return;
    final image = await picker.pickImage(source: ImageSource.camera);
    if (!mounted || image == null) return;
    await _addImageAttachment(image);
  }

  Future<void> _addScreenshotsFromGallery() async {
    if (_isSubmitting) return;
    final l10n = AppLocalizations.of(context)!;
    final remaining = _maxScreenshots - _screenshots.length;
    if (remaining <= 0) {
      _showSnackBar(l10n.helpAttachmentLimitReached);
      return;
    }
    final picker = _attachmentPicker;
    if (picker == null) return;
    final images = await picker.pickImages();
    if (!mounted || images.isEmpty) return;
    final selected = images.take(remaining).toList();
    for (final image in selected) {
      await _addImageAttachment(image);
    }
    if (images.length > remaining) {
      _showSnackBar(l10n.helpAttachmentLimitTrimmed(remaining));
    }
  }

  Future<void> _addImageAttachment(XFile image) async {
    final bytes = await image.readAsBytes();
    if (!mounted) return;
    final attachment = HelpLocalAttachment(
      id: _uuid.v4(),
      type: HelpTicketAttachmentType.image,
      filename: image.name,
      contentType: resolveHelpImageContentType(image.name),
      bytes: bytes,
      sizeBytes: bytes.length,
      duration: null,
    );
    setState(() {
      _screenshots.add(attachment);
    });
  }

  void _removeScreenshot(String id) {
    setState(() {
      _screenshots.removeWhere((item) => item.id == id);
    });
  }

  Future<void> _startRecording() async {
    if (_isSubmitting) return;
    final l10n = AppLocalizations.of(context)!;
    final started = await _audioController.start();
    if (!started && mounted) {
      _showSnackBar(l10n.helpAudioPermissionDenied);
    }
  }

  Future<void> _stopRecording() async {
    if (_isSubmitting) return;
    final l10n = AppLocalizations.of(context)!;
    final attachment = await _audioController.stop();
    if (!mounted) return;
    if (attachment == null) {
      _showSnackBar(l10n.helpAudioFailed);
      return;
    }
    _formKey.currentState?.validate();
  }

  void _clearRecording() {
    _audioController.clearAttachment();
    _formKey.currentState?.validate();
  }

  Future<void> _submitTicket() async {
    if (_isSubmitting) return;
    final l10n = AppLocalizations.of(context)!;
    final formState = _formKey.currentState;
    if (formState == null) return;
    if (!formState.validate()) {
      return;
    }
    FocusScope.of(context).unfocus();

    final title = _formController.titleController.text.trim();
    if (title.length > _maxTitleLength) {
      _showSnackBar(l10n.helpTitleTooLong(_maxTitleLength));
      return;
    }

    final description = _formController.descriptionController.text.trim();
    final audioAttachment = _audioController.snapshot.value.attachment;
    if (description.isEmpty && audioAttachment == null) {
      _showSnackBar(l10n.helpDescriptionRequired);
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final services = AppScope.of(context);
      final localeTag = Localizations.localeOf(context).toString();
      final platform = resolveHelpPlatform();
      final deviceId = await services.deviceIdService.getDeviceId();
      if (!mounted) return;
      final draft = HelpTicketDraft(
        title: title,
        description: description,
        deviceId: deviceId,
        platform: platform,
        locale: localeTag,
      );
      final attachments = <HelpTicketAttachmentDraft>[
        for (final screenshot in _screenshots) screenshot.toDraft(),
        if (audioAttachment != null) audioAttachment.toDraft(),
      ];
      await _ticketRepository!.createTicket(
        uid: widget.user.uid,
        draft: draft,
        attachments: attachments,
      );
      if (!mounted) return;
      _formController.reset();
      _screenshots.clear();
      _audioController.clearAttachment();
      _showSnackBar(l10n.helpTicketSubmitted);
      setState(() {});
    } catch (_) {
      if (!mounted) return;
      _showSnackBar(l10n.helpSubmissionFailed);
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  void _openTicketDetail(HelpTicket ticket) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) =>
            HelpTicketDetailScreen(user: widget.user, ticket: ticket),
      ),
    );
  }
}
