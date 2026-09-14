'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';

const CERTIFICATIONS = ['ifos', 'iso', 'halal'] as const;

const STATS = [
  { value: '2,400m', labelKey: 'altitude' },
  { value: '100%', labelKey: 'purity' },
  { value: '12+', labelKey: 'terroirs' },
] as const;

export function SocialProof({ locale: _locale }: { locale: string }) {
  const t = useTranslations('socialProof');

  return (
    <AnimateOnScroll animation="scale-in">
      <div className="relative overflow-hidden rounded-4xl border border-white/20 bg-white/70 p-10 text-center shadow-glass backdrop-blur-xl sm:p-14 dark:border-white/8 dark:bg-charcoal-900/60">
        {/* Background accent */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-100/30 via-transparent to-atlas-100/20 dark:from-amber-900/10 dark:to-atlas-900/10" />

        <div className="relative space-y-10">
          {/* Title section */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.5em] text-amber-600 dark:text-amber-400">
              {t('title')}
            </p>
            <h2 className="mx-auto max-w-2xl font-display text-display text-charcoal-900 dark:text-amber-50">
              {t('subtitle')}
            </h2>
          </div>

          {/* Stats row */}
          <div className="mx-auto grid max-w-2xl grid-cols-3 gap-6">
            {STATS.map((stat, index) => (
              <AnimateOnScroll key={stat.labelKey} animation="fade-up" delay={index * 100}>
                <div className="space-y-1">
                  <p className="font-display text-3xl font-bold text-amber-500 sm:text-4xl dark:text-amber-400">
                    {stat.value}
                  </p>
                  <p className="text-xs uppercase tracking-wider text-charcoal-500 dark:text-charcoal-400">
                    {t(`stats.${stat.labelKey}`)}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          {/* Divider */}
          <div className="divider-honey" />

          {/* Certifications */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {CERTIFICATIONS.map(item => (
              <Badge
                key={item}
                variant="glass"
                className="rounded-full px-5 py-2.5 text-sm font-medium uppercase tracking-wider"
              >
                {t(`certifications.${item}`)}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </AnimateOnScroll>
  );
}
