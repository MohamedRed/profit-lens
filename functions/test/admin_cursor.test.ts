import { describe, expect, it } from 'vitest';
import { decodeCursor, encodeCursor } from '../src/admin/cursor';

describe('admin cursor', () => {
  it('encodes and decodes cursor payload', () => {
    const cursor = encodeCursor('users', { lastDocPath: 'users/u1', filterKey: 'k' });
    const decoded = decodeCursor<{ lastDocPath: string; filterKey: string }>(cursor, 'users');

    expect(decoded).toEqual({
      lastDocPath: 'users/u1',
      filterKey: 'k',
    });
  });

  it('rejects malformed cursor payloads', () => {
    expect(() => decodeCursor('invalid-cursor', 'users')).toThrowError();
  });

  it('rejects mismatched cursor types', () => {
    const cursor = encodeCursor('offers', { lastDocPath: 'users/u1/offers/o1', filterKey: 'k' });
    expect(() => decodeCursor(cursor, 'users')).toThrowError();
  });
});
