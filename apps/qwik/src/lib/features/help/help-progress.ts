export type ProgressStepState = 'done' | 'current' | 'upcoming';

export const progressionStatuses = ['received', 'analyzing', 'needs_info', 'fix_ready', 'resolved'] as const;
export type ProgressionStatus = (typeof progressionStatuses)[number];

export const normalizeProgressionStatus = (value: string): ProgressionStatus | null => {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'needsinfo') {
    return 'needs_info';
  }
  if (normalized === 'fixready') {
    return 'fix_ready';
  }
  return progressionStatuses.includes(normalized as ProgressionStatus)
    ? (normalized as ProgressionStatus)
    : null;
};

export const resolveProgressStepState = (params: {
  stepStatus: ProgressionStatus;
  currentStatus: ProgressionStatus | null;
  hasEvent: boolean;
}): ProgressStepState => {
  if (params.stepStatus === params.currentStatus) {
    return 'current';
  }
  if (!params.hasEvent) {
    return 'upcoming';
  }
  if (!params.currentStatus) {
    return 'done';
  }
  return progressionStatuses.indexOf(params.stepStatus) < progressionStatuses.indexOf(params.currentStatus)
    ? 'done'
    : 'upcoming';
};
