import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';

export default component$(() => {
  const navigate = useNavigate();

  useVisibleTask$(() => {
    navigate('/next/app/offer');
  });

  return null;
});
