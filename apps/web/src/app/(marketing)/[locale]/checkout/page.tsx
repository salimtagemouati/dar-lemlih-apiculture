import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section } from '@/components/blocks/section';
import { CheckoutForm } from './checkout-form';
import { CheckoutStepper } from '@/components/checkout/stepper';
import { getCart } from '@/lib/api/cart';
import { ApiClientError } from '@/lib/api/client';
import { getSessionAction } from '@/app/actions/auth';
import type { Locale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Commande · Dar Lemlih' };

export default async function CheckoutPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  setRequestLocale(locale);

  const session = await getSessionAction();
  if (!session) {
    redirect(`/${locale}/login?redirectTo=/${locale}/checkout`);
  }

  const t = await getTranslations({ locale, namespace: 'cart' });

  let cart: Awaited<ReturnType<typeof getCart>>;
  try {
    cart = await getCart();
  } catch (e) {
    if (e instanceof ApiClientError && e.status === 401) {
      redirect(`/${locale}/login?redirectTo=/${locale}/checkout`);
    }
    throw e;
  }

  return (
    <Section>
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-honey-700 dark:text-honey-300">
            Dar Lemlih
          </p>
          <h1 className="mt-3 font-display text-display text-stone-900 dark:text-amber-50">
            {t('checkout')}
          </h1>
        </header>

        <div className="mb-12">
          <CheckoutStepper active="shipping" />
        </div>

        {cart.items.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-amber-200/40 bg-amber-50/60 p-10 text-center text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
            {t('empty')}
          </div>
        ) : (
          <CheckoutForm cart={cart} locale={locale} userName={session.name} userPhone={session.phone} />
        )}
      </div>
    </Section>
  );
}
