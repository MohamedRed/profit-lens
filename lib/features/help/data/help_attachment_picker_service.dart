import 'package:image_picker/image_picker.dart';

abstract class HelpAttachmentPickerService {
  Future<XFile?> pickImage({required ImageSource source});
  Future<List<XFile>> pickImages();
}

class DeviceHelpAttachmentPickerService implements HelpAttachmentPickerService {
  final ImagePicker _picker;

  DeviceHelpAttachmentPickerService({ImagePicker? picker})
    : _picker = picker ?? ImagePicker();

  @override
  Future<XFile?> pickImage({required ImageSource source}) {
    return _picker.pickImage(source: source);
  }

  @override
  Future<List<XFile>> pickImages() async {
    return _picker.pickMultiImage();
  }
}
