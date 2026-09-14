import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { locales } from '@/i18n/routing';
import { AuthPanel } from '@/components/forms/auth-dialog';
import { CookieBanner } from '@/components/layout/cookie-banner';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

export async function generateMetadata({ params: _params }: { params: { locale: Locale } }): Promise<Metadata> {
  return {
    title: 'Sign in'
  };
}

export default async function LoginPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;

  if (!locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen flex-col bg-sand-25 dark:bg-charcoal-950">
        <SiteHeader locale={locale} />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <AuthPanel />
        </main>
        <SiteFooter locale={locale} />
      </div>
      <CookieBanner />
    </NextIntlClientProvider>
  );
}
