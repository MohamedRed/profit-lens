import { component$ } from '@builder.io/qwik';

const range = (count: number): number[] => Array.from({ length: count }, (_, index) => index);

interface SkeletonBlockProps {
  class?: string;
  height?: string;
  width?: string;
}

export const SkeletonBlock = component$<SkeletonBlockProps>(({ class: className, height, width }) => {
  return (
    <span
      class={['ui-skeleton-block', className]}
      style={{ height: height ?? '14px', width: width ?? '100%' }}
      aria-hidden="true"
    />
  );
});

interface LoadingSkeletonAnnouncerProps {
  label: string;
}

export const LoadingSkeletonAnnouncer = component$<LoadingSkeletonAnnouncerProps>(({ label }) => {
  return <span class="ui-skeleton-sr-only">{label}</span>;
});

interface HistoryListSkeletonProps {
  itemCount?: number;
}

export const HistoryListSkeleton = component$<HistoryListSkeletonProps>(({ itemCount = 5 }) => {
  return (
    <ul class="ui-history-list" aria-hidden="true">
      {range(itemCount).map((index) => (
        <li key={`history-skeleton-${index}`} class="ui-history-item ui-skeleton-shell">
          <div class="ui-history-item-link">
            <div class="ui-history-item-main ui-skeleton-stack-sm">
              <SkeletonBlock height="34px" width="122px" />
              <SkeletonBlock height="14px" width="168px" />
            </div>
            <div class="ui-history-item-side ui-skeleton-stack-sm">
              <SkeletonBlock height="20px" width="72px" />
              <SkeletonBlock height="18px" width="20px" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
});

export const HistoryDetailSkeleton = component$(() => {
  return (
    <div class="ui-history-detail-root" aria-hidden="true">
      <section class="ui-history-detail-card ui-skeleton-shell">
        <div class="ui-skeleton-stack-md">
          <SkeletonBlock height="36px" width="136px" />
          <SkeletonBlock height="14px" width="124px" />
        </div>
        <div class="ui-skeleton-stack-sm">
          {range(8).map((index) => (
            <div key={`history-detail-row-${index}`} class="ui-skeleton-row">
              <SkeletonBlock height="12px" width="44%" />
              <SkeletonBlock height="12px" width="30%" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
});

interface HelpTicketListSkeletonProps {
  itemCount?: number;
}

export const HelpTicketListSkeleton = component$<HelpTicketListSkeletonProps>(({ itemCount = 4 }) => {
  return (
    <div class="ui-help-detail-root" aria-hidden="true">
      <section class="ui-help-card ui-help-ticket-list-section">
        <SkeletonBlock class="ui-skeleton-card-title" height="34px" width="128px" />
        <ul class="ui-help-ticket-list">
          {range(itemCount).map((index) => (
            <li key={`help-ticket-skeleton-${index}`} class="ui-help-ticket-item ui-skeleton-shell">
              <div class="ui-skeleton-stack-sm">
                <div class="ui-skeleton-row">
                  <SkeletonBlock height="14px" width="78px" />
                  <SkeletonBlock height="14px" width="84px" />
                </div>
                <SkeletonBlock height="14px" width="100%" />
                <SkeletonBlock height="12px" width="66%" />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
});

export const HelpTicketDetailSkeleton = component$(() => {
  return (
    <div class="ui-help-detail-root" aria-hidden="true">
      <section class="ui-help-card ui-skeleton-stack-sm ui-skeleton-shell">
        <SkeletonBlock class="ui-skeleton-card-title" height="28px" width="52%" />
        <SkeletonBlock height="20px" width="34%" />
        <SkeletonBlock height="12px" width="44%" />
        <SkeletonBlock height="20px" width="36%" />
        {range(2).map((index) => (
          <div key={`help-attachment-skeleton-${index}`} class="ui-skeleton-row">
            <SkeletonBlock height="54px" width="54px" />
            <div class="ui-skeleton-stack-sm ui-skeleton-grow">
              <SkeletonBlock height="12px" width="72%" />
              <SkeletonBlock height="12px" width="42%" />
            </div>
          </div>
        ))}
      </section>
      <section class="ui-help-card ui-skeleton-stack-sm ui-skeleton-shell">
        <SkeletonBlock height="20px" width="24%" />
        {range(4).map((index) => (
          <div key={`help-progress-skeleton-${index}`} class="ui-skeleton-row ui-skeleton-progress-row">
            <SkeletonBlock class="ui-skeleton-progress-dot" height="20px" width="20px" />
            <div class="ui-skeleton-stack-sm ui-skeleton-grow">
              <SkeletonBlock height="14px" width="36%" />
              <SkeletonBlock height="12px" width="44%" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
});

interface SettingsFormSkeletonProps {
  fieldCount?: number;
}

export const SettingsFormSkeleton = component$<SettingsFormSkeletonProps>(({ fieldCount = 8 }) => {
  return (
    <div class="ui-settings-detail-root" aria-hidden="true">
      <section class="ui-settings-detail-card ui-skeleton-shell">
        <SkeletonBlock class="ui-skeleton-card-title" height="24px" width="48%" />
        <div class="ui-skeleton-stack-md">
          {range(fieldCount).map((index) => (
            <div key={`settings-form-skeleton-${index}`} class="ui-skeleton-stack-sm">
              <SkeletonBlock height="12px" width="42%" />
              <SkeletonBlock height="44px" width="100%" />
            </div>
          ))}
          <SkeletonBlock height="44px" width="100%" />
        </div>
      </section>
    </div>
  );
});

interface SettingsListSkeletonProps {
  itemCount?: number;
  showHeaderAction?: boolean;
}

export const SettingsListSkeleton = component$<SettingsListSkeletonProps>(
  ({ itemCount = 3, showHeaderAction = false }) => {
    return (
      <div class="ui-settings-detail-root" aria-hidden="true">
        <section class="ui-settings-detail-card ui-skeleton-shell">
          <div class="ui-skeleton-row">
            <SkeletonBlock class="ui-skeleton-card-title" height="24px" width="42%" />
            {showHeaderAction ? <SkeletonBlock height="30px" width="92px" /> : null}
          </div>
          <SkeletonBlock height="12px" width="62%" />
          <ul class="ui-settings-device-list">
            {range(itemCount).map((index) => (
              <li key={`settings-list-skeleton-${index}`} class="ui-settings-device-item">
                <div class="ui-skeleton-stack-sm">
                  <div class="ui-skeleton-row">
                    <SkeletonBlock height="14px" width="46%" />
                    <SkeletonBlock height="14px" width="26%" />
                  </div>
                  <SkeletonBlock height="12px" width="58%" />
                  <SkeletonBlock height="12px" width="84%" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  },
);

export const OfferUsageSkeleton = component$(() => {
  return (
    <div class="ui-offer-usage-content ui-skeleton-stack-sm" aria-hidden="true">
      <SkeletonBlock height="30px" width="220px" />
      <SkeletonBlock height="13px" width="170px" />
      <SkeletonBlock height="44px" width="100%" />
    </div>
  );
});
