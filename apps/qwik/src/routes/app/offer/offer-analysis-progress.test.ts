import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  offerAnalysisProgressMinDurationMs,
  parseOfferAnalysisProgressStep,
  resolveOfferAnalysisProgressStepState,
  startOfferAnalysisProgressDriver,
  toOfferAnalysisProgressStatus,
} from './offer-analysis-progress';

describe('offer-analysis-progress', () => {
  describe('status serialization', () => {
    it('serializes and parses progress status tokens', () => {
      const status = toOfferAnalysisProgressStatus('verifyingRoute');
      expect(parseOfferAnalysisProgressStep(status)).toBe('verifyingRoute');
    });

    it('returns null for non-progress status strings', () => {
      expect(parseOfferAnalysisProgressStep('Offer analyzed.')).toBeNull();
    });
  });

  describe('resolveOfferAnalysisProgressStepState', () => {
    it('marks prior steps as done and next steps as pending', () => {
      expect(
        resolveOfferAnalysisProgressStepState('verifyingRoute', 'extracting'),
      ).toBe('done');
      expect(
        resolveOfferAnalysisProgressStepState(
          'verifyingRoute',
          'verifyingRoute',
        ),
      ).toBe('active');
      expect(
        resolveOfferAnalysisProgressStepState(
          'verifyingRoute',
          'calculatingProfit',
        ),
      ).toBe('pending');
    });
  });

  describe('startOfferAnalysisProgressDriver', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    it('advances steps with the same timing as Flutter', async () => {
      const observedSteps: string[] = [];
      const driver = startOfferAnalysisProgressDriver({
        isActive: () => true,
        onStepChange: (step) => {
          observedSteps.push(step);
        },
      });

      await vi.advanceTimersByTimeAsync(899);
      expect(observedSteps).toEqual([]);

      await vi.advanceTimersByTimeAsync(1);
      expect(observedSteps).toEqual(['verifyingRoute']);

      await vi.advanceTimersByTimeAsync(799);
      expect(observedSteps).toEqual(['verifyingRoute']);

      await vi.advanceTimersByTimeAsync(1);
      expect(observedSteps).toEqual(['verifyingRoute', 'calculatingProfit']);

      driver.cancel();
    });

    it('waits for the configured minimum duration', async () => {
      const driver = startOfferAnalysisProgressDriver({
        isActive: () => true,
        onStepChange: () => undefined,
      });
      const waitPromise = driver.waitForMinimumDuration();
      let resolved = false;
      void waitPromise.then(() => {
        resolved = true;
      });

      await vi.advanceTimersByTimeAsync(offerAnalysisProgressMinDurationMs - 1);
      expect(resolved).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      await waitPromise;
      expect(resolved).toBe(true);

      driver.cancel();
    });
  });
});
