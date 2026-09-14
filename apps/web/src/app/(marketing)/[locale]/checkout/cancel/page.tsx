import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { Section } from '@/components/blocks/section';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/i18n/routing';

export const metadata = { title: 'Paiement annulé · Dar Lemlih' };

export default async function CheckoutCancelPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  return (
    <Section>
      <div className="mx-auto max-w-xl rounded-3xl border border-amber-200/40 bg-amber-50/40 p-10 text-center shadow-glass backdrop-blur dark:border-amber-800/30 dark:bg-amber-950/20">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          <XCircle className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl font-semibold text-charcoal-900 dark:text-amber-50">
          Paiement annulé
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm text-charcoal-600 dark:text-charcoal-300">
          Aucune charge n&apos;a été effectuée sur votre carte. Vous pouvez réessayer
          ou retourner au panier.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="default" className="rounded-full">
            <Link href={`/${params.locale}/checkout` as `/${string}`}>Réessayer</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/${params.locale}/products` as `/${string}`}>
              Continuer mes achats
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
