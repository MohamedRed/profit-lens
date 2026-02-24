const selectedHelpTicketIdKey = 'pl-help-selected-ticket-id';

const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
};

export const saveSelectedHelpTicketId = (ticketId: string): void => {
  if (!isBrowser() || !ticketId) {
    return;
  }
  sessionStorage.setItem(selectedHelpTicketIdKey, ticketId);
};

export const readSelectedHelpTicketId = (): string | null => {
  if (!isBrowser()) {
    return null;
  }
  const value = sessionStorage.getItem(selectedHelpTicketIdKey);
  return value && value.length > 0 ? value : null;
};
