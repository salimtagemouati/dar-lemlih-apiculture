'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { LogOut, Package, User as UserIcon } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/routing';

interface AccountSidebarProps {
  locale: Locale;
  user: { name: string; email: string };
}

export function AccountSidebar({ locale, user }: AccountSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const initial = (user.name || user.email).slice(0, 1).toUpperCase();

  const items: Array<{ href: string; label: string; icon: typeof UserIcon }> = [
    { href: `/${locale}/account`, label: 'Mon profil', icon: UserIcon },
    { href: `/${locale}/account/orders`, label: 'Mes commandes', icon: Package }
  ];

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.replace(`/${locale}` as `/${string}`);
      router.refresh();
    });
  };

  return (
    <aside className="lg:sticky lg:top-28">
      <div className="space-y-6 rounded-3xl border border-white/20 bg-white/80 p-6 shadow-glass backdrop-blur dark:border-white/8 dark:bg-charcoal-900/60">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 font-display text-lg font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-charcoal-900 dark:text-amber-50">{user.name}</p>
            <p className="truncate text-xs text-charcoal-500 dark:text-charcoal-400">{user.email}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {items.map(item => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href as `/${string}`}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                    : 'text-charcoal-700 hover:bg-sand-50 dark:text-charcoal-300 dark:hover:bg-charcoal-800'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={handleLogout}
            disabled={pending}
            className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </nav>
      </div>
    </aside>
  );
}
