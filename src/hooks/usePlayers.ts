import { useState, useEffect, useRef } from 'react';
import { Player, Team } from '../types';
import { parsePlayerText } from '../utils/parser';
import { loadPlayers, savePlayers } from '../utils/storage';
import { capitalizeWords, removeDiacritics } from '../utils/stringUtils';
import { useToast } from './useToast';
import { TIMEOUT } from '../constants';

interface UsePlayersProps {
  currentTeam: Team | null;
  teamCode: string;
}

export function usePlayers({ currentTeam, teamCode }: UsePlayersProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const toast = useToast();
  
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
      prevTeamRef.current = currentTeam;
    } else {
      setPlayers([]);
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
      }, TIMEOUT.AUTOSAVE_DELAY);
      return () => clearTimeout(timeoutId);
    }
  }, [players, currentTeam]);

  const handleParseText = async (text: string) => {
    if (!currentTeam) {
      toast.showError("Please select a team first!");
      return;
    }
    
    const parsed = parsePlayerText(text);
    const newPlayers: Player[] = parsed.map((p, index) => ({
      id: `${Date.now()}-${index}`,
      ...p,
      first_name: capitalizeWords(p.first_name),
      last_name: p.last_name.toUpperCase(),
      team_code: teamCode,
    }));
    const updatedPlayers = [...players, ...newPlayers];
    setPlayers(updatedPlayers);
    
    // Save immediately after adding players
    await savePlayers(currentTeam.id, updatedPlayers);
  };

  const handleUpdatePlayer = async (updatedPlayer: Player) => {
    if (!currentTeam) return;
    
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

  return {
    players,
    setPlayers,
    handleParseText,
    handleUpdatePlayer,
    handleDeletePlayer,
    handleSwapNames,
    handleCleanNames,
  };
}
