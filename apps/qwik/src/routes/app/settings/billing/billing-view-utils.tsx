import type { JSXOutput } from '@builder.io/qwik';

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const emphasizeFirstValue = (copy: string, value: string): JSXOutput => {
  if (!value) {
    return <>{copy}</>;
  }
  const pattern = new RegExp(escapeRegExp(value));
  const match = pattern.exec(copy);
  if (!match || match.index < 0) {
    return <>{copy}</>;
  }
  const start = match.index;
  const end = start + value.length;
  return (
    <>
      {copy.slice(0, start)}
      <strong class="ui-settings-billing-emphasis-value">{value}</strong>
      {copy.slice(end)}
    </>
  );
};

export const resolveSubscriptionStatusToneClass = (statusRaw: string | null | undefined): string => {
  const normalized = String(statusRaw ?? '').trim().toLowerCase();
  if (normalized === 'free') {
    return 'is-info';
  }
  if (normalized === 'active' || normalized === 'trialing') {
    return 'is-success';
  }
  if (normalized === 'past_due' || normalized === 'unpaid') {
    return 'is-warning';
  }
  if (normalized === 'canceled' || normalized === 'incomplete_expired') {
    return 'is-danger';
  }
  return 'is-neutral';
};
