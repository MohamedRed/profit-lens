import { component$ } from '@builder.io/qwik';
import { VehicleEditor } from '../vehicle-editor';

export default component$(() => {
  return <VehicleEditor mode="create" />;
});
