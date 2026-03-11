# Profit Lens Android

Native Android overlay client for live Uber Eats and Deliveroo profitability scoring.

## Runtime configuration

Set the Firebase `BuildConfig` values in `app/build.gradle.kts` or wire them from CI/secrets before producing a release build.

## Local build

```bash
cd apps/android
gradle :app:testDebugUnitTest
```
