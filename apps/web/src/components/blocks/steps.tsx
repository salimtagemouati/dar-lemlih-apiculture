'use client';

import { useTranslations } from 'next-intl';
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';

const STEP_KEYS = ['foraging', 'harvest', 'analysis', 'craft'] as const;

const STEP_EMOJIS = ['🌸', '🌅', '🔬', '🍯'] as const;

export function Steps({ locale: _locale }: { locale: string }) {
  const t = useTranslations('steps');

  return (
    <div className="relative">
      {/* Connecting line (hidden on mobile, visible on xl) */}
      <div className="pointer-events-none absolute start-0 end-0 top-[3.25rem] hidden h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent xl:block dark:via-amber-700/30" />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {STEP_KEYS.map((key, index) => (
          <AnimateOnScroll key={key} animation="fade-up" delay={index * 150}>
            <div className="group relative flex flex-col items-start gap-5 rounded-3xl border border-white/15 bg-white/60 p-7 shadow-glass backdrop-blur-sm transition-all duration-500 hover:border-amber-200/40 hover:shadow-elevated dark:border-white/8 dark:bg-charcoal-900/50 dark:hover:border-amber-800/30">
              {/* Step number with emoji */}
              <div className="relative flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/15 to-amber-500/25 text-2xl font-bold text-amber-600 ring-1 ring-amber-200/30 transition-all duration-500 group-hover:ring-amber-300/50 group-hover:shadow-glow dark:from-amber-800/20 dark:to-amber-900/30 dark:text-amber-400 dark:ring-amber-800/30">
                  {index + 1}
                </span>
                <span className="text-xl" role="img" aria-hidden="true">
                  {STEP_EMOJIS[index]}
                </span>
              </div>

              {/* Content */}
              <div className="space-y-2.5">
                <h3 className="font-display text-lg font-semibold text-charcoal-900 dark:text-amber-50">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-charcoal-600 dark:text-charcoal-300">
                  {t(`${key}.description`)}
                </p>
              </div>

              {/* Subtle progress indicator */}
              <div className="mt-auto flex items-center gap-1.5 pt-2">
                {STEP_KEYS.map((_, dotIndex) => (
                  <div
                    key={dotIndex}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      dotIndex <= index
                        ? 'w-4 bg-amber-400 dark:bg-amber-500'
                        : 'w-1.5 bg-charcoal-200 dark:bg-charcoal-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </div>
  );
}
