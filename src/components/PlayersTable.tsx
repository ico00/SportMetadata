import { useState } from "react";
import { Player } from "../types";
import { useAuth } from "../context/AuthContext";
import { 
  FaUser, FaEdit, FaTrash, FaCheck, FaTimes, 
  FaBroom, FaExchangeAlt, FaHashtag, FaTag, 
  FaEye, FaCheckCircle, FaExclamationCircle
} from "react-icons/fa";

interface PlayersTableProps {
  players: Player[];
  teamCode: string;
  onUpdatePlayer: (player: Player) => void;
  onDeletePlayer: (playerId: string) => void;
  onSwapNames?: () => void;
  onCleanNames?: () => void;
}

export default function PlayersTable({
  players,
  teamCode,
  onUpdatePlayer,
  onDeletePlayer,
  onSwapNames,
  onCleanNames,
}: PlayersTableProps) {
  const { isAuthenticated } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Player>>({});

  const startEdit = (player: Player) => {
    setEditingId(player.id);
    setEditValues({
      player_number: player.player_number,
      first_name: player.first_name,
      last_name: player.last_name,
    });
  };

  // Function to capitalize names
  const capitalizeWords = (str: string): string => {
    return str
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const saveEdit = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (player && editValues.player_number !== undefined && editValues.player_number !== "") {
      onUpdatePlayer({
        ...player,
        ...editValues,
        player_number: editValues.player_number.toString(), // Keep as entered (no uppercase conversion)
        first_name: editValues.first_name 
          ? capitalizeWords(editValues.first_name)
          : player.first_name,
        last_name: (editValues.last_name || player.last_name).toUpperCase(), // Ensure uppercase for last name
        valid: true,
      });
    }
    setEditingId(null);
    setEditValues({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const getPreview = (player: Player) => {
    return `${teamCode}${player.player_number}\t${player.first_name} ${player.last_name} (${player.player_number})`;
  };

  // Sort function that handles both numbers and letters
  const sortPlayerNumber = (a: string, b: string): number => {
    const aIsNumber = !isNaN(Number(a));
    const bIsNumber = !isNaN(Number(b));
    
    // Both are numbers - sort numerically
    if (aIsNumber && bIsNumber) {
      return Number(a) - Number(b);
    }
    
    // Both are letters - sort alphabetically
    if (!aIsNumber && !bIsNumber) {
      return a.localeCompare(b);
    }
    
    // Numbers come before letters
    if (aIsNumber && !bIsNumber) {
      return -1;
    }
    if (!aIsNumber && bIsNumber) {
      return 1;
    }
    
    return 0;
  };

  const sortedPlayers = [...players].sort(
    (a, b) => sortPlayerNumber(a.player_number, b.player_number)
  );

  const validPlayersCount = players.filter(p => p.valid).length;
  const invalidPlayersCount = players.filter(p => !p.valid).length;
  const validPercentage = players.length > 0 ? (validPlayersCount / players.length) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-6 shadow-2xl border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 animate-slide-up backdrop-blur-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:to-transparent transition-all duration-300"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-colors">
              <FaUser className="text-2xl text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Players
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-300 font-semibold">{players.length} total</span>
                {players.length > 0 && (
                  <>
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <FaCheckCircle /> {validPlayersCount} valid
                    </span>
                    {invalidPlayersCount > 0 && (
                      <span className="text-xs text-red-400 flex items-center gap-1">
                        <FaExclamationCircle /> {invalidPlayersCount} invalid
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          {players.length > 0 && (
            <div className="flex space-x-2">
              {isAuthenticated && onCleanNames && (
                <button
                  onClick={onCleanNames}
                  className="px-3 py-1.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 border border-orange-400/30"
                  title="Remove all diacritics (č, ć, ž, š, đ and others) from names"
                >
                  <FaBroom className="text-xs" />
                  Clean Characters
                </button>
              )}
              {isAuthenticated && onSwapNames && (
                <button
                  onClick={onSwapNames}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 border border-purple-400/30"
                  title="Swap first name and last name for all players"
                >
                  <FaExchangeAlt className="text-xs" />
                  Swap Name/Last Name
                </button>
              )}
            </div>
          )}
        </div>

        {players.length > 0 && (
          <div className="mb-4 bg-gradient-to-r from-gray-700/50 to-gray-700/30 rounded-lg p-3 border border-gray-600/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">Validation Status</span>
              <span className="text-xs font-semibold text-cyan-400">{validPercentage.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-gray-600/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${validPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

      {players.length === 0 ? (
        <div className="text-center py-12 animate-fade-in">
          <div className="p-4 bg-gray-700/30 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <FaUser className="text-4xl text-gray-500" />
          </div>
          <p className="text-gray-400 text-lg">No players yet</p>
          <p className="text-gray-500 text-sm mt-1">Add players using the input above</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700/50 shadow-inner bg-gray-900/30 backdrop-blur-sm">
          <table className="border-collapse" style={{ width: '100%', tableLayout: 'auto' }}>
            <thead>
              <tr className="border-b border-gray-700/50 bg-gradient-to-r from-gray-700/80 to-gray-700/60 backdrop-blur-sm">
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-200 uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <div className="p-1 bg-cyan-500/20 rounded">
                      <FaHashtag className="text-cyan-400 text-xs" />
                    </div>
                    Number
                  </span>
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-200 uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <div className="p-1 bg-cyan-500/20 rounded">
                      <FaTag className="text-cyan-400 text-xs" />
                    </div>
                    Team Code
                  </span>
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-200 uppercase tracking-wider">First Name</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-200 uppercase tracking-wider">Last Name</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-200 uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <div className="p-1 bg-cyan-500/20 rounded">
                      <FaEye className="text-cyan-400 text-xs" />
                    </div>
                    Preview
                  </span>
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-200 uppercase tracking-wider">Status</th>
                {isAuthenticated && (
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-200 uppercase tracking-wider whitespace-nowrap" style={{ width: '1%' }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <tr
                  key={player.id}
                  className={`border-b border-gray-700/30 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 transition-all duration-200 ${
                    !player.valid ? "bg-red-900/10 border-red-500/20" : index % 2 === 0 ? "bg-gray-800/20" : "bg-gray-800/10"
                  } animate-slide-up group`}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  {editingId === player.id ? (
                    <>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={editValues.player_number || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow numbers and letters (up to 3 characters for flexibility)
                            // Supports: single letters (A-Z), single digit (0-9), or multi-digit numbers (10, 99, etc.)
                            if (value === "" || /^[0-9A-Za-z]{1,3}$/.test(value)) {
                              setEditValues({
                                ...editValues,
                                player_number: value,
                              });
                            }
                          }}
                          maxLength={3}
                          className="w-20 px-3 py-2 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 text-gray-200 font-semibold text-center transition-all duration-200"
                          placeholder="7, 10, or A"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={teamCode}
                          readOnly
                          className="w-20 px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-gray-400 font-semibold uppercase text-center"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={editValues.first_name || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Auto-capitalizacija prve riječi dok korisnik unosi
                            setEditValues({
                              ...editValues,
                              first_name: value,
                            });
                          }}
                          onBlur={(e) => {
                            // Capitaliziraj sve riječi kada korisnik završi unos
                            const capitalized = capitalizeWords(e.target.value);
                            setEditValues({
                              ...editValues,
                              first_name: capitalized,
                            });
                          }}
                          className="w-full px-3 py-2 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 text-gray-200 transition-all duration-200"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={editValues.last_name || ""}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              last_name: e.target.value.toUpperCase(), // Automatski konvertuj u uppercase
                            })
                          }
                          className="w-full px-3 py-2 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 text-gray-200 font-semibold uppercase transition-all duration-200"
                        />
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400 font-mono bg-gray-900/30 rounded-lg px-3 py-2">
                        {editValues.player_number && teamCode
                          ? `${teamCode}${editValues.player_number}\t${editValues.first_name || ""} ${editValues.last_name || ""} (${editValues.player_number})`
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-lg border border-green-500/30 w-fit">
                          <FaCheckCircle className="text-green-400 text-sm" />
                          <span className="text-xs text-green-300 font-medium hidden sm:inline">Valid</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveEdit(player.id)}
                            className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-1 shadow-lg hover:shadow-xl transform hover:scale-105 border border-green-400/30 font-semibold"
                          >
                            <FaCheck className="text-xs" />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-1 shadow-lg hover:shadow-xl transform hover:scale-105 border border-gray-400/30 font-semibold"
                          >
                            <FaTimes className="text-xs" />
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 font-semibold rounded-lg text-sm border border-cyan-500/30">
                          {player.player_number}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 font-semibold rounded-lg text-sm border border-purple-500/30 uppercase">
                          {teamCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-200">{player.first_name}</td>
                      <td className="py-3 px-4 font-semibold text-gray-100 uppercase">{player.last_name}</td>
                      <td className="py-3 px-4 text-xs text-gray-400 font-mono bg-gray-900/30 rounded px-2 py-1">
                        {getPreview(player)}
                      </td>
                      <td className="py-3 px-4">
                        {player.valid ? (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-lg border border-green-500/30 w-fit">
                            <FaCheckCircle className="text-green-400 text-sm" />
                            <span className="text-xs text-green-300 font-medium hidden sm:inline">Valid</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-lg border border-red-500/30 w-fit">
                            <FaExclamationCircle className="text-red-400 text-sm" />
                            <span className="text-xs text-red-300 font-medium hidden sm:inline">Invalid</span>
                          </div>
                        )}
                      </td>
                      {isAuthenticated && (
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => startEdit(player)}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-1 shadow-lg hover:shadow-xl transform hover:scale-105 border border-blue-400/30"
                            >
                              <FaEdit className="text-xs" />
                              Edit
                            </button>
                            <button
                              onClick={() => onDeletePlayer(player.id)}
                              className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-1 shadow-lg hover:shadow-xl transform hover:scale-105 border border-red-400/30"
                            >
                              <FaTrash className="text-xs" />
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}
