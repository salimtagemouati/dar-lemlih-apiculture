# Dar Lemlih API — Spring Boot 3.2

REST API for the Dar Lemlih apiculture platform. **Spring Boot 3.2**, **Java 21**, **MySQL 8**.

## Features

- **Stateless JWT auth** — Spring Security + HMAC-SHA256 access (15 min) + refresh (7 days, BCrypt-hashed at rest).
- **Catalog** — products + categories with multilingual fields (`nameFr`/`nameEn`/`nameAr`).
- **Cart & orders** — full checkout pipeline with optimistic-locked stock decrement.
- **Payments** — Stripe Checkout integration with byte-exact webhook signature verification, idempotent event handling, refunds, and a profile-restricted mock provider for dev.
- **Migrations** — Flyway, with a separate `db/migration-dev/` location for non-production seed data.
- **Async email** — `@Async` executor for password resets, order confirmations, contact form, admin notifications.
- **Storage** — pluggable `FileStorageService` (S3/LocalStack or local filesystem).
- **OpenAPI** — Swagger UI in non-prod profiles only.

## Tech stack

- Spring Boot 3.2.12 · Java 21 · MySQL 8.0 · Flyway · JJWT 0.12.x · SpringDoc OpenAPI 2.x · Jakarta Bean Validation · Lombok · MapStruct · Stripe Java SDK 24.x · AWS SDK v2.

## Getting started

### Prerequisites

- Java 21 SDK (Temurin)
- MySQL 8.0 instance
- Maven 3.9+ (or `./mvnw`)

### Configuration

```bash
cp .env.example .env
```

Required: `JWT_SECRET` (≥ 32 chars), `DB_USERNAME`, `DB_PASSWORD`. Stripe keys are required only when `PAYMENT_PROVIDER=stripe`.

See the env-vars table in the [root README](../../README.md#-environment-variables).

### Running locally

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

The API listens on `http://localhost:8080`. The `dev` profile runs `DataInitializer` on startup, which creates `admin@darlemlih.ma` and `customer@darlemlih.ma` at runtime via `PasswordEncoder.encode()`. The default password comes from `SEED_DEFAULT_PASSWORD` (or `ChangeMe!2025` if unset). **No BCrypt hashes are committed in SQL.**

### Profiles

| Profile | Datasource | Flyway | Notes |
|---|---|---|---|
| `dev` (default) | MySQL via `DB_URL` | `db/migration` + `db/migration-dev` | Mock or real Stripe; Swagger UI on. `DataInitializer` seeds dev users. |
| `portfolio` | Persistent H2 file via `PORTFOLIO_DB_PATH` | disabled (`ddl-auto: update`) | Public demo profile: mock checkout, demo users/catalog seeded at runtime, Swagger off. |
| `prod` | MySQL via env | `db/migration` only | Stripe forced (`PaymentConfig` fails fast on `mock`); Swagger off; PII-safe logging. |
| `dev-local` | localhost MySQL | both | Same as `dev` but pinned to `dar/lemlih` credentials. |
| `docker` | env-driven | `db/migration` | For Docker Compose stacks. |
| `h2` | H2 in-memory | disabled (`ddl-auto: update`) | Quick local boot. |
| `test` | H2 in-memory | disabled | Used by `./mvnw test`. |

### API documentation

Swagger UI: `http://localhost:8080/swagger-ui.html` (disabled in `prod`).
Raw OpenAPI: `http://localhost:8080/v3/api-docs` (disabled in `prod`).

## Project structure

```
src/main/java/com/darlemlih/apiculture/
├── config/         # AsyncConfig, DataInitializer (@Profile("dev")), PaymentConfig,
│                   # SecurityConfig, OpenApiConfig, AwsConfig, StorageConfig, WebConfig, S3Initializer
├── controllers/    # Auth, Cart, Category, Contact, Order, Payment, PaymentWebhook, Product, Admin, RootRedirect
├── dto/            # Request/response shapes (@Valid)
├── entities/       # JPA models (User, Product, Cart, Order, OrderItem, WebhookEvent…)
├── exceptions/     # ApiException + Not/Forbidden/Conflict/BadRequest + GlobalExceptionHandler
├── payments/       # PaymentGateway SPI + Stripe + Mock (@Profile("!prod"))
├── repositories/   # Spring Data JPA
├── security/       # JwtUtils, JwtAuthenticationFilter, RateLimitFilter
└── services/       # AuthService, CartService, OrderService, PaymentService,
                    # PaymentWebhookService, EmailService, ProductService, CategoryService, AdminService
```

## Testing

```bash
./mvnw test
```

Tests run against the `test` profile (H2 in-memory, Flyway disabled, fixed JWT secret). Mockito + Spring `@SpringBootTest` for integration. Async assertions use `Mockito.timeout()` because `EmailService` methods are `@Async`.

## Security highlights

- `JWT_SECRET` validated to ≥ 32 chars at startup.
- Refresh tokens stored as BCrypt hashes; rotated on every refresh; revoked on `DELETE /api/auth/logout` and on password reset.
- `forgotPassword` always returns 200 OK with a generic body (no email-enumeration oracle).
- Refresh / forgot-password / reset-password endpoints take JSON request bodies (no tokens in query strings/access logs).
- Stripe webhook reads raw `byte[]` for byte-exact signature verification; bad signatures return HTTP 400; idempotency via unique constraint catch on `webhook_events.event_id`.
- `MockPaymentGateway.verifyWebhook` throws `UnsupportedOperationException`; `PaymentConfig` refuses to boot if `prod` + `payment.provider=mock`.
- Production logging tightened: `BasicBinder` / `SQL` / `Spring Security` at WARN; `server.error.include-message=never`; Swagger UI + OpenAPI doc disabled.
- `AdminController` carries class-level `@PreAuthorize("hasRole('ADMIN')")`.
- Stock decrement at checkout uses `@Version` optimistic locking with retry.

See the root [README](../../README.md) for the full env-vars table, frontend setup, and architecture diagram.
