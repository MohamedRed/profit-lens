const encodeValue = (value: string): string => encodeURIComponent(value.trim());

export const getAdminUserPath = (uid: string): string =>
  `/users/detail/?uid=${encodeValue(uid)}`;

export const getAdminTicketPath = (uid: string, ticketId: string): string =>
  `/tickets/detail/?uid=${encodeValue(uid)}&ticketId=${encodeValue(ticketId)}`;
