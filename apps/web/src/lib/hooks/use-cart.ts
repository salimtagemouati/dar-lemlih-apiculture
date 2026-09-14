'use client';

import { create } from 'zustand';
import { toast } from 'sonner';
import {
  addToCartAction,
  clearCartAction,
  getCartAction,
  removeFromCartAction,
  updateCartItemAction
} from '@/app/actions/cart';
import type { CartDto, CartItemDto } from '@/lib/api/types';

interface CartState {
  cart: CartDto | null;
  loading: boolean;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  setCart: (cart: CartDto | null) => void;

  addItem: (productId: number, quantity?: number, productName?: string) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clear: () => Promise<void>;

  // Convenience selectors
  totalItems: () => number;
  totalPrice: () => number;
  items: () => CartItemDto[];
}

const EMPTY_CART: CartDto = {
  id: 0,
  items: [],
  subtotal: 0,
  shippingCost: 0,
  total: 0,
  currency: 'MAD',
  totalItems: 0
};

export const useCart = create<CartState>((set, get) => ({
  cart: null,
  loading: false,
  hydrated: false,

  setCart: cart => set({ cart, hydrated: true }),

  hydrate: async () => {
    if (get().hydrated || get().loading) return;
    set({ loading: true });
    try {
      const result = await getCartAction();
      if (result.success) {
        set({ cart: result.cart, loading: false, hydrated: true });
      } else if (result.status === 401) {
        // Anonymous user — empty cart, no error.
        set({ cart: EMPTY_CART, loading: false, hydrated: true });
      } else {
        set({ loading: false, hydrated: true });
      }
    } catch {
      set({ loading: false, hydrated: true });
    }
  },

  addItem: async (productId, quantity = 1, productName) => {
    set({ loading: true });
    const result = await addToCartAction(productId, quantity);
    if (result.success) {
      set({ cart: result.cart, loading: false, hydrated: true });
      if (productName) {
        toast.success(`${productName} ajouté au panier`);
      } else {
        toast.success('Ajouté au panier');
      }
    } else {
      set({ loading: false });
      if (result.status === 401) {
        toast.error('Connectez-vous pour ajouter au panier');
      } else {
        toast.error(result.error);
      }
    }
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(productId);
      return;
    }
    set({ loading: true });
    const result = await updateCartItemAction(productId, quantity);
    if (result.success) {
      set({ cart: result.cart, loading: false });
    } else {
      set({ loading: false });
      toast.error(result.error);
    }
  },

  removeItem: async productId => {
    set({ loading: true });
    const result = await removeFromCartAction(productId);
    if (result.success) {
      set({ cart: result.cart, loading: false });
    } else {
      set({ loading: false });
      toast.error(result.error);
    }
  },

  clear: async () => {
    set({ loading: true });
    await clearCartAction();
    set({ cart: EMPTY_CART, loading: false });
  },

  totalItems: () => get().cart?.totalItems ?? 0,
  totalPrice: () => get().cart?.total ?? 0,
  items: () => get().cart?.items ?? []
}));
