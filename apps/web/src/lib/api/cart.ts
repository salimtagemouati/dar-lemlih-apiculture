import { apiFetch } from './client';
import type { AddToCartRequest, CartDto, UpdateCartItemRequest } from './types';

export async function getCart(): Promise<CartDto> {
  return apiFetch<CartDto>('/api/cart');
}

export async function addToCart(request: AddToCartRequest): Promise<CartDto> {
  return apiFetch<CartDto>('/api/cart/add', { method: 'POST', body: request });
}

export async function updateCartItem(request: UpdateCartItemRequest): Promise<CartDto> {
  return apiFetch<CartDto>('/api/cart/update', { method: 'PUT', body: request });
}

export async function removeFromCart(productId: number): Promise<CartDto> {
  return apiFetch<CartDto>(`/api/cart/remove/${productId}`, { method: 'DELETE' });
}

export async function clearCart(): Promise<void> {
  await apiFetch<void>('/api/cart/clear', { method: 'DELETE' });
}
