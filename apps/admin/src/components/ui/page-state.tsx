import { component$ } from '@builder.io/qwik';

interface MessageProps {
  message: string;
}

export const ErrorBanner = component$<MessageProps>(({ message }) => {
  return <div class="admin-banner">{message}</div>;
});

export const EmptyPanel = component$<MessageProps>(({ message }) => {
  return <div class="admin-empty">{message}</div>;
});

export const LoadingPanel = component$<MessageProps>(({ message }) => {
  return (
    <div class="admin-loading">
      <div>{message}</div>
      <div class="admin-loading-grid" style={{ marginTop: '10px' }}>
        <div class="admin-loading-line" />
        <div class="admin-loading-line" />
        <div class="admin-loading-line" />
      </div>
    </div>
  );
});
