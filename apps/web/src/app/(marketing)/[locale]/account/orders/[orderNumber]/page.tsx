import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { getOrder } from '@/lib/api/orders';
import { ApiClientError } from '@/lib/api/client';
import { OrderStatusBadge } from '@/components/account/order-status-badge';
import { formatDate, formatPriceMAD } from '@/lib/format';
import type { Locale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Détail de commande · Dar Lemlih' };

export default async function OrderDetailPage({
  params
}: {
  params: { locale: Locale; orderNumber: string };
}) {
  setRequestLocale(params.locale);

  let order: Awaited<ReturnType<typeof getOrder>>;
  try {
    order = await getOrder(decodeURIComponent(params.orderNumber));
  } catch (e) {
    if (e instanceof ApiClientError && (e.status === 404 || e.status === 401)) {
      notFound();
    }
    throw e;
  }

  return (
    <div className="space-y-8">
      <Link
        href={`/${params.locale}/account/orders` as `/${string}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-charcoal-600 hover:text-amber-600 dark:text-charcoal-400"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour aux commandes
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-amber-600 dark:text-amber-400">
            Commande
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-charcoal-900 dark:text-amber-50">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
            Passée le {formatDate(order.createdAt, params.locale)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      {/* Items */}
      <section className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-glass backdrop-blur dark:border-white/8 dark:bg-charcoal-900/60">
        <h2 className="mb-5 font-display text-lg font-semibold text-charcoal-900 dark:text-amber-50">
          Articles
        </h2>
        <ul className="divide-y divide-sand-100 dark:divide-charcoal-800">
          {order.items.map(item => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-charcoal-900 dark:text-amber-50">
                  {item.productName}
                </p>
                <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                  SKU {item.productSku} · {item.quantity} × {formatPriceMAD(item.unitPrice, params.locale)}
                </p>
              </div>
              <p className="text-sm font-semibold text-charcoal-900 dark:text-amber-50">
                {formatPriceMAD(item.totalPrice, params.locale)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="mt-6 space-y-1.5 border-t border-sand-100 pt-5 text-sm dark:border-charcoal-800">
          <div className="flex justify-between">
            <dt className="text-charcoal-600 dark:text-charcoal-400">Sous-total</dt>
            <dd className="font-medium text-charcoal-900 dark:text-amber-50">
              {formatPriceMAD(order.subtotal, params.locale)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-charcoal-600 dark:text-charcoal-400">Livraison</dt>
            <dd className="font-medium text-charcoal-900 dark:text-amber-50">
              {formatPriceMAD(order.shippingCost, params.locale)}
            </dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-charcoal-600 dark:text-charcoal-400">Remise</dt>
              <dd className="font-medium text-amber-600">
                – {formatPriceMAD(order.discount, params.locale)}
              </dd>
            </div>
          )}
          <div className="mt-3 flex justify-between border-t border-sand-100 pt-3 text-base font-bold dark:border-charcoal-800">
            <dt>Total</dt>
            <dd className="text-amber-600">{formatPriceMAD(order.total, params.locale)}</dd>
          </div>
        </dl>
      </section>

      {/* Shipping */}
      {order.shippingAddress && (
        <section className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-glass backdrop-blur dark:border-white/8 dark:bg-charcoal-900/60">
          <h2 className="mb-5 font-display text-lg font-semibold text-charcoal-900 dark:text-amber-50">
            Livraison
          </h2>
          <address className="not-italic text-sm leading-relaxed text-charcoal-700 dark:text-charcoal-300">
            <p className="font-medium">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>
              {order.shippingAddress.postalCode} {order.shippingAddress.city}, {order.shippingAddress.region}
            </p>
            <p>{order.shippingAddress.country}</p>
            <p className="mt-2">{order.shippingAddress.phone}</p>
          </address>
          {order.trackingNumber && (
            <p className="mt-4 text-xs text-charcoal-500 dark:text-charcoal-400">
              Numéro de suivi : <span className="font-mono">{order.trackingNumber}</span>
            </p>
          )}
        </section>
      )}
    </div>
  );
}
