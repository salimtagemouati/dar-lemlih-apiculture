import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Instagram, Facebook, Mail } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

const FOOTER_NAV: Array<{ key: 'products' | 'about' | 'blog' | 'contact'; href: string }> = [
  { key: 'products', href: '/products' },
  { key: 'about', href: '/story' },
  { key: 'blog', href: '/blog' },
  { key: 'contact', href: '/contact' }
];

const FOOTER_LEGAL: Array<{ key: 'privacy' | 'terms' | 'cookies'; href: string }> = [
  { key: 'privacy', href: '/privacy' },
  { key: 'terms', href: '/terms' },
  { key: 'cookies', href: '/cookies' }
];

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'footer' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-earth-900 text-stone-100">
      {/* Soft honey-tinted glow accent at the top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-honey-400/30 to-transparent" aria-hidden />

      <div className="container-bleed relative py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.6fr,1fr,1fr,1.4fr]">
          {/* Brand column */}
          <div className="space-y-5">
            <div>
              <h3 className="font-display text-3xl font-light text-honey-100">
                Dar Lemlih
              </h3>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.4em] text-honey-300/80">
                Apiculture de terroir · Maroc
              </p>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-stone-300/90">
              {t('tagline')}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com/darlemlih"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-700/60 text-stone-300 transition-all hover:border-honey-400 hover:bg-honey-400/10 hover:text-honey-200"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com/darlemlih"
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-700/60 text-stone-300 transition-all hover:border-honey-400 hover:bg-honey-400/10 hover:text-honey-200"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="mailto:concierge@dar-lemlih.com"
                aria-label="Email"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-700/60 text-stone-300 transition-all hover:border-honey-400 hover:bg-honey-400/10 hover:text-honey-200"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navigation column */}
          <div>
            <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-400">
              {tNav('home')}
            </h4>
            <ul className="space-y-3">
              {FOOTER_NAV.map(link => (
                <li key={link.key}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="text-sm text-stone-300 transition-colors hover:text-honey-200"
                  >
                    {tNav(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-400">
              {t('legal')}
            </h4>
            <ul className="space-y-3">
              {FOOTER_LEGAL.map(link => (
                <li key={link.key}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="text-sm text-stone-300 transition-colors hover:text-honey-200"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter column */}
          <div>
            <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-400">
              Newsletter
            </h4>
            <p className="mb-4 text-sm text-stone-300/90">
              Récoltes saisonnières, vos rituels, nos histoires. Sans spam.
            </p>
            <form
              action={`mailto:concierge@dar-lemlih.com`}
              method="post"
              className="flex flex-col gap-2 sm:flex-row"
              aria-label="Newsletter signup"
            >
              <input
                type="email"
                name="email"
                placeholder="Votre email"
                required
                className="min-w-0 flex-1 rounded-sm border border-stone-700 bg-stone-900/40 px-4 py-3 text-sm text-stone-100 placeholder:text-stone-500 focus:border-honey-400 focus:outline-none"
              />
              <Button
                type="submit"
                className="rounded-sm bg-honey-400 px-5 text-stone-900 shadow-none hover:bg-honey-500"
                size="md"
              >
                S&apos;abonner
              </Button>
            </form>
            <p className="mt-3 text-[10px] uppercase tracking-wider text-stone-500">
              ☆ IFOS Pure · ISO 22000 · Halal Maroc
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-stone-800 pt-8 text-xs text-stone-500 sm:flex-row">
          <p>
            © {year} Dar Lemlih. {t('rights')}
          </p>
          <p className="text-stone-500/80">
            Made with ♥ in Fès, Maroc
          </p>
        </div>
      </div>
    </footer>
  );
}
