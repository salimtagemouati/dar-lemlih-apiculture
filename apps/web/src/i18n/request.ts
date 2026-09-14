import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales, type Locale } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) as Locale | undefined;
  const resolvedLocale = locale && locales.includes(locale) ? locale : defaultLocale;
  const messages = (await import(`./messages/${resolvedLocale}.json`)).default;
  return {
    locale: resolvedLocale,
    messages
  };
});
