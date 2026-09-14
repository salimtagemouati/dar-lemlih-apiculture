# Copilot instructions for Dar Lemlih Apiculture

## Build, test, and lint commands

Use repository root as the default cwd, then run per app:

### Backend (`apps/api`, Spring Boot + Maven)
- Install/build: `cd apps/api && ./mvnw clean verify`
- Run tests: `cd apps/api && ./mvnw test`
- Run one test class: `cd apps/api && ./mvnw -Dtest=AuthControllerTest test`
- Run one test method: `cd apps/api && ./mvnw -Dtest=AuthControllerTest#login_shouldReturnTokens test`
- Run locally: `cd apps/api && ./mvnw spring-boot:run`

### Frontend (`apps/web`, Next.js 14)
- Install deps: `cd apps/web && npm ci` (fallback: `npm install`)
- Dev server: `cd apps/web && npm run dev`
- Lint: `cd apps/web && npm run lint`
- Type-check: `cd apps/web && npm run typecheck`
- Build: `cd apps/web && npm run build`
- Unit tests (Vitest): `cd apps/web && npm test`
- Run one Vitest file: `cd apps/web && npm test -- src/path/to/file.test.ts`
- E2E (Playwright): `cd apps/web && npm run playwright:test`
- Run one Playwright spec: `cd apps/web && npm run playwright:test -- src/tests/e2e/navigation.spec.ts`

### Full-stack Docker workflows
- Dev stack (hot reload web): `make dev` (uses `infra/docker/docker-compose.dev.yml`)
- Prod-like stack: `docker compose -f infra/docker/docker-compose.yml up -d`
- Logs: `make logs` / `make logs-api` / `make logs-web`

## High-level architecture

- Monorepo split into:
  - `apps/api`: Spring Boot API (Java 21), MySQL/Flyway, JWT/RBAC, payment + storage abstractions.
  - `apps/web`: Next.js App Router frontend with `next-intl`, Contentlayer, Vitest, Playwright.
  - `infra/docker`: local/dev/prod compose stacks (db, api, web/web-dev, mailhog, phpmyadmin, localstack).
  - `tools/mcp-localstack`: MCP server for LocalStack S3/SQS/DynamoDB tooling.

- Request flow:
  - Browser -> Next.js app (`apps/web`) for localized pages (`/fr`, `/en`, `/ar`).
  - Frontend calls Spring API (`apps/api`) for auth/catalog/cart/orders/admin actions.
  - API persists to MySQL and handles migrations via Flyway.
  - Media uploads go through `FileStorageService`, backed by S3/LocalStack or local filesystem based on config.
  - Payments go through `PaymentGateway`, selecting `mock` or `stripe` by `payment.provider`.

- Runtime wiring:
  - `apps/web/next.config.mjs` composes `next-intl` and Contentlayer plugins.
  - `apps/api/config/StorageConfig` selects storage backend at bean creation time.
  - `apps/api/config/S3Initializer` auto-creates the configured bucket when S3 mode is enabled.

## Key repository conventions

- Frontend locale routing is mandatory prefix (`/ar`, `/fr`, `/en`), defined in `src/i18n/routing.ts` and enforced in `src/middleware.ts`.
- Protected frontend sections are route-segment based (`account`, `orders`, `checkout`) and gate on the `dar-lemlih-token` cookie (HttpOnly access token issued by the Spring Security JWT flow). The matching refresh token lives in `dar-lemlih-refresh`.
- Frontend message catalogs are file-based in `src/i18n/messages/{locale}.json`; `src/i18n/request.ts` dynamically imports the matching file.
- `apps/web` runs Contentlayer before build via `prebuild`, so content/schema changes should be reflected in `src/content` + `contentlayer.config.ts`.
- Playwright tests live in `apps/web/src/tests/e2e`; default base URL is `http://localhost:5173` unless `PLAYWRIGHT_BASE_URL` is set.
- Backend storage is configuration-driven:
  - `aws.s3.enabled=true` + S3 client available -> `S3FileStorageService`
  - otherwise -> `LocalFileStorageService`
- Payment implementation is configuration-driven via Spring conditions:
  - `payment.provider=mock` -> `MockPaymentGateway`
  - `payment.provider=stripe` -> `StripePaymentGateway`
- Prefer `apps/web/package.json` + `.github/workflows/ci.yml` as command source of truth when docs disagree.
