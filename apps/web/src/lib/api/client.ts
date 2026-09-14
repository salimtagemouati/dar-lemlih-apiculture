/**
 * Typed API client for the Dar Lemlih Spring Boot API.
 *
 * Two flavours:
 *   - {@link apiFetch}: server-side (Server Components / Server Actions). Reads
 *     the access-token cookie via next/headers and, on 401, attempts a single
 *     transparent refresh before retrying.
 *   - {@link apiFetchClient}: browser-side. Sends credentials so the HttpOnly
 *     cookies travel with the request.
 *
 * All endpoints throw a typed {@link ApiClientError} on non-2xx responses so
 * callers can branch on `error.status` (e.g. 401 -> redirect to /login).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

type Json = unknown;

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Json;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: { revalidate?: number };
  /** Skip the auto-refresh-on-401 retry (used internally to avoid loops). */
  skipRefresh?: boolean;
  /** When true, do not send the access-token Authorization header. */
  anonymous?: boolean;
  /** Browser fetch only: when true, sends `credentials: 'include'`. */
  withCredentials?: boolean;
}

function buildUrl(path: string, query?: FetchOptions['query']): string {
  const url = new URL(path.startsWith('http') ? path : `${API_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    }
  }
  return url.toString();
}

async function parseError(res: Response): Promise<never> {
  let payload: { code?: string; message?: string } = {};
  try {
    payload = (await res.json()) as { code?: string; message?: string };
  } catch {
    /* response was not JSON */
  }
  throw new ApiClientError(
    res.status,
    payload.code ?? `HTTP_${res.status}`,
    payload.message ?? `Request failed with status ${res.status}`
  );
}

async function parseBody<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

// ─── Server-side ───────────────────────────────────────────────────────

/**
 * Server-only fetch wrapper. Reads cookies via next/headers, attaches the
 * access-token as Authorization: Bearer, and transparently refreshes on 401.
 * Use from Server Components and Server Actions.
 */
export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  // Lazy-import next/headers so this module is still consumable from client code.
  const { cookies } = await import('next/headers');
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers ?? {})
  };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (!options.anonymous) {
    const accessToken = cookies().get('dar-lemlih-token')?.value;
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  const res = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: options.cache ?? (options.next ? undefined : 'no-store'),
    next: options.next
  });

  if (res.status === 401 && !options.skipRefresh && !options.anonymous) {
    // One-shot transparent refresh.
    const { refreshAction } = await import('@/app/actions/auth');
    const refreshed = await refreshAction();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${refreshed}`;
      const retry = await fetch(buildUrl(path, options.query), {
        method: options.method ?? 'GET',
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        cache: options.cache ?? (options.next ? undefined : 'no-store'),
        next: options.next
      });
      if (!retry.ok) await parseError(retry);
      return parseBody<T>(retry);
    }
  }

  if (!res.ok) await parseError(res);
  return parseBody<T>(res);
}

// ─── Client-side (browser) ─────────────────────────────────────────────

/**
 * Browser fetch wrapper for client components. Always sends credentials so the
 * HttpOnly access-token cookie travels with the request. On 401, calls the
 * Server Action {@code refreshAction} via `/api/refresh` (a thin route handler
 * isn't wired up in this MVP; the browser path falls through to navigation
 * to /login on persistent 401).
 */
export async function apiFetchClient<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers ?? {})
  };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: options.withCredentials === false ? 'omit' : 'include'
  });

  if (!res.ok) await parseError(res);
  return parseBody<T>(res);
}
