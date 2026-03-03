import { describe, expect, it } from 'vitest';
import { normalizeProgressionStatus, resolveProgressStepState } from './help-progress';

describe('help progress', () => {
  it('normalizes alias statuses', () => {
    expect(normalizeProgressionStatus('needsInfo')).toBe('needs_info');
    expect(normalizeProgressionStatus('fixReady')).toBe('fix_ready');
  });

  it('keeps future steps upcoming even if they have historical events', () => {
    const state = resolveProgressStepState({
      stepStatus: 'needs_info',
      currentStatus: 'analyzing',
      hasEvent: true,
    });

    expect(state).toBe('upcoming');
  });

  it('marks earlier steps as done when current step is ahead', () => {
    const state = resolveProgressStepState({
      stepStatus: 'received',
      currentStatus: 'analyzing',
      hasEvent: true,
    });

    expect(state).toBe('done');
  });

  it('marks same step as current', () => {
    const state = resolveProgressStepState({
      stepStatus: 'analyzing',
      currentStatus: 'analyzing',
      hasEvent: true,
    });

    expect(state).toBe('current');
  });

  it('falls back to done when current status is unknown and event exists', () => {
    const state = resolveProgressStepState({
      stepStatus: 'needs_info',
      currentStatus: null,
      hasEvent: true,
    });

    expect(state).toBe('done');
  });
});
