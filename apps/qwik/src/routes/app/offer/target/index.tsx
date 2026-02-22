import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { useAuth } from "../../../../lib/auth/auth-context";
import { resolveUserFacingErrorMessage } from "../../../../lib/errors/user-facing-error";
import {
  saveUserProfile,
  watchUserProfile,
} from "../../../../lib/features/profile/profile-service";
import { t, useI18n } from "../../../../lib/i18n/i18n-context";
import type { UserProfile } from "../../../../lib/types/profile";

export default component$(() => {
  const auth = useAuth();
  const i18n = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const profile = useSignal<UserProfile | null>(null);
  const targetValue = useSignal("2.00");
  const loading = useSignal(true);
  const saving = useSignal(false);
  const status = useSignal("");
  const requestedBackTo = location.url.searchParams.get("backTo");
  const backToHref =
    requestedBackTo && requestedBackTo.startsWith("/next/app/")
      ? requestedBackTo
      : "/next/app/offer/";

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    status.value = "";

    if (!user) {
      profile.value = null;
      loading.value = false;
      return;
    }

    loading.value = true;
    const unsubscribe = watchUserProfile(
      user.uid,
      user.email ?? null,
      (nextProfile) => {
        profile.value = nextProfile;
        targetValue.value = nextProfile.minProfitabilityEuro.toFixed(2);
        loading.value = false;
      },
    );
    cleanup(() => unsubscribe());
  });

  const save$ = $(async () => {
    const currentProfile = profile.value;
    const parsed = Number(targetValue.value);

    if (!currentProfile) {
      return;
    }
    if (!Number.isFinite(parsed) || parsed <= 0) {
      status.value = t(
        i18n,
        "minProfitabilityInvalidMessage",
        "Enter a valid amount greater than zero.",
      );
      return;
    }
    if (parsed === currentProfile.minProfitabilityEuro) {
      await navigate(backToHref);
      return;
    }

    saving.value = true;
    status.value = "";
    const nextProfile = { ...currentProfile, minProfitabilityEuro: parsed };

    try {
      await saveUserProfile(nextProfile);
      await navigate(backToHref);
    } catch (error) {
      status.value = resolveUserFacingErrorMessage(i18n, error, "profile");
    } finally {
      saving.value = false;
    }
  });

  if (loading.value) {
    return (
      <div class="ui-settings-detail-root">
        <section class="ui-settings-detail-card">
          <p class="ui-settings-detail-subtitle">
            {t(i18n, "loadingLabel", "Loading...")}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div class="ui-settings-detail-root">
      <section class="ui-settings-detail-card">
        <h2 class="ui-settings-detail-title">
          {t(i18n, "minProfitabilityLabel", "Minimum profit per km")}
        </h2>

        <div class="ui-field">
          <Label for="offer-target-value">
            {t(i18n, "minProfitabilityLabel", "Minimum profit per km")}
          </Label>
          <div class="ui-offer-target-input-wrap">
            <Input
              id="offer-target-value"
              type="number"
              min="0"
              step="0.01"
              value={targetValue.value}
              onInput$={(_, element) => {
                targetValue.value = element.value;
              }}
            />
            <span class="ui-offer-target-suffix">€/km</span>
          </div>
          <p class="ui-offer-target-hint">
            {t(i18n, "minProfitabilityHint", "Suggested default: €2.00/km")}
          </p>
        </div>

        <div class="ui-settings-actions">
          <Button
            type="button"
            variant="secondary"
            class="ui-settings-action-button"
            onClick$={() => navigate(backToHref)}
          >
            {t(i18n, "commonBackLabel", "Back")}
          </Button>
          <Button
            type="button"
            variant="default"
            class="ui-settings-action-button"
            disabled={saving.value}
            onClick$={save$}
          >
            {saving.value
              ? t(i18n, "loadingLabel", "Loading...")
              : t(i18n, "saveLabel", "Save")}
          </Button>
        </div>

        {status.value ? <p class="ui-status ui-status-error">{status.value}</p> : null}
      </section>
    </div>
  );
});
