import 'dart:async';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:image_picker/image_picker.dart';
import 'package:profit_lens/app/app_scope.dart';
import 'package:profit_lens/core/device/device_id_service.dart';
import 'package:profit_lens/core/widgets/primary_button.dart';
import 'package:profit_lens/features/auth/domain/auth_user.dart';
import 'package:profit_lens/features/help/data/help_attachment_picker_service.dart';
import 'package:profit_lens/features/help/data/help_audio_transcription_service.dart';
import 'package:profit_lens/features/help/data/help_ticket_repository.dart';
import 'package:profit_lens/features/help/domain/help_ticket.dart';
import 'package:profit_lens/features/help/domain/help_ticket_attachment.dart';
import 'package:profit_lens/features/help/domain/help_ticket_draft.dart';
import 'package:profit_lens/features/help/domain/help_ticket_page.dart';
import 'package:profit_lens/features/help/domain/help_ticket_status.dart';
import 'package:profit_lens/features/help/presentation/help_screen.dart';
import 'package:profit_lens/l10n/app_localizations.dart';

// Mocks
class MockHelpTicketRepository implements HelpTicketRepository {
  bool createTicketCalled = false;
  HelpTicketDraft? lastDraft;

  @override
  Future<HelpTicket> createTicket({
    required String uid,
    required HelpTicketDraft draft,
    required List<HelpTicketAttachmentDraft> attachments,
  }) async {
    createTicketCalled = true;
    lastDraft = draft;
    return HelpTicket(
      id: 'mock-id',
      description: draft.description,
      status: HelpTicketStatus.open,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      imageCount: attachments.length,
      audioCount: 0,
      aiSummary: null,
      aiNextSteps: null,
      aiConfidence: null,
      aiNeedsUserAction: null,
      transcriptionStatus: null,
      transcriptionError: null,
    );
  }

  @override
  Future<HelpTicketPage> fetchTicketsPage({
    required String uid,
    HelpTicketPageCursor? cursor,
    int limit = 20,
  }) async {
    return const HelpTicketPage(items: [], hasMore: false, nextCursor: null);
  }

  @override
  Stream<List<HelpTicketAttachment>> watchAttachments({
    required String uid,
    required String ticketId,
  }) {
    return Stream.value([]);
  }

  @override
  Stream<HelpTicket?> watchTicket({
    required String uid,
    required String ticketId,
  }) {
    return Stream.value(null);
  }
}

class MockDeviceIdService implements DeviceIdService {
  @override
  Future<String> getDeviceId() async => 'mock-device-id';
}

class MockHelpAttachmentPickerService implements HelpAttachmentPickerService {
  @override
  Future<XFile?> pickImage({required ImageSource source}) async => null;

  @override
  Future<List<XFile>> pickImages() async => [];
}

class MockHelpAudioTranscriptionService
    implements HelpAudioTranscriptionService {
  @override
  Future<String?> transcribeAudio({
    required Uint8List bytes,
    required String contentType,
    required String locale,
  }) async =>
      null;
}

void main() {
  testWidgets('Submitting short description fails, valid description succeeds', (WidgetTester tester) async {
    final mockRepo = MockHelpTicketRepository();
    final mockDeviceIdService = MockDeviceIdService();
    final mockAttachmentPicker = MockHelpAttachmentPickerService();
    final mockAudioTranscriptionService = MockHelpAudioTranscriptionService();

    final appServices = AppServices(
      helpTicketRepository: mockRepo,
      deviceIdService: mockDeviceIdService,
      helpAttachmentPickerService: mockAttachmentPicker,
      helpAudioTranscriptionService: mockAudioTranscriptionService,
    );

    const user = AuthUser(uid: 'test-uid', email: 'test@example.com');

    await tester.pumpWidget(
      AppScope(
        services: appServices,
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: const HelpScreen(user: user),
        ),
      ),
    );

    await tester.pumpAndSettle();

    // Find the description text field
    final descriptionField = find.byType(TextFormField);
    expect(descriptionField, findsOneWidget);

    // Enter "test" (too short)
    await tester.enterText(descriptionField, 'test');
    await tester.pump();

    // Find the submit button
    final submitButton = find.byType(PrimaryButton);
    expect(submitButton, findsOneWidget);

    // Tap submit
    await tester.tap(submitButton);
    await tester.pumpAndSettle();

    // Assert that createTicket was NOT called
    expect(mockRepo.createTicketCalled, isFalse);

    // Assert validation error is shown
    // Note: Since we are using generated/manual localization, we expect the English string 'Description is too short.'
    expect(find.text('Description is too short.'), findsOneWidget);

    // Enter valid description
    const validDescription = 'A sufficiently long description for the ticket.';
    await tester.enterText(descriptionField, validDescription);
    await tester.pump();

    // Tap submit again
    await tester.tap(submitButton);
    await tester.pumpAndSettle();

    // Assert that createTicket WAS called
    expect(mockRepo.createTicketCalled, isTrue);
    expect(mockRepo.lastDraft?.description, validDescription);
  });
}
