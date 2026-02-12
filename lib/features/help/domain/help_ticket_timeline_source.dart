enum HelpTicketTimelineSource { submission, triage, agent, manual, backfill }

HelpTicketTimelineSource? helpTicketTimelineSourceFromString(String? value) {
  switch (value) {
    case 'submission':
      return HelpTicketTimelineSource.submission;
    case 'triage':
      return HelpTicketTimelineSource.triage;
    case 'agent':
      return HelpTicketTimelineSource.agent;
    case 'manual':
      return HelpTicketTimelineSource.manual;
    case 'backfill':
      return HelpTicketTimelineSource.backfill;
  }
  return null;
}
