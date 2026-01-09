import { Sport, Match, Team, Player } from "../types";

// Check if running in Tauri
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// Check if running in web with server (production)
// We'll check if server is actually available by trying an API call
let isWebWithServer = false;
let serverCheckDone = false;

async function checkServerAvailable(): Promise<boolean> {
  if (serverCheckDone) return isWebWithServer;
  
  if (typeof window === 'undefined' || isTauri) {
    serverCheckDone = true;
    return false;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout
    
    const response = await fetch('/api/sports', { 
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    isWebWithServer = response.ok;
  } catch (error) {
    isWebWithServer = false;
  }
  
  serverCheckDone = true;
  return isWebWithServer;
}

// API base URL for web version
const API_BASE_URL = '/api';

// Storage keys for web version (localStorage fallback)
const SPORTS_KEY = "sports";
const MATCHES_KEY = "matches";
const TEAMS_KEY = "teams";

// File names for Tauri version
const SPORTS_FILE = "sports.json";
const MATCHES_FILE = "matches.json";
const TEAMS_FILE = "teams.json";

// Lazy load Tauri APIs
let tauriInvoke: any = null;

async function getTauriInvoke() {
  if (!tauriInvoke && isTauri) {
    const tauriApi = await import("@tauri-apps/api/tauri");
    tauriInvoke = tauriApi.invoke;
  }
  return tauriInvoke;
}

// Helper function for web API calls
async function apiCall<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T | null> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API call error for ${endpoint}:`, error);
    return null;
  }
}

// Sports
export async function loadSports(): Promise<Sport[]> {
  try {
    if (isTauri) {
      const invoke = await getTauriInvoke();
      if (!invoke) return [];
      const data = await invoke<string>("read_file", { path: SPORTS_FILE });
      return JSON.parse(data || "[]");
    } else {
      // Check if server is available
      const serverAvailable = await checkServerAvailable();
      if (serverAvailable) {
        // Use API for web with server
        const data = await apiCall<Sport[]>('/sports');
        return data || [];
      } else {
        // Fallback to localStorage for web without server
        const data = localStorage.getItem(SPORTS_KEY);
        return JSON.parse(data || "[]");
      }
    }
  } catch (error) {
    console.error('Error loading sports:', error);
    // Fallback to localStorage on error
    try {
      const data = localStorage.getItem(SPORTS_KEY);
      return JSON.parse(data || "[]");
    } catch {
      return [];
    }
  }
}

export async function saveSports(sports: Sport[]): Promise<void> {
  if (isTauri) {
    const invoke = await getTauriInvoke();
    if (!invoke) return;
    await invoke("write_file", {
      path: SPORTS_FILE,
      contents: JSON.stringify(sports, null, 2)
    });
  } else {
    // Always save to localStorage as backup
    localStorage.setItem(SPORTS_KEY, JSON.stringify(sports, null, 2));
    
    // Try to save to server if available
    const serverAvailable = await checkServerAvailable();
    if (serverAvailable) {
      try {
        await apiCall('/sports', 'POST', sports);
      } catch (error) {
        console.error('Error saving to server, using localStorage:', error);
      }
    }
  }
}

// Matches
export async function loadMatches(): Promise<Match[]> {
  try {
    if (isTauri) {
      const invoke = await getTauriInvoke();
      if (!invoke) return [];
      const data = await invoke<string>("read_file", { path: MATCHES_FILE });
      return JSON.parse(data || "[]");
    } else {
      // Check if server is available
      const serverAvailable = await checkServerAvailable();
      if (serverAvailable) {
        // Use API for web with server
        const data = await apiCall<Match[]>('/matches');
        if (data) return data;
      }
      // Fallback to localStorage for web without server
      const data = localStorage.getItem(MATCHES_KEY);
      return JSON.parse(data || "[]");
    }
  } catch (error) {
    console.error('Error loading matches:', error);
    // Fallback to localStorage on error
    try {
      const data = localStorage.getItem(MATCHES_KEY);
      return JSON.parse(data || "[]");
    } catch {
      return [];
    }
  }
}

export async function saveMatches(matches: Match[]): Promise<void> {
  if (isTauri) {
    const invoke = await getTauriInvoke();
    if (!invoke) return;
    await invoke("write_file", {
      path: MATCHES_FILE,
      contents: JSON.stringify(matches, null, 2)
    });
  } else {
    // Always save to localStorage as backup
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches, null, 2));
    
    // Try to save to server if available
    const serverAvailable = await checkServerAvailable();
    if (serverAvailable) {
      try {
        await apiCall('/matches', 'POST', matches);
      } catch (error) {
        console.error('Error saving to server, using localStorage:', error);
      }
    }
  }
}

// Teams
export async function loadTeams(): Promise<Team[]> {
  try {
    if (isTauri) {
      const invoke = await getTauriInvoke();
      if (!invoke) return [];
      const data = await invoke<string>("read_file", { path: TEAMS_FILE });
      return JSON.parse(data || "[]");
    } else {
      // Check if server is available
      const serverAvailable = await checkServerAvailable();
      if (serverAvailable) {
        // Use API for web with server
        const data = await apiCall<Team[]>('/teams');
        if (data) return data;
      }
      // Fallback to localStorage for web without server
      const data = localStorage.getItem(TEAMS_KEY);
      return JSON.parse(data || "[]");
    }
  } catch (error) {
    console.error('Error loading teams:', error);
    // Fallback to localStorage on error
    try {
      const data = localStorage.getItem(TEAMS_KEY);
      return JSON.parse(data || "[]");
    } catch {
      return [];
    }
  }
}

export async function saveTeams(teams: Team[]): Promise<void> {
  if (isTauri) {
    const invoke = await getTauriInvoke();
    if (!invoke) return;
    await invoke("write_file", {
      path: TEAMS_FILE,
      contents: JSON.stringify(teams, null, 2)
    });
  } else {
    // Always save to localStorage as backup
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams, null, 2));
    
    // Try to save to server if available
    const serverAvailable = await checkServerAvailable();
    if (serverAvailable) {
      try {
        await apiCall('/teams', 'POST', teams);
      } catch (error) {
        console.error('Error saving to server, using localStorage:', error);
      }
    }
  }
}

export async function loadPlayers(teamId: string): Promise<Player[]> {
  try {
    if (isTauri) {
      const invoke = await getTauriInvoke();
      if (!invoke) return [];
      const fileName = `players-${teamId}.json`;
      const data = await invoke<string>("read_file", { path: fileName });
      return JSON.parse(data || "[]");
    } else {
      // Check if server is available
      const serverAvailable = await checkServerAvailable();
      if (serverAvailable) {
        // Use API for web with server
        const data = await apiCall<Player[]>(`/players/${teamId}`);
        if (data) return data;
      }
      // Fallback to localStorage for web without server
      const key = `players-${teamId}`;
      const data = localStorage.getItem(key);
      return JSON.parse(data || "[]");
    }
  } catch (error) {
    console.error(`Error loading players for team ${teamId}:`, error);
    // Fallback to localStorage on error
    try {
      const key = `players-${teamId}`;
      const data = localStorage.getItem(key);
      return JSON.parse(data || "[]");
    } catch {
      return [];
    }
  }
}

export async function savePlayers(teamId: string, players: Player[]): Promise<void> {
  try {
    if (isTauri) {
      const invoke = await getTauriInvoke();
      if (!invoke) return;
      const fileName = `players-${teamId}.json`;
      await invoke("write_file", {
        path: fileName,
        contents: JSON.stringify(players, null, 2)
      });
    } else {
      // Always save to localStorage as backup
      const key = `players-${teamId}`;
      localStorage.setItem(key, JSON.stringify(players, null, 2));
      
      // Try to save to server if available
      const serverAvailable = await checkServerAvailable();
      if (serverAvailable) {
        try {
          await apiCall(`/players/${teamId}`, 'POST', players);
        } catch (error) {
          console.error('Error saving to server, using localStorage:', error);
        }
      }
    }
  } catch (error) {
    console.error(`Error saving players for team ${teamId}:`, error);
  }
}

export async function deleteTeam(teamId: string): Promise<void> {
  try {
    if (isTauri) {
      const invoke = await getTauriInvoke();
      if (!invoke) return;
      const fileName = `players-${teamId}.json`;
      await invoke("delete_file", { path: fileName });
    } else {
      // Always delete from localStorage
      const key = `players-${teamId}`;
      localStorage.removeItem(key);
      
      // Try to delete from server if available
      const serverAvailable = await checkServerAvailable();
      if (serverAvailable) {
        try {
          await apiCall(`/players/${teamId}`, 'DELETE');
        } catch (error) {
          console.error('Error deleting from server:', error);
        }
      }
    }
  } catch (error) {
    console.log("Players data not found or already deleted:", error);
  }
}

export async function deleteMatch(matchId: string): Promise<void> {
  try {
    const teams = await loadTeams();
    const matchTeams = teams.filter(t => t.match_id === matchId);
    for (const team of matchTeams) {
      await deleteTeam(team.id);
    }
  } catch (error) {
    console.log("Error deleting match:", error);
  }
}

export async function deleteSport(sportId: string): Promise<void> {
  try {
    const matches = await loadMatches();
    const sportMatches = matches.filter(m => m.sport_id === sportId);
    for (const match of sportMatches) {
      await deleteMatch(match.id);
    }
  } catch (error) {
    console.log("Error deleting sport:", error);
  }
}
