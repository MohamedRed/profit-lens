import { component$, type PropsOf } from '@builder.io/qwik';
import { cn } from '../../lib/ui/cn';

type InputProps = PropsOf<'input'>;

export const Input = component$<InputProps>((props) => {
  const { class: className, ...rest } = props;

  return <input {...rest} class={cn('ui-input', className)} />;
});
