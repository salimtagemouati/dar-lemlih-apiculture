import { describe, it, expect, beforeEach } from 'vitest';
import { useCart } from '@/lib/hooks/use-cart';

describe('useCart Zustand Store', () => {
  beforeEach(() => {
    useCart.setState({
      cart: null,
      loading: false,
      hydrated: false
    });
  });

  it('initializes with default empty selectors', () => {
    expect(useCart.getState().totalItems()).toBe(0);
    expect(useCart.getState().totalPrice()).toBe(0);
    expect(useCart.getState().items()).toEqual([]);
  });

  it('setCart updates cart state and selectors correctly', () => {
    useCart.getState().setCart({
      id: 1,
      items: [
        {
          id: 10,
          productId: 100,
          productName: 'Miel d\'Oranger',
          productSlug: 'miel-oranger-500g',
          productImage: 'https://example.com/img.jpg',
          quantity: 2,
          unitPrice: 89.0,
          totalPrice: 178.0,
          stockQuantity: 100
        }
      ],
      subtotal: 178.0,
      shippingCost: 30.0,
      total: 208.0,
      currency: 'MAD',
      totalItems: 2
    });

    expect(useCart.getState().hydrated).toBe(true);
    expect(useCart.getState().totalItems()).toBe(2);
    expect(useCart.getState().totalPrice()).toBe(208.0);
    expect(useCart.getState().items()).toHaveLength(1);
    expect(useCart.getState().items()[0].productSlug).toBe('miel-oranger-500g');
  });
});
