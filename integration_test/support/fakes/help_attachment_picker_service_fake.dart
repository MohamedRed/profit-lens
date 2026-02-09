import 'package:image_picker/image_picker.dart';
import 'package:profit_lens/features/help/data/help_attachment_picker_service.dart';

class ThrowingHelpAttachmentPickerService
    implements HelpAttachmentPickerService {
  const ThrowingHelpAttachmentPickerService();

  @override
  Future<XFile?> pickImage({required ImageSource source}) async {
    throw StateError('Help attachment picker not configured for this test.');
  }

  @override
  Future<List<XFile>> pickImages() async {
    throw StateError('Help attachment picker not configured for this test.');
  }
}
