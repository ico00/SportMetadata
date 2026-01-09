import { ParsedPlayer } from "../types";

/**
 * Parsira red teksta u player objekt
 * Podržani formati:
 * - "7 Ivan Horvat"
 * - "Ivan Horvat (7)"
 * - "7h Ivan Horvat"
 * - "Ivan Horvat - 7"
 */
/**
 * Capitalizira svaku riječ u stringu (prvo slovo veliko, ostala mala)
 */
function capitalizeWords(str: string): string {
  return str
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function parsePlayerLine(line: string): ParsedPlayer | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Format: "7 Ivan Horvat" ili "7h Ivan Horvat" (broj)
  const format1Number = /^(\d+)[h]?\s+(.+)$/i.exec(trimmed);
  if (format1Number) {
    const number = format1Number[1];
    const nameParts = format1Number[2].trim().split(/\s+/);
    if (nameParts.length >= 2) {
      const lastName = nameParts.pop()!.toUpperCase();
      const firstName = capitalizeWords(nameParts.join(" "));
      return {
        player_number: number,
        first_name: firstName,
        last_name: lastName,
        raw_input: trimmed,
        valid: true,
      };
    }
  }

  // Format: "A Ivan Horvat" ili "Ah Ivan Horvat" (slovo) - case sensitive
  const format1Letter = /^([A-Za-z])[h]?\s+(.+)$/i.exec(trimmed);
  if (format1Letter) {
    const letter = format1Letter[1]; // Keep original case
    const nameParts = format1Letter[2].trim().split(/\s+/);
    if (nameParts.length >= 2) {
      const lastName = nameParts.pop()!.toUpperCase();
      const firstName = capitalizeWords(nameParts.join(" "));
      return {
        player_number: letter,
        first_name: firstName,
        last_name: lastName,
        raw_input: trimmed,
        valid: true,
      };
    }
  }

  // Format: "Ivan Horvat (7)" ili "Ivan Horvat (A)" (broj ili slovo u zagradama) - case sensitive for letters
  const format2 = /^(.+?)\s*\(([A-Za-z0-9]+)\)$/i.exec(trimmed);
  if (format2) {
    const nameParts = format2[1].trim().split(/\s+/);
    const numberOrLetter = format2[2]; // Keep original case
    if (nameParts.length >= 2) {
      const lastName = nameParts.pop()!.toUpperCase();
      const firstName = capitalizeWords(nameParts.join(" "));
      return {
        player_number: numberOrLetter,
        first_name: firstName,
        last_name: lastName,
        raw_input: trimmed,
        valid: true,
      };
    }
  }

  // Format: "Ivan Horvat - 7" ili "Ivan Horvat - A" (broj ili slovo nakon crtice) - case sensitive for letters
  const format3 = /^(.+?)\s*-\s*([A-Za-z0-9]+)$/i.exec(trimmed);
  if (format3) {
    const nameParts = format3[1].trim().split(/\s+/);
    const numberOrLetter = format3[2]; // Keep original case
    if (nameParts.length >= 2) {
      const lastName = nameParts.pop()!.toUpperCase();
      const firstName = capitalizeWords(nameParts.join(" "));
      return {
        player_number: numberOrLetter,
        first_name: firstName,
        last_name: lastName,
        raw_input: trimmed,
        valid: true,
      };
    }
  }

  // Ako nijedan format ne odgovara, vrati nevalidan player
  return {
    player_number: "",
    first_name: "",
    last_name: trimmed.toUpperCase(),
    raw_input: trimmed,
    valid: false,
  };
}

/**
 * Parsira cijeli tekst sa više redova
 */
export function parsePlayerText(text: string): ParsedPlayer[] {
  const lines = text.split(/\r?\n/);
  const players: ParsedPlayer[] = [];

  for (const line of lines) {
    const player = parsePlayerLine(line);
    if (player) {
      players.push(player);
    }
  }

  return players;
}
