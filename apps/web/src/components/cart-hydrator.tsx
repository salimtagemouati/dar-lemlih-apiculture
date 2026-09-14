'use client';

import { useEffect } from 'react';
import { useCart } from '@/lib/hooks/use-cart';

/**
 * Client-only effect that hydrates the cart store from the server on mount.
 * Mounted once at the root via {@code Providers} so every client component
 * subscribed to {@code useCart} sees the same authoritative state.
 */
export function CartHydrator() {
  const hydrate = useCart(state => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
