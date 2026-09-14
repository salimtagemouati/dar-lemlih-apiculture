import { apiFetch } from './client';
import type { CategoryDto, PageResponse, ProductDto } from './types';

export interface ProductsQuery {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export async function getProducts(query: ProductsQuery = {}): Promise<PageResponse<ProductDto>> {
  return apiFetch<PageResponse<ProductDto>>('/api/products', {
    query: {
      search: query.search,
      categoryId: query.categoryId,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      page: query.page ?? 0,
      size: query.size ?? 24,
      sort: query.sort
    },
    anonymous: true,
    next: { revalidate: 300 }
  });
}

export async function getProductBySlug(slug: string): Promise<ProductDto> {
  return apiFetch<ProductDto>(`/api/products/${encodeURIComponent(slug)}`, {
    anonymous: true,
    next: { revalidate: 300 }
  });
}

export async function getFeaturedProducts(size = 6): Promise<PageResponse<ProductDto>> {
  return apiFetch<PageResponse<ProductDto>>('/api/products/featured', {
    query: { size },
    anonymous: true,
    next: { revalidate: 300 }
  });
}

export async function getCategories(): Promise<CategoryDto[]> {
  return apiFetch<CategoryDto[]>('/api/categories', {
    anonymous: true,
    next: { revalidate: 300 }
  });
}
