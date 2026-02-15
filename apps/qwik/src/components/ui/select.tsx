import { component$, type QRL, useSignal, useVisibleTask$ } from '@builder.io/qwik';
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

  useVisibleTask$(({ track, cleanup }) => {
    const trigger = track(() => triggerRef.value);
    const popover = track(() => popoverRef.value);
    if (!trigger || !popover) {
      return;
    }

    const syncWidth = () => {
      const triggerWidth = Math.round(trigger.getBoundingClientRect().width);
      if (triggerWidth <= 0) {
        return;
      }
      popover.style.setProperty('--ui-select-trigger-width', `${triggerWidth}px`);
    };

    syncWidth();

    const observer =
      typeof ResizeObserver === 'function' ? new ResizeObserver(() => syncWidth()) : null;
    observer?.observe(trigger);
    window.addEventListener('resize', syncWidth, { passive: true });

    cleanup(() => {
      observer?.disconnect();
      window.removeEventListener('resize', syncWidth);
    });
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
      <QSelect.Trigger id={id} class={cn('ui-select', className)} ref={triggerRef}>
        <QSelect.DisplayValue placeholder={placeholder} />
        <span class="material-icons-outlined ui-select-icon" aria-hidden="true">
          expand_more
        </span>
      </QSelect.Trigger>

      <QSelect.Popover
        class="ui-select-popover"
        flip={false}
        floating="bottom-start"
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
