import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/lib/api/types';

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  PAID: 'Payée',
  PROCESSING: 'En préparation',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  COMPLETED: 'Complétée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Remboursée'
};

const STATUS_CLASS: Record<OrderStatus, string> = {
  PENDING:    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  CONFIRMED:  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  PAID:       'bg-atlas-100 text-atlas-800 dark:bg-atlas-900/30 dark:text-atlas-300',
  PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  SHIPPED:    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  DELIVERED:  'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  COMPLETED:  'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  CANCELLED:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  REFUNDED:   'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200'
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider',
      STATUS_CLASS[status]
    )}>
      {STATUS_LABEL[status]}
    </span>
  );
}
