import { Slot, component$, type PropsOf } from '@builder.io/qwik';
import { cn } from '../../lib/ui/cn';

type BadgeProps = PropsOf<'span'>;

export const Badge = component$<BadgeProps>((props) => {
  const { class: className, ...rest } = props;

  return (
    <span {...rest} class={cn('ui-badge', className)}>
      <Slot />
    </span>
  );
});
