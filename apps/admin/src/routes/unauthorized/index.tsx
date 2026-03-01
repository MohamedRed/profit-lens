import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { signOutCurrentUser } from '../../lib/firebase/auth';

export default component$(() => {
  return (
    <div class="admin-auth-page">
      <div class="admin-auth-card">
        <h1>Unauthorized</h1>
        <p class="admin-muted" style={{ margin: 0 }}>
          Your account is authenticated but does not have admin access.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button class="admin-button secondary" onClick$={() => signOutCurrentUser()}>
            Sign out
          </button>
          <Link href="/login" class="admin-button" style={{ textAlign: 'center' }}>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
});
