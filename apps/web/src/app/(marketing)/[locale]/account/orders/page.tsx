import Link from 'next/link';
import { Package } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { getMyOrders } from '@/lib/api/orders';
import { ApiClientError } from '@/lib/api/client';
import { OrderStatusBadge } from '@/components/account/order-status-badge';
import { formatDate, formatPriceMAD } from '@/lib/format';
import type { Locale } from '@/i18n/routing';
import type { OrderDto } from '@/lib/api/types';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Mes commandes · Dar Lemlih' };

export default async function OrdersPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  let orders: OrderDto[] = [];
  try {
    const page = await getMyOrders(0, 50);
    orders = page.content;
  } catch (e) {
    if (e instanceof ApiClientError) {
      console.warn('Failed to load orders:', e.code);
    }
    orders = [];
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.5em] text-amber-600 dark:text-amber-400">
          Espace client
        </p>
        <h1 className="mt-2 font-display text-display text-charcoal-900 dark:text-amber-50">
          Mes commandes
        </h1>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/20 bg-white/70 p-12 text-center shadow-glass backdrop-blur dark:border-white/8 dark:bg-charcoal-900/60">
          <Package className="h-10 w-10 text-charcoal-400" />
          <p className="text-base font-medium text-charcoal-700 dark:text-amber-50">
            Aucune commande pour le moment.
          </p>
          <Link
            href={`/${params.locale}/products` as `/${string}`}
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            Découvrir la collection →
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map(order => (
            <li
              key={order.id}
              className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-glass backdrop-blur transition-shadow hover:shadow-elevated dark:border-white/8 dark:bg-charcoal-900/60"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-display text-lg font-semibold text-charcoal-900 dark:text-amber-50">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                    {formatDate(order.createdAt, params.locale)} · {order.items.length} article{order.items.length > 1 ? 's' : ''}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-base font-medium text-charcoal-900 dark:text-amber-50">
                  {formatPriceMAD(order.total, params.locale)}
                </p>
                <Link
                  href={`/${params.locale}/account/orders/${encodeURIComponent(order.orderNumber)}` as `/${string}`}
                  className="text-sm font-semibold text-amber-600 hover:text-amber-700"
                >
                  Voir le détail →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
