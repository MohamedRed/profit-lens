import { component$ } from '@builder.io/qwik';

type IconLabelSize = 'sm' | 'md';

interface IconLabelProps {
  icon: string;
  text: string;
  size?: IconLabelSize;
}

export const IconLabel = component$<IconLabelProps>(({ icon, text, size = 'md' }) => {
  return (
    <span class={{ 'admin-icon-label': true, [`size-${size}`]: true }}>
      <span class="material-icons-outlined" aria-hidden="true">{icon}</span>
      <span>{text}</span>
    </span>
  );
});
