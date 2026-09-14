'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/hooks/use-cart';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatPriceMAD, resolveImageUrl } from '@/lib/format';
import type { Locale } from '@/i18n/routing';

export function CartSheet() {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const cart = useCart(state => state.cart);
  const loading = useCart(state => state.loading);
  const updateQuantity = useCart(state => state.updateQuantity);
  const removeItem = useCart(state => state.removeItem);

  // Avoid SSR/CSR hydration mismatch on the badge count
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  const totalItems = mounted ? cart?.totalItems ?? 0 : 0;
  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const total = cart?.total ?? 0;
  const shippingCost = cart?.shippingCost ?? 0;

  // Free-shipping threshold (kept client-side for display only — backend is
  // still authoritative on what gets charged).
  const FREE_SHIPPING_THRESHOLD = 500;
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (!mounted) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full" aria-label={t('nav.cart')}>
          <ShoppingBag className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white shadow-sm">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="space-y-2.5 pe-6">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {t('cart.title')}
            {totalItems > 0 && (
              <span className="text-sm font-normal text-charcoal-500">
                ({totalItems} {totalItems === 1 ? t('cart.item') : t('cart.items')})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <Separator className="my-4" />

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-sand-100 p-6 dark:bg-charcoal-800">
              <ShoppingBag className="h-10 w-10 text-sand-400" />
            </div>
            <p className="text-lg font-medium text-charcoal-900 dark:text-amber-50">
              {t('cart.empty')}
            </p>
            <p className="max-w-[200px] text-sm text-charcoal-500">
              {t('cart.emptySub')}
            </p>
            <Button
              variant="outline"
              className="mt-2 rounded-full"
              asChild
            >
              <Link href={`/${locale}/products` as `/${string}`} onClick={() => setOpen(false)}>
                {t('cart.startShopping')}
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pe-4">
              <div className="flex flex-col gap-5 py-2">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative aspect-square h-20 w-20 overflow-hidden rounded-xl bg-sand-100 dark:bg-charcoal-800">
                      <Image
                        src={resolveImageUrl(item.productImage)}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between py-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/${locale}/products/${item.productSlug}` as `/${string}`}
                            className="block truncate text-sm font-semibold text-charcoal-900 hover:text-amber-600 dark:text-amber-50"
                            onClick={() => setOpen(false)}
                          >
                            {item.productName}
                          </Link>
                          <p className="text-xs text-charcoal-500">
                            {formatPriceMAD(item.unitPrice, locale)}
                          </p>
                        </div>
                        <p className="whitespace-nowrap text-sm font-bold text-charcoal-900 dark:text-amber-50">
                          {formatPriceMAD(item.totalPrice, locale)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-full border border-sand-200 p-1 dark:border-charcoal-800">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={loading}
                            aria-label="decrement quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-4 text-center text-xs font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={loading || item.quantity >= item.stockQuantity}
                            aria-label="increment quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-charcoal-400 hover:text-red-500"
                          onClick={() => removeItem(item.productId)}
                          disabled={loading}
                          aria-label="remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-6">
              <Separator />
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-600 dark:text-charcoal-400">{t('cart.subtotal')}</span>
                  <span className="font-semibold text-charcoal-900 dark:text-amber-50">
                    {formatPriceMAD(subtotal, locale)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-600 dark:text-charcoal-400">{t('cart.shipping')}</span>
                  <span className={freeShipping ? 'font-semibold text-atlas-600 dark:text-atlas-400' : 'text-charcoal-500'}>
                    {freeShipping ? 'Gratuit' : (shippingCost > 0 ? formatPriceMAD(shippingCost, locale) : t('cart.shippingNote'))}
                  </span>
                </div>
                {!freeShipping && remainingForFree > 0 && (
                  <p className="rounded-lg bg-honey-50/60 px-3 py-2 text-[11px] text-honey-800 dark:bg-honey-900/20 dark:text-honey-200">
                    Plus que {formatPriceMAD(remainingForFree, locale)} pour la livraison gratuite.
                  </p>
                )}
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>{t('cart.total')}</span>
                <span className="text-amber-600">{formatPriceMAD(total, locale)}</span>
              </div>
              <SheetFooter className="mt-2 flex-col gap-2 sm:flex-col">
                <Button className="w-full rounded-full bg-amber-600 hover:bg-amber-700" size="lg" asChild>
                  <Link href={`/${locale}/checkout` as `/${string}`} onClick={() => setOpen(false)}>
                    {t('cart.checkout')}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full rounded-full"
                  onClick={() => setOpen(false)}
                >
                  {t('cart.continue')}
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
