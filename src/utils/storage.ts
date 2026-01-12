import { Sport, Match, Team, Player } from "../types";

// Check if running in Tauri
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// Check if running in web with server (production)
// We'll check if server is actually available by trying an API call
let isWebWithServer = false;
let serverCheckDone = false;

async function checkServerAvailable(): Promise<boolean> {
  if (serverCheckDone) {
    console.log(`🔍 Server check already done: ${isWebWithServer}`);
    return isWebWithServer;
  }
  
  if (typeof window === 'undefined' || isTauri) {
    console.log('🔍 Skipping server check (Tauri or SSR)');
    serverCheckDone = true;
    return false;
  }
  
  console.log('🔍 Checking if server is available...');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT.API_REQUEST);
    
    const response = await fetch('/api/sports', { 
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    isWebWithServer = response.ok;
    console.log(`🔍 Server check result: ${isWebWithServer} (status: ${response.status})`);
  } catch (error) {
    console.log(`🔍 Server check failed:`, error);
    isWebWithServer = false;
  }
  
  serverCheckDone = true;
  return isWebWithServer;
}

// API base URL for web version
const API_BASE_URL = '/api';

import { STORAGE_KEYS, DATA_FILES, TIMEOUT, DEFAULTS } from '../constants';

// Storage keys for web version (localStorage fallback)
const SPORTS_KEY = STORAGE_KEYS.SPORTS;
const MATCHES_KEY = STORAGE_KEYS.MATCHES;
const TEAMS_KEY = STORAGE_KEYS.TEAMS;

// File names for Tauri version
const SPORTS_FILE = DATA_FILES.SPORTS;
const MATCHES_FILE = DATA_FILES.MATCHES;
const TEAMS_FILE = DATA_FILES.TEAMS;

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
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`🌐 API ${method} ${url}`, body ? { body } : '');
    
    // Get auth token from localStorage
    const token = localStorage.getItem('adminToken');
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    // Add auth token if available (for POST, PUT, DELETE requests)
    if (token && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    console.log(`📡 API Response for ${url}:`, response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API call failed for ${url}:`, response.status, errorText);
      
      // If unauthorized, clear token
      if (response.status === 401) {
        localStorage.removeItem('adminToken');
      }
      
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ API success for ${url}:`, Array.isArray(data) ? `${data.length} items` : 'data received');
    return data;
  } catch (error) {
    console.error(`❌ API call error for ${endpoint}:`, error);
    return null;
  }
}

// Sports
export async function loadSports(): Promise<Sport[]> {
  try {
    if (isTauri) {
      const invoke = await getTauriInvoke();
      if (!invoke) return [];
      const data = await (invoke as any)("read_file", { path: SPORTS_FILE }) as string;
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
        console.log('📦 Using localStorage fallback for sports');
        const data = localStorage.getItem(SPORTS_KEY);
        const parsed = JSON.parse(data || "[]");
        console.log(`📦 Loaded ${parsed.length} sports from localStorage`);
        return parsed;
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
      contents: JSON.stringify(sports, null, DEFAULTS.JSON_INDENT)
    });
  } else {
    // Always save to localStorage as backup
    localStorage.setItem(SPORTS_KEY, JSON.stringify(sports, null, DEFAULTS.JSON_INDENT));
    
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
      const data = await (invoke as any)("read_file", { path: MATCHES_FILE }) as string;
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
      contents: JSON.stringify(matches, null, DEFAULTS.JSON_INDENT)
    });
  } else {
    // Always save to localStorage as backup
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches, null, DEFAULTS.JSON_INDENT));
    
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
      const data = await (invoke as any)("read_file", { path: TEAMS_FILE }) as string;
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
  console.log('🔍 saveTeams called, teams count:', teams.length);
  const teamWithLogo = teams.find(t => t.logo);
  if (teamWithLogo) {
    console.log('🔍 Team with logo found:', teamWithLogo.id, teamWithLogo.name, 'logo length:', teamWithLogo.logo?.length || 0);
  }
  
  if (isTauri) {
    const invoke = await getTauriInvoke();
    if (!invoke) return;
    const jsonContent = JSON.stringify(teams, null, DEFAULTS.JSON_INDENT);
    console.log('🔍 Saving to Tauri file, JSON length:', jsonContent.length);
    await invoke("write_file", {
      path: TEAMS_FILE,
      contents: jsonContent
    });
    console.log('✅ Saved to Tauri file');
  } else {
    // Always save to localStorage as backup
    const jsonContent = JSON.stringify(teams, null, DEFAULTS.JSON_INDENT);
    console.log('🔍 Saving to localStorage, JSON length:', jsonContent.length);
    localStorage.setItem(TEAMS_KEY, jsonContent);
    console.log('✅ Saved to localStorage');
    
    // Try to save to server if available
    const serverAvailable = await checkServerAvailable();
    if (serverAvailable) {
      try {
        console.log('🔍 Saving to server...');
        await apiCall('/teams', 'POST', teams);
        console.log('✅ Saved to server');
      } catch (error) {
        console.error('❌ Error saving to server, using localStorage:', error);
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
      const data = await (invoke as any)("read_file", { path: fileName }) as string;
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
        contents: JSON.stringify(players, null, DEFAULTS.JSON_INDENT)
      });
    } else {
      // Always save to localStorage as backup
      const key = `players-${teamId}`;
      localStorage.setItem(key, JSON.stringify(players, null, DEFAULTS.JSON_INDENT));
      
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
