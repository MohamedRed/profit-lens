import 'package:image_picker/image_picker.dart';

abstract class HelpAttachmentPickerService {
  Future<XFile?> pickImage({required ImageSource source});
  Future<List<XFile>> pickImages();
}

class DeviceHelpAttachmentPickerService implements HelpAttachmentPickerService {
  final ImagePicker _picker;
  static const int _imageQuality = 80;
  static const double _maxDimension = 1600;

  DeviceHelpAttachmentPickerService({ImagePicker? picker})
    : _picker = picker ?? ImagePicker();

  @override
  Future<XFile?> pickImage({required ImageSource source}) {
    return _picker.pickImage(
      source: source,
      imageQuality: _imageQuality,
      maxWidth: _maxDimension,
      maxHeight: _maxDimension,
    );
  }

  @override
  Future<List<XFile>> pickImages() async {
    return _picker.pickMultiImage(
      imageQuality: _imageQuality,
      maxWidth: _maxDimension,
      maxHeight: _maxDimension,
    );
  }
}
