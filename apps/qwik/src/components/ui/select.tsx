import { $, component$, type QRL, useComputed$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { cn } from '../../lib/ui/cn';

export interface SelectOption {
  disabled?: boolean;
  label: string;
  value: string;
}

interface SelectProps {
  class?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  onChange$?: QRL<(value: string) => void>;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  value: string;
}

export const Select = component$<SelectProps>((props) => {
  const {
    class: className,
    disabled,
    id,
    name,
    onChange$,
    options,
    placeholder,
    required,
    value,
  } = props;
  const rootRef = useSignal<HTMLElement>();
  const triggerRef = useSignal<HTMLButtonElement>();
  const isOpen = useSignal(false);

  const selectedOption = useComputed$(() => {
    return options.find((option) => option.value === value);
  });

  useVisibleTask$(({ cleanup }) => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!isOpen.value) {
        return;
      }
      const root = rootRef.value;
      if (!root) {
        return;
      }
      if (root.contains(event.target as Node)) {
        return;
      }
      isOpen.value = false;
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !isOpen.value) {
        return;
      }
      isOpen.value = false;
      triggerRef.value?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    cleanup(() => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    });
  });

  const toggleOpen$ = $(() => {
    if (disabled) {
      return;
    }
    isOpen.value = !isOpen.value;
  });

  const onTriggerKeyDown$ = $((event: KeyboardEvent) => {
    if (disabled) {
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      isOpen.value = true;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      isOpen.value = true;
    }
  });

  const selectOption$ = $((nextValue: string) => {
    if (disabled) {
      return;
    }
    if (nextValue !== value) {
      onChange$?.(nextValue);
    }
    isOpen.value = false;
    triggerRef.value?.focus();
  });

  return (
    <div
      class="ui-select-root"
      data-open={isOpen.value ? 'true' : 'false'}
      ref={rootRef}
    >
      <button
        type="button"
        id={id}
        class={cn('ui-select', className)}
        ref={triggerRef}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen.value ? 'true' : 'false'}
        onClick$={toggleOpen$}
        onKeyDown$={onTriggerKeyDown$}
      >
        <span class={{ 'ui-select-value': true, 'ui-select-placeholder': !selectedOption.value }}>
          {selectedOption.value?.label ?? placeholder ?? ''}
        </span>
        <span class="material-icons-outlined ui-select-icon" aria-hidden="true">
          expand_more
        </span>
      </button>

      <div class="ui-select-popover" role="listbox" hidden={!isOpen.value}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            class="ui-select-item"
            disabled={option.disabled}
            aria-selected={option.value === value ? 'true' : 'false'}
            onClick$={() => selectOption$(option.value)}
          >
            <span class="ui-select-item-label">{option.label}</span>
            {option.value === value ? (
              <span class="material-icons-outlined ui-select-item-indicator">check</span>
            ) : (
              <span class="ui-select-item-indicator ui-select-item-indicator-empty" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      <select
        class="ui-select-native"
        disabled={disabled}
        name={name}
        required={required}
        value={value}
        tabIndex={-1}
        aria-hidden="true"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});
