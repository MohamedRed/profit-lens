import 'package:image_picker/image_picker.dart';

abstract class OfferImagePickerService {
  Future<XFile?> pickImage({required ImageSource source});
}

class DeviceOfferImagePickerService implements OfferImagePickerService {
  final ImagePicker _picker;

  DeviceOfferImagePickerService({ImagePicker? picker})
    : _picker = picker ?? ImagePicker();

  @override
  Future<XFile?> pickImage({required ImageSource source}) {
    return _picker.pickImage(source: source);
  }
}
