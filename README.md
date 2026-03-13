# ProfitLens

ProfitLens is a Qwik web app for analyzing delivery offers (for example Uber Eats) and estimating profitability after costs and contributions.

## Repository layout

- `apps/qwik`: Main web application (Qwik + Qwik City)
- `apps/admin`: Read-only admin dashboard (Qwik + Qwik City)
- `apps/android`: Native Android overlay client (Jetpack Compose + AccessibilityService)
- `functions`: Firebase Cloud Functions backend
- `infrastructure/terraform`: Infrastructure as code
- `tool`: Build and deployment helper scripts

## Local development

1. Create local runtime defines:
   ```bash
   cp tool/dev_runtime_defines.example.json tool/dev_runtime_defines.json
   ```
2. Fill `tool/dev_runtime_defines.json` with valid Stripe price IDs.
3. Run the Qwik app:
   ```bash
   ./tool/run_web.sh
   ```

## Production web bundle

Build user app bundle:

```bash
./tool/build_web.sh
```

Build admin app bundle:

```bash
./tool/build_admin_web.sh
```

Validate expected bundle structures:

```bash
./tool/verify_web_bundle_layout.sh
./tool/verify_admin_bundle_layout.sh
```

## Firebase deployment

- Hosting deploy uses Firebase multi-target hosting:
  - `app` target uses `tool/build_web.sh`
  - `admin` target uses `tool/build_admin_web.sh`
- Functions deploy uses `functions/`

Examples:

```bash
firebase deploy --only hosting
firebase deploy --only functions
```

## Runtime config

- Firebase client config source: `apps/qwik/public/firebase-web-config.js`
- Admin Firebase client config source: `apps/admin/public/firebase-web-config.js`
- Billing runtime defines source: `tool/dev_runtime_defines.json`
- Android APK runtime define: `ANDROID_APP_DOWNLOAD_URL` in `tool/dev_runtime_defines.json`
- Generated TypeScript config files:
  - `apps/qwik/src/lib/config/firebase-web-config.ts`
  - `apps/admin/src/lib/config/firebase-web-config.ts`
  - `apps/qwik/src/lib/config/billing-defines.ts`
  - `apps/qwik/src/lib/config/install-defines.ts`

Use `tool/sync_web_runtime_config.sh` to regenerate generated config files after runtime changes.
