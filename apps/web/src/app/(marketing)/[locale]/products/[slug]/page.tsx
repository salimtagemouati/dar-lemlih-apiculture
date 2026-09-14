import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Section } from '@/components/blocks/section';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AddToCartButton } from './add-to-cart-button';
import { getProductBySlug } from '@/lib/api/products';
import { ApiClientError } from '@/lib/api/client';
import {
  formatPriceMAD,
  localizedProductDescription,
  localizedProductName,
  resolveImageUrl
} from '@/lib/format';
import type { Locale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { locale: Locale; slug: string } }): Promise<Metadata> {
  try {
    const product = await getProductBySlug(params.slug);
    return {
      title: `${localizedProductName(product, params.locale)} · Dar Lemlih`,
      description: localizedProductDescription(product, params.locale).slice(0, 160) || undefined
    };
  } catch {
    return { title: 'Produit · Dar Lemlih' };
  }
}

export default async function ProductPage({ params }: { params: { locale: Locale; slug: string } }) {
  setRequestLocale(params.locale);

  let product: Awaited<ReturnType<typeof getProductBySlug>>;
  try {
    product = await getProductBySlug(params.slug);
  } catch (e) {
    if (e instanceof ApiClientError && e.status === 404) {
      notFound();
    }
    throw e;
  }

  const t = await getTranslations({ locale: params.locale, namespace: 'products' });
  const tNav = await getTranslations({ locale: params.locale, namespace: 'nav' });

  const name = localizedProductName(product, params.locale);
  const description = localizedProductDescription(product, params.locale);
  const image = resolveImageUrl(product.images?.[0]);
  const outOfStock = product.stockQuantity <= 0;

  return (
    <Section>
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-charcoal-500 dark:text-charcoal-400">
        <Link href={`/${params.locale}`} className="hover:text-amber-600">{tNav('home')}</Link>
        <span>/</span>
        <Link href={`/${params.locale}/products`} className="hover:text-amber-600">{tNav('products')}</Link>
        {product.categoryName && (
          <>
            <span>/</span>
            <span className="text-charcoal-700 dark:text-charcoal-300">{product.categoryName}</span>
          </>
        )}
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Product image */}
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/20 bg-white/50 shadow-glass backdrop-blur dark:border-white/10 dark:bg-charcoal-900/50">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {product.isFeatured && (
            <div className="absolute start-6 top-6">
              <Badge variant="default" className="px-4 py-1.5 text-xs shadow-lg">★ Featured</Badge>
            </div>
          )}
          {outOfStock && (
            <div className="absolute end-6 top-6">
              <Badge variant="destructive" className="px-4 py-1.5 text-xs shadow-lg">{t('outOfStock')}</Badge>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            {product.origin && (
              <Badge variant="glass" className="mb-2 uppercase tracking-widest">
                {product.origin}
              </Badge>
            )}
            <h1 className="font-display text-4xl font-bold text-charcoal-900 dark:text-amber-50 lg:text-5xl">
              {name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-bold">4.8</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-charcoal-500">Certified Pure</span>
              {product.weightGrams && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-charcoal-500">{product.weightGrams}g</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-charcoal-900 dark:text-amber-50">
              {formatPriceMAD(product.price, params.locale)}
            </span>
            {product.weightGrams && (
              <span className="text-charcoal-500">/ {product.weightGrams}g</span>
            )}
          </div>

          {description && (
            <p className="text-lg leading-relaxed text-charcoal-600 dark:text-charcoal-300">
              {description}
            </p>
          )}

          <Separator className="my-2" />

          <AddToCartButton
            productId={product.id}
            productName={name}
            stockQuantity={product.stockQuantity}
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-sand-50 p-4 text-center dark:bg-charcoal-800/50">
              <Truck className="h-5 w-5 text-amber-600" />
              <span className="text-xs font-medium">Livraison Maroc</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-sand-50 p-4 text-center dark:bg-charcoal-800/50">
              <ShieldCheck className="h-5 w-5 text-amber-600" />
              <span className="text-xs font-medium">100% Naturel</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-sand-50 p-4 text-center dark:bg-charcoal-800/50">
              <RotateCcw className="h-5 w-5 text-amber-600" />
              {product.isHalal ? (
                <span className="text-xs font-medium">Halal certifié</span>
              ) : (
                <span className="text-xs font-medium">Authenticité</span>
              )}
            </div>
          </div>

          {/* Editorial accordion: Origine / Conservation / Informations nutritionnelles */}
          <Accordion type="multiple" className="mt-6 border-t border-stone-200 dark:border-charcoal-800">
            <AccordionItem value="origine">
              <AccordionTrigger>Origine & terroir</AccordionTrigger>
              <AccordionContent>
                {product.origin
                  ? `Récolté à ${product.origin}.`
                  : 'Récolte artisanale au Maroc, dans le respect du terroir et des cycles saisonniers.'}
                {product.ingredients ? (
                  <>
                    <br />
                    <span className="text-xs uppercase tracking-wider text-stone-500">Composition&nbsp;:</span>{' '}
                    {product.ingredients}
                  </>
                ) : null}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="conservation">
              <AccordionTrigger>Conservation</AccordionTrigger>
              <AccordionContent>
                À conserver à l&apos;abri de la lumière et de la chaleur. Ne pas réfrigérer —
                la cristallisation naturelle peut être inversée par un bain-marie tiède
                (max 40 °C) afin de préserver les enzymes vivantes.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="nutrition">
              <AccordionTrigger>Informations nutritionnelles</AccordionTrigger>
              <AccordionContent>
                Pour 100&nbsp;g&nbsp;: ~304&nbsp;kcal · Glucides 82&nbsp;g
                (dont sucres 82&nbsp;g) · Protéines 0,3&nbsp;g · Sel
                0&nbsp;g. Valeurs indicatives, fluctuent selon la flore butinée.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </Section>
  );
}
