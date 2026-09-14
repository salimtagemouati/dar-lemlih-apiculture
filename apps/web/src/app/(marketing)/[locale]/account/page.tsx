import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getSessionAction } from '@/app/actions/auth';
import type { Locale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Mon profil · Dar Lemlih' };

export default async function AccountPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  const session = await getSessionAction();
  if (!session) {
    redirect(`/${params.locale}/login?redirectTo=/${params.locale}/account`);
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.5em] text-amber-600 dark:text-amber-400">
          Espace client
        </p>
        <h1 className="mt-2 font-display text-display text-charcoal-900 dark:text-amber-50">
          Bonjour, {session.name.split(' ')[0]}
        </h1>
      </header>

      <div className="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-glass backdrop-blur dark:border-white/8 dark:bg-charcoal-900/60">
        <h2 className="mb-6 font-display text-xl font-semibold text-charcoal-900 dark:text-amber-50">
          Informations personnelles
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-charcoal-500 dark:text-charcoal-400">Nom</dt>
            <dd className="mt-1 text-sm font-medium text-charcoal-900 dark:text-amber-50">{session.name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-charcoal-500 dark:text-charcoal-400">Email</dt>
            <dd className="mt-1 text-sm font-medium text-charcoal-900 dark:text-amber-50">{session.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-charcoal-500 dark:text-charcoal-400">Téléphone</dt>
            <dd className="mt-1 text-sm font-medium text-charcoal-900 dark:text-amber-50">
              {session.phone || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-charcoal-500 dark:text-charcoal-400">Statut email</dt>
            <dd className="mt-1 text-sm font-medium text-charcoal-900 dark:text-amber-50">
              {session.emailVerified ? 'Vérifié' : 'Non vérifié'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
