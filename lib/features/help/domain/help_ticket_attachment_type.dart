enum HelpTicketAttachmentType { image }

String helpTicketAttachmentTypeToString(HelpTicketAttachmentType type) {
  switch (type) {
    case HelpTicketAttachmentType.image:
      return 'image';
  }
}

HelpTicketAttachmentType? helpTicketAttachmentTypeFromString(String? value) {
  switch (value) {
    case 'image':
      return HelpTicketAttachmentType.image;
  }
  return null;
}
