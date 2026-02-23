import { describe, expect, it } from 'vitest';
import { formatHelpTicketDisplayNumber } from './help-ticket-reference';

describe('help-ticket-reference', () => {
  it('returns a 6-digit numeric reference', () => {
    const reference = formatHelpTicketDisplayNumber('3ixpln4a2zjwj9iIycjQ');
    expect(reference).toMatch(/^\d{6}$/);
  });

  it('stays deterministic for the same ticket id', () => {
    const ticketId = '3ixpln4a2zjwj9iIycjQ';
    const a = formatHelpTicketDisplayNumber(ticketId);
    const b = formatHelpTicketDisplayNumber(ticketId);
    expect(a).toBe(b);
  });

  it('returns a different reference for a different ticket id', () => {
    const a = formatHelpTicketDisplayNumber('3ixpln4a2zjwj9iIycjQ');
    const b = formatHelpTicketDisplayNumber('other-ticket-id');
    expect(a).not.toBe(b);
  });
});
