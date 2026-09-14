# Dar Lemlih Apiculture - Project Context

This file is the foundational context for AI agent interactions in this repository. It describes the project architecture, conventions, and operational workflows. Keep it in sync with `README.md` - they should never disagree.

## Project overview

Dar Lemlih is a premium, multilingual e-commerce platform for Moroccan terroir honey. It is a monorepo with a Next.js 14 frontend and a Spring Boot 3.2 REST API.

- **Frontend (`apps/web`)** - Next.js 14 (App Router), TypeScript, Tailwind CSS, Cormorant Garamond x Inter typography, `next-intl` (fr/en/ar with RTL), Contentlayer, Zustand-backed cart store wired to Server Actions.
- **Backend (`apps/api`)** - Spring Boot 3.2, Java 21, MySQL 8, Flyway, Stripe, AWS S3 / LocalStack, async email via `@Async`.
- **Auth** - Stateless Spring Security + JWT. Access token (15 min) + refresh token (7 days, BCrypt-hashed at rest). Frontend cookies: `dar-lemlih-token` (HttpOnly access) and `dar-lemlih-refresh` (HttpOnly refresh).
- **Database** - MySQL 8.0 only.

## Architecture and structure

### Monorepo layout
- `apps/api/` - Spring Boot REST API. Standard Maven structure.
- `apps/web/` - Next.js frontend. App Router with localized marketing routes.
- `infra/` - infrastructure scripts and Docker workflows.
- `docs/` - architecture and agent guides.
- `.github/workflows/` - CI/CD pipelines.

### Backend highlights
- `com.darlemlih.apiculture.controllers` - REST endpoints for catalog, cart, orders, payments, contact, auth, admin (class-level `@PreAuthorize("hasRole('ADMIN')")`).
- `com.darlemlih.apiculture.security` - JWT helpers, `JwtAuthenticationFilter`, `RateLimitFilter`.
- `com.darlemlih.apiculture.payments` - `PaymentGateway` SPI with `StripePaymentGateway` and `MockPaymentGateway` (`@Profile("!prod")`).
- `com.darlemlih.apiculture.config` - `SecurityConfig`, `PaymentConfig` (validates `payment.provider != mock` in `prod`), `AsyncConfig`, `DataInitializer` (`@Profile("dev")`).
- `db/migration/V1..V5` - canonical migrations. Dev-only seed data lives in `db/migration-dev/` and is loaded only when `SPRING_PROFILES_ACTIVE=dev`.
- Stripe webhooks read the raw `byte[]` payload for signature verification; bad signatures return HTTP 400, and idempotency relies on the unique constraint on `webhook_events.event_id`.

### Frontend highlights
- `src/app/(marketing)/[locale]/` - public catalog, story, blog, contact, checkout, account.
- `src/app/(auth)/[locale]/` - login + reset-password.
- `src/app/actions/` - Server Actions: `auth.ts`, `cart.ts`, `checkout.ts`, `contact.ts`, `password.ts`.
- `src/lib/api/` - typed API client. `apiFetch` (server) attaches the access cookie and transparently refreshes on 401; `apiFetchClient` (browser) sends credentials.
- `src/lib/hooks/use-cart.ts` - Zustand store synced to `/api/cart`. `CartHydrator` mounts in `Providers` to fetch on first render.
- `src/i18n/` - `next-intl` config + `messages/{fr,en,ar}.json` dictionaries.

## Authentication model

The API is stateless Spring Security + JWT. Frontend cookies are HttpOnly, SameSite=Lax, Secure in production.

- Access token TTL: 15 minutes.
- Refresh token TTL: 7 days.
- Refresh tokens stored as BCrypt hashes in `users.refresh_token`.
- Logout revokes the stored hash.
- Forgot password always returns 200 OK with a generic message.
- Reset password invalidates the stored refresh hash on success.
- JWT secret must be at least 32 characters; validated at startup via `@PostConstruct`.

Public endpoints (no JWT required): `POST /api/auth/{login,register,refresh,forgot-password,reset-password}`, `GET /api/products/**`, `GET /api/categories/**`, `POST /api/contact`, `POST /api/payments/webhook`, `GET /actuator/health`.

## Payments (Stripe)

- `POST /api/orders/checkout` creates the order, decrements stock with optimistic locking (3 retries), and creates a Stripe Checkout Session.
- The webhook handler reads raw `byte[]`, verifies the signature, returns HTTP 400 on failure, and deduplicates events by `webhook_events.event_id`.
- `payment.provider=stripe` enables Stripe; `payment.provider=mock` enables `MockPaymentGateway` (not allowed in `prod`).
- `success_url` / `cancel_url` are allow-listed against `app.web-base-url` + `app.base-url`.

## Development workflows

### Prerequisites
- Node.js 20+
- Java 21 (Temurin)
- MySQL 8.0
- (Optional) Stripe test keys; otherwise set `PAYMENT_PROVIDER=mock`.

### Run locally
| Component | Directory | Command |
|---|---|---|
| API | `apps/api` | `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev` |
| Web | `apps/web` | `npm install && npm run dev` |

### Testing and quality
- **API** - `./mvnw test` (uses H2 via the `test` profile).
- **Web** - `npm run typecheck`, `npm run lint`, `npm test` (Vitest), `npm run playwright:test` (E2E).

## Engineering standards

### Frontend
- **RTL** - always use Tailwind logical properties (`ps`, `pe`, `ms`, `me`, `start`, `end`). Never hard-code `left`/`right`.
- **Routing** - locale prefix is mandatory; protected segments (`account`, `orders`, `checkout`) are gated in `src/middleware.ts` via the `dar-lemlih-token` cookie AND server-side `getSessionAction`.
- **Cart** - never mutate the cart from the browser directly; always go through Server Actions in `app/actions/cart.ts`.
- **Currency** - always render via `formatPriceMAD()` from `src/lib/format.ts`. The store is in MAD, not EUR.
- **Auth tokens** - never read JWTs in client code; cookies are HttpOnly. The `apiFetch` helper handles refresh-on-401.
- **Styling** - honey/earth/stone palette per `tailwind.config.ts`; display serif is Cormorant Garamond, body is Inter, RTL falls back to Noto Sans Arabic.

### Backend
- **Exceptions** - services throw `NotFoundException` / `UnauthorizedException` / `ConflictException` / `BadRequestException`. Never bare `RuntimeException`. `GlobalExceptionHandler` maps Spring/JPA exceptions to API errors and never echoes internal messages to clients.
- **Schema** - all changes go through Flyway. Core migrations in `db/migration/`, dev-only seed in `db/migration-dev/`.
- **Security** - `JWT_SECRET` must be >= 32 chars (validated in `JwtUtils.@PostConstruct`); refresh tokens are stored as BCrypt hashes; `forgotPassword` always returns 200 OK; `application-prod.yml` disables Swagger UI + raw OpenAPI doc and tightens `BasicBinder`/`SQL`/`Spring Security` logging.
- **OpenAPI** - security scheme name is `bearer-jwt`; controllers using auth annotate with `@SecurityRequirement(name = "bearer-jwt")`.

### Git and collaboration
- **Secrets** - never commit `.env` files. Use `apps/api/.env.example` and `apps/web/.env.example`.
- **Architecture** - keep `apps/api` and `apps/web` cleanly separated. No shared runtime code; if it's needed, lift it to a typed package.

---
Last updated: 2026-05-21
