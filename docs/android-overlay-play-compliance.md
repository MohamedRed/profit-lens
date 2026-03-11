# Android Overlay Play Compliance

This repository now includes an Android accessibility-based overlay client in `apps/android`.

Before submitting the app to Google Play:

1. Complete the Accessibility API declaration for the overlay service.
2. Add a prominent in-app disclosure before enabling live monitoring.
3. Update the privacy policy to describe:
   - accessibility screen reading on supported courier apps
   - background location usage for offer scoring
   - non-persistence of raw accessibility text
4. Record a demo video for the Play review questionnaire.
5. Enable provider rollout gradually through Remote Config:
   - `overlay_provider_uber_eats_enabled`
   - `overlay_provider_deliveroo_enabled`

The first implementation is read-only. It does not accept, decline, or automate courier-app actions.
