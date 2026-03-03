import { component$ } from '@builder.io/qwik';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { HelpTicketTimelineEvent } from '../../../../lib/types/help';
import { delivererStatusLabel } from '../../../../lib/features/help/help-ui-utils';
import {
  normalizeProgressionStatus,
  progressionStatuses,
  resolveProgressStepState,
  type ProgressionStatus,
} from '../../../../lib/features/help/help-progress';

interface HelpTicketProgressStepperProps {
  currentStatus: string;
  events: HelpTicketTimelineEvent[];
}

const statusColor = (status: ProgressionStatus): string => {
  if (status === 'received' || status === 'needs_info') {
    return 'var(--pl-color-teal)';
  }
  if (status === 'analyzing') {
    return 'var(--pl-color-pink)';
  }
  if (status === 'fix_ready') {
    return 'var(--pl-color-purple)';
  }
  return 'var(--pl-color-text-secondary)';
};

const statusSoftColor = (status: ProgressionStatus): string => {
  if (status === 'received' || status === 'needs_info') {
    return 'rgba(20, 184, 166, 0.35)';
  }
  if (status === 'analyzing') {
    return 'rgba(244, 114, 182, 0.35)';
  }
  if (status === 'fix_ready') {
    return 'rgba(139, 92, 246, 0.35)';
  }
  return 'rgba(113, 113, 122, 0.35)';
};

const statusSoftFill = (status: ProgressionStatus): string => {
  if (status === 'received' || status === 'needs_info') {
    return 'rgba(20, 184, 166, 0.15)';
  }
  if (status === 'analyzing') {
    return 'rgba(244, 114, 182, 0.15)';
  }
  if (status === 'fix_ready') {
    return 'rgba(139, 92, 246, 0.15)';
  }
  return 'rgba(113, 113, 122, 0.15)';
};

const latestEventByStatus = (events: HelpTicketTimelineEvent[]): Map<ProgressionStatus, HelpTicketTimelineEvent> => {
  const latest = new Map<ProgressionStatus, HelpTicketTimelineEvent>();
  for (const event of events) {
    const key = normalizeProgressionStatus(event.status);
    if (!key) {
      continue;
    }
    const current = latest.get(key);
    if (!current) {
      latest.set(key, event);
      continue;
    }
    const currentAt = current.at?.getTime() ?? -1;
    const candidateAt = event.at?.getTime() ?? -1;
    if (candidateAt > currentAt) {
      latest.set(key, event);
    }
  }
  return latest;
};

const formatTimelineDate = (eventAt: Date | null, locale: string, atLabel: string): string => {
  if (!eventAt) {
    return '';
  }
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(eventAt);
  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(eventAt);
  return `${atLabel} ${date} ${time}`;
};

export const HelpTicketProgressStepper = component$<HelpTicketProgressStepperProps>(({ currentStatus, events }) => {
  const i18n = useI18n();
  const normalizedCurrent = normalizeProgressionStatus(currentStatus);
  const byStatus = latestEventByStatus(events);
  const atLabel = t(i18n, 'helpTicketTimelineAtLabel', 'At');
  const locale = i18n.locale.value || 'en';

  return (
    <div class="ui-help-progress-list">
      {progressionStatuses.map((status, index) => {
        const isLast = index === progressionStatuses.length - 1;
        const event = byStatus.get(status) ?? null;
        const state = resolveProgressStepState({
          stepStatus: status,
          currentStatus: normalizedCurrent,
          hasEvent: event !== null,
        });
        const color = statusColor(status);
        const lineColor = state === 'upcoming' ? 'var(--pl-color-outline)' : statusSoftColor(status);
        const fillColor =
          state === 'upcoming'
            ? 'var(--pl-color-surface)'
            : state === 'current'
              ? statusSoftFill(status)
              : color;

        return (
          <div key={status} class={['ui-help-progress-step', index === 0 ? 'is-first' : null, !isLast ? 'has-line' : null]}>
            {!isLast ? <span class="ui-help-progress-line" style={{ '--ui-help-progress-line-color': lineColor }} /> : null}

            <span
              class={['ui-help-progress-dot', `is-${state}`]}
              style={{ '--ui-help-progress-color': color, '--ui-help-progress-fill': fillColor }}
              aria-hidden="true"
            >
              {state === 'done' ? <span class="material-icons-outlined ui-help-progress-check">check</span> : null}
              {state === 'current' ? <span class="ui-help-progress-current-core" /> : null}
            </span>

            <div class="ui-help-progress-copy">
              <p class={['ui-help-progress-label', state === 'upcoming' ? 'is-upcoming' : null]}>
                {delivererStatusLabel(status, status, (key, fallbackText) => t(i18n, key, fallbackText))}
              </p>
              {event && state !== 'upcoming' ? (
                <>
                  <p class="ui-help-progress-date">{formatTimelineDate(event.at, locale, atLabel)}</p>
                  <p class="ui-help-progress-message">{event.message}</p>
                </>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
});
