import { Slot, component$ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { useAdminAuth } from '../../lib/auth/admin-auth-context';
import { signOutCurrentUser } from '../../lib/firebase/auth';

const navItems = [
  { href: '/', label: 'Overview', icon: 'dashboard' },
  { href: '/users', label: 'Users', icon: 'group' },
  { href: '/offers', label: 'Offers', icon: 'payments' },
  { href: '/tickets', label: 'Tickets', icon: 'support_agent' },
] as const;

const isActiveRoute = (pathname: string, href: string) => {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

export const AdminShell = component$(() => {
  const location = useLocation();
  const auth = useAdminAuth();

  return (
    <div class="admin-shell">
      <aside class="admin-sidebar">
        <div class="admin-brand">Profit Lens Admin</div>

        <nav class="admin-nav" aria-label="Admin navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              class={{ active: isActiveRoute(location.url.pathname, item.href) }}
            >
              <span class="material-icons-outlined" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div class="admin-muted" style={{ display: 'grid', gap: '8px' }}>
          <span>{auth.user.value?.email ?? 'Admin user'}</span>
          <button
            class="admin-button secondary"
            onClick$={async () => {
              await signOutCurrentUser();
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main class="admin-main">
        <Slot />
      </main>
    </div>
  );
});
