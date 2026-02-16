const maxNestedRedirectDepth = 4;

const decodeRepeated = (raw: string): string => {
  let current = raw;
  for (let index = 0; index < maxNestedRedirectDepth; index += 1) {
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) {
        break;
      }
      current = decoded;
    } catch {
      break;
    }
  }
  return current;
};

const decodeTicketId = (raw: string | null | undefined): string | null => {
  if (typeof raw !== 'string') {
    return null;
  }

  const source = decodeRepeated(raw).trim();
  if (!source || source.toLowerCase() === 'details' || source.includes('/')) {
    return null;
  }
  return source;
};

const readFromPath = (path: string): string | null => {
  const detailsMatch = path.match(/\/app\/help\/tickets\/details\/([^/?#]+)\/?$/);
  if (detailsMatch) {
    return decodeTicketId(detailsMatch[1]);
  }

  const directMatch = path.match(/\/app\/help\/tickets\/([^/?#]+)\/?$/);
  if (directMatch) {
    return decodeTicketId(directMatch[1]);
  }

  return null;
};

const readFromHash = (hash: string): string | null => {
  if (!hash) {
    return null;
  }
  const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  return decodeTicketId(hashParams.get('ticketId') ?? hashParams.get('id'));
};

const readFromRedirect = (raw: string | null, depth = 0): string | null => {
  if (!raw || depth > maxNestedRedirectDepth) {
    return null;
  }

  const decoded = decodeRepeated(raw).trim();
  if (!decoded) {
    return null;
  }

  const direct = decodeTicketId(decoded);
  if (direct) {
    return direct;
  }

  try {
    const parsed = decoded.startsWith('http://') || decoded.startsWith('https://')
      ? new URL(decoded)
      : new URL(decoded, 'https://profit-lens.local');

    const fromQuery = decodeTicketId(parsed.searchParams.get('ticketId') ?? parsed.searchParams.get('id'));
    if (fromQuery) {
      return fromQuery;
    }

    const fromPath = readFromPath(parsed.pathname);
    if (fromPath) {
      return fromPath;
    }

    const fromHash = readFromHash(parsed.hash);
    if (fromHash) {
      return fromHash;
    }

    const nested =
      parsed.searchParams.get('redirect') ??
      parsed.searchParams.get('next') ??
      parsed.searchParams.get('returnTo');
    return readFromRedirect(nested, depth + 1);
  } catch {
    return null;
  }
};

export const readHelpTicketId = (
  paramsTicketId: string | undefined,
  path: string,
  search: string,
  hash: string,
): string | null => {
  const fromParams = decodeTicketId(paramsTicketId);
  if (fromParams) {
    return fromParams;
  }

  const searchParams = new URLSearchParams(search);
  const fromQuery = decodeTicketId(searchParams.get('ticketId') ?? searchParams.get('id'));
  if (fromQuery) {
    return fromQuery;
  }

  const fromHash = readFromHash(hash);
  if (fromHash) {
    return fromHash;
  }

  const fromPath = readFromPath(path);
  if (fromPath) {
    return fromPath;
  }

  const fromRedirect = readFromRedirect(
    searchParams.get('redirect') ?? searchParams.get('next') ?? searchParams.get('returnTo'),
  );
  if (fromRedirect) {
    return fromRedirect;
  }

  const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  return readFromRedirect(hashParams.get('redirect'));
};
