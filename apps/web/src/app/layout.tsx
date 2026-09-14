import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter, Noto_Sans_Arabic } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Providers from './providers';
import './globals.css';
import { defaultLocale, isRTL } from '@/i18n/routing';

// Display: Cormorant Garamond — premium editorial serif used for hero headings,
// product names, section H2s. Loaded with light + regular + semibold weights
// and italic variants for tasting-note flourishes.
const display = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display'
});

// Body: Inter — modern, neutral, excellent at small sizes.
const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans'
});

// RTL fallback for Arabic locale.
const arabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.dar-lemlih.com'),
  title: {
    default: 'Dar Lemlih — Le Miel de l\u2019Atlas',
    template: '%s · Dar Lemlih'
  },
  description:
    `Dar Lemlih crée des miels marocains d'exception depuis l'Atlas. Découvrez nos crus rares, nos rituels, et notre savoir-faire apicole ancestral.`,
  keywords: [
    'miel marocain',
    'apiculture de luxe',
    'honey morocco',
    'atlas honey',
    'dar lemlih',
    'عسل مغربي',
    'miel de terroir'
  ],
  openGraph: {
    title: 'Dar Lemlih — Le Miel de l\u2019Atlas',
    description:
      'Une apiculture marocaine de prestige : crus rares, analyses, et histoires de rucher.',
    url: 'https://www.dar-lemlih.com',
    siteName: 'Dar Lemlih',
    type: 'website',
    locale: 'fr_FR'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dar Lemlih — Le Miel de l\u2019Atlas',
    description: 'Miels marocains de prestige, sourcés avec rigueur et passion.',
    creator: '@darlemlih'
  },
  icons: {
    icon: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico'
  },
  manifest: '/site.webmanifest'
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b0e11' },
    { color: '#f9f6f1' }
  ],
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const direction = isRTL(defaultLocale) ? 'rtl' : 'ltr';

  return (
    <html
      lang={defaultLocale}
      dir={direction}
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${arabic.variable}`}
    >
      <body className="min-h-screen bg-sand-25 font-sans text-charcoal-900 antialiased">
        <Providers>
          {children}
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
