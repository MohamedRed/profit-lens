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
  const popoverWidth = useSignal('');

  useVisibleTask$(({ cleanup }) => {
    if (!triggerRef.value || typeof ResizeObserver === 'undefined') {
      return;
    }
    const updateWidth = () => {
      if (!triggerRef.value) {
        return;
      }
      popoverWidth.value = `${Math.round(triggerRef.value.getBoundingClientRect().width)}px`;
    };
    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(triggerRef.value);
    window.addEventListener('resize', updateWidth);
    cleanup(() => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWidth);
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
      <QSelect.Trigger ref={triggerRef} id={id} class={cn('ui-select', className)}>
        <QSelect.DisplayValue placeholder={placeholder} />
        <span class="material-icons-outlined ui-select-icon" aria-hidden="true">
          expand_more
        </span>
      </QSelect.Trigger>

      <QSelect.Popover
        class="ui-select-popover"
        style={
          popoverWidth.value
            ? {
                width: popoverWidth.value,
                minWidth: popoverWidth.value,
                maxWidth: popoverWidth.value,
              }
            : undefined
        }
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
