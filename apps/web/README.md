# Dar Lemlih Web — Next.js 14 App Router

Premium Moroccan apiculture storefront built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **next-intl**. Supports French, English, and Arabic with full RTL/LTR awareness and a Cormorant Garamond × Inter editorial design system. Authentication is provided by the Spring Boot API using stateless JWT (HttpOnly cookies), not by any third-party identity provider.

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

The default API base is `http://localhost:8080`. To point at a different backend, set `NEXT_PUBLIC_API_URL`.

## Environment

The web app only reads `NEXT_PUBLIC_*` variables; everything sensitive (JWT secrets, Stripe keys) lives on the API side.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Spring Boot API base URL. Defaults to `http://localhost:8080`. |
| `PLAYWRIGHT_BASE_URL` | Optional override for E2E. Defaults to `http://localhost:3000`. |
| `DISABLE_CONTENTLAYER` | Optional `true` — skip MDX content during builds. |

See the [root README](../../README.md#-environment-variables) for the full env-vars table including the backend.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Next.js dev server on port 3000. |
| `npm run build` | Contentlayer prebuild + `next build`. |
| `npm run start` | Run the production build. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run lint` | ESLint (Next.js + TypeScript-checked rules). |
| `npm test` | Vitest. |
| `npm run playwright:test` | Playwright E2E (requires API + web running). |

## Architecture

```
src/
├── app/
│   ├── (marketing)/[locale]/      # localized public surface
│   │     page.tsx                 #   /[locale]                home
│   │     products/                #   /[locale]/products
│   │     story/, blog/, contact/  #   editorial pages
│   │     checkout/                #   /[locale]/checkout (+ success / cancel)
│   │     account/                 #   /[locale]/account (+ /orders, /orders/[orderNumber])
│   ├── (auth)/[locale]/           #   /[locale]/login + /[locale]/reset-password
│   ├── actions/                   # Server Actions: auth.ts, cart.ts, checkout.ts, contact.ts, password.ts
│   ├── globals.css                # tokens + animations + glass system
│   ├── layout.tsx                 # root metadata, font loading, Providers
│   └── providers.tsx              # ThemeProvider + Tooltip + Sonner + CartHydrator
├── components/
│   ├── blocks/                    # Hero, FeatureGrid, ProductCatalog, ContactForm, Steps, …
│   ├── layout/                    # SiteHeader, SiteFooter, CartSheet, LocaleSwitcher, ThemeToggle, UserAccountNav, CookieBanner
│   ├── account/                   # OrderStatusBadge
│   ├── checkout/                  # Stepper
│   └── ui/                        # Radix UI primitives (Button, Sheet, Dialog, Accordion, Tabs, …)
├── lib/
│   ├── api/                       # Typed API client (server + browser, refresh-on-401)
│   │   ├── client.ts              # apiFetch / apiFetchClient + ApiClientError
│   │   ├── types.ts               # ProductDto, CategoryDto, CartDto, OrderDto, …
│   │   ├── auth.ts                # login / register / refresh / logout / forgotPassword / resetPassword
│   │   ├── products.ts            # getProducts / getProductBySlug / getCategories / getFeaturedProducts
│   │   ├── cart.ts                # getCart / addToCart / updateCartItem / removeFromCart / clearCart
│   │   ├── orders.ts              # getMyOrders / getOrder / checkout
│   │   └── contact.ts             # sendContactMessage
│   ├── format.ts                  # formatPriceMAD, formatDate, localizedProductName, resolveImageUrl
│   ├── hooks/use-cart.ts          # Zustand store synced to /api/cart via Server Actions
│   ├── hooks/use-in-view.ts       # IntersectionObserver scroll hook
│   └── utils.ts                   # cn()
├── i18n/
│   ├── routing.ts                 # locale list + RTL helpers
│   ├── request.ts                 # next-intl config
│   └── messages/{fr,en,ar}.json
└── middleware.ts                  # locale router + protected-segment auth gate
```

## Authentication & sessions

Authentication is handled by the Spring API. The frontend stores tokens in two HttpOnly cookies set by Server Actions (`src/app/actions/auth.ts`):

- `dar-lemlih-token` — short-lived (15 min) access JWT.
- `dar-lemlih-refresh` — long-lived (7 days) refresh JWT.

`getSessionAction` reads the access cookie and, on 401, transparently calls `refreshAction` (which posts the refresh token to `/api/auth/refresh`) before retrying. `logoutAction` calls `DELETE /api/auth/logout` to revoke the stored hash and clears both cookies.

## Cart & checkout

The cart store (`src/lib/hooks/use-cart.ts`) is a thin Zustand layer over Server Actions in `src/app/actions/cart.ts`. The `CartHydrator` client component mounts inside `Providers` and hydrates the store from `GET /api/cart` on first render.

Checkout posts to `/api/orders/checkout` via `checkoutAction` and redirects to the Stripe Checkout `paymentUrl` returned by the backend. Stripe redirects back to `/[locale]/checkout/success?order=…` or `/[locale]/checkout/cancel`.

## Internationalisation

Powered by `next-intl`. Locale prefix is mandatory in URLs. RTL is achieved with Tailwind logical properties (`ps`, `pe`, `ms`, `me`, `start`, `end`). Arabic falls back to the Noto Sans Arabic font.
