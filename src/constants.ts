/**
 * Application-wide constants
 * Centralized location for magic numbers and strings
 */

// Toast notification durations (milliseconds)
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 4000,
  INFO: 3000,
  LOADING: Infinity, // Loading toasts don't auto-dismiss
} as const;

// Toast notification position
export const TOAST_POSITION = 'top-right' as const;

// Timeout values (milliseconds)
export const TIMEOUT = {
  API_REQUEST: 2000, // API request timeout
  AUTOSAVE_DELAY: 2000, // Delay before autosaving players
  COPY_FEEDBACK: 2000, // Duration to show copy feedback
  LOGIN_MODAL_CLOSE: 100, // Delay before closing login modal after auth
} as const;

// Storage keys (localStorage keys for web version)
export const STORAGE_KEYS = {
  SPORTS: 'sports',
  MATCHES: 'matches',
  TEAMS: 'teams',
  PLAYERS: 'players',
} as const;

// File names (Tauri version file names)
export const DATA_FILES = {
  SPORTS: 'sports.json',
  MATCHES: 'matches.json',
  TEAMS: 'teams.json',
  PLAYERS: 'players.json',
} as const;

// Player input constraints
export const PLAYER_CONSTRAINTS = {
  MAX_NUMBER_LENGTH: 3, // Maximum length for player number (e.g., "7", "10", "A")
  MIN_NAME_PARTS: 2, // Minimum number of name parts required (first + last name)
} as const;

// Toast styles (colors)
export const TOAST_STYLES = {
  SUCCESS_BORDER: '#10b981',
  ERROR_BORDER: '#ef4444',
  INFO_BORDER: '#3b82f6',
  LOADING_BORDER: '#6b7280',
  BACKGROUND: '#1f2937',
  TEXT_COLOR: '#fff',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  SPORTS: '/api/sports',
  MATCHES: '/api/matches',
  TEAMS: '/api/teams',
  PLAYERS: '/api/players',
  LOGIN: '/api/login',
} as const;

// Default values
export const DEFAULTS = {
  SPORT_NAME: 'New Sport',
  TEAM_NAME: 'New Team',
  JSON_INDENT: 2, // JSON.stringify indentation
} as const;
