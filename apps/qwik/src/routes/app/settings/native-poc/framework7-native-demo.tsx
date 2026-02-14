import { $, component$, noSerialize, type NoSerialize, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Select } from '../../../../components/ui/select';

import './framework7-native-demo.css';

type Framework7App = {
  destroy?: () => void;
  sheet?: {
    create?: (params: { backdrop: boolean; el: Element; swipeToClose: boolean }) => Framework7Sheet;
  };
};

type Framework7Sheet = {
  destroy?: () => void;
  open?: () => void;
};

type Framework7Ctor = new (params: { root: Element; theme: 'auto' | 'ios' | 'md' }) => Framework7App;

const themeOptions = [
  { label: 'Auto', value: 'auto' },
  { label: 'iOS', value: 'ios' },
  { label: 'Material', value: 'md' },
] as const;

export const Framework7NativeDemo = component$(() => {
  const hostRef = useSignal<HTMLElement>();
  const framework7App = useSignal<NoSerialize<Framework7App>>();
  const framework7Sheet = useSignal<NoSerialize<Framework7Sheet>>();
  const selectedTheme = useSignal<'auto' | 'ios' | 'md'>('auto');
  const status = useSignal('Loading Framework7...');

  useVisibleTask$(async ({ track, cleanup }) => {
    const host = hostRef.value;
    const theme = track(() => selectedTheme.value);
    if (!host) {
      return;
    }

    status.value = 'Loading Framework7...';
    const [{ default: Framework7 }] = await Promise.all([
      import('framework7/lite-bundle'),
      import('framework7/css/bundle'),
    ]);

    const Framework7Class = Framework7 as unknown as Framework7Ctor;
    const app = new Framework7Class({
      root: host,
      theme,
    });
    const sheetElement = host.querySelector('.ui-f7-sheet');
    if (!sheetElement) {
      status.value = 'Unable to start Framework7 demo.';
      app.destroy?.();
      return;
    }
    const sheet = app.sheet?.create?.({
      el: sheetElement,
      backdrop: true,
      swipeToClose: true,
    });
    if (!sheet) {
      status.value = 'Unable to start Framework7 sheet.';
      app.destroy?.();
      return;
    }

    framework7App.value = noSerialize(app);
    framework7Sheet.value = noSerialize(sheet);
    status.value = `Framework7 ready (${theme.toUpperCase()})`;

    cleanup(() => {
      sheet.destroy?.();
      app.destroy?.();
      framework7Sheet.value = undefined;
      framework7App.value = undefined;
    });
  });

  const openSheet$ = $(() => {
    const sheet = framework7Sheet.value;
    if (!sheet) {
      status.value = 'Framework7 still loading. Try again in a second.';
      return;
    }
    sheet.open?.();
  });

  return (
    <div class="ui-f7-demo">
      <section class="ui-f7-controls ui-settings-card">
        <p class="ui-settings-title">Framework7 Native POC</p>
        <p class="ui-settings-subtitle">Qwik UI controls + Framework7 interactions.</p>
        <div class="ui-f7-field">
          <label for="f7-theme" class="ui-settings-subtitle">
            Theme
          </label>
          <Select
            id="f7-theme"
            class="ui-select ui-settings-language-select"
            options={themeOptions.map((option) => ({ ...option }))}
            value={selectedTheme.value}
            onChange$={(value: string) => {
              if (value === 'auto' || value === 'ios' || value === 'md') {
                selectedTheme.value = value;
              }
            }}
          />
        </div>
        <p class="ui-f7-status">{status.value}</p>
      </section>

      <div ref={hostRef} class="ui-f7-host">
        <div class="view view-main view-init safe-areas" data-url="/">
          <div class="page" data-name="home">
            <div class="navbar">
              <div class="navbar-bg" />
              <div class="navbar-inner">
                <div class="title">Native Demo</div>
              </div>
            </div>
            <div class="page-content">
              <div class="block block-strong">
                <p>Framework7 card/list spacing and touch targets.</p>
                <button type="button" class="button button-fill color-indigo" onClick$={openSheet$}>
                  Open Native Sheet
                </button>
              </div>
              <div class="list inset">
                <ul>
                  <li>
                    <a href="#" class="item-link item-content">
                      <div class="item-media">
                        <i class="icon f7-icons">bell</i>
                      </div>
                      <div class="item-inner">
                        <div class="item-title">Push Notifications</div>
                        <div class="item-after">Enabled</div>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="#" class="item-link item-content">
                      <div class="item-media">
                        <i class="icon f7-icons">lock</i>
                      </div>
                      <div class="item-inner">
                        <div class="item-title">Biometric Lock</div>
                        <div class="item-after">Face ID</div>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="#" class="item-link item-content">
                      <div class="item-media">
                        <i class="icon f7-icons">chart_bar</i>
                      </div>
                      <div class="item-inner">
                        <div class="item-title">Weekly Insights</div>
                        <div class="item-after">3 new</div>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>

              <div class="sheet-modal ui-f7-sheet">
                <div class="sheet-modal-inner">
                  <div class="block-title">Swipe down to close</div>
                  <div class="block">
                    <p>This bottom sheet is Framework7-driven and behaves like native modal sheets.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
