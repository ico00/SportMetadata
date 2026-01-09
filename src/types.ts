export interface Sport {
  id: string;
  name: string;
  created_at: string;
}

export interface Match {
  id: string;
  sport_id: string;
  date: string;
  city: string;
  country: string;
  description: string;
  created_at: string;
}

export interface Team {
  id: string;
  match_id: string;
  name: string;
  team_code: string;
  created_at: string;
}

export interface Player {
  id: string;
  player_number: string; // Can be number or letter (e.g., "7" or "A")
  team_code: string;
  first_name: string;
  last_name: string;
  raw_input: string;
  valid: boolean;
}

export interface ParsedPlayer {
  player_number: string; // Can be number or letter (e.g., "7" or "A")
  first_name: string;
  last_name: string;
  raw_input: string;
  valid: boolean;
}
