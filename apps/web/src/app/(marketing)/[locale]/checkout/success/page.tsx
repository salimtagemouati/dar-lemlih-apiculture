import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { Section } from '@/components/blocks/section';
import { Button } from '@/components/ui/button';
import { CheckoutStepper } from '@/components/checkout/stepper';
import type { Locale } from '@/i18n/routing';

export const metadata = { title: 'Commande confirmée · Dar Lemlih' };

export default async function CheckoutSuccessPage({
  params,
  searchParams
}: {
  params: { locale: Locale };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  setRequestLocale(params.locale);

  const orderRaw = searchParams.order;
  const orderNumber = typeof orderRaw === 'string' ? orderRaw : undefined;

  return (
    <Section>
      <div className="mx-auto max-w-3xl">
        <div className="mb-12">
          <CheckoutStepper active="confirmation" />
        </div>
        <div className="rounded-3xl border border-atlas-200/40 bg-atlas-50/40 p-10 text-center shadow-glass backdrop-blur dark:border-atlas-800/30 dark:bg-atlas-950/20">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-atlas-100 text-atlas-700 dark:bg-atlas-900/40 dark:text-atlas-300">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl font-semibold text-charcoal-900 dark:text-amber-50">
          Merci pour votre commande
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm text-charcoal-600 dark:text-charcoal-300">
          Votre paiement a été confirmé. Vous recevrez bientôt un email de confirmation.
          {orderNumber ? (
            <>
              <br />
              Numéro de commande : <strong>{orderNumber}</strong>
            </>
          ) : null}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {orderNumber && (
            <Button asChild variant="default" className="rounded-full">
              <Link
                href={`/${params.locale}/account/orders/${encodeURIComponent(orderNumber)}` as `/${string}`}
              >
                Voir ma commande
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/${params.locale}/products` as `/${string}`}>
              Continuer mes achats
            </Link>
          </Button>
        </div>
        </div>
      </div>
    </Section>
  );
}
