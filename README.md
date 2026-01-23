# ProfitLens

ProfitLens is a Flutter app to analyze delivery offers (e.g., Uber Eats) and compute profitability after energy costs and auto-entrepreneur contributions. It targets mobile + PWA with French, Arabic, and English localization.

## Features (MVP)
- Manual offer entry (payout + distance) and vehicle cost profile
- Profitability breakdown (energy, maintenance, depreciation, social contributions)
- France presets for rates (editable)
- Screenshot ingestion stub (Gemini multimodal extraction hook)

## Local setup
```bash
flutter pub get
flutter gen-l10n
flutter run
```

## Firebase setup (Auth + Firestore)
1. Install FlutterFire CLI and run:
   ```bash
   flutterfire configure
   ```
2. Replace `lib/firebase_options.dart` with the generated file.
3. Enable Firebase initialization by setting:
   ```bash
   flutter run --dart-define=FIREBASE_CONFIGURED=true
   ```

## Gemini multimodal extraction
This app is wired for a Cloud Function that accepts an image and returns a structured offer. Configure:
```bash
flutter run \
  --dart-define=GEMINI_API_KEY=YOUR_KEY \
  --dart-define=GEMINI_MODEL=gemini-1.5-pro
```

## France presets
The defaults live in `lib/features/defaults/data/france_defaults.dart` and can be overridden by the user.
- Social contribution rate: 21.2% (services commerciales ou artisanales)
- Electricity price: 0.1940 EUR/kWh (Tarif Bleu, base, 6 kVA)
- Fuel prices: daily national average (dataset)

Update cadence: add a scheduled backend task later if you want live updates.

## Structure
`lib/features` is organized by domain (offers, profitability, vehicles, auth). Keep files small and move UI sections into sub-widgets to stay modular.
