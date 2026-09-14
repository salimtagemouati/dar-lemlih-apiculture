'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/hooks/use-cart';

interface AddToCartButtonProps {
  productId: number;
  productName: string;
  stockQuantity: number;
}

export function AddToCartButton({ productId, productName, stockQuantity }: AddToCartButtonProps) {
  const t = useTranslations('products');
  const addItem = useCart(state => state.addItem);
  const loading = useCart(state => state.loading);
  const [quantity, setQuantity] = useState(1);

  const outOfStock = stockQuantity <= 0;
  const max = Math.max(1, Math.min(stockQuantity, 10));

  const handleAddToCart = () => {
    void addItem(productId, quantity, productName);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4 rounded-full border border-sand-200 p-1.5 dark:border-charcoal-800">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={quantity <= 1 || outOfStock}
          aria-label="decrement"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center text-lg font-semibold">{quantity}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => setQuantity(Math.min(max, quantity + 1))}
          disabled={quantity >= max || outOfStock}
          aria-label="increment"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Button
        className="h-14 flex-1 rounded-full bg-amber-600 px-8 text-lg hover:bg-amber-700"
        onClick={handleAddToCart}
        disabled={outOfStock || loading}
      >
        <ShoppingBag className="me-2 h-5 w-5" />
        {outOfStock ? t('outOfStock') : t('addToCart')}
      </Button>
    </div>
  );
}
