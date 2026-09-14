import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Section } from '@/components/blocks/section';
import { ProductCatalog } from '@/components/blocks/product-catalog';
import { getCategories, getProducts } from '@/lib/api/products';
import { ApiClientError } from '@/lib/api/client';
import type { CategoryDto, ProductDto } from '@/lib/api/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'products' });
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

async function loadCatalog(): Promise<{ products: ProductDto[]; categories: CategoryDto[]; failed: boolean }> {
  try {
    const [productsPage, categories] = await Promise.all([
      getProducts({ size: 60 }),
      getCategories()
    ]);
    return { products: productsPage.content, categories, failed: false };
  } catch (e) {
    if (!(e instanceof ApiClientError)) {
      console.error('[products] unexpected error loading catalog', e);
    }
    return { products: [], categories: [], failed: true };
  }
}

export default async function ProductsPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  const t = await getTranslations({ locale: params.locale, namespace: 'products' });
  const { products, categories, failed } = await loadCatalog();

  return (
    <>
      <Section>
        <div className="mb-14 space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-amber-600 dark:text-amber-400">
            Dar Lemlih
          </p>
          <h1 className="font-display text-hero text-charcoal-900 dark:text-amber-50">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-charcoal-600 dark:text-charcoal-300">
            {t('subtitle')}
          </p>
        </div>
      </Section>

      <Section background="warm">
        {failed ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-amber-200/60 bg-amber-50/80 p-8 text-center text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
            La collection sera disponible très prochainement. Veuillez réessayer plus tard.
          </div>
        ) : (
          <ProductCatalog
            locale={params.locale}
            initialProducts={products}
            categories={categories}
          />
        )}
      </Section>
    </>
  );
}
