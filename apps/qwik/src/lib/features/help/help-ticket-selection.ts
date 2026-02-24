const selectedHelpTicketIdKey = 'pl-help-selected-ticket-id';

const readSessionStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

export const saveSelectedHelpTicketId = (ticketId: string): void => {
  if (!ticketId) {
    return;
  }
  const storage = readSessionStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(selectedHelpTicketIdKey, ticketId);
  } catch {
    // Ignore storage failures to avoid breaking ticket navigation.
  }
};

export const readSelectedHelpTicketId = (): string | null => {
  const storage = readSessionStorage();
  if (!storage) {
    return null;
  }
  try {
    const value = storage.getItem(selectedHelpTicketIdKey);
    return value && value.length > 0 ? value : null;
  } catch {
    return null;
  }
};
