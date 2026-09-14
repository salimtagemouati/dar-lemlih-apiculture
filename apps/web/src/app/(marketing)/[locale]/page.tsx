import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Hero } from '@/components/blocks/hero';
import { FeatureGrid } from '@/components/blocks/feature-grid';
import { SocialProof } from '@/components/blocks/social-proof';
import { Steps } from '@/components/blocks/steps';
import { Section } from '@/components/blocks/section';
import { Button } from '@/components/ui/button';

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'hero' });

  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: `https://www.dar-lemlih.com/${params.locale}`
    }
  };
}

export default async function LocaleHomePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  setRequestLocale(locale);

  const tCta = await getTranslations({ locale, namespace: 'cta' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  return (
    <div className="space-y-0">
      {/* Hero — full-bleed, no Section wrapper so the bg image touches the viewport edge */}
      <Hero locale={locale} />

      {/* USP Features */}
      <Section id="usp" background="warm">
        <div className="mb-12 text-center">
          <h2 className="font-display text-heading text-stone-900 dark:text-amber-50">
            {tCta('story')}
          </h2>
        </div>
        <FeatureGrid locale={locale} />
      </Section>

      {/* Social Proof / Certifications */}
      <Section>
        <SocialProof locale={locale} />
      </Section>

      {/* Journey Steps */}
      <Section id="journey" background="warm">
        <div className="mb-14 flex flex-col gap-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-amber-600 dark:text-amber-400">
            Hive to jar
          </p>
          <h2 className="font-display text-display text-charcoal-900 dark:text-amber-50">
            {tCommon('journeyDescription')}
          </h2>
        </div>
        <Steps locale={locale} />
      </Section>

      {/* Wholesale CTA */}
      <Section>
        <div className="relative overflow-hidden rounded-4xl border border-white/20 bg-gradient-to-br from-charcoal-900 to-charcoal-800 p-10 text-center sm:p-16 dark:from-charcoal-950 dark:to-charcoal-900">
          {/* Decorative honey gradient */}
          <div className="pointer-events-none absolute -end-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -start-20 h-80 w-80 rounded-full bg-atlas-500/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-8">
            <h2 className="max-w-2xl font-display text-display text-amber-50">
              {tCta('wholesale')}
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-charcoal-300">
              {tCommon('wholesaleDescription')}
            </p>
            <div className="flex flex-col gap-3.5 sm:flex-row">
              <Button asChild size="xl" variant="premium" className="rounded-full">
                <Link href={`/${locale}/contact`}>{tCta('wholesale')}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-amber-700/40 text-amber-200 hover:border-amber-500 hover:bg-amber-900/20 hover:text-amber-100">
                <Link href={`/${locale}/story`}>{tCta('story')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
