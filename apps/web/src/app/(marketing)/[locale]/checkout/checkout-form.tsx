'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Lock, Loader2 } from 'lucide-react';
import { checkoutAction } from '@/app/actions/checkout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPriceMAD, resolveImageUrl } from '@/lib/format';
import type { CartDto } from '@/lib/api/types';
import type { Locale } from '@/i18n/routing';

const schema = z.object({
  name: z.string().min(2, 'Nom requis'),
  phone: z.string().min(8, 'Téléphone invalide'),
  line1: z.string().min(3, 'Adresse requise'),
  line2: z.string().optional(),
  city: z.string().min(2, 'Ville requise'),
  region: z.string().min(2, 'Région requise'),
  postalCode: z.string().min(4, 'Code postal requis'),
  country: z.string().min(2),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

interface CheckoutFormProps {
  cart: CartDto;
  locale: Locale;
  userName?: string;
  userPhone?: string;
}

export function CheckoutForm({ cart, locale, userName, userPhone }: CheckoutFormProps) {
  const t = useTranslations('cart');
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: userName ?? '',
      phone: userPhone ?? '',
      line1: '',
      line2: '',
      city: '',
      region: '',
      postalCode: '',
      country: 'Maroc',
      notes: ''
    }
  });

  const onSubmit = form.handleSubmit(async values => {
    setSubmitting(true);
    const result = await checkoutAction({
      shippingAddress: {
        name: values.name,
        phone: values.phone,
        line1: values.line1,
        line2: values.line2 || null,
        city: values.city,
        region: values.region,
        postalCode: values.postalCode,
        country: values.country
      },
      notes: values.notes,
      paymentMethod: 'stripe'
    });

    if (!result.success) {
      setSubmitting(false);
      toast.error(result.error);
      return;
    }

    if (result.paymentUrl) {
      // Redirect to Stripe Checkout (or mock URL).
      window.location.href = result.paymentUrl;
      return;
    }

    // Defensive fallback — show success page directly.
    router.replace(`/${locale}/checkout/success?order=${encodeURIComponent(result.orderNumber)}` as `/${string}`);
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
      {/* Shipping form */}
      <div className="space-y-5 rounded-3xl border border-white/20 bg-white/70 p-8 shadow-glass backdrop-blur dark:border-white/8 dark:bg-charcoal-900/60">
        <h2 className="font-display text-2xl font-semibold text-charcoal-900 dark:text-amber-50">
          Livraison
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            placeholder="Nom complet"
            {...form.register('name')}
            error={!!form.formState.errors.name}
          />
          <Input
            placeholder="Téléphone"
            {...form.register('phone')}
            error={!!form.formState.errors.phone}
          />
        </div>

        <Input
          placeholder="Adresse"
          {...form.register('line1')}
          error={!!form.formState.errors.line1}
        />
        <Input
          placeholder="Complément d'adresse (optionnel)"
          {...form.register('line2')}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input placeholder="Ville" {...form.register('city')} error={!!form.formState.errors.city} />
          <Input placeholder="Région" {...form.register('region')} error={!!form.formState.errors.region} />
          <Input placeholder="Code postal" {...form.register('postalCode')} error={!!form.formState.errors.postalCode} />
        </div>

        <Input placeholder="Pays" {...form.register('country')} />

        <textarea
          placeholder="Notes (optionnel)"
          rows={3}
          {...form.register('notes')}
          className="w-full resize-none rounded-2xl border-0 bg-white/80 px-4 py-3.5 text-sm text-charcoal-900 shadow-inner placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60 dark:bg-charcoal-900/60 dark:text-amber-50 dark:placeholder:text-charcoal-500"
        />
      </div>

      {/* Order summary */}
      <aside className="space-y-5 rounded-3xl border border-white/20 bg-white/80 p-8 shadow-glass backdrop-blur dark:border-white/8 dark:bg-charcoal-900/70">
        <h2 className="font-display text-2xl font-semibold text-charcoal-900 dark:text-amber-50">
          Votre commande
        </h2>

        <ul className="space-y-3">
          {cart.items.map(item => (
            <li key={item.id} className="flex items-center gap-3">
              <div className="relative aspect-square h-14 w-14 overflow-hidden rounded-xl bg-sand-100 dark:bg-charcoal-800">
                <Image
                  src={resolveImageUrl(item.productImage)}
                  alt={item.productName}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-charcoal-900 dark:text-amber-50">
                  {item.productName}
                </p>
                <p className="text-xs text-charcoal-500">
                  {item.quantity} × {formatPriceMAD(item.unitPrice, locale)}
                </p>
              </div>
              <p className="text-sm font-semibold text-charcoal-900 dark:text-amber-50">
                {formatPriceMAD(item.totalPrice, locale)}
              </p>
            </li>
          ))}
        </ul>

        <Separator />

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-charcoal-600 dark:text-charcoal-400">{t('subtotal')}</span>
            <span className="font-medium text-charcoal-900 dark:text-amber-50">
              {formatPriceMAD(cart.subtotal, locale)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-600 dark:text-charcoal-400">{t('shipping')}</span>
            <span className="text-charcoal-500">{formatPriceMAD(cart.shippingCost, locale)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span>{t('total')}</span>
          <span className="text-amber-600">{formatPriceMAD(cart.total, locale)}</span>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full rounded-full bg-amber-600 hover:bg-amber-700"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              Redirection…
            </>
          ) : (
            <>
              <Lock className="me-2 h-4 w-4" />
              Payer par carte
            </>
          )}
        </Button>

        <p className="flex items-center justify-center gap-2 text-xs text-charcoal-500 dark:text-charcoal-400">
          <Lock className="h-3 w-3" />
          Paiement 100% sécurisé · Stripe
        </p>
      </aside>
    </form>
  );
}
