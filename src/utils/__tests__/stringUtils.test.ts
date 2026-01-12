import { describe, it, expect } from 'vitest';
import { capitalizeWords, removeDiacritics } from '../stringUtils';

describe('stringUtils', () => {
  describe('capitalizeWords', () => {
    it('should capitalize first letter of each word', () => {
      expect(capitalizeWords('ivan horvat')).toBe('Ivan Horvat');
      expect(capitalizeWords('john doe')).toBe('John Doe');
    });

    it('should handle single word', () => {
      expect(capitalizeWords('ivan')).toBe('Ivan');
    });

    it('should handle multiple words', () => {
      expect(capitalizeWords('ivan marko horvat')).toBe('Ivan Marko Horvat');
    });

    it('should handle already capitalized words', () => {
      expect(capitalizeWords('Ivan Horvat')).toBe('Ivan Horvat');
    });

    it('should handle mixed case', () => {
      expect(capitalizeWords('iVAN hORVAT')).toBe('Ivan Horvat');
    });

    it('should handle empty string', () => {
      expect(capitalizeWords('')).toBe('');
    });

    it('should handle words with numbers', () => {
      expect(capitalizeWords('ivan2 horvat3')).toBe('Ivan2 Horvat3');
    });
  });

  describe('removeDiacritics', () => {
    it('should remove Croatian diacritics', () => {
      expect(removeDiacritics('Čačić')).toBe('Cacic');
      expect(removeDiacritics('Šimunić')).toBe('Simunic');
      expect(removeDiacritics('Živković')).toBe('Zivkovic');
      expect(removeDiacritics('Đorđević')).toBe('Djordjevic');
    });

    it('should handle multiple diacritics', () => {
      expect(removeDiacritics('Čačić Šimunić')).toBe('Cacic Simunic');
    });

    it('should handle strings without diacritics', () => {
      expect(removeDiacritics('Ivan Horvat')).toBe('Ivan Horvat');
    });

    it('should handle empty string', () => {
      expect(removeDiacritics('')).toBe('');
    });

    it('should handle mixed case with diacritics', () => {
      expect(removeDiacritics('ČaČić')).toBe('CaCic');
    });
  });
});
