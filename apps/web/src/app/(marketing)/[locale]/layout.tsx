import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { isRTL, locales, type Locale } from '@/i18n/routing';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { CookieBanner } from '@/components/layout/cookie-banner';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

type LayoutProps = {
  children: ReactNode;
  params: { locale: Locale };
};

export default async function MarketingLayout({ children, params }: LayoutProps) {
  const { locale } = params;
  const direction = isRTL(locale) ? 'rtl' : 'ltr';

  if (!locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen flex-col" dir={direction} lang={locale}>
        <SiteHeader locale={locale} />
        <main className="flex-1 bg-none">
          {children}
        </main>
        <SiteFooter locale={locale} />
      </div>
      <CookieBanner />
    </NextIntlClientProvider>
  );
}
