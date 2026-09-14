'use server';

import { cookies } from 'next/headers';
import {
  login as apiLogin,
  register as apiRegister,
  refresh as apiRefresh,
  getMe as apiGetMe,
  logout as apiLogout,
  forgotPassword as apiForgotPassword,
  type AuthResponse,
  type LoginPayload,
  type RegisterPayload,
  type User
} from '@/lib/api/auth';

const ACCESS_COOKIE = 'dar-lemlih-token';
const REFRESH_COOKIE = 'dar-lemlih-refresh';

const ACCESS_MAX_AGE_SECONDS = 60 * 15;          // 15 minutes
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const isProd = process.env.NODE_ENV === 'production';

function setSessionCookies(response: AuthResponse) {
  const jar = cookies();
  jar.set(ACCESS_COOKIE, response.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_MAX_AGE_SECONDS
  });
  jar.set(REFRESH_COOKIE, response.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_MAX_AGE_SECONDS
  });
}

function clearSessionCookies() {
  const jar = cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

type ActionResult<T> =
  | { success: true; user: T }
  | { success: false; error: string };

export async function loginAction(data: LoginPayload): Promise<ActionResult<User>> {
  try {
    const response = await apiLogin(data);
    setSessionCookies(response);
    return { success: true, user: response.user };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return { success: false, error: message };
  }
}

export async function registerAction(data: RegisterPayload): Promise<ActionResult<User>> {
  try {
    const response = await apiRegister({ ...data, phone: data.phone || '' });
    setSessionCookies(response);
    return { success: true, user: response.user };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return { success: false, error: message };
  }
}

/**
 * Use the refresh-token cookie to obtain a new access token. Called automatically
 * from getSessionAction when the access token is missing/expired. Returns the
 * new access token on success, or null on failure (caller should treat as
 * unauthenticated).
 */
export async function refreshAction(): Promise<string | null> {
  const refreshToken = cookies().get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;
  try {
    const response = await apiRefresh(refreshToken);
    setSessionCookies(response);
    return response.accessToken;
  } catch {
    clearSessionCookies();
    return null;
  }
}

export async function logoutAction(): Promise<void> {
  const token = cookies().get(ACCESS_COOKIE)?.value;
  if (token) {
    await apiLogout(token);
  }
  clearSessionCookies();
}

/**
 * Returns the current user, or null if not signed in.
 * If the access token is missing/expired, transparently attempts a refresh
 * once before giving up.
 */
export async function getSessionAction(): Promise<User | null> {
  let token = cookies().get(ACCESS_COOKIE)?.value;

  if (!token) {
    token = (await refreshAction()) ?? undefined;
    if (!token) return null;
  }

  try {
    return await apiGetMe(token);
  } catch {
    // Try one refresh on 401 / expiry, then re-fetch.
    const refreshed = await refreshAction();
    if (!refreshed) return null;
    try {
      return await apiGetMe(refreshed);
    } catch {
      clearSessionCookies();
      return null;
    }
  }
}

export async function forgotPasswordAction(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const result = await apiForgotPassword(email);
    return { success: true, message: result.message };
  } catch {
    // Backend always returns 200; surface a generic message either way.
    return {
      success: true,
      message: 'If that email exists, a reset link has been sent.'
    };
  }
}
