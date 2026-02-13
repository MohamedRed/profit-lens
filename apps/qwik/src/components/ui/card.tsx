import { Slot, component$, type PropsOf } from '@builder.io/qwik';
import { cn } from '../../lib/ui/cn';

type CardProps = PropsOf<'section'>;
type CardHeaderProps = PropsOf<'div'>;
type CardTitleProps = PropsOf<'h2'>;
type CardDescriptionProps = PropsOf<'p'>;
type CardContentProps = PropsOf<'div'>;

export const Card = component$<CardProps>((props) => {
  const { class: className, ...rest } = props;

  return (
    <section {...rest} class={cn('ui-card', className)}>
      <Slot />
    </section>
  );
});

export const CardHeader = component$<CardHeaderProps>((props) => {
  const { class: className, ...rest } = props;

  return (
    <div {...rest} class={cn('ui-card-header', className)}>
      <Slot />
    </div>
  );
});

export const CardTitle = component$<CardTitleProps>((props) => {
  const { class: className, ...rest } = props;

  return (
    <h2 {...rest} class={cn('ui-card-title', className)}>
      <Slot />
    </h2>
  );
});

export const CardDescription = component$<CardDescriptionProps>((props) => {
  const { class: className, ...rest } = props;

  return (
    <p {...rest} class={cn('ui-card-description', className)}>
      <Slot />
    </p>
  );
});

export const CardContent = component$<CardContentProps>((props) => {
  const { class: className, ...rest } = props;

  return (
    <div {...rest} class={cn('ui-card-content', className)}>
      <Slot />
    </div>
  );
});
