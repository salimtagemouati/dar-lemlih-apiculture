import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Section } from '@/components/blocks/section';
import { getSessionAction } from '@/app/actions/auth';
import { AccountSidebar } from './account-sidebar';
import type { Locale } from '@/i18n/routing';

export default async function AccountLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  setRequestLocale(params.locale);

  const session = await getSessionAction();
  if (!session) {
    redirect(`/${params.locale}/login?redirectTo=/${params.locale}/account`);
  }

  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[260px,1fr]">
        <AccountSidebar locale={params.locale} user={{ name: session.name, email: session.email }} />
        <div>{children}</div>
      </div>
    </Section>
  );
}
