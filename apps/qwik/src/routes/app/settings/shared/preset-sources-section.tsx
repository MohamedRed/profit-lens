import { component$ } from '@builder.io/qwik';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';

interface PresetSourceItem {
  label: string;
  url: string;
  lastChecked: string;
}

interface PresetSourcesSectionProps {
  sources: PresetSourceItem[];
}

export const PresetSourcesSection = component$<PresetSourcesSectionProps>((props) => {
  const i18n = useI18n();

  if (props.sources.length === 0) {
    return null;
  }

  return (
    <details class="ui-settings-sources">
      <summary class="ui-settings-sources-summary">
        {t(i18n, 'sourcesSection', 'Sources')}
      </summary>
      <ul class="ui-settings-sources-list">
        {props.sources.map((source) => (
          <li key={`${source.label}-${source.lastChecked}`} class="ui-settings-sources-item">
            <p class="ui-settings-row-title">{source.label}</p>
            <p class="ui-settings-row-subtitle">
              {t(i18n, 'sourceLastCheckedLabel', 'Last checked')}: {source.lastChecked}
            </p>
            <a
              class="ui-settings-link-button"
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t(i18n, 'sourceOpenButton', 'Open')}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
});
