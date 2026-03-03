import {
  createContextId,
  type Signal,
  useContext,
  useContextProvider,
  useSignal,
  useVisibleTask$,
} from '@builder.io/qwik';

export type LocaleCode = 'fr' | 'en' | 'ar';

export const supportedLocales: LocaleCode[] = ['fr', 'en', 'ar'];

type Dictionary = Record<string, string>;

export interface I18nStore {
  locale: Signal<LocaleCode>;
  direction: Signal<'ltr' | 'rtl'>;
  dictionary: Signal<Dictionary>;
  ready: Signal<boolean>;
}

const I18nContext = createContextId<I18nStore>('profit-lens.i18n');

export const resolveLocaleCode = (raw: string | null | undefined): LocaleCode => {
  const value = (raw ?? '').toLowerCase();
  if (value.startsWith('ar')) {
    return 'ar';
  }
  if (value.startsWith('en')) {
    return 'en';
  }
  return 'fr';
};

const resolveSystemLocale = (): LocaleCode => {
  if (typeof navigator === 'undefined') {
    return 'fr';
  }
  return resolveLocaleCode(navigator.language);
};

const dictionaryPath = (locale: LocaleCode): string => {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}i18n/${locale}.json`;
};

const loadDictionary = async (locale: LocaleCode): Promise<Dictionary> => {
  const response = await fetch(dictionaryPath(locale), { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Failed to load i18n dictionary for locale ${locale}`);
  }
  return (await response.json()) as Dictionary;
};

export const setupI18nProvider = () => {
  const locale = useSignal<LocaleCode>('fr');
  const direction = useSignal<'ltr' | 'rtl'>('ltr');
  const dictionary = useSignal<Dictionary>({});
  const ready = useSignal<boolean>(false);

  const store: I18nStore = {
    locale,
    direction,
    dictionary,
    ready,
  };

  useContextProvider(I18nContext, store);

  useVisibleTask$(({ cleanup }) => {
    const syncFromSystemLocale = async () => {
      const nextLocale = resolveSystemLocale();
      if (store.ready.value && store.locale.value === nextLocale) {
        return;
      }
      await applyLocale(store, nextLocale);
    };

    void syncFromSystemLocale().catch((error) => {
      console.warn('[i18n] failed to apply system locale', error);
    });

    const onLanguageChange = () => {
      void syncFromSystemLocale().catch((error) => {
        console.warn('[i18n] failed to apply system locale change', error);
      });
    };

    window.addEventListener('languagechange', onLanguageChange);
    cleanup(() => {
      window.removeEventListener('languagechange', onLanguageChange);
    });
  });

  return store;
};

export const useI18n = (): I18nStore => {
  return useContext(I18nContext);
};

export const applyLocale = async (store: I18nStore, locale: LocaleCode) => {
  const dictionary = await loadDictionary(locale);
  store.locale.value = locale;
  store.dictionary.value = dictionary;
  store.direction.value = locale === 'ar' ? 'rtl' : 'ltr';
  store.ready.value = true;

  document.documentElement.lang = locale;
  document.documentElement.dir = store.direction.value;
};

export const t = (store: I18nStore, key: string, fallback?: string): string => {
  return store.dictionary.value[key] ?? fallback ?? key;
};

export const formatTemplate = (
  template: string,
  values: Record<string, string | number>,
): string => {
  return template.replace(/\{(\w+)\}/g, (token, key: string) => {
    if (!(key in values)) {
      return token;
    }
    return String(values[key]);
  });
};
