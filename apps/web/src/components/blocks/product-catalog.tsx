'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';
import { useCart } from '@/lib/hooks/use-cart';
import { cn } from '@/lib/utils';
import type { CategoryDto, ProductDto } from '@/lib/api/types';
import type { Locale } from '@/i18n/routing';
import { formatPriceMAD, localizedProductName, resolveImageUrl } from '@/lib/format';

interface ProductCatalogProps {
  locale: Locale;
  initialProducts: ProductDto[];
  categories: CategoryDto[];
}

/**
 * Catalog grid styled in the spec's "Aesop meets Moroccan souk" register:
 *   - Square images on radius-md, hover scale 1.03 over 0.4s.
 *   - Category eyebrow (honey-700, uppercase, 11px, tracked).
 *   - Product name in display serif, 20px.
 *   - Price in display serif, 24px, honey-800.
 *   - Outline button at rest, fills with honey-400 on hover.
 *   - "Nouveau" / "Rupture de stock" badges in the top-left corner.
 */
export function ProductCatalog({ locale, initialProducts, categories }: ProductCatalogProps) {
  const t = useTranslations('products');
  const addItem = useCart(state => state.addItem);
  const loading = useCart(state => state.loading);
  const [activeCategoryId, setActiveCategoryId] = useState<number | 'all'>('all');

  const filtered = useMemo(() => {
    if (activeCategoryId === 'all') return initialProducts;
    return initialProducts.filter(p => p.categoryId === activeCategoryId);
  }, [initialProducts, activeCategoryId]);

  const localizedCategoryLabel = (c: CategoryDto): string => {
    if (locale === 'ar' && c.nameAr) return c.nameAr;
    if (locale === 'en' && c.nameEn) return c.nameEn;
    return c.nameFr;
  };

  return (
    <div className="space-y-12">
      {/* Filter chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setActiveCategoryId('all')}
          className={cn(
            'rounded-sm px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-300',
            activeCategoryId === 'all'
              ? 'bg-stone-900 text-stone-50 shadow-sm dark:bg-honey-400 dark:text-stone-900'
              : 'bg-transparent text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-honey-200'
          )}
        >
          {t('filter.all')}
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategoryId(category.id)}
            className={cn(
              'rounded-sm px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-300',
              activeCategoryId === category.id
                ? 'bg-stone-900 text-stone-50 shadow-sm dark:bg-honey-400 dark:text-stone-900'
                : 'bg-transparent text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-honey-200'
            )}
          >
            {localizedCategoryLabel(category)}
            <span className="ms-1.5 text-[9px] opacity-50">({category.productCount})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mx-auto max-w-md rounded-md border border-stone-200 bg-white/60 p-10 text-center text-sm text-stone-500 dark:border-charcoal-800 dark:bg-charcoal-900/50 dark:text-stone-400">
          {t('outOfStock')}
        </div>
      ) : (
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product, index) => {
            const name = localizedProductName(product, locale);
            const image = resolveImageUrl(product.images?.[0]);
            const outOfStock = product.stockQuantity <= 0;

            return (
              <AnimateOnScroll key={product.id} animation="fade-up" delay={index * 60}>
                <article className="group flex flex-col">
                  {/* Square image */}
                  <Link
                    href={`/${locale}/products/${product.slug}` as `/${string}`}
                    className="relative block aspect-square overflow-hidden rounded-md bg-stone-100 dark:bg-charcoal-800 focus-ring"
                  >
                    <Image
                      src={image}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />

                    {/* Status badges (top-left) */}
                    <div className="absolute start-3 top-3 flex flex-col gap-1.5">
                      {product.isFeatured && !outOfStock && (
                        <span className="inline-flex items-center rounded-sm bg-honey-400 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-900">
                          Nouveau
                        </span>
                      )}
                      {outOfStock && (
                        <span className="inline-flex items-center rounded-sm bg-stone-900/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-50 backdrop-blur">
                          Rupture de stock
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Body */}
                  <div className="mt-5 flex flex-col gap-3">
                    {/* Category eyebrow */}
                    {product.categoryName && (
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-honey-700 dark:text-honey-400">
                        {product.categoryName}
                      </p>
                    )}

                    <h3 className="font-display text-[20px] leading-tight text-stone-900 dark:text-stone-50">
                      <Link
                        href={`/${locale}/products/${product.slug}` as `/${string}`}
                        className="transition-colors hover:text-honey-700"
                      >
                        {name}
                      </Link>
                    </h3>

                    {product.origin && (
                      <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                        {product.origin}
                        {product.weightGrams ? ` · ${product.weightGrams} g` : ''}
                      </p>
                    )}

                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-display text-[24px] leading-none text-honey-800 dark:text-honey-300">
                        {formatPriceMAD(product.price, locale)}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2 w-full rounded-sm border-stone-300 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-700 hover:border-honey-400 hover:bg-honey-400 hover:text-stone-900 dark:border-charcoal-700 dark:text-stone-300 dark:hover:bg-honey-400 dark:hover:text-stone-900"
                      disabled={outOfStock || loading}
                      onClick={() => void addItem(product.id, 1, name)}
                      aria-label={`${t('addToCart')} — ${name}`}
                    >
                      {outOfStock ? t('outOfStock') : t('addToCart')}
                    </Button>
                  </div>
                </article>
              </AnimateOnScroll>
            );
          })}
        </div>
      )}
    </div>
  );
}
