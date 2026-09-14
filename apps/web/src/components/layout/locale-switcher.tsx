'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { locales, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const LOCALE_LABEL: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
  ar: 'AR'
};

/**
 * Premium-feel inline locale switcher: thin pills with a divider, e.g. "FR | AR".
 * Falls back to a button + popover only on very narrow viewports if needed
 * (currently inline at all sizes — locales is short).
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const tCommon = useTranslations('common');

  const handleChange = (next: Locale) => {
    if (next === locale) return;
    const newPath = (pathname?.replace(`/${locale}`, `/${next}`) ?? `/${next}`) as `/${string}`;
    router.replace(newPath);
  };

  return (
    <div
      role="group"
      aria-label={tCommon('languageSelector')}
      className={cn('flex items-center gap-1 px-1', className)}
    >
      {locales.map((current, index) => (
        <span key={current} className="flex items-center">
          {index > 0 && (
            <span className="mx-1 select-none text-[10px] text-current opacity-30" aria-hidden>
              |
            </span>
          )}
          <button
            type="button"
            onClick={() => handleChange(current)}
            aria-pressed={current === locale}
            className={cn(
              'rounded-sm px-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-opacity focus-ring',
              current === locale ? 'opacity-100' : 'opacity-60 hover:opacity-100'
            )}
          >
            {LOCALE_LABEL[current]}
          </button>
        </span>
      ))}
    </div>
  );
}
