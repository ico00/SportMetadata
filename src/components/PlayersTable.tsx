import { useState } from "react";
import { Player } from "../types";
import { useAuth } from "../context/AuthContext";
import { capitalizeWords } from "../utils/stringUtils";
import { sortPlayerNumber } from "../utils/sortUtils";
import { PLAYER_CONSTRAINTS } from "../constants";
import { 
  FaUser, FaEdit, FaTrash, FaCheck, FaTimes, 
  FaBroom, FaExchangeAlt, FaHashtag, FaTag, 
  FaEye, FaCheckCircle, FaExclamationCircle, FaSearch, FaFilter
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"all" | "valid" | "invalid">("all");

  const startEdit = (player: Player) => {
    setEditingId(player.id);
    setEditValues({
      player_number: player.player_number,
      first_name: player.first_name,
      last_name: player.last_name,
    });
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
    const namePart = player.first_name?.trim() 
      ? `${player.first_name} ${player.last_name}`
      : player.last_name;
    return `${teamCode}${player.player_number}\t${namePart} (${player.player_number})`;
  };


  // Filter and search logic
  const filteredPlayers = players.filter((player) => {
    // Status filter
    if (filterStatus === "valid" && !player.valid) return false;
    if (filterStatus === "invalid" && player.valid) return false;

    // Search query filter
    if (searchQuery.trim() === "") return true;

    const query = searchQuery.toLowerCase().trim();
    const searchFields = [
      player.player_number.toLowerCase(),
      player.first_name.toLowerCase(),
      player.last_name.toLowerCase(),
      `${player.first_name} ${player.last_name}`.toLowerCase(),
    ];

    return searchFields.some(field => field.includes(query));
  });

  const sortedPlayers = [...filteredPlayers].sort(
    (a, b) => sortPlayerNumber(a.player_number, b.player_number)
  );

  const validPlayersCount = players.filter(p => p.valid).length;
  const invalidPlayersCount = players.filter(p => !p.valid).length;
  const validPercentage = players.length > 0 ? (validPlayersCount / players.length) * 100 : 0;
  const filteredCount = filteredPlayers.length;

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
                  aria-label="Remove all diacritics from player names"
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
                  aria-label="Swap first name and last name for all players"
                >
                  <FaExchangeAlt className="text-xs" />
                  Swap Name/Last Name
                </button>
              )}
            </div>
          )}
        </div>

        {players.length > 0 && (
          <>
            {/* Search and Filter Section */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400 text-sm" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or number..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gradient-to-r from-gray-700/80 to-gray-700/60 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 text-gray-200 placeholder-gray-400 transition-all duration-200"
                  aria-label="Search players by name or number"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                    aria-label="Clear search"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                )}
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <FaFilter className="text-gray-400 text-sm" />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as "all" | "valid" | "invalid")}
                  className="pl-10 pr-8 py-2.5 bg-gradient-to-r from-gray-700/80 to-gray-700/60 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 text-gray-200 appearance-none cursor-pointer transition-all duration-200"
                  aria-label="Filter players by status"
                >
                  <option value="all">All Players</option>
                  <option value="valid">Valid Only</option>
                  <option value="invalid">Invalid Only</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            {(searchQuery || filterStatus !== "all") && (
              <div className="mb-4 text-sm text-gray-400">
                Showing {filteredCount} of {players.length} player{players.length !== 1 ? 's' : ''}
              </div>
            )}

            {/* Validation Status Bar */}
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
          </>
        )}

      {players.length === 0 ? (
        <div className="text-center py-12 animate-fade-in">
          <div className="p-4 bg-gray-700/30 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <FaUser className="text-4xl text-gray-500" />
          </div>
          <p className="text-gray-400 text-lg">No players yet</p>
          <p className="text-gray-500 text-sm mt-1">Add players using the input above</p>
        </div>
      ) : sortedPlayers.length === 0 ? (
        <div className="text-center py-12 animate-fade-in">
          <div className="p-4 bg-gray-700/30 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <FaSearch className="text-4xl text-gray-500" />
          </div>
          <p className="text-gray-400 text-lg">No players match your search</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filter</p>
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
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              cancelEdit();
                            } else if (e.key === 'Enter' && e.ctrlKey) {
                              saveEdit(player.id);
                            }
                          }}
                          maxLength={PLAYER_CONSTRAINTS.MAX_NUMBER_LENGTH}
                          className="w-20 px-3 py-2 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 text-gray-200 font-semibold text-center transition-all duration-200"
                          placeholder="7, 10, or A"
                          aria-label="Player number"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={teamCode}
                          readOnly
                          className="w-20 px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-gray-400 font-semibold uppercase text-center"
                          aria-label="Team code (read-only)"
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
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              cancelEdit();
                            }
                          }}
                          className="w-full px-3 py-2 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 text-gray-200 transition-all duration-200"
                          aria-label="First name"
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
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              cancelEdit();
                            }
                          }}
                          className="w-full px-3 py-2 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 text-gray-200 font-semibold uppercase transition-all duration-200"
                          aria-label="Last name"
                        />
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400 font-mono bg-gray-900/30 rounded-lg px-3 py-2">
                        {editValues.player_number && teamCode
                          ? (() => {
                              const namePart = editValues.first_name?.trim()
                                ? `${editValues.first_name} ${editValues.last_name || ""}`
                                : (editValues.last_name || "");
                              return `${teamCode}${editValues.player_number}\t${namePart} (${editValues.player_number})`;
                            })()
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
                            aria-label={`Save changes for player ${player.first_name} ${player.last_name}`}
                          >
                            <FaCheck className="text-xs" />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-1 shadow-lg hover:shadow-xl transform hover:scale-105 border border-gray-400/30 font-semibold"
                            aria-label="Cancel editing player"
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
                              aria-label={`Edit player ${player.first_name} ${player.last_name}`}
                            >
                              <FaEdit className="text-xs" />
                              Edit
                            </button>
                            <button
                              onClick={() => onDeletePlayer(player.id)}
                              className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-1 shadow-lg hover:shadow-xl transform hover:scale-105 border border-red-400/30"
                              aria-label={`Delete player ${player.first_name} ${player.last_name}`}
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
