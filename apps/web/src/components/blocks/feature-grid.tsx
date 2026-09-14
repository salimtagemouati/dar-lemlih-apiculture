'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Leaf, ShieldCheck, Recycle } from 'lucide-react';
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';

const FEATURES = [
  {
    key: 'atlas' as const,
    icon: Leaf,
    gradient: 'from-atlas-400/20 to-atlas-600/20 dark:from-atlas-800/30 dark:to-atlas-950/30',
    iconColor: 'text-atlas-600 dark:text-atlas-400',
    accent: 'bg-atlas-500',
  },
  {
    key: 'lab' as const,
    icon: ShieldCheck,
    gradient: 'from-amber-400/20 to-amber-600/20 dark:from-amber-800/30 dark:to-amber-950/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    accent: 'bg-amber-500',
  },
  {
    key: 'sustainable' as const,
    icon: Recycle,
    gradient: 'from-terracotta-400/15 to-terracotta-600/15 dark:from-terracotta-800/20 dark:to-terracotta-950/20',
    iconColor: 'text-terracotta-600 dark:text-terracotta-400',
    accent: 'bg-terracotta-500',
  },
];

export function FeatureGrid({ locale: _locale }: { locale: string }) {
  const t = useTranslations('usp');

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <AnimateOnScroll key={feature.key} animation="fade-up" delay={index * 120}>
            <Card className="group relative overflow-hidden border-white/15 bg-white/60 transition-all duration-500 hover:border-amber-200/40 dark:hover:border-amber-800/40">
              {/* Gradient background on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              />

              <CardHeader className="relative">
                <div className="mb-3 flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm transition-transform duration-500 group-hover:scale-110 dark:bg-charcoal-800/80`}>
                    <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <div className={`h-1 w-1 rounded-full ${feature.accent} opacity-60`} />
                </div>
                <CardTitle className="text-lg">
                  {t(`${feature.key}.title`)}
                </CardTitle>
              </CardHeader>

              <CardContent className="relative">
                <CardDescription className="leading-relaxed">
                  {t(`${feature.key}.description`)}
                </CardDescription>
              </CardContent>

              {/* Bottom accent line */}
              <div
                className={`absolute bottom-0 start-6 end-6 h-0.5 ${feature.accent} scale-x-0 rounded-full opacity-40 transition-transform duration-500 group-hover:scale-x-100`}
              />
            </Card>
          </AnimateOnScroll>
        );
      })}
    </div>
  );
}
