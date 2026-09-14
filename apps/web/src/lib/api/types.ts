/** Shared backend DTO types — keep aligned with apps/api DTO layer. */

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface ProductDto {
  id: number;
  sku: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  descriptionFr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  price: number;
  currency: string;
  stockQuantity: number;
  weightGrams?: number | null;
  ingredients?: string | null;
  origin?: string | null;
  isHalal: boolean;
  isActive: boolean;
  isFeatured: boolean;
  images: string[];
  categoryId?: number | null;
  categoryName?: string | null;
}

export interface CategoryDto {
  id: number;
  slug: string;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  descriptionFr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  image?: string | null;
  displayOrder: number;
  productCount: number;
}

export interface CartItemDto {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  productImage?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  stockQuantity: number;
}

export interface CartDto {
  id: number;
  items: CartItemDto[];
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  totalItems: number;
}

export interface ShippingAddressDto {
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface OrderItemDto {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDto {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  currency: string;
  paymentProvider?: string | null;
  trackingNumber?: string | null;
  shippingAddress: ShippingAddressDto | null;
  items: OrderItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutRequest {
  shippingAddress: ShippingAddressDto;
  notes?: string | null;
  paymentMethod: string;
}

export interface CheckoutResponse {
  orderNumber: string;
  paymentUrl: string;
  sessionId: string;
  status: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  productId: number;
  quantity: number;
}
