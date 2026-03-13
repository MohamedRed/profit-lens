# Profit Lens Android

Native Android overlay client for live Uber Eats and Deliveroo profitability scoring.

## Runtime configuration

The app reads Firebase values from environment variables when present and otherwise falls back to the current project web config values baked into [build.gradle.kts](/Users/mrr/profit-lens/apps/android/app/build.gradle.kts).

## Release signing

`release` builds require these environment variables:

- `ANDROID_UPLOAD_STORE_FILE`
- `ANDROID_UPLOAD_STORE_PASSWORD`
- `ANDROID_UPLOAD_KEY_ALIAS`
- `ANDROID_UPLOAD_KEY_PASSWORD`

The GitHub release workflow uses those values from repository secrets and publishes a stable asset URL:

- `https://github.com/MohamedRed/profit-lens/releases/download/android-latest/profit-lens-android-release.apk`

## Local build

```bash
cd apps/android
gradle :app:testDebugUnitTest
```

## CI release

Run the `Android APK Release` GitHub Actions workflow to build and publish the latest release APK. After that, set `ANDROID_APP_DOWNLOAD_URL` in `WEB_RUNTIME_DEFINES_JSON` to the stable release URL and redeploy Firebase Hosting.
