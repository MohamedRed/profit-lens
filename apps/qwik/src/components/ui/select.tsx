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
  const popoverRef = useSignal<HTMLElement>();

  const handleBeforeToggle$ = $((event: { newState: 'open' | 'closed' }) => {
    const popover = popoverRef.value;
    if (!popover) {
      return;
    }

    if (event.newState === 'open') {
      // Hide while floating-ui computes final coordinates to prevent lateral jump flashes.
      popover.style.opacity = '0';
      return;
    }

    // Reset inline placement so next open starts from a clean state.
    popover.style.removeProperty('left');
    popover.style.removeProperty('top');
    popover.style.removeProperty('right');
    popover.style.removeProperty('bottom');
    popover.style.removeProperty('opacity');
  });

  const handleToggle$ = $((event: { newState: 'open' | 'closed' }) => {
    if (event.newState !== 'open') {
      return;
    }
    requestAnimationFrame(() => {
      const popover = popoverRef.value;
      if (!popover) {
        return;
      }
      popover.style.opacity = '1';
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
      <QSelect.Trigger id={id} class={cn('ui-select', className)}>
        <QSelect.DisplayValue placeholder={placeholder} />
        <span class="material-icons-outlined ui-select-icon" aria-hidden="true">
          expand_more
        </span>
      </QSelect.Trigger>

      <QSelect.Popover
        class="ui-select-popover"
        flip={false}
        floating="bottom-start"
        onBeforeToggle$={handleBeforeToggle$}
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
