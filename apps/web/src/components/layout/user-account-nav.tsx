'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, Package, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { getSessionAction, logoutAction } from '@/app/actions/auth';
import type { User } from '@/lib/api/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '../forms/auth-dialog';

export function UserAccountNav() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
    void getSessionAction().then(setUser);
  }, []);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      setUser(null);
      toast.success('Déconnexion réussie');
      router.refresh();
    });
  };

  if (!mounted) return null;
  if (!user) return <AuthDialog />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full bg-amber-50 dark:bg-charcoal-800" aria-label="Account menu">
          <UserIcon className="h-5 w-5 text-amber-700 dark:text-amber-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
        <DropdownMenuLabel className="px-3 py-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-charcoal-500">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="rounded-xl focus:bg-amber-50 dark:focus:bg-charcoal-800">
          <Link href={`/${locale}/account` as `/${string}`} className="flex w-full items-center gap-2 px-3 py-2">
            <Settings className="h-4 w-4" />
            <span>{t('account')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-xl focus:bg-amber-50 dark:focus:bg-charcoal-800">
          <Link href={`/${locale}/account/orders` as `/${string}`} className="flex w-full items-center gap-2 px-3 py-2">
            <Package className="h-4 w-4" />
            <span>Mes commandes</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={e => {
            e.preventDefault();
            handleLogout();
          }}
          disabled={isPending}
          className="rounded-xl text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-900/20"
        >
          <div className="flex w-full items-center gap-2 px-3 py-2">
            <LogOut className="h-4 w-4" />
            <span>{t('logout')}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
