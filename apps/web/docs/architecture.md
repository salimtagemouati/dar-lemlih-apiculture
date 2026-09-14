# Dar Lemlih Web — Architecture overview

## Goals

- Build on the Next.js App Router with Server Components, fluid SSR, and rich SEO metadata out of the box.
- Centralize design tokens via Tailwind + Radix UI primitives and a Cormorant Garamond × Inter typography pair.
- Talk to a single source of truth (the Spring Boot API) for catalog, cart, orders, payments, and authentication. No client-side persistence of user data.
- Maintain resilient commerce primitives: product catalog, variant-aware PDP, server-synced cart, Stripe-powered checkout, account dashboard.

## Tech stack

- **Framework**: Next.js 14 App Router + TypeScript.
- **Styling**: Tailwind CSS 3.4, `tailwindcss-animate`, Radix UI primitives, custom design tokens.
- **State**: Server Actions + a thin Zustand cart store synced to the API.
- **Forms / validation**: react-hook-form + zod.
- **i18n**: next-intl (fr/en/ar with RTL).
- **Notifications**: Sonner.
- **Auth/payments backend**: Spring Boot REST API (see `apps/api`). The web app NEVER stores secrets; all sensitive operations cross the network to the API.

## Directory structure (live)

```
apps/web/src/
├── app/
│   ├── (marketing)/[locale]/
│   │   ├── page.tsx                       # Home
│   │   ├── products/page.tsx              # Catalog (Server Component, calls getProducts)
│   │   ├── products/[slug]/page.tsx       # PDP
│   │   ├── products/[slug]/add-to-cart-button.tsx
│   │   ├── products/loading.tsx           # Suspense skeleton
│   │   ├── story/page.tsx, blog/page.tsx, contact/page.tsx
│   │   ├── checkout/page.tsx + checkout-form.tsx
│   │   ├── checkout/success/page.tsx, cancel/page.tsx
│   │   ├── account/layout.tsx + page.tsx + account-sidebar.tsx
│   │   ├── account/orders/page.tsx + loading.tsx
│   │   └── account/orders/[orderNumber]/page.tsx
│   ├── (auth)/[locale]/
│   │   ├── login/page.tsx
│   │   └── reset-password/page.tsx + reset-password-form.tsx
│   ├── actions/                           # Server Actions
│   │   ├── auth.ts                        # login / register / refresh / logout / getSession / forgotPassword
│   │   ├── cart.ts
│   │   ├── checkout.ts
│   │   ├── contact.ts
│   │   └── password.ts
│   ├── globals.css                        # tokens + animations
│   ├── layout.tsx                         # fonts (Cormorant Garamond / Inter / Noto Sans Arabic) + Providers
│   └── providers.tsx                      # ThemeProvider + Tooltip + Sonner + CartHydrator
├── components/
│   ├── blocks/                            # Hero, FeatureGrid, ProductCatalog, Steps, SocialProof, ContactForm
│   ├── layout/                            # SiteHeader, SiteFooter, CartSheet, LocaleSwitcher, ThemeToggle, UserAccountNav, CookieBanner
│   ├── account/order-status-badge.tsx
│   ├── checkout/stepper.tsx
│   ├── cart-hydrator.tsx                  # Mounts useCart.hydrate() once on first client render
│   └── ui/                                # Radix UI primitives + custom Skeleton helpers
├── lib/
│   ├── api/                               # Typed API client (apiFetch / apiFetchClient)
│   │   ├── client.ts, types.ts, auth.ts, products.ts, cart.ts, orders.ts, contact.ts
│   ├── format.ts                          # formatPriceMAD, formatDate, localizedProductName, resolveImageUrl
│   ├── hooks/use-cart.ts                  # Zustand store synced via Server Actions
│   ├── hooks/use-in-view.ts
│   └── utils.ts                           # cn()
├── i18n/
│   ├── routing.ts, request.ts, messages/{fr,en,ar}.json
└── middleware.ts                          # locale router + protected-segment auth gate
```

## Auth & session lifecycle

```
Browser                          Next.js (server)               Spring API
   │                                  │                             │
   │── Action: login(form) ───────────▶                             │
   │                                  ├── POST /api/auth/login ───▶│
   │                                  │◀── AuthResponse ────────────│
   │                                  ├── set 'dar-lemlih-token'   │
   │                                  │   set 'dar-lemlih-refresh' │
   │◀── render(redirect)──────────────│                             │
   │                                  │                             │
   │── apiFetch(/cart) ──────────────▶│── GET /api/cart (Bearer) ─▶│
   │                                  │◀── 401 if expired ──────────│
   │                                  ├── refreshAction ──────────▶│
   │                                  │── POST /api/auth/refresh ─▶│
   │                                  │◀── new tokens ─────────────│
   │                                  │── retry GET /api/cart ───▶│
   │◀── CartDto ──────────────────────│                             │
```

The middleware (`src/middleware.ts`) double-checks: protected segments (`account`, `orders`, `checkout`) redirect unauthenticated requests to `/[locale]/login` based on the access cookie's presence. Server-side pages additionally call `getSessionAction()` to fail closed if the token is rejected.

## Cart

`useCart` is a Zustand store backed by Server Actions in `app/actions/cart.ts`. Mutations are routed through the API; the store mirrors the response. Free-shipping threshold (500 MAD) is computed client-side from the authoritative server `subtotal` for display only — pricing is always the API's responsibility.

## Checkout

1. `/[locale]/checkout` — Server Component, reads `getSessionAction` (redirect if absent) and `getCart` (redirect to empty-cart if no items).
2. `CheckoutForm` (client) collects shipping details with `react-hook-form` + zod, posts via `checkoutAction → POST /api/orders/checkout`.
3. The backend creates a Stripe Checkout Session, persists `orders.stripe_session_id`, and returns `paymentUrl`.
4. The browser navigates to `paymentUrl`; Stripe redirects to `/[locale]/checkout/success?order=…` (or `/cancel`).
5. On webhook completion the backend flips the order to `PAID` (idempotently) and queues a confirmation email.
