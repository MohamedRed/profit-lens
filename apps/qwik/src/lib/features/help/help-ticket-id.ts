const decodeTicketId = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(trimmed).trim();
    if (!decoded || decoded.includes('/')) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
};

const readFromHash = (hash: string): string | null => {
  if (!hash) {
    return null;
  }
  const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  const fromHash = hashParams.get('ticketId') ?? hashParams.get('id');
  return fromHash ? decodeTicketId(fromHash) : null;
};

export const readHelpTicketId = (
  paramsTicketId: string | undefined,
  search: string,
  hash: string,
): string | null => {
  if (paramsTicketId) {
    return decodeTicketId(paramsTicketId);
  }

  const searchParams = new URLSearchParams(search);
  const fromQuery = searchParams.get('ticketId') ?? searchParams.get('id');
  if (fromQuery) {
    return decodeTicketId(fromQuery);
  }

  return readFromHash(hash);
};
