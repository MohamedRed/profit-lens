import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';

const readTicketId = (source: string | null): string | null => {
  if (!source) {
    return null;
  }
  try {
    const decoded = decodeURIComponent(source).trim();
    return decoded.length > 0 ? decoded : null;
  } catch {
    return source;
  }
};

export default component$(() => {
  const location = useLocation();
  const navigate = useNavigate();

  useVisibleTask$(({ track }) => {
    const search = track(() => location.url.search);
    const hash = track(() => location.url.hash);
    const params = new URLSearchParams(search);
    const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    const ticketId =
      readTicketId(params.get('ticketId') ?? params.get('id')) ??
      readTicketId(hashParams.get('ticketId') ?? hashParams.get('id'));

    if (ticketId) {
      navigate(`/next/app/help/tickets/${encodeURIComponent(ticketId)}?ticketId=${encodeURIComponent(ticketId)}`);
      return;
    }

    navigate('/next/app/help/tickets');
  });

  return <p class="ui-help-ticket-empty">Loading...</p>;
});
