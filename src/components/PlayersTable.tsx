import { useState } from "react";
import { Player } from "../types";
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

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-xl border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaUser className="text-xl text-cyan-400" />
          <h2 className="text-xl font-semibold">
            Players <span className="text-cyan-400">({players.length})</span>
          </h2>
        </div>
        {players.length > 0 && (
          <div className="flex space-x-2">
            {onCleanNames && (
              <button
                onClick={onCleanNames}
                className="px-3 py-1.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                title="Remove all diacritics (č, ć, ž, š, đ and others) from names"
              >
                <FaBroom className="text-xs" />
                Clean Characters
              </button>
            )}
            {onSwapNames && (
              <button
                onClick={onSwapNames}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                title="Swap first name and last name for all players"
              >
                <FaExchangeAlt className="text-xs" />
                Swap Name/Last Name
              </button>
            )}
          </div>
        )}
      </div>

      {players.length === 0 ? (
        <div className="text-center py-8 animate-fade-in">
          <FaUser className="text-4xl text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No players. Add players using the input above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="border-collapse" style={{ width: '100%', tableLayout: 'auto' }}>
            <thead>
              <tr className="border-b border-gray-700 bg-gray-700/50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  <span className="flex items-center gap-2">
                    <FaHashtag className="text-gray-400" />
                    Number
                  </span>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  <span className="flex items-center gap-2">
                    <FaTag className="text-gray-400" />
                    Team Code
                  </span>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">First Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Last Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  <span className="flex items-center gap-2">
                    <FaEye className="text-gray-400" />
                    Preview
                  </span>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300 whitespace-nowrap" style={{ width: '1%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <tr
                  key={player.id}
                  className={`border-b border-gray-700 hover:bg-gray-700/30 transition-colors duration-150 ${
                    !player.valid ? "bg-red-900/20" : ""
                  } animate-slide-up`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {editingId === player.id ? (
                    <>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={editValues.player_number || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow numbers and letters (single character)
                            if (value === "" || /^[0-9A-Za-z]$/.test(value)) {
                              setEditValues({
                                ...editValues,
                                player_number: value,
                              });
                            }
                          }}
                          className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="7 or A"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={teamCode}
                          readOnly
                          className="w-20 px-2 py-1 bg-gray-600 border border-gray-500 rounded"
                        />
                      </td>
                      <td className="py-2 px-3">
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
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={editValues.last_name || ""}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              last_name: e.target.value.toUpperCase(), // Automatski konvertuj u uppercase
                            })
                          }
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ textTransform: 'uppercase' }}
                        />
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-400 font-mono">
                        {editValues.player_number && teamCode
                          ? `${teamCode}${editValues.player_number}\t${editValues.first_name || ""} ${editValues.last_name || ""} (${editValues.player_number})`
                          : "-"}
                      </td>
                      <td className="py-2 px-3">
                        <FaCheckCircle className="text-green-400 inline" />
                      </td>
                      <td className="py-2 px-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveEdit(player.id)}
                            className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded transition-all duration-200 text-sm flex items-center gap-1 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <FaCheck className="text-xs" />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 rounded transition-all duration-200 text-sm flex items-center gap-1 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <FaTimes className="text-xs" />
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 px-3">{player.player_number}</td>
                      <td className="py-2 px-3">{teamCode}</td>
                      <td className="py-2 px-3">{player.first_name}</td>
                      <td className="py-2 px-3">{player.last_name}</td>
                      <td className="py-2 px-3 text-xs text-gray-400 font-mono">
                        {getPreview(player)}
                      </td>
                      <td className="py-2 px-3">
                        {player.valid ? (
                          <FaCheckCircle className="text-green-400 inline" />
                        ) : (
                          <FaExclamationCircle className="text-red-400 inline" />
                        )}
                      </td>
                      <td className="py-2 px-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(player)}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded transition-all duration-200 text-sm flex items-center gap-1 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <FaEdit className="text-xs" />
                            Edit
                          </button>
                          <button
                            onClick={() => onDeletePlayer(player.id)}
                            className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded transition-all duration-200 text-sm flex items-center gap-1 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <FaTrash className="text-xs" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
