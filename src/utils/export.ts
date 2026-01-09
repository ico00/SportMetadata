import { Player, Team, Match, Sport } from "../types";
import { formatForShutterstock } from "./stockAgencies";

interface TeamPlayers {
  team: Team;
  players: Player[];
}

// Check if running in Tauri
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

/**
 * Generates TXT file for Photo Mechanic code replacements
 * Format: {team_code}{player_number}\t{first_name} {last_name} ({player_number})
 * Exports all teams from the match into one file
 */
export async function exportToTxt(
  sport: Sport,
  match: Match,
  teamsWithPlayers: TeamPlayers[],
  fileName?: string
): Promise<void> {
  const allLines: string[] = [];

  // Add sport name at the very top
  allLines.push(sport.name);
  allLines.push(""); // Empty line after sport name

  // Add Shutterstock format for the match (second line)
  const shutterstockFormat = formatForShutterstock(match);
  allLines.push(shutterstockFormat);
  allLines.push(""); // Empty line after Shutterstock format

  // For each team, add team name, separator, and players
  for (let i = 0; i < teamsWithPlayers.length; i++) {
    const { team, players } = teamsWithPlayers[i];
    
    // Add team name
    allLines.push(team.name);
    
    // Add separator line under team name
    allLines.push("---------------------");
    
    // Sort function that handles both numbers and letters
    const sortPlayerNumber = (a: string, b: string): number => {
      const aIsNumber = !isNaN(Number(a));
      const bIsNumber = !isNaN(Number(b));
      
      if (aIsNumber && bIsNumber) {
        return Number(a) - Number(b);
      }
      if (!aIsNumber && !bIsNumber) {
        return a.localeCompare(b);
      }
      if (aIsNumber && !bIsNumber) return -1;
      if (!aIsNumber && bIsNumber) return 1;
      return 0;
    };

    // Add players
    const validPlayers = players.filter((p) => p.valid);
    const lines = validPlayers
      .sort((a, b) => sortPlayerNumber(a.player_number, b.player_number))
      .map((player) => {
        const line = `${team.team_code}${player.player_number}\t${player.first_name} ${player.last_name} (${player.player_number})`;
        return line;
      });
    allLines.push(...lines);
    
    // Add separator between teams (except after last team)
    if (i < teamsWithPlayers.length - 1) {
      allLines.push(""); // Empty line between teams
    }
  }

  const content = allLines.join("\n");
  
  // Generate filename: yyyy-mm-dd-Team1-Team2
  let defaultPath = fileName;
  if (!defaultPath) {
    const dateStr = match.date;
    const teamNames = teamsWithPlayers
      .map(({ team }) => team.name.replace(/\s+/g, '-'))
      .join('-');
    defaultPath = `${dateStr}-${teamNames}.txt`;
  }

  if (isTauri) {
    // Tauri version - use file dialog
    const { save } = await import("@tauri-apps/api/dialog");
    const { writeTextFile } = await import("@tauri-apps/api/fs");

    const selectedPath = await save({
      defaultPath,
      filters: [
        {
          name: "Text files",
          extensions: ["txt"],
        },
      ],
    });

    if (!selectedPath) {
      return;
    }

    await writeTextFile(selectedPath, content);
  } else {
    // Web version - use browser download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = defaultPath;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
