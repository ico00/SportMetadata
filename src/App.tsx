import { useState, useEffect, useRef } from "react";
import { Sport, Match, Team, Player } from "./types";
import { parsePlayerText } from "./utils/parser";
import { 
  loadSports, saveSports, deleteSport,
  loadMatches, saveMatches, deleteMatch,
  loadTeams, saveTeams, deleteTeam,
  loadPlayers, savePlayers 
} from "./utils/storage";
import { exportToTxt } from "./utils/export";
import InputSection from "./components/InputSection";
import PlayersTable from "./components/PlayersTable";
import ExportPanel from "./components/ExportPanel";
import StockAgenciesPanel from "./components/StockAgenciesPanel";
import DatePicker from "./components/DatePicker";
import AdminLogin from "./components/AdminLogin";
import { useAuth } from "./context/AuthContext";
import { 
  FaFutbol, FaPlus, FaTrash, 
  FaCalendarAlt, FaMapMarkerAlt, FaFlag, FaFileAlt,
  FaUsers, FaTag, FaBuilding, FaSignOutAlt
} from "react-icons/fa";

function App() {
  const { isAuthenticated, logout } = useAuth();
  const [sports, setSports] = useState<Sport[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  
  const [currentSport, setCurrentSport] = useState<Sport | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamCode, setTeamCode] = useState("");

  // Load initial data
  useEffect(() => {
    console.log('🔄 Loading initial data...');
    loadSports()
      .then((data) => {
        console.log('✅ Loaded sports:', data);
        setSports(data);
      })
      .catch((error) => {
        console.error('❌ Error loading sports:', error);
      });
    
    loadMatches()
      .then((data) => {
        console.log('✅ Loaded matches:', data);
        setMatches(data);
      })
      .catch((error) => {
        console.error('❌ Error loading matches:', error);
      });
    
    loadTeams()
      .then((data) => {
        console.log('✅ Loaded teams:', data);
        setTeams(data);
      })
      .catch((error) => {
        console.error('❌ Error loading teams:', error);
      });
  }, []);

  // Filter matches by sport
  useEffect(() => {
    if (currentSport) {
      const sportMatches = matches.filter(m => m.sport_id === currentSport.id);
      if (sportMatches.length > 0 && !currentMatch) {
        setCurrentMatch(sportMatches[0]);
      } else if (sportMatches.length === 0) {
        setCurrentMatch(null);
      }
    } else {
      setCurrentMatch(null);
    }
  }, [currentSport, matches]);

  // Filter teams by match
  useEffect(() => {
    if (currentMatch) {
      const matchTeams = teams.filter(t => t.match_id === currentMatch.id);
      if (matchTeams.length > 0 && !currentTeam) {
        setCurrentTeam(matchTeams[0]);
      } else if (matchTeams.length === 0) {
        setCurrentTeam(null);
      }
    } else {
      setCurrentTeam(null);
    }
  }, [currentMatch, teams]);

  // Store previous team to save before switching
  const prevTeamRef = useRef<Team | null>(null);
  const prevPlayersRef = useRef<Player[]>([]);

  // Load players when team changes
  useEffect(() => {
    // Save previous team's players before switching
    if (prevTeamRef.current && prevPlayersRef.current.length > 0) {
      savePlayers(prevTeamRef.current.id, prevPlayersRef.current);
    }

    if (currentTeam) {
      loadPlayers(currentTeam.id).then((loadedPlayers) => {
        setPlayers(loadedPlayers);
        prevPlayersRef.current = loadedPlayers;
      });
      setTeamCode(currentTeam.team_code);
      prevTeamRef.current = currentTeam;
    } else {
      setPlayers([]);
      setTeamCode("");
      prevPlayersRef.current = [];
      prevTeamRef.current = null;
    }
  }, [currentTeam]);

  // Update ref when players change
  useEffect(() => {
    if (currentTeam) {
      prevPlayersRef.current = players;
    }
  }, [players, currentTeam]);

  // Autosave players (backup, but immediate saves are handled in handlers)
  useEffect(() => {
    if (currentTeam && players.length > 0) {
      const timeoutId = setTimeout(() => {
        savePlayers(currentTeam.id, players);
        prevPlayersRef.current = players;
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [players, currentTeam]);

  // Sport handlers
  const handleCreateSport = () => {
    const newSport: Sport = {
      id: Date.now().toString(),
      name: "New Sport",
      created_at: new Date().toISOString(),
    };
    const updatedSports = [...sports, newSport];
    setSports(updatedSports);
    saveSports(updatedSports);
    setCurrentSport(newSport);
  };

  const handleUpdateSport = (updatedSport: Sport) => {
    const updatedSports = sports.map((s) =>
      s.id === updatedSport.id ? updatedSport : s
    );
    setSports(updatedSports);
    saveSports(updatedSports);
    setCurrentSport(updatedSport);
  };

  const handleDeleteSport = async (sportId: string) => {
    const sport = sports.find((s) => s.id === sportId);
    if (!sport) return;

    if (!window.confirm(`Are you sure you want to delete sport "${sport.name}"?\n\nThis action will delete the sport, all matches and all teams.`)) {
      return;
    }

    try {
      await deleteSport(sportId);
      const updatedSports = sports.filter((s) => s.id !== sportId);
      setSports(updatedSports);
      saveSports(updatedSports);

      if (currentSport?.id === sportId) {
        setCurrentSport(null);
      }
      alert("Sport deleted successfully!");
    } catch (error) {
      alert(`Error deleting sport: ${error}`);
    }
  };

  // Match handlers
  const handleCreateMatch = () => {
    if (!currentSport) {
      alert("Please select a sport first!");
      return;
    }
    const newMatch: Match = {
      id: Date.now().toString(),
      sport_id: currentSport.id,
      date: new Date().toISOString().split('T')[0],
      city: "",
      country: "",
      venue: "",
      description: "",
      created_at: new Date().toISOString(),
    };
    const updatedMatches = [...matches, newMatch];
    setMatches(updatedMatches);
    saveMatches(updatedMatches);
    setCurrentMatch(newMatch);
  };

  const handleUpdateMatch = (updatedMatch: Match) => {
    const updatedMatches = matches.map((m) =>
      m.id === updatedMatch.id ? updatedMatch : m
    );
    setMatches(updatedMatches);
    saveMatches(updatedMatches);
    setCurrentMatch(updatedMatch);
  };

  const handleDeleteMatch = async (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    if (!window.confirm(`Are you sure you want to delete this match?\n\nThis action will delete the match and all associated teams.`)) {
      return;
    }

    try {
      await deleteMatch(matchId);
      const updatedMatches = matches.filter((m) => m.id !== matchId);
      setMatches(updatedMatches);
      saveMatches(updatedMatches);

      if (currentMatch?.id === matchId) {
        setCurrentMatch(null);
      }
      alert("Match deleted successfully!");
    } catch (error) {
      alert(`Error deleting match: ${error}`);
    }
  };

  // Team handlers
  const handleCreateTeam = () => {
    if (!currentMatch) {
      alert("Please select a match first!");
      return;
    }
    const newTeam: Team = {
      id: Date.now().toString(),
      match_id: currentMatch.id,
      name: "New Team",
      team_code: "",
      created_at: new Date().toISOString(),
    };
    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    saveTeams(updatedTeams);
    setCurrentTeam(newTeam);
  };

  const handleUpdateTeam = (updatedTeam: Team) => {
    const updatedTeams = teams.map((t) =>
      t.id === updatedTeam.id ? updatedTeam : t
    );
    setTeams(updatedTeams);
    saveTeams(updatedTeams);
    setCurrentTeam(updatedTeam);
    setTeamCode(updatedTeam.team_code);
  };

  const handleDeleteTeam = async (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    if (!window.confirm(`Are you sure you want to delete team "${team.name}"?\n\nThis action will delete the team and all associated players.`)) {
      return;
    }

    try {
      await deleteTeam(teamId);
      const updatedTeams = teams.filter((t) => t.id !== teamId);
      setTeams(updatedTeams);
      saveTeams(updatedTeams);

      if (currentTeam?.id === teamId) {
        setCurrentTeam(null);
        setPlayers([]);
        setTeamCode("");
      }
      alert("Team deleted successfully!");
    } catch (error) {
      alert(`Error deleting team: ${error}`);
    }
  };

  // Player handlers
  // Function to capitalize names (each word starts with uppercase)
  const capitalizeWords = (str: string): string => {
    return str
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleParseText = async (text: string) => {
    if (!currentTeam) {
      alert("Please select a team first!");
      return;
    }
    
    const parsed = parsePlayerText(text);
    const newPlayers: Player[] = parsed.map((p, index) => ({
      id: `${Date.now()}-${index}`,
      ...p,
      first_name: capitalizeWords(p.first_name), // Capitalize first name
      last_name: p.last_name.toUpperCase(), // Ensure last name is uppercase
      team_code: teamCode,
    }));
    const updatedPlayers = [...players, ...newPlayers];
    setPlayers(updatedPlayers);
    
    // Save immediately after adding players
    await savePlayers(currentTeam.id, updatedPlayers);
  };

  const handleUpdatePlayer = async (updatedPlayer: Player) => {
    if (!currentTeam) return;
    
    // Ensure first name is capitalized and last name is uppercase
    const normalizedPlayer = {
      ...updatedPlayer,
      first_name: capitalizeWords(updatedPlayer.first_name),
      last_name: updatedPlayer.last_name.toUpperCase(),
    };
    const updatedPlayers = players.map((p) => (p.id === normalizedPlayer.id ? normalizedPlayer : p));
    setPlayers(updatedPlayers);
    
    // Save immediately after update
    await savePlayers(currentTeam.id, updatedPlayers);
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!currentTeam) return;
    
    const updatedPlayers = players.filter((p) => p.id !== playerId);
    setPlayers(updatedPlayers);
    
    // Save immediately after delete
    await savePlayers(currentTeam.id, updatedPlayers);
  };

  const handleSwapNames = async () => {
    if (!currentTeam) return;
    
    const swappedPlayers = players.map((player) => ({
      ...player,
      first_name: capitalizeWords(player.last_name.toLowerCase()),
      last_name: player.first_name.toUpperCase(),
    }));
    setPlayers(swappedPlayers);
    
    // Save immediately after swap
    await savePlayers(currentTeam.id, swappedPlayers);
  };

  // Funkcija za uklanjanje dijakritika
  const removeDiacritics = (str: string): string => {
    return str
      .replace(/dž/g, "dz") // Prvo dž jer je duplo slovo
      .replace(/Dž/g, "Dz")
      .replace(/DŽ/g, "DZ")
      .replace(/đ/g, "dj") // đ → dj
      .replace(/Đ/g, "Dj")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Ukloni ostale dijakritike
      .replace(/ć/g, "c")
      .replace(/Ć/g, "C")
      .replace(/č/g, "c")
      .replace(/Č/g, "C")
      .replace(/š/g, "s")
      .replace(/Š/g, "S")
      .replace(/ž/g, "z")
      .replace(/Ž/g, "Z");
  };

  const handleCleanNames = async () => {
    if (!currentTeam) return;
    
    const cleanedPlayers = players.map((player) => ({
      ...player,
      first_name: capitalizeWords(removeDiacritics(player.first_name)),
      last_name: removeDiacritics(player.last_name).toUpperCase(),
    }));
    setPlayers(cleanedPlayers);
    
    // Save immediately after clean
    await savePlayers(currentTeam.id, cleanedPlayers);
  };

  const handleExport = async () => {
    if (!currentMatch) {
      alert("Please select a match before exporting!");
      return;
    }

    if (!currentSport) {
      alert("Please select a sport before exporting!");
      return;
    }

    // Load players for all teams from the match
    const teamsWithPlayers = await Promise.all(
      currentMatchTeams.map(async (team) => {
        const teamPlayers = await loadPlayers(team.id);
        return { team, players: teamPlayers };
      })
    );

    // Check if all teams have team code
    const teamsWithoutCode = teamsWithPlayers.filter(
      ({ team }) => !team.team_code
    );
    if (teamsWithoutCode.length > 0) {
      alert(
        `Please enter team code for all teams!\n\nTeams without code: ${teamsWithoutCode.map((t) => t.team.name).join(", ")}`
      );
      return;
    }

    // Check if there are valid players
    const totalValidPlayers = teamsWithPlayers.reduce(
      (sum, { players }) => sum + players.filter((p) => p.valid).length,
      0
    );
    if (totalValidPlayers === 0) {
      alert("No valid players for export!");
      return;
    }

    try {
      await exportToTxt(currentSport, currentMatch, teamsWithPlayers);
      alert(`File exported successfully! (${totalValidPlayers} players from ${teamsWithPlayers.length} teams)`);
    } catch (error) {
      alert(`Export error: ${error}`);
    }
  };

  const currentSportMatches = currentSport 
    ? matches.filter(m => m.sport_id === currentSport.id)
    : [];
  
  const currentMatchTeams = currentMatch
    ? teams.filter(t => t.match_id === currentMatch.id)
    : [];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <FaFutbol className="text-3xl text-blue-400 animate-bounce-subtle" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Photo Mechanic Team TXT Generator
            </h1>
          </div>
          {isAuthenticated && (
            <button
              onClick={logout}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <FaSignOutAlt className="text-sm" />
              Logout
            </button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Admin Login */}
        {!isAuthenticated && <AdminLogin />}
        
        {/* Sport Selection */}
        <div className="bg-gray-800 rounded-lg p-4 shadow-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaFutbol className="text-xl text-blue-400" />
              <h2 className="text-xl font-semibold">Sport</h2>
            </div>
            {isAuthenticated && (
              <button
                onClick={handleCreateSport}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FaPlus className="text-sm" />
                New Sport
              </button>
            )}
          </div>

          {currentSport && (
            <div className="space-y-3 mb-4 animate-fade-in">
              <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
                  <FaFutbol className="text-blue-400" />
                  {currentSport.name}
                </h3>
                {isAuthenticated && (
                  <button
                    onClick={() => handleDeleteSport(currentSport.id)}
                    className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <FaTrash className="text-xs" />
                    Delete
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sport Name</label>
                <input
                  type="text"
                  value={currentSport.name}
                  onChange={(e) =>
                    handleUpdateSport({ ...currentSport, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {sports.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Sport</label>
              <select
                value={currentSport?.id || ""}
                onChange={(e) => {
                  const sport = sports.find((s) => s.id === e.target.value);
                  setCurrentSport(sport || null);
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Sport --</option>
                {sports.map((sport) => (
                  <option key={sport.id} value={sport.id}>
                    {sport.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Match Selection */}
        {currentSport && (
          <div className="bg-gray-800 rounded-lg p-4 shadow-xl border border-gray-700 hover:border-green-500/50 transition-all duration-300 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-xl text-green-400" />
                <h2 className="text-xl font-semibold">Match</h2>
              </div>
              {isAuthenticated && (
                <button
                  onClick={handleCreateMatch}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <FaPlus className="text-sm" />
                  New Match
                </button>
              )}
            </div>

            {currentMatch && (
              <div className="space-y-3 mb-4 animate-fade-in">
                <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                  <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                    <FaFileAlt className="text-green-400" />
                    {currentMatch.description || "New match"}
                  </h3>
                  {isAuthenticated && (
                    <button
                      onClick={() => handleDeleteMatch(currentMatch.id)}
                      className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <FaTrash className="text-xs" />
                      Delete
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-400" />
                      Date
                    </label>
                    <DatePicker
                      value={currentMatch.date}
                      onChange={(date) =>
                        handleUpdateMatch({ ...currentMatch, date })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400" />
                      City
                    </label>
                    <input
                      type="text"
                      value={currentMatch.city || ""}
                      onChange={(e) =>
                        handleUpdateMatch({ ...currentMatch, city: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      placeholder="e.g. Zagreb"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      <FaFlag className="text-gray-400" />
                      Country
                    </label>
                    <input
                      type="text"
                      value={currentMatch.country || ""}
                      onChange={(e) =>
                        handleUpdateMatch({ ...currentMatch, country: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      placeholder="e.g. Croatia"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      <FaBuilding className="text-gray-400" />
                      Venue
                    </label>
                    <input
                      type="text"
                      value={currentMatch.venue || ""}
                      onChange={(e) =>
                        handleUpdateMatch({ ...currentMatch, venue: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      placeholder="e.g. Arena Zagreb"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                    <FaFileAlt className="text-gray-400" />
                    Description
                  </label>
                  <input
                    type="text"
                    value={currentMatch.description}
                    onChange={(e) =>
                      handleUpdateMatch({ ...currentMatch, description: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder="e.g. Final, Semi-final, etc."
                  />
                </div>
              </div>
            )}

            {currentSportMatches.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Select Match</label>
                <select
                  value={currentMatch?.id || ""}
                  onChange={(e) => {
                    const match = currentSportMatches.find((m) => m.id === e.target.value);
                    setCurrentMatch(match || null);
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Match --</option>
                  {currentSportMatches.map((match) => (
                    <option key={match.id} value={match.id}>
                      {match.date} - {match.description || "No description"}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Team Selection */}
        {currentMatch && (
          <div className="bg-gray-800 rounded-lg p-4 shadow-xl border border-gray-700 hover:border-yellow-500/50 transition-all duration-300 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaUsers className="text-xl text-yellow-400" />
                <h2 className="text-xl font-semibold">Team</h2>
              </div>
              {isAuthenticated && (
                <button
                  onClick={handleCreateTeam}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <FaPlus className="text-sm" />
                  New Team
                </button>
              )}
            </div>

            {currentTeam && (
              <div className="space-y-3 mb-4 animate-fade-in">
                <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                  <h3 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
                    <FaUsers className="text-yellow-400" />
                    {currentTeam.name}
                  </h3>
                  {isAuthenticated && (
                    <button
                      onClick={() => handleDeleteTeam(currentTeam.id)}
                      className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <FaTrash className="text-xs" />
                      Delete
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      <FaUsers className="text-gray-400" />
                      Team Name
                    </label>
                    <input
                      type="text"
                      value={currentTeam.name}
                      onChange={(e) =>
                        handleUpdateTeam({ ...currentTeam, name: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      <FaTag className="text-gray-400" />
                      Team Code
                    </label>
                    <input
                      type="text"
                      value={teamCode}
                      onChange={(e) => {
                        setTeamCode(e.target.value);
                        handleUpdateTeam({ ...currentTeam, team_code: e.target.value });
                      }}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all uppercase"
                      placeholder="e.g. HRV, USA, etc."
                    />
                  </div>
                </div>
              </div>
            )}

            {currentMatchTeams.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Select Team</label>
                <select
                  value={currentTeam?.id || ""}
                  onChange={(e) => {
                    const team = currentMatchTeams.find((t) => t.id === e.target.value);
                    setCurrentTeam(team || null);
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Team --</option>
                  {currentMatchTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.team_code})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Stock Agencies Section */}
        {currentMatch && (
          <StockAgenciesPanel match={currentMatch} teams={currentMatchTeams} />
        )}

        {/* Players Section */}
        {currentTeam && (
          <>
            <InputSection onParseText={handleParseText} />
            <PlayersTable
              players={players}
              teamCode={teamCode}
              onUpdatePlayer={handleUpdatePlayer}
              onDeletePlayer={handleDeletePlayer}
              onSwapNames={handleSwapNames}
              onCleanNames={handleCleanNames}
            />
            <ExportPanel
              players={players}
              teamCode={teamCode}
              allTeams={currentMatchTeams}
              onExport={handleExport}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
