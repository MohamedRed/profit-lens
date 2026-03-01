import { describe, expect, it } from 'vitest';
import { maskEmail, summarizeAddress } from '../src/admin/masks';

describe('admin masking helpers', () => {
  it('masks local part of email', () => {
    expect(maskEmail('john.doe@example.com')).toBe('j***@example.com');
  });

  it('returns city-level summary for full addresses', () => {
    expect(summarizeAddress('12 Main Street, 75001 Paris, France')).toBe('75001 Paris, France');
  });

  it('returns null for missing address', () => {
    expect(summarizeAddress(undefined)).toBeNull();
  });
});
