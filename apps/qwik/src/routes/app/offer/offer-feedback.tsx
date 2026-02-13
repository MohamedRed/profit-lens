import { component$ } from '@builder.io/qwik';

interface OfferFeedbackProps {
  result: Record<string, unknown> | null;
  status: string;
}

const isSuccessStatus = (value: string): boolean => {
  const lower = value.toLowerCase();
  return lower.includes('successfully') || lower.includes('verified') || lower.includes('analyzed');
};

export const OfferFeedback = component$<OfferFeedbackProps>(({ result, status }) => {
  return (
    <>
      <div
        class={{
          'ui-status': true,
          'ui-offer-status': true,
          'ui-status-success': isSuccessStatus(status),
          'ui-status-error': Boolean(status) && !isSuccessStatus(status),
        }}
      >
        {status}
      </div>

      {result && (
        <pre class="ui-offer-result">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </>
  );
});
