import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Section } from '@/components/blocks/section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BLOG_POSTS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80',
    category: 'Recipe',
    title: 'Atlas Thyme Honey Glazed Tagine',
    excerpt: 'A refined take on the classic lamb tagine, elevated with our wild thyme honey from 2,400m altitude.',
    date: '2025-12-15',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
    category: 'Terroir',
    title: 'Understanding Moroccan Honey Terroir',
    excerpt: 'Like wine, honey expresses its geography. Explore how altitude, flora, and season shape each batch.',
    date: '2025-11-28',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1471943038711-ddd2a7d4c9aa?auto=format&fit=crop&w=800&q=80',
    category: 'Wellness',
    title: 'Morning Honey Ritual for Energy',
    excerpt: 'Discover the Berber tradition of raw honey and warm water — a simple ritual with profound benefits.',
    date: '2025-11-10',
  },
];

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'blog' });
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function BlogPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  const t = await getTranslations({ locale: params.locale, namespace: 'blog' });

  return (
    <>
      <Section>
        <div className="mb-14 space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-amber-600 dark:text-amber-400">
            Journal
          </p>
          <h1 className="font-display text-hero text-charcoal-900 dark:text-amber-50">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-charcoal-600 dark:text-charcoal-300">
            {t('subtitle')}
          </p>
        </div>
      </Section>

      <Section background="warm">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <Card key={post.id} className="group flex flex-col overflow-hidden border-white/15 p-0">
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal-900/20 to-transparent" />
                <div className="absolute start-4 top-4">
                  <Badge variant="glass" className="rounded-full text-[10px] shadow-lg">
                    {post.category}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col gap-3 p-6">
                <time className="text-xs text-charcoal-400 dark:text-charcoal-500">
                  {new Date(post.date).toLocaleDateString(params.locale === 'ar' ? 'ar-MA' : params.locale === 'fr' ? 'fr-FR' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <h3 className="font-display text-lg font-semibold leading-tight text-charcoal-900 transition-colors group-hover:text-amber-600 dark:text-amber-50 dark:group-hover:text-amber-400">
                  {post.title}
                </h3>
                <p className="flex-1 text-sm leading-relaxed text-charcoal-600 dark:text-charcoal-300">
                  {post.excerpt}
                </p>
                <span className="mt-2 text-sm font-semibold text-amber-600 transition-colors group-hover:text-amber-700 dark:text-amber-400 dark:group-hover:text-amber-300">
                  {t('readMore')} →
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* Coming soon note */}
        <div className="mt-16 text-center">
          <p className="rounded-2xl border border-amber-200/40 bg-amber-50/60 px-6 py-4 text-sm text-amber-700 dark:border-amber-800/30 dark:bg-amber-950/20 dark:text-amber-300">
            {t('comingSoon')}
          </p>
        </div>
      </Section>
    </>
  );
}
