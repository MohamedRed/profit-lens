import { component$ } from '@builder.io/qwik';
import { SkeletonBlock } from '../../../../components/ui/page-loading-skeleton';

export const HelpTicketAttachmentSkeleton = component$(() => {
  return (
    <div class="ui-help-ticket-attachments-content" aria-hidden="true">
      <div class="ui-help-ticket-attachment-gallery-skeleton">
        <SkeletonBlock class="ui-help-ticket-attachment-thumb-skeleton" height="72px" width="72px" />
        <SkeletonBlock class="ui-help-ticket-attachment-thumb-skeleton" height="72px" width="72px" />
        <SkeletonBlock class="ui-help-ticket-attachment-thumb-skeleton" height="72px" width="72px" />
      </div>
    </div>
  );
});
