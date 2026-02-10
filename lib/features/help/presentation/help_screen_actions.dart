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
      durationSeconds: null,
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

  Future<void> _toggleAudioRecording() async {
    if (!_HelpScreenState._audioEnabled) return;
    if (_state._isSubmitting) return;
    final l10n = AppLocalizations.of(context)!;
    final error = await _state._audioController.toggle();
    if (error == null) {
      if (_state._audioController.state.value.recording != null) {
        _state._formKey.currentState?.validate();
      }
      return;
    }
    if (!mounted) return;
    switch (error) {
      case HelpAudioError.permissionDenied:
        _showSnackBar(l10n.helpAudioPermissionDenied);
        break;
      case HelpAudioError.notSupported:
        _showSnackBar(l10n.helpAudioNotSupported);
        break;
      case HelpAudioError.failed:
        _showSnackBar(l10n.helpAudioFailed);
        break;
    }
  }

  void _clearAudioRecording() {
    if (!_HelpScreenState._audioEnabled) return;
    _state._audioController.clear();
    _state._lastTranscribedRecording = null;
    _state._transcriptionRequestId++;
    setState(() => _state._isTranscribingAudio = false);
    _state._formKey.currentState?.validate();
  }

  Future<void> _submitTicket() async {
    if (_state._isSubmitting) return;
    final l10n = AppLocalizations.of(context)!;
    final formState = _state._formKey.currentState;
    if (formState == null) return;
    final services = AppScope.of(context);
    final localeTag = Localizations.localeOf(context).toString();
    if (_HelpScreenState._audioEnabled) {
      await _state._audioController.stop();
    }
    if (!mounted) return;
    if (!formState.validate()) {
      return;
    }
    FocusScope.of(context).unfocus();

    final description = _state._formController.descriptionController.text
        .trim();
    final audioRecording = _HelpScreenState._audioEnabled
        ? _state._audioController.state.value.recording
        : null;
    if (description.isEmpty && audioRecording == null) {
      _showSnackBar(l10n.helpDescriptionRequired);
      return;
    }

    setState(() => _state._isSubmitting = true);

    try {
      final platform = resolveHelpPlatform();
      final deviceId = await services.deviceIdService.getDeviceId();
      if (!mounted) return;
      final draft = HelpTicketDraft(
        description: description,
        deviceId: deviceId,
        platform: platform,
        locale: localeTag,
      );
      final processedScreenshots = <HelpTicketAttachmentDraft>[];
      for (final screenshot in _state._screenshots) {
        try {
          final processed = await processHelpImageForUpload(
            bytes: screenshot.bytes,
            filename: screenshot.filename,
            contentType: screenshot.contentType,
          );
          processedScreenshots.add(
            HelpTicketAttachmentDraft(
              id: screenshot.id,
              type: screenshot.type,
              filename: processed.filename,
              contentType: processed.contentType,
              bytes: processed.bytes,
              sizeBytes: processed.bytes.length,
              durationSeconds: screenshot.durationSeconds,
            ),
          );
        } catch (_) {
          if (!mounted) return;
          _showSnackBar(l10n.helpAttachmentProcessingFailed);
          return;
        }
      }

      final attachments = <HelpTicketAttachmentDraft>[
        ...processedScreenshots,
        if (_HelpScreenState._audioEnabled && audioRecording != null)
          HelpLocalAttachment(
            id: _state._uuid.v4(),
            type: HelpTicketAttachmentType.audio,
            filename: audioRecording.filename,
            contentType: audioRecording.contentType,
            bytes: audioRecording.bytes,
            sizeBytes: audioRecording.bytes.length,
            durationSeconds: audioRecording.duration.inSeconds,
          ).toDraft(),
      ];
      await _state._ticketRepository!.createTicket(
        uid: widget.user.uid,
        draft: draft,
        attachments: attachments,
      );
      if (!mounted) return;
      _state._formController.reset();
      _state._screenshots.clear();
      _state._audioController.clear();
      _showSnackBar(l10n.helpTicketSubmitted);
      setState(() {});
    } on TimeoutException {
      if (!mounted) return;
      _showSnackBar(l10n.helpSubmissionTimeout);
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

  void _openTickets() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => HelpTicketsScreen(user: widget.user),
      ),
    );
  }

}
