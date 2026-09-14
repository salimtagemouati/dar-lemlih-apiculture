import type { Locale } from '@/i18n/routing';

const LOCALE_TAG: Record<Locale, string> = {
  fr: 'fr-MA',
  en: 'en-MA',
  ar: 'ar-MA'
};

/**
 * Format a price in MAD (Moroccan Dirham). Accepts strings (as returned by
 * Java BigDecimal serialisation in some configs) or numbers.
 */
export function formatPriceMAD(value: number | string | null | undefined, locale: Locale = 'fr'): string {
  if (value === null || value === undefined || value === '') return '—';
  const num = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(num)) return '—';
  try {
    return new Intl.NumberFormat(LOCALE_TAG[locale], {
      style: 'currency',
      currency: 'MAD',
      maximumFractionDigits: 2
    }).format(num);
  } catch {
    return `${num.toFixed(2)} MAD`;
  }
}

export function formatDate(value: string | Date | null | undefined, locale: Locale = 'fr'): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export interface NamedProductLike {
  nameFr: string;
  nameEn: string;
  nameAr: string;
  descriptionFr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
}

export function localizedProductName(p: NamedProductLike, locale: Locale): string {
  if (locale === 'ar' && p.nameAr) return p.nameAr;
  if (locale === 'en' && p.nameEn) return p.nameEn;
  return p.nameFr;
}

export function localizedProductDescription(p: NamedProductLike, locale: Locale): string {
  if (locale === 'ar' && p.descriptionAr) return p.descriptionAr;
  if (locale === 'en' && p.descriptionEn) return p.descriptionEn;
  return p.descriptionFr ?? '';
}

/**
 * Resolve product image URL. Backend returns either a relative path
 * (`/images/products/...`) for seed data, an absolute URL (S3/Unsplash), or a
 * locally-served path under {@code /uploads/...}. For relative paths, we
 * prefix the API base URL so {@code <Image>} can fetch them.
 */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) {
    return 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  return `${base}${url.startsWith('/') ? url : '/' + url}`;
}
