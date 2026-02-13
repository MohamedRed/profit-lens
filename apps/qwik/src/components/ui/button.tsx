import { Slot, component$, type PropsOf } from '@builder.io/qwik';
import { cn } from '../../lib/ui/cn';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends PropsOf<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClass: Record<ButtonVariant, string> = {
  default: 'ui-button-default',
  secondary: 'ui-button-secondary',
  outline: 'ui-button-outline',
  ghost: 'ui-button-ghost',
  destructive: 'ui-button-destructive',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'ui-button-sm',
  md: 'ui-button-md',
  lg: 'ui-button-lg',
};

export const Button = component$<ButtonProps>((props) => {
  const { class: className, variant = 'default', size = 'md', ...rest } = props;

  return (
    <button
      {...rest}
      class={cn('ui-button', variantClass[variant], sizeClass[size], className)}
    >
      <Slot />
    </button>
  );
});
