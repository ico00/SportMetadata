import { useState, useEffect } from 'react';
import { Sport } from '../types';
import { loadSports, saveSports, deleteSport } from '../utils/storage';
import { useToast } from './useToast';
import { DEFAULTS } from '../constants';

export function useSports() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [currentSport, setCurrentSport] = useState<Sport | null>(null);
  const toast = useToast();

  // Load sports on mount
  useEffect(() => {
    loadSports()
      .then((data) => {
        setSports(data);
      })
      .catch((error) => {
        console.error('❌ Error loading sports:', error);
        toast.showError('Error loading sports');
      });
  }, [toast]);

  const handleCreateSport = () => {
    const newSport: Sport = {
      id: Date.now().toString(),
      name: DEFAULTS.SPORT_NAME,
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

    const confirmed = await toast.confirm(
      `Are you sure you want to delete sport "${sport.name}"?\n\nThis action will delete the sport, all matches and all teams.`
    );
    if (!confirmed) {
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
      toast.showSuccess("Sport deleted successfully!");
    } catch (error) {
      toast.showError(`Error deleting sport: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return {
    sports,
    currentSport,
    setCurrentSport,
    handleCreateSport,
    handleUpdateSport,
    handleDeleteSport,
  };
}
