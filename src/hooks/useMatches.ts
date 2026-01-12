import { useState, useEffect } from 'react';
import { Match, Sport } from '../types';
import { loadMatches, saveMatches, deleteMatch } from '../utils/storage';
import { useToast } from './useToast';

interface UseMatchesProps {
  currentSport: Sport | null;
}

export function useMatches({ currentSport }: UseMatchesProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const toast = useToast();

  // Load matches on mount
  useEffect(() => {
    loadMatches()
      .then((data) => {
        setMatches(data);
      })
      .catch((error) => {
        console.error('❌ Error loading matches:', error);
        toast.showError('Error loading matches');
      });
  }, [toast]);

  // Filter matches by sport and auto-select first match
  useEffect(() => {
    if (currentSport) {
      const sportMatches = matches.filter(m => m.sport_id === currentSport.id);
      if (sportMatches.length > 0) {
        // Only auto-select if current match is not in the filtered list
        const isCurrentMatchValid = currentMatch && sportMatches.some(m => m.id === currentMatch.id);
        if (!isCurrentMatchValid) {
          setCurrentMatch(sportMatches[0]);
        }
      } else {
        setCurrentMatch(null);
      }
    } else {
      setCurrentMatch(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSport, matches]);

  const handleCreateMatch = () => {
    if (!currentSport) {
      toast.showError("Please select a sport first!");
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

    const confirmed = await toast.confirm(
      `Are you sure you want to delete this match?\n\nThis action will delete the match and all associated teams.`
    );
    if (!confirmed) {
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
      toast.showSuccess("Match deleted successfully!");
    } catch (error) {
      toast.showError(`Error deleting match: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const currentSportMatches = currentSport 
    ? matches.filter(m => m.sport_id === currentSport.id)
    : [];

  return {
    matches,
    currentMatch,
    setCurrentMatch,
    currentSportMatches,
    handleCreateMatch,
    handleUpdateMatch,
    handleDeleteMatch,
  };
}
