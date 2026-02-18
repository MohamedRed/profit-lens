import { component$ } from '@builder.io/qwik';

interface OfferErrorNoticeProps {
  title?: string;
  message: string;
}

export const OfferErrorNotice = component$<OfferErrorNoticeProps>(({ title, message }) => {
  return (
    <section class="ui-offer-error-notice" role="alert" aria-live="polite">
      {title ? (
        <div class="ui-offer-error-notice-header">
          <span class="material-icons-outlined ui-offer-error-notice-icon" aria-hidden="true">
            error
          </span>
          <p class="ui-offer-error-notice-title">{title}</p>
        </div>
      ) : null}
      <p class="ui-offer-error-notice-message">{message}</p>
    </section>
  );
});
