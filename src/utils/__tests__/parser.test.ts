import { describe, it, expect } from 'vitest';
import { parsePlayerLine, parsePlayerText } from '../parser';

describe('parser', () => {
  describe('parsePlayerLine', () => {
    it('should parse format: "7 Ivan Horvat"', () => {
      const result = parsePlayerLine('7 Ivan Horvat');
      expect(result).not.toBeNull();
      expect(result?.player_number).toBe('7');
      expect(result?.first_name).toBe('Ivan');
      expect(result?.last_name).toBe('HORVAT');
      expect(result?.valid).toBe(true);
    });

    it('should parse format: "A Ivan Horvat"', () => {
      const result = parsePlayerLine('A Ivan Horvat');
      expect(result).not.toBeNull();
      expect(result?.player_number).toBe('A');
      expect(result?.first_name).toBe('Ivan');
      expect(result?.last_name).toBe('HORVAT');
    });

    it('should parse format: "Ivan Horvat (7)"', () => {
      const result = parsePlayerLine('Ivan Horvat (7)');
      expect(result).not.toBeNull();
      expect(result?.player_number).toBe('7');
      expect(result?.first_name).toBe('Ivan');
      expect(result?.last_name).toBe('HORVAT');
    });

    it('should parse format: "Ivan Horvat - 7"', () => {
      const result = parsePlayerLine('Ivan Horvat - 7');
      expect(result).not.toBeNull();
      expect(result?.player_number).toBe('7');
      expect(result?.first_name).toBe('Ivan');
      expect(result?.last_name).toBe('HORVAT');
    });

    it('should handle "h" suffix: "7h Ivan Horvat"', () => {
      const result = parsePlayerLine('7h Ivan Horvat');
      expect(result).not.toBeNull();
      expect(result?.player_number).toBe('7');
    });

    it('should return null for invalid input', () => {
      expect(parsePlayerLine('')).toBeNull();
      expect(parsePlayerLine('   ')).toBeNull();
    });

    it('should return invalid player for unparseable input', () => {
      const result = parsePlayerLine('Invalid');
      expect(result).not.toBeNull();
      expect(result?.valid).toBe(false);
      expect(result?.last_name).toBe('INVALID');
    });

    it('should return invalid player for single name part', () => {
      const result = parsePlayerLine('Ivan');
      expect(result).not.toBeNull();
      expect(result?.valid).toBe(false);
    });

    it('should handle multi-part first names', () => {
      const result = parsePlayerLine('7 Ivan Marko Horvat');
      expect(result).not.toBeNull();
      expect(result?.first_name).toBe('Ivan Marko');
      expect(result?.last_name).toBe('HORVAT');
    });

    it('should preserve letter case for player numbers', () => {
      const result = parsePlayerLine('A Ivan Horvat');
      expect(result?.player_number).toBe('A');
    });
  });

  describe('parsePlayerText', () => {
    it('should parse multiple lines', () => {
      const text = '7 Ivan Horvat\n10 Marko Petrovic\nA John Doe';
      const result = parsePlayerText(text);
      
      expect(result.length).toBe(3);
      expect(result[0].player_number).toBe('7');
      expect(result[1].player_number).toBe('10');
      expect(result[2].player_number).toBe('A');
    });

    it('should include invalid players in result', () => {
      const text = '7 Ivan Horvat\nInvalid Line\n10 Marko Petrovic';
      const result = parsePlayerText(text);
      
      // parsePlayerText includes all players (even invalid ones)
      expect(result.length).toBe(3);
      expect(result[0].player_number).toBe('7');
      expect(result[0].valid).toBe(true);
      expect(result[1].valid).toBe(false); // Invalid line becomes invalid player
      expect(result[2].player_number).toBe('10');
      expect(result[2].valid).toBe(true);
    });

    it('should handle empty text', () => {
      const result = parsePlayerText('');
      expect(result.length).toBe(0);
    });

    it('should return ParsedPlayer array (without team_code)', () => {
      const text = '7 Ivan Horvat\n10 Marko Petrovic';
      const result = parsePlayerText(text);
      
      // parsePlayerText returns ParsedPlayer[], not Player[]
      // team_code is added later in usePlayers hook
      expect(result.length).toBe(2);
      result.forEach(player => {
        expect(player).toHaveProperty('player_number');
        expect(player).toHaveProperty('first_name');
        expect(player).toHaveProperty('last_name');
        expect(player).toHaveProperty('raw_input');
        expect(player).toHaveProperty('valid');
        // ParsedPlayer doesn't have team_code - it's added in usePlayers hook
        expect(player).not.toHaveProperty('team_code');
      });
    });
  });
});
