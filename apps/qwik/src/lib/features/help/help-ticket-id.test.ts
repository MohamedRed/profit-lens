import { describe, expect, it } from 'vitest';
import { readHelpTicketId } from './help-ticket-id';

describe('help-ticket-id', () => {
  it('prefers route param id when available', () => {
    expect(readHelpTicketId('abc-123', '?ticketId=ignored', '')).toBe('abc-123');
  });

  it('reads ticket id from query string', () => {
    expect(readHelpTicketId(undefined, '?ticketId=abc-123', '')).toBe('abc-123');
  });

  it('decodes encoded query id', () => {
    expect(readHelpTicketId(undefined, '?ticketId=abc%20123', '')).toBe('abc 123');
  });

  it('reads ticket id from hash params when query is missing', () => {
    expect(readHelpTicketId(undefined, '', '#ticketId=abc-123')).toBe('abc-123');
  });

  it('rejects invalid ids with path separators', () => {
    expect(readHelpTicketId(undefined, '?ticketId=abc/123', '')).toBeNull();
  });
});
