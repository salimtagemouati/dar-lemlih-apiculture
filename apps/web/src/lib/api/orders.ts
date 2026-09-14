import { apiFetch } from './client';
import type { CheckoutRequest, CheckoutResponse, OrderDto, PageResponse } from './types';

export async function getMyOrders(page = 0, size = 20): Promise<PageResponse<OrderDto>> {
  return apiFetch<PageResponse<OrderDto>>('/api/orders', {
    query: { page, size, sort: 'createdAt,desc' }
  });
}

export async function getOrder(orderNumber: string): Promise<OrderDto> {
  return apiFetch<OrderDto>(`/api/orders/${encodeURIComponent(orderNumber)}`);
}

export async function checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
  return apiFetch<CheckoutResponse>('/api/orders/checkout', {
    method: 'POST',
    body: request
  });
}
