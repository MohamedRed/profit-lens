import { $, component$, type QRL, useSignal, useVisibleTask$ } from '@builder.io/qwik';
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
    if (!triggerRef.value || !popoverRef.value) {
      return;
    }
    const width = `${Math.round(triggerRef.value.getBoundingClientRect().width)}px`;
    popoverRef.value.style.setProperty('--ui-select-trigger-width', width);
  });

  useVisibleTask$(({ cleanup }) => {
    const trigger = triggerRef.value;
    if (!trigger) {
      return;
    }

    syncPopoverWidth$();

    const observer = new ResizeObserver(() => {
      syncPopoverWidth$();
    });
    observer.observe(trigger);

    window.addEventListener('resize', syncPopoverWidth$);
    window.addEventListener('orientationchange', syncPopoverWidth$);

    cleanup(() => {
      observer.disconnect();
      window.removeEventListener('resize', syncPopoverWidth$);
      window.removeEventListener('orientationchange', syncPopoverWidth$);
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
        gutter={8}
        ref={popoverRef}
        onBeforeToggle$={(event) => {
          if (event.newState === 'open') {
            syncPopoverWidth$();
          }
        }}
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
