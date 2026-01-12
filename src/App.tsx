import { useState, useCallback, useRef, useEffect } from "react";
import { loadPlayers } from "./utils/storage";
import { exportToTxt } from "./utils/export";
import InputSection from "./components/InputSection";
import PlayersTable from "./components/PlayersTable";
import ExportPanel from "./components/ExportPanel";
import StockAgenciesPanel from "./components/StockAgenciesPanel";
import DatePicker from "./components/DatePicker";
import CustomSelect from "./components/CustomSelect";
import AdminLogin from "./components/AdminLogin";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./hooks/useToast";
import { useSports } from "./hooks/useSports";
import { useMatches } from "./hooks/useMatches";
import { useTeams } from "./hooks/useTeams";
import { usePlayers } from "./hooks/usePlayers";
import {
  FaFutbol, FaPlus, FaTrash,
  FaCalendarAlt, FaMapMarkerAlt, FaFlag, FaFileAlt,
  FaUsers, FaTag, FaBuilding, FaSignOutAlt, FaLock, FaUser, FaImage, FaTimes
} from "react-icons/fa";

function App() {
  const { isAuthenticated, logout, isLocalhost } = useAuth();
  const toast = useToast();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Use custom hooks for state management
  const {
    sports,
    currentSport,
    setCurrentSport,
    handleCreateSport,
    handleUpdateSport,
    handleDeleteSport,
  } = useSports();

  const {
    matches,
    currentMatch,
    setCurrentMatch,
    currentSportMatches,
    handleCreateMatch,
    handleUpdateMatch,
    handleDeleteMatch,
  } = useMatches({ currentSport });

  const {
    teams,
    currentTeam,
    setCurrentTeam,
    teamCode,
    setTeamCode,
    currentMatchTeams,
    handleCreateTeam,
    handleUpdateTeam,
    handleDeleteTeam,
  } = useTeams({ currentMatch });

  // Ref for currentTeam to use in async callbacks
  const currentTeamRef = useRef(currentTeam);
  
  // Update ref when currentTeam changes
  useEffect(() => {
    currentTeamRef.current = currentTeam;
  }, [currentTeam]);

  const {
    players,
    handleParseText,
    handleUpdatePlayer,
    handleDeletePlayer,
    handleSwapNames,
    handleCleanNames,
  } = usePlayers({ currentTeam, teamCode });

  const handleExport = useCallback(async () => {
    if (!currentMatch) {
      toast.showError("Please select a match before exporting!");
      return;
    }

    if (!currentSport) {
      toast.showError("Please select a sport before exporting!");
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
      toast.showError(
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
      toast.showError("No valid players for export!");
      return;
    }

    try {
      await exportToTxt(currentSport, currentMatch, teamsWithPlayers);
      toast.showSuccess(`File exported successfully! (${totalValidPlayers} players from ${teamsWithPlayers.length} teams)`);
    } catch (error) {
      toast.showError(`Export error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [currentMatch, currentSport, currentMatchTeams, toast]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gradient-to-r from-gray-800 via-gray-750 to-gray-700 border-b border-gray-600/50 px-6 py-5 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5"></div>
        <div className="relative z-10 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
              <FaFutbol className="text-3xl text-blue-400 animate-bounce-subtle" />
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-pulse-slow">
              Sport Metadata Generator
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {!isAuthenticated && !isLocalhost && (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 border border-gray-400/30 font-semibold"
                title="Admin Login"
              >
                <FaLock className="text-sm" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
            {isAuthenticated && (
              <button
                onClick={logout}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 border border-red-400/30 font-semibold"
              >
                <FaSignOutAlt className="text-sm" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            {isLocalhost && (
              <div className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl flex items-center gap-2 shadow-lg backdrop-blur-sm">
                <div className="p-1 bg-green-500/20 rounded-lg">
                  <FaLock className="text-sm text-green-400" />
                </div>
                <span className="text-sm text-green-400 font-bold hidden sm:inline">Admin Mode</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Admin Login Modal */}
        <AdminLogin isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        
        {/* Team Logo Modal */}
        {showLogoModal && currentTeam && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" 
            onClick={() => setShowLogoModal(false)}
          >
            <div 
              className="relative bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full mx-4 shadow-2xl animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowLogoModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
                aria-label="Close logo modal"
              >
                <FaTimes className="h-5 w-5" />
              </button>
              
              <div className="mb-4 flex items-center gap-2">
                <FaImage className="h-5 w-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-gray-100">Team Logo</h3>
              </div>
              
              <div className="space-y-4">
                {/* Logo Preview */}
                {currentTeam.logo && (
                  <div className="flex flex-col items-center">
                    <div className="w-48 h-48 flex items-center justify-center bg-gray-700/50 border border-gray-600 rounded-lg overflow-hidden">
                      <img
                        src={currentTeam.logo.startsWith('data:') ? currentTeam.logo : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(currentTeam.logo)}`}
                        alt={`${currentTeam.name} logo`}
                        className="w-full h-full object-contain p-4"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>';
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Current logo</p>
                  </div>
                )}
                
                {/* Upload Controls */}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/svg+xml,.svg"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (!file.type.includes('svg') && !file.name.endsWith('.svg')) {
                      toast.showError('Please select an SVG file!');
                      return;
                    }

                    try {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const svgContent = event.target?.result as string;
                        if (svgContent && currentTeamRef.current) {
                          const updatedTeam = { ...currentTeamRef.current, logo: svgContent };
                          console.log('🔍 Uploading logo, team ID:', updatedTeam.id, 'logo length:', svgContent.length);
                          handleUpdateTeam(updatedTeam);
                          toast.showSuccess('Logo uploaded successfully!');
                          setShowLogoModal(false);
                        }
                      };
                      reader.onerror = () => {
                        toast.showError('Error reading SVG file');
                      };
                      reader.readAsText(file);
                    } catch (error) {
                      toast.showError(`Error uploading logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    } finally {
                      if (logoInputRef.current) {
                        logoInputRef.current.value = '';
                      }
                    }
                  }}
                  className="hidden"
                  aria-label="Upload team logo SVG file"
                />
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 border border-blue-400/30"
                    aria-label="Upload team logo"
                  >
                    <FaImage className="text-xs" />
                    {currentTeam.logo ? 'Change Logo' : 'Upload Logo'}
                  </button>
                  {currentTeam.logo && (
                    <button
                      type="button"
                      onClick={() => {
                        if (currentTeamRef.current) {
                          handleUpdateTeam({ ...currentTeamRef.current, logo: undefined });
                          toast.showSuccess('Logo removed');
                          setShowLogoModal(false);
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 border border-gray-400/30"
                      aria-label="Remove team logo"
                    >
                      <FaTrash className="text-xs" />
                      Remove
                    </button>
                  )}
                </div>
                
                <p className="text-xs text-gray-400 text-center">Upload an SVG file for the team logo/emblem</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Statistics Overview */}
        {sports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl p-4 border border-blue-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-up backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FaFutbol className="text-2xl text-blue-400" />
                </div>
                <span className="text-3xl font-bold text-blue-400">{sports.length}</span>
              </div>
              <p className="text-sm text-gray-300 font-medium">Total Sports</p>
              <div className="mt-2 h-1 bg-blue-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-xl p-4 border border-green-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-up backdrop-blur-sm" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <FaCalendarAlt className="text-2xl text-green-400" />
                </div>
                <span className="text-3xl font-bold text-green-400">{matches.length}</span>
              </div>
              <p className="text-sm text-gray-300 font-medium">Total Matches</p>
              <div className="mt-2 h-1 bg-green-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: `${Math.min((matches.length / Math.max(sports.length, 1)) * 100, 100)}%` }}></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 rounded-xl p-4 border border-yellow-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-up backdrop-blur-sm" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <FaUsers className="text-2xl text-yellow-400" />
                </div>
                <span className="text-3xl font-bold text-yellow-400">{teams.length}</span>
              </div>
              <p className="text-sm text-gray-300 font-medium">Total Teams</p>
              <div className="mt-2 h-1 bg-yellow-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full" style={{ width: `${Math.min((teams.length / Math.max(matches.length, 1)) * 100, 100)}%` }}></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 rounded-xl p-4 border border-cyan-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-up backdrop-blur-sm" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <FaUser className="text-2xl text-cyan-400" />
                </div>
                <span className="text-3xl font-bold text-cyan-400">{players.length}</span>
              </div>
              <p className="text-sm text-gray-300 font-medium">Total Players</p>
              <div className="mt-2 h-1 bg-cyan-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full" style={{ width: `${Math.min((players.filter(p => p.valid).length / Math.max(players.length, 1)) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Sport Selection */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-6 shadow-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 animate-slide-up backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-transparent transition-all duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <FaFutbol className="text-2xl text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Sport</h2>
              </div>
              {isAuthenticated && (
                <button
                  onClick={handleCreateSport}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 border border-blue-400/30"
                  aria-label="Create new sport"
                >
                  <FaPlus className="text-sm" />
                  New Sport
                </button>
              )}
            </div>

          {currentSport && (
            <div className="space-y-3 mb-4 animate-fade-in">
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-900/30 to-blue-800/20 rounded-xl p-4 border border-blue-500/30 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <FaFutbol className="text-xl text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-400">{currentSport.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {currentSportMatches.length} {currentSportMatches.length === 1 ? 'match' : 'matches'}
                    </p>
                  </div>
                </div>
                {isAuthenticated && (
                  <button
                    onClick={() => handleDeleteSport(currentSport.id)}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 border border-red-400/30"
                    aria-label={`Delete sport ${currentSport.name}`}
                  >
                    <FaTrash className="text-xs" />
                    Delete
                  </button>
                )}
              </div>
              {isAuthenticated ? (
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
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-400">Sport Name</label>
                  <div className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300">
                    {currentSport.name}
                  </div>
                </div>
              )}
            </div>
          )}

          {sports.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Select Sport</label>
              <CustomSelect
                value={currentSport?.id || ""}
                onChange={(value) => {
                  const sport = sports.find((s) => s.id === value);
                  setCurrentSport(sport || null);
                }}
                options={sports.map((sport) => ({
                  value: sport.id,
                  label: sport.name,
                }))}
                placeholder="-- Select Sport --"
                focusColor="blue"
              />
            </div>
          )}
            </div>
          </div>

        {/* Match Selection */}
        {currentSport && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-6 shadow-2xl border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 animate-slide-up backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-transparent transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                    <FaCalendarAlt className="text-2xl text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Match</h2>
                </div>
                {isAuthenticated && (
                  <button
                    onClick={handleCreateMatch}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 border border-green-400/30"
                    aria-label="Create new match"
                  >
                    <FaPlus className="text-sm" />
                    New Match
                  </button>
                )}
              </div>

            {currentMatch && (
              <div className="space-y-4 mb-4 animate-fade-in">
                <div className="flex items-center justify-between bg-gradient-to-r from-green-900/30 to-green-800/20 rounded-xl p-4 border border-green-500/30 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <FaFileAlt className="text-xl text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-400">{currentMatch.description || "New match"}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        {currentMatch.date && <span className="flex items-center gap-1"><FaCalendarAlt className="text-green-400" /> {currentMatch.date}</span>}
                        {currentMatch.city && <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-green-400" /> {currentMatch.city}</span>}
                        {currentMatchTeams.length > 0 && <span className="flex items-center gap-1"><FaUsers className="text-green-400" /> {currentMatchTeams.length} teams</span>}
                      </div>
                    </div>
                  </div>
                  {isAuthenticated && (
                    <button
                      onClick={() => handleDeleteMatch(currentMatch.id)}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 border border-red-400/30"
                      aria-label={`Delete match ${currentMatch.description || currentMatch.date}`}
                    >
                      <FaTrash className="text-xs" />
                      Delete
                    </button>
                  )}
                </div>
                {isAuthenticated ? (
                  <>
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
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-2 text-gray-400">
                          <FaCalendarAlt className="text-gray-400" />
                          Date
                        </label>
                        <div className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300">
                          {currentMatch.date || "Not set"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-2 text-gray-400">
                          <FaMapMarkerAlt className="text-gray-400" />
                          City
                        </label>
                        <div className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300">
                          {currentMatch.city || "Not set"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-2 text-gray-400">
                          <FaFlag className="text-gray-400" />
                          Country
                        </label>
                        <div className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300">
                          {currentMatch.country || "Not set"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-2 text-gray-400">
                          <FaBuilding className="text-gray-400" />
                          Venue
                        </label>
                        <div className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300">
                          {currentMatch.venue || "Not set"}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center gap-2 text-gray-400">
                        <FaFileAlt className="text-gray-400" />
                        Description
                      </label>
                      <div className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300">
                        {currentMatch.description || "Not set"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentSportMatches.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Select Match</label>
                <CustomSelect
                  value={currentMatch?.id || ""}
                  onChange={(value) => {
                    const match = currentSportMatches.find((m) => m.id === value);
                    setCurrentMatch(match || null);
                  }}
                  options={currentSportMatches.map((match) => ({
                    value: match.id,
                    label: `${match.date} - ${match.description || "No description"}`,
                  }))}
                  placeholder="-- Select Match --"
                  focusColor="green"
                />
              </div>
            )}
            </div>
          </div>
        )}

        {/* Team Selection */}
        {currentMatch && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-6 shadow-2xl border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 animate-slide-up backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/5 group-hover:to-transparent transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-colors">
                    <FaUsers className="text-2xl text-yellow-400" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Team</h2>
                </div>
                {isAuthenticated && (
                    <button
                      onClick={handleCreateTeam}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 border border-yellow-400/30"
                      aria-label="Create new team"
                    >
                      <FaPlus className="text-sm" />
                      New Team
                    </button>
                )}
              </div>

            {currentTeam && (
              <div className="space-y-4 mb-4 animate-fade-in">
                <div className="flex items-center justify-between bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 rounded-xl p-4 border border-yellow-500/30 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    {/* Team Logo/Emblem */}
                    {isAuthenticated ? (
                      <button
                        type="button"
                        onClick={() => setShowLogoModal(true)}
                        className="relative w-16 h-16 flex items-center justify-center bg-yellow-500/20 rounded-lg border border-yellow-500/30 overflow-hidden hover:bg-yellow-500/30 transition-colors cursor-pointer"
                        aria-label="Change team logo"
                      >
                        {currentTeam.logo ? (
                          <img
                            src={currentTeam.logo.startsWith('data:') ? currentTeam.logo : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(currentTeam.logo)}`}
                            alt={`${currentTeam.name} logo`}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              // Fallback to default icon on error
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>';
                              }
                            }}
                          />
                        ) : (
                          <FaFlag className="text-2xl text-yellow-400" />
                        )}
                      </button>
                    ) : (
                      <div className="relative w-16 h-16 flex items-center justify-center bg-yellow-500/20 rounded-lg border border-yellow-500/30 overflow-hidden">
                        {currentTeam.logo ? (
                          <img
                            src={currentTeam.logo.startsWith('data:') ? currentTeam.logo : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(currentTeam.logo)}`}
                            alt={`${currentTeam.name} logo`}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              // Fallback to default icon on error
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>';
                              }
                            }}
                          />
                        ) : (
                          <FaFlag className="text-2xl text-yellow-400" />
                        )}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-yellow-400">{currentTeam.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        {teamCode && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs font-semibold rounded-lg border border-yellow-500/30">
                            Code: {teamCode}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FaUser className="text-yellow-400" /> {players.length} {players.length === 1 ? 'player' : 'players'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isAuthenticated && (
                    <button
                      onClick={() => handleDeleteTeam(currentTeam.id)}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 border border-red-400/30"
                      aria-label={`Delete team ${currentTeam.name}`}
                    >
                      <FaTrash className="text-xs" />
                      Delete
                    </button>
                  )}
                </div>
                {isAuthenticated ? (
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
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-2 text-gray-400">
                          <FaUsers className="text-gray-400" />
                          Team Name
                        </label>
                        <div className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300">
                          {currentTeam.name}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-2 text-gray-400">
                          <FaTag className="text-gray-400" />
                          Team Code
                        </label>
                        <div className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 uppercase">
                          {teamCode || "Not set"}
                        </div>
                      </div>
                    </div>
                    {currentTeam.logo && (
                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-2 text-gray-400">
                          <FaImage className="text-gray-400" />
                          Team Logo
                        </label>
                        <div className="w-20 h-20 flex items-center justify-center bg-gray-700/50 border border-gray-600 rounded-lg overflow-hidden">
                          <img
                            src={currentTeam.logo.startsWith('data:') ? currentTeam.logo : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(currentTeam.logo)}`}
                            alt={`${currentTeam.name} logo`}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>';
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentMatchTeams.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Select Team</label>
                <CustomSelect
                  value={currentTeam?.id || ""}
                  onChange={(value) => {
                    const team = currentMatchTeams.find((t) => t.id === value);
                    setCurrentTeam(team || null);
                  }}
                  options={currentMatchTeams.map((team) => ({
                    value: team.id,
                    label: `${team.name} (${team.team_code})`,
                  }))}
                  placeholder="-- Select Team --"
                  focusColor="yellow"
                />
              </div>
            )}
            </div>
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
              match={currentMatch}
              onExport={handleExport}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
