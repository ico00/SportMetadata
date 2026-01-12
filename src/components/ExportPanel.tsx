import { memo } from "react";
import { Player, Team, Match } from "../types";
import { sortPlayerNumber } from "../utils/sortUtils";
import { FaFileExport, FaCheckCircle, FaExclamationCircle, FaUsers, FaInfoCircle } from "react-icons/fa";

interface ExportPanelProps {
  players: Player[];
  teamCode: string;
  allTeams?: Team[];
  match?: Match | null;
  onExport: () => void;
}

const ExportPanel = memo(function ExportPanel({
  players,
  teamCode,
  allTeams,
  match,
  onExport,
}: ExportPanelProps) {
  const validPlayers = players.filter((p) => p.valid);
  const invalidPlayers = players.filter((p) => !p.valid);

  const previewLines = validPlayers
    .sort((a, b) => sortPlayerNumber(a.player_number, b.player_number))
    .map((player) => {
      const namePart = player.first_name?.trim() 
        ? `${player.first_name} ${player.last_name}`
        : player.last_name;
      return `${teamCode}${player.player_number}\t${namePart} (${player.player_number})`;
    });

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

  const validPercentage = players.length > 0 ? (validPlayers.length / players.length) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-6 shadow-2xl border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 animate-slide-up backdrop-blur-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent transition-all duration-300"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
            <FaFileExport className="text-2xl text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
            Export
          </h2>
        </div>

        <div className="space-y-4">
          {allTeamsCount > 0 && (
            <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-xl p-4 shadow-lg backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-500/20 rounded-lg mt-0.5">
                  <FaInfoCircle className="text-blue-400 text-sm" />
                </div>
                <p className="text-sm text-blue-300 flex-1">
                  Export will include <span className="font-bold text-blue-200">{allTeamsCount}</span> {allTeamsCount === 1 ? 'team' : 'teams'} from the match
                </p>
              </div>
            </div>
          )}
          <div className="bg-gradient-to-r from-gray-700/80 to-gray-700/60 rounded-xl p-4 border border-gray-600/50 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-200 uppercase tracking-wider">Statistics</span>
              <span className="text-xs text-emerald-400 font-semibold">{validPercentage.toFixed(0)}% Ready</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-lg p-3 border border-gray-600/30">
                <div className="flex items-center gap-2 mb-1">
                  <FaUsers className="text-gray-400 text-sm" />
                  <span className="text-xs text-gray-400 font-medium">Total Players</span>
                </div>
                <span className="text-2xl font-bold text-gray-200">{players.length}</span>
              </div>
              <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-lg p-3 border border-green-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <FaCheckCircle className="text-green-400 text-sm" />
                  <span className="text-xs text-green-400 font-medium">Valid</span>
                </div>
                <span className="text-2xl font-bold text-green-400">{validPlayers.length}</span>
              </div>
              <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-lg p-3 border border-red-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <FaExclamationCircle className="text-red-400 text-sm" />
                  <span className="text-xs text-red-400 font-medium">Invalid</span>
                </div>
                <span className="text-2xl font-bold text-red-400">{invalidPlayers.length}</span>
              </div>
            </div>
            {players.length > 0 && (
              <div className="mt-4">
                <div className="h-2 bg-gray-600/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${validPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

        {invalidPlayers.length > 0 && (
          <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-500/30 rounded-xl p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-1.5 bg-red-500/20 rounded-lg mt-0.5">
                <FaExclamationCircle className="text-red-400 text-sm" />
              </div>
              <p className="text-sm text-red-300 font-medium flex-1">
                There are invalid players that will not be included in the export:
              </p>
            </div>
            <ul className="list-none space-y-1 text-sm text-red-200 ml-8">
              {invalidPlayers.map((player) => (
                <li key={player.id} className="flex items-center gap-2 before:content-['•'] before:text-red-400 before:font-bold">
                  <span className="font-mono text-xs bg-red-900/30 px-2 py-1 rounded border border-red-500/30">{player.raw_input}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {validPlayers.length > 0 && (
          <>
            <div className="bg-gradient-to-r from-gray-700/80 to-gray-700/60 rounded-xl p-4 border border-gray-600/50 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                  <div className="p-1 bg-emerald-500/20 rounded">
                    <FaFileExport className="text-emerald-400 text-xs" />
                  </div>
                  Export Preview
                </span>
                <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                  {exportFileName}
                </span>
              </div>
              <pre className="text-xs text-gray-300 font-mono bg-gray-900/50 p-4 rounded-lg overflow-x-auto max-h-60 overflow-y-auto border border-gray-700/50 shadow-inner">
                {previewLines.join("\n")}
                {allTeamsCount > 1 && (
                  <span className="text-gray-500 italic">
                    {"\n"}... (and other teams from the match)
                  </span>
                )}
              </pre>
            </div>

            <button
              onClick={onExport}
              disabled={!teamCode || validPlayers.length === 0}
              className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:transform-none font-bold text-lg border border-emerald-400/30 disabled:border-gray-500/30"
              aria-label={allTeamsCount > 1 ? `Export all ${allTeamsCount} teams` : "Export TXT file"}
            >
              <FaFileExport className="text-xl" />
              <span>
                {allTeamsCount > 1 
                  ? `Export All Teams (${allTeamsCount})` 
                  : "Export TXT File"}
              </span>
            </button>
          </>
        )}

        {validPlayers.length === 0 && (
          <div className="text-center py-8 animate-fade-in">
            <div className="p-3 bg-gray-700/30 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <FaFileExport className="text-2xl text-gray-500" />
            </div>
            <p className="text-gray-400 text-lg font-medium">No valid players for export</p>
            <p className="text-gray-500 text-sm mt-1">Add and validate players first</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
});

export default ExportPanel;
