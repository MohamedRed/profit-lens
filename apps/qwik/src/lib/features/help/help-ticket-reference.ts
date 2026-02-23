const HASH_MULTIPLIER = 31;
const DISPLAY_MIN = 100000;
const DISPLAY_SPAN = 900000;

export const formatHelpTicketDisplayNumber = (ticketId: string): string => {
  let hash = 0;
  for (let index = 0; index < ticketId.length; index += 1) {
    hash = (Math.imul(hash, HASH_MULTIPLIER) + ticketId.charCodeAt(index)) >>> 0;
  }
  const numeric = DISPLAY_MIN + (hash % DISPLAY_SPAN);
  return String(numeric);
};
