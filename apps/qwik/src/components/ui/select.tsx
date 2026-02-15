import { $, component$, type QRL, useSignal } from '@builder.io/qwik';
import { Select as QSelect } from '@qwik-ui/headless';
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
  const triggerRef = useSignal<HTMLElement>();
  const popoverRef = useSignal<HTMLElement>();

  const syncPopoverWidth$ = $(() => {
    const popover = popoverRef.value;
    const trigger = triggerRef.value;
    if (!popover || !trigger) {
      return;
    }

    const triggerWidth = trigger.getBoundingClientRect().width;
    if (triggerWidth && Number.isFinite(triggerWidth)) {
      popover.style.setProperty('--ui-select-trigger-width', `${Math.round(triggerWidth)}px`);
    }
  });

  const handleToggle$ = $((event: { newState: 'open' | 'closed' }) => {
    if (event.newState !== 'open') {
      return;
    }
    const popover = popoverRef.value;
    const trigger = triggerRef.value;
    if (!popover || !trigger) {
      return;
    }
    const triggerWidth = trigger.getBoundingClientRect().width;
    if (triggerWidth && Number.isFinite(triggerWidth)) {
      popover.style.setProperty('--ui-select-trigger-width', `${Math.round(triggerWidth)}px`);
    }
  });

  return (
    <QSelect.Root
      class="ui-select-root"
      disabled={disabled}
      name={name}
      required={required}
      value={value}
      onChange$={(nextValue: string | string[]) => {
        if (typeof nextValue === 'string') {
          onChange$?.(nextValue);
        }
      }}
    >
      <QSelect.Trigger
        id={id}
        class={cn('ui-select', className)}
        ref={triggerRef}
        onPointerDown$={syncPopoverWidth$}
        onClick$={syncPopoverWidth$}
      >
        <QSelect.DisplayValue placeholder={placeholder} />
        <span class="material-icons-outlined ui-select-icon" aria-hidden="true">
          expand_more
        </span>
      </QSelect.Trigger>

      <QSelect.Popover
        class="ui-select-popover"
        flip={false}
        floating="bottom-start"
        onToggle$={handleToggle$}
        ref={popoverRef}
      >
        {options.map((option) => (
          <QSelect.Item
            key={option.value}
            class="ui-select-item"
            disabled={option.disabled}
            value={option.value}
          >
            <QSelect.ItemLabel class="ui-select-item-label">{option.label}</QSelect.ItemLabel>
            <QSelect.ItemIndicator class="material-icons-outlined ui-select-item-indicator">
              check
            </QSelect.ItemIndicator>
          </QSelect.Item>
        ))}
      </QSelect.Popover>

      <QSelect.HiddenNativeSelect disabled={disabled} name={name} required={required} />
    </QSelect.Root>
  );
});
