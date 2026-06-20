import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '../navigation';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid, fallback to 'en' if not
  if (!locale || !locales.includes(locale as any)) {
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
