import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n/routing';
import { ResetPasswordForm } from './reset-password-form';
import { CookieBanner } from '@/components/layout/cookie-banner';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

export const metadata: Metadata = {
  title: 'Réinitialiser le mot de passe · Dar Lemlih'
};

export default async function ResetPasswordPage({
  params,
  searchParams
}: {
  params: { locale: Locale };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { locale } = params;
  if (!locales.includes(locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const tokenRaw = searchParams.token;
  const token = typeof tokenRaw === 'string' ? tokenRaw : '';

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen flex-col bg-sand-25 dark:bg-charcoal-950">
        <SiteHeader locale={locale} />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="mx-auto w-full max-w-md rounded-3xl border border-white/20 bg-white/80 p-10 shadow-glass backdrop-blur dark:border-white/10 dark:bg-charcoal-900/60">
            <header className="mb-8 space-y-2 text-center">
              <h1 className="font-display text-3xl font-semibold text-charcoal-900 dark:text-amber-50">
                Réinitialiser le mot de passe
              </h1>
              <p className="text-sm text-charcoal-600 dark:text-charcoal-300">
                Choisissez un nouveau mot de passe pour votre compte.
              </p>
            </header>

            {!token ? (
              <p className="rounded-2xl border border-red-200/40 bg-red-50/60 p-4 text-center text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-300">
                Ce lien est invalide ou a expiré. Veuillez demander un nouveau lien.
              </p>
            ) : (
              <ResetPasswordForm token={token} locale={locale} />
            )}
          </div>
        </main>
        <SiteFooter locale={locale} />
      </div>
      <CookieBanner />
    </NextIntlClientProvider>
  );
}
