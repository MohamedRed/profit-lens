import { component$ } from '@builder.io/qwik';

interface BulkStatusBannerProps {
  message: string;
  tone: 'default' | 'error' | 'success';
}

export const BulkStatusBanner = component$<BulkStatusBannerProps>(({ message, tone }) => {
  if (!message) {
    return null;
  }

  return (
    <p
      class={{
        'ui-status': true,
        'ui-status-error': tone === 'error',
        'ui-status-success': tone === 'success',
      }}
    >
      {message}
    </p>
  );
});
