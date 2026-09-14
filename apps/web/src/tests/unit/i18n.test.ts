import { describe, it, expect } from 'vitest';
import fr from '@/i18n/messages/fr.json';
import en from '@/i18n/messages/en.json';
import ar from '@/i18n/messages/ar.json';

function extractKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.keys(obj).reduce<string[]>((res, el) => {
    const val = obj[el];
    if (Array.isArray(val)) {
      return [...res, prefix + el];
    } else if (typeof val === 'object' && val !== null) {
      return [...res, ...extractKeys(val as Record<string, unknown>, `${prefix}${el}.`)];
    }
    return [...res, prefix + el];
  }, []);
}

describe('i18n Dictionary Parity', () => {
  it('should have identical translation keys across French, English, and Arabic', () => {
    const frKeys = extractKeys(fr);
    const enKeys = extractKeys(en);
    const arKeys = extractKeys(ar);

    expect(frKeys.length).toBeGreaterThan(0);
    expect(new Set(frKeys)).toEqual(new Set(enKeys));
    expect(new Set(frKeys)).toEqual(new Set(arKeys));
  });

  it('should not contain empty translation values', () => {
    const checkNoEmptyValues = (obj: Record<string, unknown>, path = '') => {
      for (const [k, v] of Object.entries(obj)) {
        const fullKey = path ? `${path}.${k}` : k;
        if (typeof v === 'string') {
          expect(v.trim().length, `Empty string at ${fullKey}`).toBeGreaterThan(0);
        } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          checkNoEmptyValues(v as Record<string, unknown>, fullKey);
        }
      }
    };

    checkNoEmptyValues(fr, 'fr');
    checkNoEmptyValues(en, 'en');
    checkNoEmptyValues(ar, 'ar');
  });
});
