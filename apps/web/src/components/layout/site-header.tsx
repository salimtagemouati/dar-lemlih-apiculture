'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NextTopLoader from 'nextjs-toploader';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';
import { CartSheet } from './cart-sheet';
import { UserAccountNav } from './user-account-nav';
import type { Locale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_ITEMS: Array<{ key: string; href: string }> = [
  { key: 'home', href: '/' },
  { key: 'products', href: '/products' },
  { key: 'about', href: '/story' },
  { key: 'blog', href: '/blog' },
  { key: 'contact', href: '/contact' }
];

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Body scroll lock while mobile menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Slim honey progress bar on route changes */}
      <NextTopLoader color="#F59E0B" showSpinner={false} shadow={false} height={2} />

      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-[background-color,backdrop-filter,border-color,box-shadow] duration-500',
          scrolled
            ? 'border-b border-stone-200/60 shadow-sm'
            : 'border-b border-transparent'
        )}
        style={
          scrolled
            ? {
                backgroundColor: 'rgba(255, 255, 255, 0.97)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }
            : { backgroundColor: 'transparent' }
        }
      >
        <div className="container-bleed flex h-20 items-center justify-between gap-4 lg:h-22">
          {/* Wordmark logo — Cormorant Garamond */}
          <Link
            href={`/${locale}`}
            className="group flex items-baseline gap-2 focus-ring rounded-sm"
            aria-label="Dar Lemlih — accueil"
          >
            <span
              className={cn(
                'font-display text-[22px] leading-none tracking-tight transition-colors',
                scrolled
                  ? 'text-stone-900 group-hover:text-honey-700'
                  : 'text-white group-hover:text-honey-200'
              )}
            >
              Dar Lemlih
            </span>
            <span
              className={cn(
                'hidden text-[10px] font-medium uppercase tracking-[0.4em] sm:inline',
                scrolled ? 'text-stone-500' : 'text-stone-200/80'
              )}
            >
              · Maroc
            </span>
          </Link>

          {/* Desktop navigation — small caps, tracked */}
          <nav className="hidden flex-1 items-center justify-center lg:flex" aria-label="Main navigation">
            <ul className="flex items-center gap-7">
              {NAV_ITEMS.map(item => (
                <li key={item.key}>
                  <Link
                    href={`/${locale}${item.href === '/' ? '' : item.href}`}
                    className={cn(
                      'text-[11px] font-medium uppercase tracking-[0.2em] transition-colors focus-ring rounded-sm',
                      scrolled
                        ? 'text-stone-700 hover:text-honey-700'
                        : 'text-stone-100 hover:text-honey-200'
                    )}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right actions */}
          <div className={cn('flex items-center gap-1', scrolled ? '' : 'text-white')}>
            <LocaleSwitcher />
            <ThemeToggle />
            <CartSheet />

            <div className="hidden sm:block">
              <UserAccountNav />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'rounded-full lg:hidden',
                scrolled ? '' : 'text-white hover:bg-white/10 hover:text-white'
              )}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Full-height mobile panel sliding in from the right */}
      <div
        className={cn(
          'fixed end-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-stone-50 shadow-elevated transition-transform duration-500 ease-out-expo lg:hidden dark:bg-charcoal-950',
          mobileOpen ? 'translate-x-0 rtl:-translate-x-0' : 'translate-x-full rtl:-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-stone-200/60 px-6 py-5 dark:border-charcoal-800/60">
          <span className="font-display text-xl text-stone-900 dark:text-amber-100">
            Dar Lemlih
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-8" aria-label="Mobile navigation">
          <ul className="space-y-1">
            {NAV_ITEMS.map(item => (
              <li key={item.key}>
                <Link
                  href={`/${locale}${item.href === '/' ? '' : item.href}`}
                  className="flex items-center rounded-sm px-2 py-4 font-display text-2xl text-stone-900 transition-colors hover:text-honey-700 dark:text-amber-100 dark:hover:text-honey-300"
                  onClick={() => setMobileOpen(false)}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-stone-200/60 p-6 dark:border-charcoal-800/60">
          <UserAccountNav />
        </div>
      </div>
    </>
  );
}
