import { $, component$, type ClassList, type QRL } from '@builder.io/qwik';
import { cn } from '../../lib/ui/cn';

export interface VisualOptionItem {
  value: string;
  label: string;
  subtitle?: string;
  icon?: string;
  imageAlt?: string;
  imageSrc?: string;
  mediaText?: string;
  disabled?: boolean;
}

interface VisualOptionPickerProps {
  ariaLabel: string;
  class?: ClassList;
  columns?: 1 | 2 | 3;
  compact?: boolean;
  disabled?: boolean;
  onChange$: QRL<(value: string) => void>;
  optionClass?: ClassList;
  options: VisualOptionItem[];
  value: string;
}

const normalizeColumns = (value: 1 | 2 | 3 | undefined): 1 | 2 | 3 => {
  if (value === 1 || value === 2 || value === 3) {
    return value;
  }
  return 2;
};

export const VisualOptionPicker = component$<VisualOptionPickerProps>((props) => {
  const columns = normalizeColumns(props.columns);
  const selectOption$ = $((nextValue: string) => {
    if (props.disabled || nextValue === props.value) {
      return;
    }
    void props.onChange$(nextValue);
  });

  return (
    <div
      class={cn('ui-visual-option-picker', props.class, { 'is-disabled': props.disabled })}
      role="radiogroup"
      aria-label={props.ariaLabel}
      style={{ '--ui-visual-option-columns': String(columns) }}
    >
      {props.options.map((option) => {
        const selected = option.value === props.value;
        const disabled = Boolean(props.disabled || option.disabled);
        const mediaText = option.mediaText ?? option.label.slice(0, 2).toUpperCase();

        return (
          <button
            key={option.value}
            type="button"
            class={cn('ui-visual-option-item', props.optionClass, {
              'is-selected': selected,
              'is-compact': props.compact,
            })}
            role="radio"
            aria-checked={selected ? 'true' : 'false'}
            aria-label={option.label}
            disabled={disabled}
            onClick$={() => selectOption$(option.value)}
          >
            <span class="ui-visual-option-media" aria-hidden="true">
              {option.imageSrc ? (
                <img
                  class="ui-visual-option-image"
                  src={option.imageSrc}
                  alt={option.imageAlt ?? option.label}
                  width={34}
                  height={34}
                  loading="lazy"
                  decoding="async"
                />
              ) : option.icon ? (
                <span class="material-icons-outlined ui-visual-option-icon">{option.icon}</span>
              ) : (
                <span class="ui-visual-option-media-text">{mediaText}</span>
              )}
            </span>

            <span class="ui-visual-option-copy">
              <span class="ui-visual-option-title">{option.label}</span>
              {option.subtitle ? (
                <span class="ui-visual-option-subtitle">{option.subtitle}</span>
              ) : null}
            </span>

            <span class="material-icons-outlined ui-visual-option-check" aria-hidden="true">
              {selected ? 'check_circle' : 'radio_button_unchecked'}
            </span>
          </button>
        );
      })}
    </div>
  );
});
