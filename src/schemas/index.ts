/**
 * Zod schemas for runtime validation
 * These schemas match the TypeScript interfaces in types.ts
 */

import { z } from 'zod';

// Sport schema
export const SportSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Sport name is required'),
  created_at: z.string().datetime(),
});

// Match schema
export const MatchSchema = z.object({
  id: z.string(),
  sport_id: z.string().min(1, 'Sport ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  city: z.string(),
  country: z.string(),
  venue: z.string(),
  description: z.string(),
  created_at: z.string().datetime(),
});

// Team schema
export const TeamSchema = z.object({
  id: z.string(),
  match_id: z.string().min(1, 'Match ID is required'),
  name: z.string().min(1, 'Team name is required'),
  team_code: z.string(),
  logo: z.string().optional(), // SVG content or base64 encoded image
  created_at: z.string().datetime(),
});

// Player schema
export const PlayerSchema = z.object({
  id: z.string(),
  player_number: z.string(), // Can be number or letter (e.g., "7" or "A")
  team_code: z.string(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  raw_input: z.string(),
  valid: z.boolean(),
});

// ParsedPlayer schema (for parser output)
export const ParsedPlayerSchema = z.object({
  player_number: z.string(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  raw_input: z.string(),
  valid: z.boolean(),
});

// Array schemas for API endpoints
export const SportsArraySchema = z.array(SportSchema);
export const MatchesArraySchema = z.array(MatchSchema);
export const TeamsArraySchema = z.array(TeamSchema);
export const PlayersArraySchema = z.array(PlayerSchema);

// Type inference from schemas (for TypeScript)
export type SportValidated = z.infer<typeof SportSchema>;
export type MatchValidated = z.infer<typeof MatchSchema>;
export type TeamValidated = z.infer<typeof TeamSchema>;
export type PlayerValidated = z.infer<typeof PlayerSchema>;
export type ParsedPlayerValidated = z.infer<typeof ParsedPlayerSchema>;
