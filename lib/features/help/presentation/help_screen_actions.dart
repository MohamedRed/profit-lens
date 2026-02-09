part of 'help_screen.dart';

mixin _HelpScreenActions on State<HelpScreen> {
  _HelpScreenState get _state => this as _HelpScreenState;

  Future<void> _addScreenshotFromCamera() async {
    if (_state._isSubmitting) return;
    final l10n = AppLocalizations.of(context)!;
    if (_state._screenshots.length >= _HelpScreenState.maxScreenshots) {
      _showSnackBar(l10n.helpAttachmentLimitReached);
      return;
    }
    final picker = _state._attachmentPicker;
    if (picker == null) return;
    final image = await picker.pickImage(source: ImageSource.camera);
    if (!mounted || image == null) return;
    await _addImageAttachment(image);
  }

  Future<void> _addScreenshotsFromGallery() async {
    if (_state._isSubmitting) return;
    final l10n = AppLocalizations.of(context)!;
    final remaining =
        _HelpScreenState.maxScreenshots - _state._screenshots.length;
    if (remaining <= 0) {
      _showSnackBar(l10n.helpAttachmentLimitReached);
      return;
    }
    final picker = _state._attachmentPicker;
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
      id: _state._uuid.v4(),
      type: HelpTicketAttachmentType.image,
      filename: image.name,
      contentType: resolveHelpImageContentType(image.name),
      bytes: bytes,
      sizeBytes: bytes.length,
      duration: null,
    );
    setState(() {
      _state._screenshots.add(attachment);
    });
  }

  void _removeScreenshot(String id) {
    setState(() {
      _state._screenshots.removeWhere((item) => item.id == id);
    });
  }

  Future<void> _startRecording() async {
    if (_state._isSubmitting) return;
    final l10n = AppLocalizations.of(context)!;
    final started = await _state._audioController.start();
    if (!started && mounted) {
      _showSnackBar(l10n.helpAudioPermissionDenied);
    }
  }

  Future<void> _stopRecording() async {
    if (_state._isSubmitting) return;
    final l10n = AppLocalizations.of(context)!;
    final attachment = await _state._audioController.stop();
    if (!mounted) return;
    if (attachment == null) {
      _showSnackBar(l10n.helpAudioFailed);
      return;
    }
    _state._formKey.currentState?.validate();
  }

  void _clearRecording() {
    _state._audioController.clearAttachment();
    _state._formKey.currentState?.validate();
  }

  Future<void> _submitTicket() async {
    if (_state._isSubmitting) return;
    final l10n = AppLocalizations.of(context)!;
    final formState = _state._formKey.currentState;
    if (formState == null) return;
    if (!formState.validate()) {
      return;
    }
    FocusScope.of(context).unfocus();

    final title = _state._formController.titleController.text.trim();
    if (title.length > _HelpScreenState.maxTitleLength) {
      _showSnackBar(l10n.helpTitleTooLong(_HelpScreenState.maxTitleLength));
      return;
    }

    final description = _state._formController.descriptionController.text
        .trim();
    final audioAttachment = _state._audioController.snapshot.value.attachment;
    if (description.isEmpty && audioAttachment == null) {
      _showSnackBar(l10n.helpDescriptionRequired);
      return;
    }

    setState(() => _state._isSubmitting = true);

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
        for (final screenshot in _state._screenshots) screenshot.toDraft(),
        if (audioAttachment != null) audioAttachment.toDraft(),
      ];
      await _state._ticketRepository!.createTicket(
        uid: widget.user.uid,
        draft: draft,
        attachments: attachments,
      );
      if (!mounted) return;
      _state._formController.reset();
      _state._screenshots.clear();
      _state._audioController.clearAttachment();
      _showSnackBar(l10n.helpTicketSubmitted);
      setState(() {});
    } catch (_) {
      if (!mounted) return;
      _showSnackBar(l10n.helpSubmissionFailed);
    } finally {
      if (mounted) {
        setState(() => _state._isSubmitting = false);
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
            HelpTicketDetailScreen(user: widget.user, ticketId: ticket.id),
      ),
    );
  }
}
