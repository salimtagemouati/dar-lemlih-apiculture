# Next phases for Dar Lemlih web

The Next.js foundation, localisation, design system, server-synced cart, and checkout / account flows are now in place against the Spring Boot API. The following tracks will help reach feature parity and unlock further capabilities.

1. **Catalog depth**
   - Add filter facets (floral source, region, weight, price) with URL-state-driven Server Components and client-side refinements.
   - Add a media gallery with thumbnail strip on the PDP (multiple images already supported by the API).
   - Wire reviews + structured data (Product schema with `aggregateRating`).

2. **Checkout polish**
   - Add a "guest checkout" path that promotes the user to a real account post-purchase (email-on-success).
   - Add coupon / discount codes on the checkout page (backend `Order.discount` is already in the schema).
   - Pre-fill the shipping form from the user's last order's shipping address.

3. **Account experiences**
   - Address book (CRUD on `/api/addresses` — endpoint to be added).
   - Profile editor (name / phone / password change).
   - Downloadable invoices / lab certificates (PDF generation).

4. **Content & CMS**
   - Wire `apps/web/contentlayer.config.ts` to a real `src/content/blog` and `src/content/recipes` directory; render at `/[locale]/blog/[slug]` and `/[locale]/recipes/[slug]`.

5. **Performance & polish**
   - Replace remote Unsplash imagery with self-hosted assets (already supported by `next/image` `remotePatterns`).
   - Audit Lighthouse on mobile (target ≥ 95 across categories).
   - Add `nprogress`-style route transitions (currently `nextjs-toploader` is mounted but only on the header).

6. **Observability**
   - Add `Sentry` (or similar) error reporting on both surfaces.
   - Add a server-side request log of cart / checkout failures keyed by user id (PII-safe).

7. **Admin surface**
   - Build `/[locale]/admin` (admin-only) for product CRUD, image uploads, order status transitions, refund processing — backend endpoints are already in place under `/api/admin/*`.
