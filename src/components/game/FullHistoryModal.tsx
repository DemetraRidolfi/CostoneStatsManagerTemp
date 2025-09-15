import React from 'react';
import { X, Trash2 } from 'lucide-react';
import type { PlayResult } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  plays: PlayResult[];
  getPlayDescription: (play: PlayResult) => {
    player: string;
    scheme: string;
    result: string;
    color: string;
    type: string;
    timestamp: number;
  };
  getPlayIcon: (type: string) => JSX.Element;
  onDelete: ((timestamp: number) => void) | null;
  deleteConfirm: number | null;
  onDeleteConfirm: (timestamp: number) => void;
};

export default function FullHistoryModal({ 
  isOpen, 
  onClose, 
  plays, 
  getPlayDescription, 
  getPlayIcon,
  onDelete,
  deleteConfirm,
  onDeleteConfirm
}: Props) {
  const { tabletMode } = useTheme();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`${tabletMode ? 'text-2xl' : 'text-xl'} font-semibold text-gray-900 dark:text-white`}>
            Cronologia Completa
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className={`${tabletMode ? 'w-6 h-6' : 'w-5 h-5'} text-gray-500 dark:text-gray-400`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {[...plays].reverse().map((play) => {
              const { player, scheme, result, color, type, timestamp } = getPlayDescription(play);
              const isConfirming = deleteConfirm === timestamp;

              return (
                <div 
                  key={timestamp}
                  className={`relative flex items-start gap-3 ${tabletMode ? 'p-4' : 'p-3'} ${
                    isConfirming 
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-500'
                      : 'bg-gray-50 dark:bg-gray-900'
                  } rounded-lg`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {getPlayIcon(type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`${tabletMode ? 'text-base' : 'text-sm'} font-medium text-gray-900 dark:text-white`}>
                      {scheme}
                    </div>
                    <div className={`${tabletMode ? 'text-base' : 'text-sm'} text-gray-500 dark:text-gray-400`}>
                      {player}
                    </div>
                    <div className={`${tabletMode ? 'text-base' : 'text-sm'} font-medium ${color}`}>
                      {result}
                    </div>
                  </div>
                  {onDelete && (
                    <button
                      onClick={() => onDeleteConfirm(timestamp)}
                      className={`p-2 rounded-lg transition-all ${
                        isConfirming
                          ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                          : 'hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                      }`}
                      title={isConfirming ? "Conferma eliminazione" : "Elimina azione"}
                    >
                      {isConfirming ? (
                        <X className={`${tabletMode ? 'w-5 h-5' : 'w-4 h-4'}`} />
                      ) : (
                        <Trash2 className={`${tabletMode ? 'w-5 h-5' : 'w-4 h-4'}`} />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className={`w-full ${tabletMode ? 'py-3 text-base' : 'py-2 text-sm'} px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors`}
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}