import React from 'react';
import type { PlayResult } from '../../types';
import { useTeamData } from '../../hooks/useTeamData';

type Props = {
  selectedPlayerId: number | null;
  onPlayerSelect: (playerId: number | null) => void;
  plays: PlayResult[];
};

export default function StatFilters({ selectedPlayerId, onPlayerSelect, plays }: Props) {
  const { players: PLAYERS } = useTeamData();
  
  // Get unique player IDs from plays, excluding noImpact plays
  const activePlayers = [...new Set(plays
    .filter(p => p.playerId !== -1)
    .map(p => p.playerId)
  )];

  // Sort players by number
  const sortedPlayers = activePlayers
    .map(id => PLAYERS.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)
    .sort((a, b) => Number(a.number) - Number(b.number));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Filtro Giocatori</h2>
      <div className="flex gap-4">
        <select
          value={selectedPlayerId || ''}
          onChange={(e) => onPlayerSelect(e.target.value ? Number(e.target.value) : null)}
          className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900"
        >
          <option value="">Tutti i giocatori</option>
          {sortedPlayers.map((player) => (
            <option key={player.id} value={player.id}>
              #{player.number} {player.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}