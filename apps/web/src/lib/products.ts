/**
 * Legacy export kept for backward-compatibility with old imports.
 * The real product catalog now comes from the Spring Boot API via
 * {@code @/lib/api/products}. This file is intentionally empty so that
 * any straggling import will surface as a TypeScript error.
 *
 * @deprecated Use {@code getProducts}/{@code getProductBySlug} from
 *             {@code @/lib/api/products} instead.
 */
export {};
