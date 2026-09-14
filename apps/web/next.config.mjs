import createNextIntlPlugin from 'next-intl/plugin';
import { withContentlayer } from 'next-contentlayer';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  experimental: {
    typedRoutes: true,
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Configure additional hosts here when product images are served from a CDN.
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' }
    ],
    formats: ['image/avif', 'image/webp']
  },
  eslint: {
    dirs: ['src']
  },
  typescript: {
    ignoreBuildErrors: false
  }
};

const disableContentlayer = process.env.DISABLE_CONTENTLAYER === 'true';

export default disableContentlayer ? withNextIntl(nextConfig) : withContentlayer(withNextIntl(nextConfig));
