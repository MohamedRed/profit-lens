import { Slot, component$ } from '@builder.io/qwik';
import { AdminGuard } from '../../components/guards/admin-guard';
import { AdminShell } from '../../components/layout/admin-shell';

export default component$(() => {
  return (
    <AdminGuard requireAdmin={true}>
      <AdminShell>
        <Slot />
      </AdminShell>
    </AdminGuard>
  );
});
