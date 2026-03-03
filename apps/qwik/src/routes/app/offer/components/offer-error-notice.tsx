import { component$, type QRL } from '@builder.io/qwik';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';

interface OfferErrorNoticeProps {
  title?: string;
  message: string;
  onDismiss$?: QRL<() => void>;
  actionLabel?: string;
  onAction$?: QRL<() => void | Promise<void>>;
}

export const OfferErrorNotice = component$<OfferErrorNoticeProps>(({
  title,
  message,
  onDismiss$,
  actionLabel,
  onAction$,
}) => {
  const i18n = useI18n();

  return (
    <section
      class={{
        'ui-offer-error-notice': true,
        'has-dismiss': Boolean(onDismiss$),
      }}
      role="alert"
      aria-live="polite"
    >
      {onDismiss$ ? (
        <button
          type="button"
          class="ui-offer-error-notice-dismiss"
          aria-label={t(i18n, 'closeLabel', 'Close')}
          onClick$={onDismiss$}
        >
          <span class="material-icons-outlined" aria-hidden="true">
            close
          </span>
        </button>
      ) : null}
      {title ? (
        <div class="ui-offer-error-notice-header">
          <span class="material-icons-outlined ui-offer-error-notice-icon" aria-hidden="true">
            error
          </span>
          <p class="ui-offer-error-notice-title">{title}</p>
        </div>
      ) : null}
      <p class="ui-offer-error-notice-message">{message}</p>
      {onAction$ && actionLabel ? (
        <button
          type="button"
          class="ui-offer-error-notice-action"
          onClick$={onAction$}
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
});
