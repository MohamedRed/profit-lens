import { Slot, component$, type PropsOf } from '@builder.io/qwik';
import { Label as QLabel } from '@qwik-ui/headless';
import { cn } from '../../lib/ui/cn';

type LabelProps = PropsOf<typeof QLabel>;

export const Label = component$<LabelProps>((props) => {
  const { class: className, ...rest } = props;

  return (
    <QLabel {...rest} class={cn('ui-label', className)}>
      <Slot />
    </QLabel>
  );
});
