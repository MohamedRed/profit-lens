import { component$, type PropsOf } from '@builder.io/qwik';
import { Separator as QSeparator } from '@qwik-ui/headless';
import { cn } from '../../lib/ui/cn';

type SeparatorProps = PropsOf<typeof QSeparator>;

export const Separator = component$<SeparatorProps>((props) => {
  const { class: className, ...rest } = props;

  return <QSeparator {...rest} class={cn(className)} />;
});
