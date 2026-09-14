'use server';

import { revalidatePath } from 'next/cache';
import { checkout as apiCheckout } from '@/lib/api/orders';
import { ApiClientError } from '@/lib/api/client';
import type { CheckoutRequest } from '@/lib/api/types';

export type CheckoutActionResult =
  | { success: true; orderNumber: string; paymentUrl: string; sessionId: string }
  | { success: false; error: string; code: string };

export async function checkoutAction(request: CheckoutRequest): Promise<CheckoutActionResult> {
  try {
    const result = await apiCheckout(request);
    revalidatePath('/[locale]', 'layout');
    return {
      success: true,
      orderNumber: result.orderNumber,
      paymentUrl: result.paymentUrl,
      sessionId: result.sessionId
    };
  } catch (e) {
    if (e instanceof ApiClientError) {
      return { success: false, error: e.message, code: e.code };
    }
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Checkout failed',
      code: 'NETWORK_ERROR'
    };
  }
}
