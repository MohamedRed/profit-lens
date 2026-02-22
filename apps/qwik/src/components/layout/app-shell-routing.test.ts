import { describe, expect, it } from 'vitest';
import {
  resolveHeaderBackHref,
  shouldPreferDeterministicBack,
} from './app-shell-routing';

describe('shouldPreferDeterministicBack', () => {
  it('returns true when an explicit app back target is provided', () => {
    expect(shouldPreferDeterministicBack('/app/help/tickets/details', '/next/app/help/tickets')).toBe(true);
  });

  it('returns true for settings vehicle editor routes', () => {
    expect(shouldPreferDeterministicBack('/app/settings/vehicles/abc123')).toBe(true);
  });

  it('returns true for help ticket details routes', () => {
    expect(shouldPreferDeterministicBack('/app/help/tickets/details')).toBe(true);
    expect(shouldPreferDeterministicBack('/app/help/tickets/details/abc123')).toBe(true);
  });

  it('returns false for help tickets list route', () => {
    expect(shouldPreferDeterministicBack('/app/help/tickets')).toBe(false);
  });
});

describe('resolveHeaderBackHref', () => {
  it('keeps help ticket details back target on tickets list', () => {
    expect(resolveHeaderBackHref('/app/help/tickets/details')).toBe('/next/app/help/tickets');
  });

  it('ignores explicit back target for help ticket details routes', () => {
    expect(resolveHeaderBackHref('/app/help/tickets/details', '/next/app/help')).toBe('/next/app/help/tickets');
  });
});
