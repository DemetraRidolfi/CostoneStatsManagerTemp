import React from 'react';
import type { Game } from '../../types';
import { calculateEfficiency, calculateProductivity } from '../../utils/pdf/statistics';
import { calculatePoints } from '../../utils/calculatePoints';
import { calculateFieldGoals } from '../../utils/calculateFieldGoals';
import { useTeamData } from '../../hooks/useTeamData';

type Props = {
  games: Game[];
  selectedPlayerId: number | null;
};

export default function PlayerStats({ games, selectedPlayerId }: Props) {
  const { players: PLAYERS } = useTeamData();
  const plays = games.flatMap(g => g.plays);
  const validPlayerIds = new Set(PLAYERS.map(p => p.id));
  const players = new Set(plays
    .filter(p => p.playerId !== -1) // Exclude noImpact plays
    .map(p => p.playerId)
    .filter(id => validPlayerIds.has(id))
  );

  const getPlayerStats = (playerId: number) => {
    const playerPlays = plays.filter(p => p.playerId === playerId);
    const playerInfo = PLAYERS.find(p => p.id === playerId)!;
    
    const fieldGoals = calculateFieldGoals(playerPlays);
    const foulInbound = playerPlays.filter(p => p.type === 'foulInbound').length;
    const foulShot = playerPlays.filter(p => p.type === 'foulShot').length;
    const turnover = playerPlays.filter(p => p.type === 'turnover').length;

    // Calculate total actions excluding noImpact plays
    const totalActions = playerPlays.filter(p => p.type !== 'noImpact').length;

    // Calculate points using the shared function
    const points = calculatePoints(playerPlays);

    // Calculate efficiency and productivity
    const efficiency = calculateEfficiency(playerPlays);
    const productivity = calculateProductivity(playerPlays);

    return {
      playerId,
      playerName: playerInfo.name,
      playerNumber: playerInfo.number,
      totalActions,
      ...fieldGoals,
      foulInbound,
      foulShot,
      turnover,
      efficiency,
      productivity,
      points,
    };
  };

  const playersToShow = selectedPlayerId 
    ? [selectedPlayerId].filter(id => validPlayerIds.has(id))
    : Array.from(players);

  const playerStats = playersToShow
    .map(getPlayerStats)
    .sort((a, b) => b.points.total - a.points.total);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Statistiche Giocatori</h2>
      <div className="space-y-6">
        {playerStats.map((stats) => (
          <div key={stats.playerId} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                #{stats.playerNumber} {stats.playerName}
              </h3>
              <div className="flex items-center gap-4">
                {/* Efficiency Badge */}
                <div className="flex flex-col items-center">
                  <div className={`text-lg font-bold rounded-lg px-3 py-1 ${
                    stats.efficiency >= 60 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                    stats.efficiency >= 40 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {stats.efficiency}%
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Efficacia</span>
                </div>
                {/* Productivity Badge */}
                <div className="flex flex-col items-center">
                  <div className={`text-lg font-bold rounded-lg px-3 py-1 ${
                    stats.productivity >= 2 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                    stats.productivity >= 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {stats.productivity.toFixed(1)}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Produttività</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Azioni totali</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.totalActions}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Punti totali</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.points.total} ({stats.points.fieldGoals}+{stats.points.freeThrows})
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Canestri da 2</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.made2}/{stats.total2}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Canestri da 3</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.made3}/{stats.total3}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Falli subiti</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.foulInbound + stats.foulShot}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Palle perse</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.turnover}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}