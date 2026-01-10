import { Player, Team, Match } from "../types";
import { FaFileExport } from "react-icons/fa";

interface ExportPanelProps {
  players: Player[];
  teamCode: string;
  allTeams?: Team[];
  match?: Match | null;
  onExport: () => void;
}

export default function ExportPanel({
  players,
  teamCode,
  allTeams,
  match,
  onExport,
}: ExportPanelProps) {
  const validPlayers = players.filter((p) => p.valid);
  const invalidPlayers = players.filter((p) => !p.valid);

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

  const previewLines = validPlayers
    .sort((a, b) => sortPlayerNumber(a.player_number, b.player_number))
    .map(
      (player) =>
        `${teamCode}${player.player_number}\t${player.first_name} ${player.last_name} (${player.player_number})`
    );

  const allTeamsCount = allTeams?.length || 0;

  // Generate filename based on match date and team names (same format as in export.ts)
  // If exporting multiple teams, use match format: yyyy-mm-dd-Team1-Team2.txt
  // If exporting single team, use: team-CODE.txt
  const getExportFileName = (): string => {
    // If there are multiple teams and we have match data, use match format
    if (allTeamsCount > 1 && match && allTeams && allTeams.length > 0) {
      const dateStr = match.date;
      const teamNames = allTeams
        .map((team) => team.name.replace(/\s+/g, '-'))
        .join('-');
      return `${dateStr}-${teamNames}.txt`;
    }
    // Single team export: team-CODE.txt
    if (teamCode) {
      return `team-${teamCode}.txt`;
    }
    return "team-CODE.txt";
  };

  const exportFileName = getExportFileName();

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-xl border border-gray-700 hover:border-emerald-500/50 transition-all duration-300 animate-slide-up">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FaFileExport className="text-emerald-400" />
        Export
      </h2>

      <div className="space-y-4">
        {allTeamsCount > 0 && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
            <p className="text-sm text-blue-400">
              ℹ️ Export will include <span className="font-semibold">{allTeamsCount}</span> {allTeamsCount === 1 ? 'team' : 'teams'} from the match
            </p>
          </div>
        )}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Statistics:</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Total players:</span>{" "}
              <span className="font-semibold">{players.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Valid:</span>{" "}
              <span className="font-semibold text-green-400">
                {validPlayers.length}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Invalid:</span>{" "}
              <span className="font-semibold text-red-400">
                {invalidPlayers.length}
              </span>
            </div>
          </div>
        </div>

        {invalidPlayers.length > 0 && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
            <p className="text-sm text-red-400 mb-2">
              ⚠️ There are invalid players that will not be included in the export:
            </p>
            <ul className="list-disc list-inside text-sm text-red-300">
              {invalidPlayers.map((player) => (
                <li key={player.id}>{player.raw_input}</li>
              ))}
            </ul>
          </div>
        )}

        {validPlayers.length > 0 && (
          <>
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Export Preview:</span>
                <span className="text-xs text-gray-400 font-mono">
                  {exportFileName}
                </span>
              </div>
              <pre className="text-xs text-gray-300 font-mono bg-gray-800 p-3 rounded overflow-x-auto max-h-60 overflow-y-auto">
                {previewLines.join("\n")}
                {allTeamsCount > 1 && (
                  <span className="text-gray-500">
                    {"\n"}... (and other teams from the match)
                  </span>
                )}
              </pre>
            </div>

            <button
              onClick={onExport}
              disabled={!teamCode || validPlayers.length === 0}
              className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none font-semibold"
            >
              <FaFileExport />
              {allTeamsCount > 1 
                ? `Export All Teams (${allTeamsCount})` 
                : "Export TXT File"}
            </button>
          </>
        )}

        {validPlayers.length === 0 && (
          <p className="text-gray-400 text-center py-4">
            No valid players for export.
          </p>
        )}
      </div>
    </div>
  );
}
