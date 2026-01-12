import { describe, it, expect } from 'vitest';
import { sortPlayerNumber } from '../sortUtils';

describe('sortUtils', () => {
  describe('sortPlayerNumber', () => {
    it('should sort numbers numerically', () => {
      expect(sortPlayerNumber('1', '2')).toBe(-1);
      expect(sortPlayerNumber('2', '1')).toBe(1);
      expect(sortPlayerNumber('10', '2')).toBe(8); // 10 > 2
      expect(sortPlayerNumber('1', '1')).toBe(0);
    });

    it('should sort letters alphabetically', () => {
      expect(sortPlayerNumber('A', 'B')).toBeLessThan(0);
      expect(sortPlayerNumber('B', 'A')).toBeGreaterThan(0);
      expect(sortPlayerNumber('A', 'A')).toBe(0);
      expect(sortPlayerNumber('Z', 'A')).toBeGreaterThan(0);
    });

    it('should sort numbers before letters', () => {
      expect(sortPlayerNumber('1', 'A')).toBe(-1); // Numbers come first
      expect(sortPlayerNumber('A', '1')).toBe(1);
      expect(sortPlayerNumber('10', 'A')).toBe(-1);
      expect(sortPlayerNumber('Z', '1')).toBe(1);
    });

    it('should handle multi-digit numbers', () => {
      expect(sortPlayerNumber('9', '10')).toBe(-1);
      expect(sortPlayerNumber('10', '9')).toBe(1);
      expect(sortPlayerNumber('99', '100')).toBe(-1);
    });

    it('should handle case sensitivity for letters', () => {
      // localeCompare is case-sensitive, but exact values depend on locale
      expect(sortPlayerNumber('a', 'A')).not.toBe(0);
      expect(sortPlayerNumber('A', 'a')).not.toBe(0);
      expect(sortPlayerNumber('a', 'b')).toBeLessThan(0);
    });

    it('should handle edge cases', () => {
      expect(sortPlayerNumber('0', '1')).toBe(-1);
      // Empty string is converted to 0 (Number('') = 0), so it's treated as a number
      expect(sortPlayerNumber('', '1')).toBe(-1); // 0 - 1 = -1
    });
  });
});
