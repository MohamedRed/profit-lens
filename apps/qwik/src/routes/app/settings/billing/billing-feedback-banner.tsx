import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

interface BillingFeedbackBannerProps {
  message: string;
  tone: 'success' | 'error';
}

export const BillingFeedbackBanner = component$<BillingFeedbackBannerProps>((props) => {
  const feedbackRef = useSignal<HTMLElement>();

  useVisibleTask$(({ track }) => {
    const message = track(() => props.message);
    const tone = track(() => props.tone);
    if (!message || tone !== 'error') {
      return;
    }
    const element = feedbackRef.value;
    if (!element) {
      return;
    }
    const animationFrameId = window.requestAnimationFrame(() => {
      element.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    });
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  });

  if (!props.message) {
    return null;
  }

  return (
    <p
      ref={feedbackRef}
      class={`ui-settings-billing-feedback ui-settings-billing-feedback-${props.tone}`}
      role={props.tone === 'error' ? 'alert' : 'status'}
      aria-live={props.tone === 'error' ? 'assertive' : 'polite'}
    >
      {props.message}
    </p>
  );
});
