import { component$ } from '@builder.io/qwik';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import { type OfferAnalysisProgressStep } from '../../offer-analysis-progress';
import { OfferAnalysisProgressStepper } from '../../components/offer-analysis-progress-stepper';

interface BulkAnalysisProgressProps {
  activeStep: OfferAnalysisProgressStep | null;
  currentIndex: number;
  totalCount: number;
}

export const BulkAnalysisProgress = component$<BulkAnalysisProgressProps>((props) => {
  const i18n = useI18n();
  if (!props.activeStep || props.totalCount <= 0 || props.currentIndex <= 0) {
    return null;
  }

  return (
    <div class="ui-offer-bulk-progress">
      <OfferAnalysisProgressStepper activeStep={props.activeStep} />
      <p class="ui-offer-bulk-progress-meta">
        {t(i18n, 'bulkParseProgressMeta', 'Parsing screenshot {current} of {total}.')
          .replace('{current}', String(props.currentIndex))
          .replace('{total}', String(props.totalCount))}
      </p>
    </div>
  );
});
