import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlayersTable from '../PlayersTable';
import { Player } from '../../types';

// Mock useAuth hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
  }),
}));

describe('PlayersTable', () => {
  const mockPlayers: Player[] = [
    {
      id: '1',
      player_number: '7',
      team_code: 'HRV',
      first_name: 'Ivan',
      last_name: 'Horvat',
      raw_input: '7 Ivan Horvat',
      valid: true,
    },
    {
      id: '2',
      player_number: '10',
      team_code: 'HRV',
      first_name: 'Marko',
      last_name: 'Petrovic',
      raw_input: '10 Marko Petrovic',
      valid: true,
    },
  ];

  const mockHandlers = {
    onUpdatePlayer: vi.fn(),
    onDeletePlayer: vi.fn(),
    onSwapNames: vi.fn(),
    onCleanNames: vi.fn(),
  };

  it('should render players table', () => {
    render(
      <PlayersTable
        players={mockPlayers}
        teamCode="HRV"
        onUpdatePlayer={mockHandlers.onUpdatePlayer}
        onDeletePlayer={mockHandlers.onDeletePlayer}
      />
    );

    expect(screen.getByText('Players')).toBeInTheDocument();
    expect(screen.getByText('Ivan')).toBeInTheDocument();
    expect(screen.getByText('Horvat')).toBeInTheDocument();
    expect(screen.getByText('Marko')).toBeInTheDocument();
  });

  it('should display player count', () => {
    render(
      <PlayersTable
        players={mockPlayers}
        teamCode="HRV"
        onUpdatePlayer={mockHandlers.onUpdatePlayer}
        onDeletePlayer={mockHandlers.onDeletePlayer}
      />
    );

    expect(screen.getByText(/2 total/)).toBeInTheDocument();
  });

  it('should show empty state when no players', () => {
    render(
      <PlayersTable
        players={[]}
        teamCode="HRV"
        onUpdatePlayer={mockHandlers.onUpdatePlayer}
        onDeletePlayer={mockHandlers.onDeletePlayer}
      />
    );

    expect(screen.getByText('No players yet')).toBeInTheDocument();
  });
});
