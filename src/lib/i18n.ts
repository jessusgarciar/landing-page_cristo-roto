import es from '../data/locales/es.json';
import en from '../data/locales/en.json';
import ja from '../data/locales/ja.json';

type Locale = 'es' | 'en' | 'ja';

const translations: Record<Locale, Record<string, string>> = { es, en, ja };
let currentLocale: Locale = 'es';

export function t(key: string): string {
  return translations[getLocale()]?.[key] ?? translations['es']?.[key] ?? key;
}

export function changeLanguage(locale: Locale): void {
  currentLocale = locale;
  if (typeof document !== 'undefined') {
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
    document.querySelectorAll('[data-i18n]').forEach((el: Element) => {
      const key = el.getAttribute('data-i18n');
      if (key && translations[locale]?.[key]) {
        el.textContent = translations[locale][key];
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el: Element) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key && translations[locale]?.[key]) {
        (el as HTMLInputElement | HTMLTextAreaElement).placeholder = translations[locale][key];
      }
    });
  }
}

export function initI18n(): void {
  if (typeof document === 'undefined') return;
  const saved = localStorage.getItem('locale') as Locale | null;
  const browser = navigator.language.slice(0, 2) as Locale;
  const locale: Locale =
    saved === 'es' || saved === 'en' || saved === 'ja' ? saved :
    browser === 'es' || browser === 'en' || browser === 'ja' ? browser :
    'es';
  currentLocale = locale;
  document.documentElement.lang = locale;
  document.querySelectorAll('[data-i18n]').forEach((el: Element) => {
    const key = el.getAttribute('data-i18n');
    if (key && translations[locale]?.[key]) {
      el.textContent = translations[locale][key];
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el: Element) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && translations[locale]?.[key]) {
      (el as HTMLInputElement | HTMLTextAreaElement).placeholder = translations[locale][key];
    }
  });
}

export function getLocale(): Locale {
  if (typeof document !== 'undefined') {
    const saved = localStorage.getItem('locale') as Locale | null;
    if (saved === 'es' || saved === 'en' || saved === 'ja') return saved;
  }
  return currentLocale;
}

export function getLocaleLabel(locale: Locale): string {
  return { es: 'Español', en: 'English', ja: '日本語' }[locale];
}

export function getFlagEmoji(locale: Locale): string {
  return { es: '🇲🇽', en: '🇺🇸', ja: '🇯🇵' }[locale];
}

export const serviceIcons: Record<string, string> = {
  anchor: '⚓', parking: '🅿️', emergency: '🏥', restroom: '🚻',
};

const i18nExports = { t, changeLanguage, initI18n, getLocale, getLocaleLabel, getFlagEmoji, serviceIcons };
export default i18nExports;
export type { Locale };
