/**
 * Runtime validation using Zod schemas
 * Validates data before saving to files
 */

const { z } = require('zod');

// Sport schema
const SportSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Sport name is required'),
  created_at: z.string().datetime(),
});

// Match schema
const MatchSchema = z.object({
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
const TeamSchema = z.object({
  id: z.string(),
  match_id: z.string().min(1, 'Match ID is required'),
  name: z.string().min(1, 'Team name is required'),
  team_code: z.string(),
  logo: z.string().optional(), // SVG content or base64 encoded image
  created_at: z.string().datetime(),
});

// Player schema
const PlayerSchema = z.object({
  id: z.string(),
  player_number: z.string(),
  team_code: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required'),
  raw_input: z.string(),
  valid: z.boolean(),
});

// Array schemas
const SportsArraySchema = z.array(SportSchema);
const MatchesArraySchema = z.array(MatchSchema);
const TeamsArraySchema = z.array(TeamSchema);
const PlayersArraySchema = z.array(PlayerSchema);

/**
 * Validates sports array
 * @param {Array} data - Sports array to validate
 * @returns {{valid: boolean, error?: string, data?: Array}}
 */
function validateSports(data) {
  try {
    const validated = SportsArraySchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { valid: false, error: `Validation error: ${errorMessage}` };
    }
    return { valid: false, error: `Unknown validation error: ${error.message}` };
  }
}

/**
 * Validates matches array
 * @param {Array} data - Matches array to validate
 * @returns {{valid: boolean, error?: string, data?: Array}}
 */
function validateMatches(data) {
  try {
    const validated = MatchesArraySchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { valid: false, error: `Validation error: ${errorMessage}` };
    }
    return { valid: false, error: `Unknown validation error: ${error.message}` };
  }
}

/**
 * Validates teams array
 * @param {Array} data - Teams array to validate
 * @returns {{valid: boolean, error?: string, data?: Array}}
 */
function validateTeams(data) {
  try {
    const validated = TeamsArraySchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { valid: false, error: `Validation error: ${errorMessage}` };
    }
    return { valid: false, error: `Unknown validation error: ${error.message}` };
  }
}

/**
 * Validates players array
 * @param {Array} data - Players array to validate
 * @returns {{valid: boolean, error?: string, data?: Array}}
 */
function validatePlayers(data) {
  try {
    const validated = PlayersArraySchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { valid: false, error: `Validation error: ${errorMessage}` };
    }
    return { valid: false, error: `Unknown validation error: ${error.message}` };
  }
}

module.exports = {
  validateSports,
  validateMatches,
  validateTeams,
  validatePlayers,
};
