import React, { useState } from 'react';
import type { Game } from '../../types';
import { getAllDraftGames } from '../../services/gameService';
import { useNavigate } from 'react-router-dom';
import { FileEdit, AlertTriangle } from 'lucide-react';
import PageContainer from '../layout/PageContainer';
import { useTheme } from '../../contexts/ThemeContext';

type Props = {
  onStart: (data: Partial<Game>) => void;
  initialData?: Partial<Game>;
};

export default function GameHeader({ onStart, initialData }: Props) {
  const navigate = useNavigate();
  const { menuVisible } = useTheme();
  const [gameData, setGameData] = useState<Partial<Game>>(initialData || {
    date: new Date().toISOString().split('T')[0],
    opponent: '',
    location: '',
    matchType: 'AMICHEVOLE',
    plays: [],
  });
  const [showConfirm, setShowConfirm] = useState(false);

  const draftGames = getAllDraftGames();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    onStart(gameData);
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className={`max-w-6xl mx-auto px-4 transition-all duration-300 ${
      menuVisible ? 'pt-20' : 'pt-8'
    }`}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          NUOVA PARTITA
        </h1>
      </div>
      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-primary-600 dark:text-primary-400 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Inizia Partita</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Sei sicuro di voler iniziare una nuova partita contro {gameData.opponent}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Annulla
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Conferma
              </button>
            </div>
          </div>
        </div>
      )}

      {!initialData && draftGames.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-4">
            Partite in Corso
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {draftGames.map(draft => (
              <button
                key={draft.id}
                onClick={() => navigate(`/new-game/${draft.id}`)}
                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <FileEdit className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    vs {draft.opponent}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(new Date(draft.lastUpdated!).toISOString().split('T')[0])}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data
            </label>
            <input
              type="date"
              value={gameData.date}
              onChange={(e) => setGameData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipologia Partita
            </label>
            <select
              value={gameData.matchType || 'AMICHEVOLE'}
              onChange={(e) => setGameData(prev => ({ ...prev, matchType: e.target.value as any }))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900"
              required
            >
              <option value="AMICHEVOLE">AMICHEVOLE</option>
              <option value="CAMPIONATO - 1° FASE">CAMPIONATO - 1° FASE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Avversario
            </label>
            <input
              type="text"
              value={gameData.opponent || ''}
              onChange={(e) => setGameData(prev => ({ ...prev, opponent: e.target.value }))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Luogo
            </label>
            <input
              type="text"
              value={gameData.location || ''}
              onChange={(e) => setGameData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            {initialData ? 'Inizia Partita' : 'Inizia Partita'}
          </button>
        </form>
      </div>
    </div>
  );
}