import { Slot, component$, type PropsOf } from '@builder.io/qwik';
import { cn } from '../../lib/ui/cn';

type LabelProps = PropsOf<'label'>;

export const Label = component$<LabelProps>((props) => {
  const { class: className, ...rest } = props;

  return (
    <label {...rest} class={cn('ui-label', className)}>
      <Slot />
    </label>
  );
});
