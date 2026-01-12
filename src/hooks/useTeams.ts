import { useState, useEffect } from 'react';
import { Team, Match } from '../types';
import { loadTeams, saveTeams, deleteTeam } from '../utils/storage';
import { useToast } from './useToast';
import { DEFAULTS } from '../constants';

interface UseTeamsProps {
  currentMatch: Match | null;
}

export function useTeams({ currentMatch }: UseTeamsProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teamCode, setTeamCode] = useState("");
  const toast = useToast();

  // Load teams on mount
  useEffect(() => {
    loadTeams()
      .then((data) => {
        setTeams(data);
      })
      .catch((error) => {
        console.error('❌ Error loading teams:', error);
        toast.showError('Error loading teams');
      });
  }, [toast]);

  // Filter teams by match and auto-select first team
  useEffect(() => {
    if (currentMatch) {
      const matchTeams = teams.filter(t => t.match_id === currentMatch.id);
      if (matchTeams.length > 0) {
        // Only auto-select if current team is not in the filtered list
        const isCurrentTeamValid = currentTeam && matchTeams.some(t => t.id === currentTeam.id);
        if (!isCurrentTeamValid) {
          setCurrentTeam(matchTeams[0]);
        }
      } else {
        setCurrentTeam(null);
      }
    } else {
      setCurrentTeam(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMatch, teams]);

  // Update teamCode when currentTeam changes
  useEffect(() => {
    if (currentTeam) {
      setTeamCode(currentTeam.team_code);
    } else {
      setTeamCode("");
    }
  }, [currentTeam]);

  const handleCreateTeam = () => {
    if (!currentMatch) {
      toast.showError("Please select a match first!");
      return;
    }
    const newTeam: Team = {
      id: Date.now().toString(),
      match_id: currentMatch.id,
      name: DEFAULTS.TEAM_NAME,
      team_code: "",
      created_at: new Date().toISOString(),
    };
    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    saveTeams(updatedTeams);
    setCurrentTeam(newTeam);
  };

  const handleUpdateTeam = (updatedTeam: Team) => {
    console.log('🔍 handleUpdateTeam called, team ID:', updatedTeam.id, 'has logo:', !!updatedTeam.logo, 'logo length:', updatedTeam.logo?.length || 0);
    setTeams((prevTeams) => {
      const updatedTeams = prevTeams.map((t) =>
        t.id === updatedTeam.id ? updatedTeam : t
      );
      console.log('🔍 Updated teams array, saving...', updatedTeams.find(t => t.id === updatedTeam.id));
      // Save teams immediately with the updated team
      saveTeams(updatedTeams).then(() => {
        console.log('✅ Teams saved successfully');
      }).catch((error) => {
        console.error('❌ Error saving teams:', error);
        toast.showError('Error saving team data');
      });
      return updatedTeams;
    });
    setCurrentTeam(updatedTeam);
    setTeamCode(updatedTeam.team_code);
  };

  const handleDeleteTeam = async (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    const confirmed = await toast.confirm(
      `Are you sure you want to delete team "${team.name}"?\n\nThis action will delete the team and all associated players.`
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteTeam(teamId);
      const updatedTeams = teams.filter((t) => t.id !== teamId);
      setTeams(updatedTeams);
      saveTeams(updatedTeams);

      if (currentTeam?.id === teamId) {
        setCurrentTeam(null);
        setTeamCode("");
      }
      toast.showSuccess("Team deleted successfully!");
    } catch (error) {
      toast.showError(`Error deleting team: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const currentMatchTeams = currentMatch
    ? teams.filter(t => t.match_id === currentMatch.id)
    : [];

  return {
    teams,
    currentTeam,
    setCurrentTeam,
    teamCode,
    setTeamCode,
    currentMatchTeams,
    handleCreateTeam,
    handleUpdateTeam,
    handleDeleteTeam,
  };
}
