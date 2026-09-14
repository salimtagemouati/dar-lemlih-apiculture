'use server';

import { revalidatePath } from 'next/cache';
import {
  addToCart as apiAddToCart,
  clearCart as apiClearCart,
  getCart as apiGetCart,
  removeFromCart as apiRemoveFromCart,
  updateCartItem as apiUpdateCartItem
} from '@/lib/api/cart';
import { ApiClientError } from '@/lib/api/client';
import type { CartDto } from '@/lib/api/types';

type CartActionResult =
  | { success: true; cart: CartDto }
  | { success: false; error: string; code: string; status: number };

function toError(error: unknown): { error: string; code: string; status: number } {
  if (error instanceof ApiClientError) {
    return { error: error.message, code: error.code, status: error.status };
  }
  return {
    error: error instanceof Error ? error.message : 'Cart operation failed',
    code: 'NETWORK_ERROR',
    status: 0
  };
}

export async function getCartAction(): Promise<CartActionResult> {
  try {
    const cart = await apiGetCart();
    return { success: true, cart };
  } catch (e) {
    return { success: false, ...toError(e) };
  }
}

export async function addToCartAction(productId: number, quantity = 1): Promise<CartActionResult> {
  try {
    const cart = await apiAddToCart({ productId, quantity });
    revalidatePath('/[locale]', 'layout');
    return { success: true, cart };
  } catch (e) {
    return { success: false, ...toError(e) };
  }
}

export async function updateCartItemAction(productId: number, quantity: number): Promise<CartActionResult> {
  try {
    const cart = await apiUpdateCartItem({ productId, quantity });
    revalidatePath('/[locale]', 'layout');
    return { success: true, cart };
  } catch (e) {
    return { success: false, ...toError(e) };
  }
}

export async function removeFromCartAction(productId: number): Promise<CartActionResult> {
  try {
    const cart = await apiRemoveFromCart(productId);
    revalidatePath('/[locale]', 'layout');
    return { success: true, cart };
  } catch (e) {
    return { success: false, ...toError(e) };
  }
}

export async function clearCartAction(): Promise<{ success: boolean }> {
  try {
    await apiClearCart();
    revalidatePath('/[locale]', 'layout');
    return { success: true };
  } catch {
    return { success: false };
  }
}
