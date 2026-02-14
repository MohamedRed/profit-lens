import { describe, expect, it } from 'vitest';
import { isRunningAsInstalledPwa, type PwaWindowLike } from './pwa-install-state';

const browserWithMatches = (matchingQueries: string[]): PwaWindowLike => {
  return {
    matchMedia: (query: string) => ({ matches: matchingQueries.includes(query) }),
    navigator: {},
  };
};

describe('pwa-install-state', () => {
  it('returns false without a browser object', () => {
    expect(isRunningAsInstalledPwa(undefined)).toBe(false);
  });

  it('returns true when running in iOS standalone mode', () => {
    expect(isRunningAsInstalledPwa({ navigator: { standalone: true } })).toBe(true);
  });

  it('returns true when standalone display mode matches', () => {
    expect(isRunningAsInstalledPwa(browserWithMatches(['(display-mode: standalone)']))).toBe(true);
  });

  it('returns true when fullscreen display mode matches', () => {
    expect(isRunningAsInstalledPwa(browserWithMatches(['(display-mode: fullscreen)']))).toBe(true);
  });

  it('returns false when no install mode matches', () => {
    expect(isRunningAsInstalledPwa(browserWithMatches([]))).toBe(false);
  });
});
