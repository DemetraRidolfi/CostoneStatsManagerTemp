import React, { useState } from 'react';
import { PlusCircle, History, BarChart3, Users, Settings, FileEdit, Trash2, AlertTriangle } from 'lucide-react';
import { getAllDraftGames, deleteDraftGame } from '../services/gameService';
import { useNavigation } from '../contexts/NavigationContext';
import { useTheme } from '../contexts/ThemeContext';

const menuItems = [
  { icon: PlusCircle, label: 'Nuova Partita', path: '/new-game' },
  { icon: History, label: 'Archivio Partite', path: '/games' },
  { icon: BarChart3, label: 'Statistiche', path: '/stats' },
  { icon: Users, label: 'Gestione Squadra', path: '/team' },
];

const settingsItem = { icon: Settings, label: 'Impostazioni', path: '/settings' };

export default function Home() {
  const { handleNavigation } = useNavigation();
  const { menuVisible } = useTheme();
  const [draftGames, setDraftGames] = useState(getAllDraftGames());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    deleteDraftGame(id);
    setDraftGames(getAllDraftGames());
    setShowDeleteConfirm(null);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4 transition-all duration-300 ${menuVisible ? 'pt-24' : 'pt-8'}`}>
      <div className="col-span-full mb-8 text-center">
        <img 
          src="https://i.ibb.co/Pxsjh0j/costone.png"
          alt="Costone Logo"
          className="w-24 h-24 mx-auto rounded-full border-2 border-primary-600 shadow-lg mb-4"
        />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">COSTONE BASKET SIENA</h1>
      </div>

      {draftGames.length > 0 && (
        <div className="col-span-full">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-3">
              Partite in Corso
            </h2>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {draftGames.map(draft => (
                <div
                  key={draft.id}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => handleNavigation(`/new-game/${draft.id}`)}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <FileEdit className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <div className="text-left min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        vs {draft.opponent}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(draft.lastUpdated!).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(draft.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Elimina partita"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            className="flex items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400"
            onClick={() => handleNavigation(item.path)}
          >
            <Icon className="w-10 h-10 text-primary-600 dark:text-primary-400 mr-4" />
            <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">{item.label}</span>
          </button>
        );
      })}

      {/* Settings button - centered at bottom */}
      <div className="col-span-full flex justify-center">
        <button
          className="flex items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400"
          onClick={() => handleNavigation(settingsItem.path)}
        >
          <settingsItem.icon className="w-10 h-10 text-primary-600 dark:text-primary-400 mr-4" />
          <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">{settingsItem.label}</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Elimina Partita</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Sei sicuro di voler eliminare questa partita in corso? Questa azione non può essere annullata.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Annulla
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}