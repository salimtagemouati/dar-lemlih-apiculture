import { describe, it, expect } from 'vitest';
import {
  formatPriceMAD,
  formatDate,
  localizedProductName,
  localizedProductDescription,
  resolveImageUrl
} from '@/lib/format';

describe('format utilities', () => {
  it('formatPriceMAD handles numbers, strings, and invalid inputs', () => {
    expect(formatPriceMAD(null)).toBe('—');
    expect(formatPriceMAD(undefined)).toBe('—');
    expect(formatPriceMAD('')).toBe('—');
    expect(formatPriceMAD('invalid')).toBe('—');

    const formattedFr = formatPriceMAD(89.0, 'fr');
    expect(formattedFr).toContain('89');

    const formattedAr = formatPriceMAD('120.00', 'ar');
    expect(formattedAr.length).toBeGreaterThan(0);
  });

  it('formatDate formats dates across locales', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate('invalid-date')).toBe('—');

    const valid = '2026-06-01T12:00:00Z';
    expect(formatDate(valid, 'fr')).toContain('2026');
    expect(formatDate(valid, 'en')).toContain('2026');
  });

  it('localizedProductName picks appropriate locale string', () => {
    const product = {
      nameFr: 'Miel d\'Oranger',
      nameEn: 'Orange Blossom Honey',
      nameAr: 'عسل زهر البرتقال'
    };

    expect(localizedProductName(product, 'fr')).toBe('Miel d\'Oranger');
    expect(localizedProductName(product, 'en')).toBe('Orange Blossom Honey');
    expect(localizedProductName(product, 'ar')).toBe('عسل زهر البرتقال');

    const descProduct = {
      nameFr: 'Miel',
      nameEn: 'Honey',
      nameAr: 'عسل',
      descriptionFr: 'Description FR',
      descriptionEn: 'Description EN',
      descriptionAr: 'Description AR'
    };
    expect(localizedProductDescription(descProduct, 'fr')).toBe('Description FR');
    expect(localizedProductDescription(descProduct, 'en')).toBe('Description EN');
    expect(localizedProductDescription(descProduct, 'ar')).toBe('Description AR');
  });

  it('resolveImageUrl handles absolute URLs and relative paths', () => {
    expect(resolveImageUrl('https://images.unsplash.com/photo-123')).toBe(
      'https://images.unsplash.com/photo-123'
    );
    expect(resolveImageUrl('/uploads/products/1.jpg')).toContain('/uploads/products/1.jpg');
    expect(resolveImageUrl(null)).toContain('unsplash.com');
  });
});
