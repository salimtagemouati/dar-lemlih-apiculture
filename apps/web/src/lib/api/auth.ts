export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  emailVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function jsonOrThrow<T>(res: Response, fallbackMessage: string): Promise<T> {
  if (res.ok) {
    return (await res.json()) as T;
  }
  let body: { message?: string; code?: string } = {};
  try {
    body = (await res.json()) as { message?: string; code?: string };
  } catch {
    /* response was not JSON */
  }
  const error: ApiError = {
    code: body.code ?? 'NETWORK_ERROR',
    message: body.message ?? fallbackMessage,
    status: res.status
  };
  throw error;
}

export async function login(data: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return jsonOrThrow<AuthResponse>(res, 'Login failed');
}

export async function register(data: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return jsonOrThrow<AuthResponse>(res, 'Registration failed');
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  return jsonOrThrow<AuthResponse>(res, 'Session refresh failed');
}

export async function getMe(token: string): Promise<User> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return jsonOrThrow<User>(res, 'Failed to fetch user');
}

export async function logout(token: string): Promise<void> {
  // Server-side revoke. Best-effort: do not throw if it fails (we still clear cookies).
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch {
    /* swallow */
  }
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return jsonOrThrow<{ message: string }>(res, 'Request failed');
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  return jsonOrThrow<{ message: string }>(res, 'Reset failed');
}
