import '../../../core/platform/pwa_install.dart';

enum AuthEntryMode { auto, install, login }

AuthEntryMode resolveAuthEntryMode() {
  final entry = Uri.base.queryParameters['entry']?.trim().toLowerCase();
  switch (entry) {
    case 'install':
      return AuthEntryMode.install;
    case 'login':
      return AuthEntryMode.login;
    default:
      return AuthEntryMode.auto;
  }
}

bool shouldShowInstallGate({
  required AuthEntryMode entryMode,
  required bool installPromptAvailable,
}) {
  switch (entryMode) {
    case AuthEntryMode.install:
      return true;
    case AuthEntryMode.login:
      return false;
    case AuthEntryMode.auto:
      return !isPwaInstalled ||
          installPromptAvailable ||
          isAppleInstallManualAvailable;
  }
}
