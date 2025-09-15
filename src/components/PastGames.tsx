import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllGames, deleteGame } from '../services/gameService';
import { Trash2, BarChart2, Filter } from 'lucide-react';
import type { MatchType } from '../types';
import PageContainer from './layout/PageContainer';

export default function PastGames() {
  const navigate = useNavigate();
  const [selectedMatchType, setSelectedMatchType] = useState<MatchType | 'ALL'>('ALL');
  const games = getAllGames();

  // Filter games by match type
  const filteredGames = selectedMatchType === 'ALL' 
    ? games 
    : games.filter(game => game.matchType === selectedMatchType);

  const handleDelete = (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa partita?')) {
      deleteGame(id);
      // Force re-render
      navigate('/games');
    }
  };

  const getMatchTypeColor = (matchType: MatchType) => {
    switch (matchType) {
      case 'AMICHEVOLE':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'CAMPIONATO - 1° FASE':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <PageContainer title="ARCHIVIO PARTITE">
      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtra per Tipologia</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedMatchType('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedMatchType === 'ALL'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            TUTTE
          </button>
          <button
            onClick={() => setSelectedMatchType('AMICHEVOLE')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedMatchType === 'AMICHEVOLE'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            AMICHEVOLE
          </button>
          <button
            onClick={() => setSelectedMatchType('CAMPIONATO - 1° FASE')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedMatchType === 'CAMPIONATO - 1° FASE'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            CAMPIONATO - 1° FASE
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredGames.map((game) => (
          <div key={game.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    vs {game.opponent}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchTypeColor(game.matchType)}`}>
                    {game.matchType}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Data: {new Date(game.date).toLocaleDateString()}</p>
                  <p>Luogo: {game.location}</p>
                  <p>Azioni registrate: {game.plays.length}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/stats/${game.id}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600"
                >
                  <BarChart2 className="w-4 h-4" />
                  Statistiche
                </button>
                <button
                  onClick={() => handleDelete(game.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredGames.length === 0 && games.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Nessuna partita trovata per questa tipologia</p>
          </div>
        )}
        {games.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Nessuna partita registrata</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}