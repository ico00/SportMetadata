import { useState } from "react";
import { Player } from "../types";

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
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Players ({players.length})
        </h2>
        {players.length > 0 && (
          <div className="flex space-x-2">
            {onCleanNames && (
              <button
                onClick={onCleanNames}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-sm"
                title="Remove all diacritics (č, ć, ž, š, đ and others) from names"
              >
                🧹 Clean Characters
              </button>
            )}
            {onSwapNames && (
              <button
                onClick={onSwapNames}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm"
                title="Swap first name and last name for all players"
              >
                🔄 Swap Name/Last Name
              </button>
            )}
          </div>
        )}
      </div>

      {players.length === 0 ? (
        <p className="text-gray-400">No players. Add players using the input above.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3">Number</th>
                <th className="text-left py-2 px-3">Team Code</th>
                <th className="text-left py-2 px-3">First Name</th>
                <th className="text-left py-2 px-3">Last Name</th>
                <th className="text-left py-2 px-3">Preview</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-left py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player) => (
                <tr
                  key={player.id}
                  className={`border-b border-gray-700 ${
                    !player.valid ? "bg-red-900/20" : ""
                  }`}
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
                        <span className="text-green-400">✓</span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveEdit(player.id)}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
                          >
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
                          <span className="text-green-400">✓</span>
                        ) : (
                          <span className="text-red-400">✗</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(player)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeletePlayer(player.id)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                          >
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
