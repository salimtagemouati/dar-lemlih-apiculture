# 🍯 Dar Lemlih — Moroccan Terroir E-Commerce

[![Next.js](https://img.shields.io/badge/Next.js-14-000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](#license)

> A premium, multilingual e-commerce platform for Moroccan terroir honey products. Built with Next.js 14 (App Router) and a Spring Boot 3.2 REST API, with full Arabic RTL support and a Cormorant Garamond × Inter editorial design system.

---

## ✨ Features

### Storefront (Next.js)
- **Premium editorial design** — Cormorant Garamond × Inter pairing, honey/earth/stone palette, full-bleed hero, glassmorphism accents, Aesop-style catalog cards.
- **Trilingual** — French 🇫🇷, English 🇬🇧, Arabic 🇲🇦 (with RTL layout via Tailwind logical properties).
- **End-to-end shopping flow** — server-rendered catalog, product detail page with editorial accordion, server-synced cart, multi-step checkout, Stripe Checkout redirect, success/cancel pages.
- **Account area** — profile + order history + order detail with status timeline (PENDING / PAID / SHIPPED / DELIVERED / CANCELLED / REFUNDED).
- **Auth flows** — login, register, forgot/reset password, transparent access-token refresh on 401.
- **Functional contact form** wired to the API.

### API (Spring Boot)
- **Stateless JWT auth** — Spring Security with HMAC-SHA256 access (15 min) + refresh (7 days) tokens.
- **Refresh tokens hashed at rest** with BCrypt.
- **Stripe payments** — Checkout Session creation with `stripe_session_id` capture, signature-verified webhooks (raw byte payload, byte-exact signature input), idempotent event handling, refund support.
- **Optimistic locking** on `Product.stockQuantity` to prevent oversell at checkout.
- **Multilingual catalog** — products & categories with `nameFr/nameEn/nameAr` and search by category/price.
- **Async email** — Spring `@Async` executor for password resets, order confirmations, contact form, admin notifications.
- **Flyway migrations** — versioned schema (V1–V5) plus a separate `db/migration-dev` location for development seed data.
- **Storage** — pluggable `FileStorageService` (LocalStack S3 or local filesystem).
- **OpenAPI** — Swagger UI in non-prod profiles only.

---

## 🏗️ Architecture

```
dar-lemlih-apiculture/
├── apps/
│   ├── api/                                 # Spring Boot 3.2 REST API (Java 21)
│   │   ├── src/main/java/com/darlemlih/apiculture/
│   │   │   ├── config/                      # AsyncConfig, AwsConfig, DataInitializer (@Profile("dev")),
│   │   │   │                                # OpenApiConfig, PaymentConfig (validates provider), SecurityConfig,
│   │   │   │                                # StorageConfig, WebConfig, S3Initializer
│   │   │   ├── controllers/                 # Auth, Cart, Category, Contact, Order, Payment,
│   │   │   │                                # PaymentWebhook, Product, Admin, RootRedirect
│   │   │   ├── dto/                         # Request/response shapes (@Valid)
│   │   │   ├── entities/                    # JPA models (Order, User, Product, Cart…)
│   │   │   ├── exceptions/                  # ApiException + Not/Forbidden/Conflict/BadRequest
│   │   │   │                                # GlobalExceptionHandler
│   │   │   ├── payments/                    # PaymentGateway + Stripe + Mock (@Profile("!prod"))
│   │   │   ├── repositories/                # Spring Data JPA repos
│   │   │   ├── security/                    # JwtUtils, JwtAuthenticationFilter, RateLimitFilter
│   │   │   └── services/                    # AuthService, CartService, OrderService,
│   │   │                                    # PaymentService, PaymentWebhookService, EmailService…
│   │   └── src/main/resources/
│   │       ├── application*.yml             # base + dev/dev-local/docker/h2/prod/test profiles
│   │       └── db/migration/                # Flyway core migrations (V1–V5)
│   │           db/migration-dev/            # dev-only seed (orders + addresses)
│   │
│   └── web/                                 # Next.js 14 frontend (App Router)
│       ├── src/app/
│       │   ├── (marketing)/[locale]/        # Localized marketing routes:
│       │   │     page.tsx                   #   /[locale]            (home)
│       │   │     products/                  #   /[locale]/products
│       │   │     story/, blog/, contact/    #   editorial pages
│       │   │     checkout/                  #   checkout + success/cancel
│       │   │     account/                   #   profile + orders + order detail
│       │   ├── (auth)/[locale]/             #   /[locale]/login + /reset-password
│       │   └── actions/                     # Server Actions (auth, cart, checkout, contact, password)
│       ├── src/lib/api/                     # Typed API client (server + browser, refresh-on-401)
│       ├── src/lib/hooks/use-cart.ts        # Zustand store synced to /api/cart via Server Actions
│       ├── src/components/                  # blocks/, layout/, account/, checkout/, ui/ (Radix)
│       └── src/i18n/                        # next-intl config + fr/en/ar dictionaries
│
└── docs/                                    # Architecture & agent guides
```

Request flow (typical):
```
Browser ──► Next.js (Server Components / Server Actions)
              │  reads `dar-lemlih-token` (HttpOnly access cookie, 15m)
              │  on 401 ► transparently refreshes via `dar-lemlih-refresh` (7d)
              ▼
            Spring Boot API ──► MySQL (Flyway-managed schema)
                            └─► Stripe (Checkout Session + webhook)
                            └─► SMTP (async via @Async executor)
```

---

## 🔐 Authentication model

The API is **stateless** Spring Security + JWT. Frontend cookies are HttpOnly, SameSite=Lax, Secure in production.

| Property | Value |
|---|---|
| Access token TTL | 15 minutes (`JWT_ACCESS_TOKEN_EXPIRATION=900000` ms) |
| Refresh token TTL | 7 days (`JWT_REFRESH_TOKEN_EXPIRATION=604800000` ms) |
| Access cookie | `dar-lemlih-token` — HttpOnly |
| Refresh cookie | `dar-lemlih-refresh` — HttpOnly |
| Refresh storage | BCrypt hash in `users.refresh_token` |
| Logout | `DELETE /api/auth/logout` revokes the stored hash |
| Forgot password | Always returns 200 OK with a generic message (no email-enumeration oracle) |
| Reset password | Invalidates the stored refresh hash on success |
| JWT secret | Min 32 chars; validated at startup via `@PostConstruct` |

Public endpoints (no JWT required):
`POST /api/auth/{login,register,refresh,forgot-password,reset-password}` ·
`GET /api/products/**` · `GET /api/categories/**` ·
`POST /api/contact` · `POST /api/payments/webhook` ·
`GET /actuator/health`.

---

## 💳 Payments (Stripe)

The checkout flow:

1. Client calls `POST /api/orders/checkout` with shipping address.
2. `OrderService` decrements stock atomically (optimistic lock + 3 retries on `OptimisticLockingFailureException`), generates a unique `ORD-YYYY-XXXXXXXX` order number (`SecureRandom` + collision retry), creates a Stripe Checkout Session, and persists `orders.stripe_session_id`.
3. Client is redirected to `session.url`.
4. On completion, Stripe `POST`s the webhook to `POST /api/payments/webhook`. The controller reads the **raw `byte[]` body** (no charset round-trip) and the `Stripe-Signature` header.
5. `PaymentWebhookService.processWebhook` verifies the signature; bad signatures return **HTTP 400** (Stripe will not retry); duplicate events are dropped via the unique constraint on `webhook_events.event_id`.
6. On `checkout.session.completed`: order looked up by `stripe_session_id`, `payment_intent_id` captured from the payload, status flipped to `PAID` (idempotent — skips if already PAID), confirmation email queued via `@Async`.

Provider selection is profile-driven:
- `payment.provider=stripe` → real Stripe gateway.
- `payment.provider=mock` → `MockPaymentGateway` (`@Profile("!prod")`). `verifyWebhook` throws `UnsupportedOperationException` to prevent silent webhook approval.
- `PaymentConfig` fails fast at startup if `prod` + `mock` are combined.
- `success_url` / `cancel_url` are allow-listed against `app.web-base-url` + `app.base-url`.

---

## 🚀 Getting started

### Prerequisites
| Tool | Version |
|---|---|
| Node.js | 20+ |
| Java (Temurin) | 21 |
| MySQL | 8.0 |
| Stripe account (test mode) | optional in dev (set `PAYMENT_PROVIDER=mock`) |

### 1. Clone
```bash
git clone https://github.com/salimtagemouati/dar-lemlih-apiculture.git
cd dar-lemlih-apiculture
```

### 2. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Fill in at minimum:
- `JWT_SECRET` — 64+ char random string (generate with `openssl rand -hex 32`).
- `DB_USERNAME` / `DB_PASSWORD` — credentials for your local MySQL.
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — only required if `PAYMENT_PROVIDER=stripe`.

### 3. Run the API
```bash
cd apps/api
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

`DataInitializer` (active under the `dev` profile only) creates `admin@darlemlih.ma` and `customer@darlemlih.ma` at runtime using `PasswordEncoder.encode()`. The default password is taken from the `SEED_DEFAULT_PASSWORD` env var (`ChangeMe!2025` if unset). **No BCrypt hashes are committed in SQL.**

### 4. Run the web app
```bash
cd apps/web
npm install
npm run dev
```

Open http://localhost:3000.

---

## 🚀 Portfolio deployment

For a public portfolio demo, use the dedicated `portfolio` API profile. It uses a persistent H2 database, runtime demo seed data, local upload storage, and mock checkout redirects. The strict `prod` profile is still available for real commerce with MySQL + Stripe.

### Backend on Render

1. Create a new Render Blueprint from this repo. `render.yaml` provisions `apps/api` as a Docker web service.
2. Set these Render environment variables after the first service URL is known:

| Variable | Value |
|---|---|
| `APP_BASE_URL` | Your Render API URL, e.g. `https://dar-lemlih-api.onrender.com` |
| `WEB_BASE_URL` | Your Vercel web URL, e.g. `https://dar-lemlih.vercel.app` |
| `CORS_ALLOWED_ORIGINS` | Same as `WEB_BASE_URL` |
| `SEED_DEFAULT_PASSWORD` | Demo login password of your choice |

`JWT_SECRET` is generated by Render. The API health check is `/actuator/health`.

### Frontend on Vercel

1. Import the repo in Vercel and set the Root Directory to `apps/web`.
2. Set:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | Your Render API URL |

3. Deploy. The frontend build uses `apps/web/vercel.json`.

Demo accounts seeded by the `portfolio` profile:
- `customer@darlemlih.ma`
- `admin@darlemlih.ma`

Both use `SEED_DEFAULT_PASSWORD`.

---

## 🌍 Environment variables

### Backend (`apps/api/.env`)

| Variable | Maps to | Default | Notes |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `spring.profiles.active` | `dev` | Activates `application-{profile}.yml`. Use `prod` in production. |
| `DB_URL` | `spring.datasource.url` | local MySQL | JDBC URL. |
| `DB_USERNAME` | `spring.datasource.username` | — | |
| `DB_PASSWORD` | `spring.datasource.password` | — | |
| `JWT_SECRET` | `jwt.secret` | — | **Required**, min 32 chars, validated at startup. |
| `JWT_ACCESS_TOKEN_EXPIRATION` | `jwt.access-token-expiration` | `900000` | Milliseconds (15 min). |
| `JWT_REFRESH_TOKEN_EXPIRATION` | `jwt.refresh-token-expiration` | `604800000` | Milliseconds (7 days). |
| `PAYMENT_PROVIDER` | `payment.provider` | `mock` | `stripe` or `mock`. Forced to `stripe` in `application-prod.yml`. |
| `STRIPE_SECRET_KEY` | `payment.stripe.secret-key` | — | Required when `PAYMENT_PROVIDER=stripe`. |
| `STRIPE_WEBHOOK_SECRET` | `payment.stripe.webhook-secret` | — | Required when `PAYMENT_PROVIDER=stripe`. |
| `PAYMENT_SUCCESS_URL` | `payment.stripe.success-url` | `${app.web-base-url}/checkout/success` | Allow-listed against `app.web-base-url` + `app.base-url`. |
| `PAYMENT_CANCEL_URL` | `payment.stripe.cancel-url` | `${app.web-base-url}/checkout/cancel` | Allow-listed. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | `spring.mail.*` | `localhost:1025` | Use Mailhog locally. |
| `MAIL_FROM` / `APP_EMAIL_FROM` | `app.mail.from` | `noreply@darlemlih.ma` | |
| `APP_EMAIL_ADMIN` | `app.mail.admin` | `admin@darlemlih.ma` | Recipient for new-order + contact emails. |
| `APP_BASE_URL` | `app.base-url` | `http://localhost:8080` | API base URL. |
| `WEB_BASE_URL` | `app.web-base-url` | `http://localhost:3000` | Frontend base URL (used in emails + redirect allow-list). |
| `CORS_ALLOWED_ORIGINS` | `app.cors.allowed-origins` | `http://localhost:3000,http://localhost` | CSV list. |
| `UPLOAD_PATH` | `app.uploads.path` | `./uploads` | Local file-storage root. |
| `UPLOAD_MAX_SIZE` | `app.uploads.max-size` | `10485760` (10MB) | Bytes. |
| `STORAGE_S3_ENABLED` | `aws.s3.enabled` | `false` | Switches `FileStorageService` to S3 backend. |
| `S3_BUCKET` | `aws.s3.bucket` | `media` | |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` / `AWS_ENDPOINT_URL` | `aws.*` | — | LocalStack-friendly. |
| `SEED_DEFAULT_PASSWORD` | (read by `DataInitializer`) | `ChangeMe!2025` | Dev profile only. |

### Frontend (`apps/web/.env`)

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_API_URL` | Spring Boot API base URL. Defaults to `http://localhost:8080`. **Bundled into the client; do not put secrets here.** |
| `PLAYWRIGHT_BASE_URL` | Optional override for E2E. Defaults to `http://localhost:3000`. |
| `DISABLE_CONTENTLAYER` | Optional `true` — skip MDX content during builds. |

---

## 🧪 Testing & quality

| Surface | Command | Tooling |
|---|---|---|
| Backend unit + integration | `cd apps/api && ./mvnw test` | JUnit 5, Mockito, Spring `@SpringBootTest` (`test` profile uses H2). |
| Frontend type check | `cd apps/web && npm run typecheck` | `tsc --noEmit`. |
| Frontend lint | `cd apps/web && npm run lint` | ESLint (Next.js config + TS recommended-type-checked). |
| Frontend unit | `cd apps/web && npm test` | Vitest (`--passWithNoTests`). |
| Frontend production build | `cd apps/web && npm run build` | Next.js + Contentlayer. |
| E2E | `cd apps/web && npm run playwright:test` | Playwright (default `http://localhost:3000`). |

CI runs all of the above on every push/PR to `main`/`develop`. See `.github/workflows/ci.yml`.

---

## 🌐 Internationalisation

Powered by `next-intl`. Locale is a mandatory URL prefix (`/fr`, `/en`, `/ar`). RTL is handled with Tailwind logical properties (`ps-`, `pe-`, `me-`, `ms-`, `start-`, `end-`).

| Locale | Direction | Status |
|---|---|---|
| `fr` | LTR | ✅ Primary |
| `en` | LTR | ✅ Complete |
| `ar` | **RTL** | ✅ Complete (Noto Sans Arabic fallback) |

---

## 🗺️ Roadmap

- [x] Persistent server-synced cart
- [x] Stripe Checkout integration (Web + API)
- [x] Account dashboard (profile + order history)
- [x] Forgot/reset password
- [x] Functional contact form
- [ ] Admin dashboard (product/inventory management beyond the existing CRUD endpoints)
- [ ] WhatsApp order integration
- [ ] Mobile app (React Native / Expo)

---

## 📄 License

© 2026 Dar Lemlih Apiculture. All rights reserved. Proprietary software.

---

<p align="center">
  Made with ❤️ in Morocco 🇲🇦 by <a href="https://github.com/salimtagemouati">Salim Tagemouati</a>
</p>
