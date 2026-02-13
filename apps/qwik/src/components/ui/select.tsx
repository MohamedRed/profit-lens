import { Slot, component$, type PropsOf } from '@builder.io/qwik';
import { cn } from '../../lib/ui/cn';

type SelectProps = PropsOf<'select'>;

export const Select = component$<SelectProps>((props) => {
  const { class: className, ...rest } = props;

  return (
    <select {...rest} class={cn('ui-select pl-select', className)}>
      <Slot />
    </select>
  );
});
