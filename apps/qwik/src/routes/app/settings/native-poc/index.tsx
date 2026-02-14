import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { Framework7NativeDemo } from './framework7-native-demo';

export default component$(() => {
  return (
    <div class="ui-settings-root">
      <section class="ui-settings-card">
        <Link class="ui-f7-back-link" href="/next/app/settings">
          <span class="material-icons-outlined" aria-hidden="true">
            arrow_back
          </span>
          <span>Settings</span>
        </Link>
      </section>
      <Framework7NativeDemo />
    </div>
  );
});
