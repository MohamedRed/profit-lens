import { describe, expect, it } from 'vitest';
import { readHelpTicketId } from './help-ticket-id';

describe('help-ticket-id', () => {
  it('prefers route param id when available', () => {
    expect(readHelpTicketId('abc-123', '/app/help/tickets/abc-123', '?ticketId=ignored', '')).toBe('abc-123');
  });

  it('reads ticket id from query string', () => {
    expect(readHelpTicketId(undefined, '/app/help/tickets/details', '?ticketId=abc-123', '')).toBe('abc-123');
  });

  it('decodes encoded query id', () => {
    expect(readHelpTicketId(undefined, '/app/help/tickets/details', '?ticketId=abc%20123', '')).toBe('abc 123');
  });

  it('reads ticket id from hash params when query is missing', () => {
    expect(readHelpTicketId(undefined, '/app/help/tickets/details', '', '#ticketId=abc-123')).toBe('abc-123');
  });

  it('rejects invalid ids with path separators', () => {
    expect(readHelpTicketId(undefined, '/app/help/tickets/details', '?ticketId=abc/123', '')).toBeNull();
  });

  it('reads ticket id from direct path', () => {
    expect(readHelpTicketId(undefined, '/app/help/tickets/abc-123', '', '')).toBe('abc-123');
  });

  it('reads ticket id from details path', () => {
    expect(readHelpTicketId(undefined, '/app/help/tickets/details/abc-123', '', '')).toBe('abc-123');
  });

  it('reads ticket id from /next details path', () => {
    expect(readHelpTicketId(undefined, '/next/app/help/tickets/details/abc-123', '', '')).toBe('abc-123');
  });

  it('reads ticket id from /next direct path', () => {
    expect(readHelpTicketId(undefined, '/next/app/help/tickets/abc-123', '', '')).toBe('abc-123');
  });

  it('reads ticket id from redirect query payload', () => {
    expect(
      readHelpTicketId(
        undefined,
        '/app/help/tickets/details',
        '?redirect=%2Fapp%2Fhelp%2Ftickets%2Fdetails%2Fabc-123',
        '',
      ),
    ).toBe('abc-123');
  });

  it('reads ticket id from /next redirect query payload', () => {
    expect(
      readHelpTicketId(
        undefined,
        '/next/app/help/tickets/details',
        '?redirect=%2Fnext%2Fapp%2Fhelp%2Ftickets%2Fdetails%2Fabc-123',
        '',
      ),
    ).toBe('abc-123');
  });
});
