import { Section } from '@/components/blocks/section';
import { ProductCardSkeleton, Skeleton } from '@/components/ui/skeleton';

/**
 * Suspense fallback for the products page. Mirrors the real layout to avoid
 * layout shift while data is fetching.
 */
export default function ProductsLoading() {
  return (
    <>
      <Section>
        <div className="mb-14 space-y-4 text-center">
          <Skeleton className="mx-auto h-3 w-40" />
          <Skeleton className="mx-auto h-12 w-3/4 max-w-lg" />
          <Skeleton className="mx-auto h-4 w-2/3 max-w-md" />
        </div>
      </Section>

      <Section background="warm">
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </Section>
    </>
  );
}
