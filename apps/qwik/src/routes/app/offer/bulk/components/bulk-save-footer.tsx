import { component$, type PropFunction } from '@builder.io/qwik';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';

interface BulkSaveFooterProps {
  canSave: boolean;
  rowCount: number;
  saving: boolean;
  status: string;
  onSave$: PropFunction<() => Promise<void>>;
}

export const BulkSaveFooter = component$<BulkSaveFooterProps>((props) => {
  const i18n = useI18n();
  return (
    <footer class="ui-offer-bulk-save-footer">
      <p class="ui-offer-bulk-save-meta">
        {t(i18n, 'bulkRowsReadyLabel', '{count} rows ready to save.').replace(
          '{count}',
          String(props.rowCount),
        )}
      </p>
      <button
        type="button"
        class="ui-button ui-button-lg ui-offer-primary-cta"
        onClick$={props.onSave$}
        disabled={!props.canSave || props.saving}
      >
        {props.saving ? t(i18n, 'loadingLabel', 'Loading...') : t(i18n, 'bulkSaveButton', 'Save rows')}
      </button>
      {props.status ? <p class="ui-status">{props.status}</p> : null}
    </footer>
  );
});
