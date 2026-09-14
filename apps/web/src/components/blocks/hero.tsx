import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1567880905822-56f8e06fe630?auto=format&fit=crop&w=2400&q=85';
const HERO_BLUR =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxASEhUSEhIVFRUVFhUQFRUVFRUYFhUVFRUWFhUVFRUYHSggGBolHRUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGisdHh0rKy0rLSstLS0tLS0tLS0rKy0rLS0tKystLS0tLS0tLSstLS0tLS0rLS0tKystK//AABEIAJ8BPgMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAABv/EABcQAQEBAQAAAAAAAAAAAAAAAAECEQD/2gAMAwEAAhADEAAAAcUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//Z';

export async function Hero({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'hero' });

  return (
    <section
      className="relative flex min-h-[88vh] w-full items-center justify-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Full-bleed background image */}
      <Image
        src={HERO_IMAGE}
        alt={t('alt')}
        fill
        priority
        placeholder="blur"
        blurDataURL={HERO_BLUR}
        sizes="100vw"
        className="object-cover"
      />

      {/* Warm dark overlay (rgba(30, 20, 10, 0.45)) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: 'rgba(30, 20, 10, 0.45)' }}
        aria-hidden="true"
      />

      {/* Subtle radial gradient for added depth */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40"
        aria-hidden="true"
      />

      {/* Centered text block */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.5em] text-honey-200">
          Pur Maroc · Récolte Artisanale
        </p>

        <h1
          id="hero-heading"
          className="font-display font-light text-white"
          style={{ fontSize: 'clamp(2.75rem, 5.5vw + 1rem, 4.5rem)', lineHeight: 1.05, letterSpacing: '-0.01em' }}
        >
          {t('title')}
        </h1>

        <p className="mx-auto mt-6 max-w-[480px] text-base font-light leading-relaxed text-stone-100 sm:text-lg">
          {t('subtitle')}
        </p>

        <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          {/* Primary CTA — flat honey-400, stone-900 text, radius-sm */}
          <Button
            asChild
            variant="hero"
            size="lg"
            className="rounded-sm bg-honey-400 text-stone-900 hover:bg-honey-500"
          >
            <Link href={`/${locale}/products`}>
              {t('primaryCta')}
            </Link>
          </Button>
          {/* Ghost CTA — white border, white text */}
          <Button
            asChild
            variant="ghostHero"
            size="lg"
            className="rounded-sm border border-white/80 bg-transparent text-white hover:bg-white/10"
          >
            <Link href={`/${locale}/story`}>
              {t('secondaryCta')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="hero-scroll-indicator" />
      </div>
    </section>
  );
}
