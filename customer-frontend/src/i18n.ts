import 'server-only';

export type Locale = 'en' | 'ar';

const dictionaries = {
  en: () => import('./locales/en/landing.json').then((module) => module.default),
  ar: () => import('./locales/ar/landing.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]?.() ?? dictionaries.en();
};
