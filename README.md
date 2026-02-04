# ProfitLens

ProfitLens is a Flutter app to analyze delivery offers (e.g., Uber Eats) and compute profitability after energy costs and auto-entrepreneur contributions. It targets mobile + PWA with French, Arabic, and English localization.

## Features (MVP)
- Manual offer entry (payout + distance) and vehicle cost profile
- Profitability breakdown (energy, maintenance, depreciation, social contributions)
- France presets with sources visible in-app (editable)
- Gemini-only screenshot extraction via Cloud Functions

## Local setup
```bash
flutter pub get
flutter gen-l10n
flutter run
```

## Firebase setup (Auth + Firestore + Functions)
Firebase app configs are already added for:
- Android: `android/app/google-services.json`
- iOS: `ios/Runner/GoogleService-Info.plist`
- Web: `lib/firebase_options.dart`

Enable Firebase initialization by setting:
```bash
flutter run --dart-define=FIREBASE_CONFIGURED=true
```

## Gemini-only extraction (Cloud Function)
The app calls a Firebase callable function named `extractOfferFromImage`.
1. Set the Gemini API key as a secret:
   ```bash
   firebase functions:secrets:set GEMINI_API_KEY
   ```
2. Deploy functions:
   ```bash
   firebase deploy --only functions
   ```

## France license plate lookup (RapidAPI)
Vehicle lookup via plate uses the `lookupVehicleByPlate` callable function.
1. Set the RapidAPI key as a secret:
   ```bash
   firebase functions:secrets:set RAPIDAPI_PLAQUE_KEY
   ```
2. Deploy functions:
   ```bash
   firebase deploy --only functions
   ```

## France presets
Defaults live in `lib/features/defaults/data/france_defaults.dart` and can be overridden by the user. Sources are shown in the app under "Preset sources".

Update cadence: add a scheduled backend task later if you want live updates.

## Structure
`lib/features` is organized by domain (offers, profitability, vehicles, auth). Keep files small and move UI sections into sub-widgets to stay modular.
