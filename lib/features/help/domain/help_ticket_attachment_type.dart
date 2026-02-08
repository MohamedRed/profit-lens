enum HelpTicketAttachmentType { image, audio }

String helpTicketAttachmentTypeToString(HelpTicketAttachmentType type) {
  switch (type) {
    case HelpTicketAttachmentType.image:
      return 'image';
    case HelpTicketAttachmentType.audio:
      return 'audio';
  }
}

HelpTicketAttachmentType? helpTicketAttachmentTypeFromString(String? value) {
  switch (value) {
    case 'image':
      return HelpTicketAttachmentType.image;
    case 'audio':
      return HelpTicketAttachmentType.audio;
  }
  return null;
}
