import React from 'react';
import type { Player } from '../../types';
import { Ban } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTeamData } from '../../hooks/useTeamData';

type Props = {
  onSelect: (playerId: number | null) => void;
};

export default function PlayerSelector({ onSelect }: Props) {
  const { tabletMode } = useTheme();
  const { getEnabledPlayers } = useTeamData();
  
  const players = getEnabledPlayers();

  if (tabletMode) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 h-[calc(100vh-16rem)] flex flex-col">
        {/* No Impact Button */}
        <div className="mb-3">
          <button
            onClick={() => onSelect(null)}
            className="w-full h-9 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center justify-center gap-2"
          >
            <Ban className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Nessun Impatto</span>
          </button>
        </div>

        {/* Player Grid - Dynamic sizing */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 overflow-y-auto p-1">
          {players.map(player => (
            <button
              key={player.id}
              onClick={() => onSelect(player.id)}
              className="flex flex-col items-center p-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all border border-transparent hover:border-primary-400 dark:hover:border-primary-600"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white text-base font-bold mb-1">
                {player.number}
              </div>
              <span className="text-[0.7rem] font-medium text-gray-900 dark:text-white text-center leading-tight">
                {player.name.split(' ').slice(-1)[0]}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Desktop layout remains unchanged
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-[calc(100vh-20rem)] overflow-y-auto">
      <div className="flex flex-col h-full">
        {/* No Impact Button */}
        <div className="mb-6">
          <button
            onClick={() => onSelect(null)}
            className="w-full h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center justify-center gap-3"
          >
            <Ban className="w-7 h-7 text-gray-500 dark:text-gray-400" />
            <span className="text-xl font-medium text-gray-700 dark:text-gray-300">Nessun Impatto</span>
          </button>
        </div>

        {/* Player Grid */}
        <div className="flex-1 overflow-y-auto -mx-2 px-2">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 p-2">
            {players.map(player => (
              <div key={player.id} className="relative transform-gpu">
                <button
                  onClick={() => onSelect(player.id)}
                  className="group w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all hover:scale-105 border-2 border-transparent hover:border-primary-400 dark:hover:border-primary-600"
                >
                  <div className="flex flex-col items-center">
                    <div className="relative mb-3">
                      <img
                        src={player.imageUrl}
                        alt={player.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover ring-4 ring-primary-100 dark:ring-primary-900 group-hover:ring-primary-500 transition-all"
                      />
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-3.5 py-1 rounded-full text-xl font-bold min-w-[2.75rem] text-center shadow-lg">
                        #{player.number}
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        {player.name.split(' ').slice(-1)[0]}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}