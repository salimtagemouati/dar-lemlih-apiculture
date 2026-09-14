import { Skeleton } from '@/components/ui/skeleton';

export default function OrdersLoading() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-64" />
      </header>
      <ul className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-glass dark:border-white/8 dark:bg-charcoal-900/60"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="mt-6 flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
