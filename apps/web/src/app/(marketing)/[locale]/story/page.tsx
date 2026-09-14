import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Section } from '@/components/blocks/section';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Eye, RefreshCw } from 'lucide-react';

const STORY_IMAGES = [
  'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1509731987499-ef6601bb7674?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80',
];

const VALUE_ICONS = {
  terroir: Leaf,
  transparency: Eye,
  regenerative: RefreshCw,
};

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'story' });
  return {
    title: t('title'),
    description: t('heroText'),
  };
}

export default async function StoryPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  const t = await getTranslations({ locale: params.locale, namespace: 'story' });

  return (
    <>
      {/* Hero */}
      <Section>
        <div className="relative overflow-hidden rounded-4xl border border-white/20 bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 p-10 sm:p-16 lg:p-20 dark:from-charcoal-950 dark:to-charcoal-900">
          <div className="pointer-events-none absolute -end-40 -top-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -start-40 h-80 w-80 rounded-full bg-atlas-500/10 blur-3xl" />

          <div className="relative mx-auto max-w-3xl text-center">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.5em] text-amber-400">
              Dar Lemlih
            </p>
            <h1 className="font-display text-hero text-amber-50">
              {t('title')}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-charcoal-300">
              {t('heroText')}
            </p>
          </div>
        </div>
      </Section>

      {/* Chapters */}
      {[
        { titleKey: 'chapter1Title', textKey: 'chapter1Text', imageIndex: 0, reverse: false },
        { titleKey: 'chapter2Title', textKey: 'chapter2Text', imageIndex: 1, reverse: true },
        { titleKey: 'chapter3Title', textKey: 'chapter3Text', imageIndex: 2, reverse: false },
      ].map((chapter, index) => (
        <Section key={index} background={index % 2 === 1 ? 'warm' : 'default'}>
          <div className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${chapter.reverse ? 'lg:[direction:ltr]' : ''}`}>
            <div className={`space-y-6 ${chapter.reverse ? 'lg:order-2' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-amber-300/30" />
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-sm font-bold text-amber-600 dark:text-amber-400">
                  {index + 1}
                </span>
              </div>
              <h2 className="font-display text-heading text-charcoal-900 dark:text-amber-50">
                {t(chapter.titleKey as 'chapter1Title' | 'chapter2Title' | 'chapter3Title')}
              </h2>
              <p className="text-base leading-relaxed text-charcoal-600 dark:text-charcoal-300">
                {t(chapter.textKey as 'chapter1Text' | 'chapter2Text' | 'chapter3Text')}
              </p>
            </div>
            <div className={`relative aspect-[4/3] overflow-hidden rounded-3xl shadow-elevated ${chapter.reverse ? 'lg:order-1' : ''}`}>
              <Image
                src={STORY_IMAGES[chapter.imageIndex]}
                alt={t(chapter.titleKey as 'chapter1Title' | 'chapter2Title' | 'chapter3Title')}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal-900/15 to-transparent" />
            </div>
          </div>
        </Section>
      ))}

      {/* Values */}
      <Section background="warm">
        <div className="mb-12 text-center">
          <h2 className="font-display text-display text-charcoal-900 dark:text-amber-50">
            {t('valuesTitle')}
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {(['terroir', 'transparency', 'regenerative'] as const).map((key) => {
            const Icon = VALUE_ICONS[key];
            return (
              <Card key={key} className="text-center">
                <CardContent className="flex flex-col items-center gap-4 p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100/80 dark:bg-amber-900/20">
                    <Icon className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-charcoal-900 dark:text-amber-50">
                    {t(`values.${key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-charcoal-600 dark:text-charcoal-300">
                    {t(`values.${key}.description`)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>
    </>
  );
}
