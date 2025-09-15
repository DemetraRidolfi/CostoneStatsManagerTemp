import React, { useState } from 'react';
import type { PlayResult as PlayResultType } from '../../types';
import { X, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

type Props = {
  schemeId: string;
  playerId: number;
  onSave: (result: PlayResultType) => void;
  onCancel: () => void;
};

const resultGroups = [
  {
    title: 'Tiri',
    items: [
      { type: 'made2', label: '2 PUNTI', icon: Check, color: 'bg-emerald-500' },
      { type: 'made3', label: '3 PUNTI', icon: Check, color: 'bg-emerald-500' },
      { type: 'missed2', label: '2 PUNTI', icon: X, color: 'bg-red-500' },
      { type: 'missed3', label: '3 PUNTI', icon: X, color: 'bg-red-500' },
    ],
  },
  {
    title: 'Falli Subiti',
    items: [
      { type: 'foulInbound', label: 'RIMESSA', icon: AlertCircle, color: 'bg-blue-500' },
      { type: 'foulShot', label: 'TIRI LIBERI', icon: AlertCircle, color: 'bg-blue-500' },
    ],
  },
  {
    title: 'Altro',
    items: [
      { type: 'turnover', label: 'PALLA PERSA', icon: X, color: 'bg-yellow-500' },
    ],
  },
] as const;

export default function PlayResult({ schemeId, playerId, onSave, onCancel }: Props) {
  const { tabletMode } = useTheme();
  const [notes, setNotes] = useState('');
  const [showFoulModal, setShowFoulModal] = useState(false);
  const [showFreeThrowModal, setShowFreeThrowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<PlayResultType['type'] | null>(null);
  const [madeBasketPoints, setMadeBasketPoints] = useState<number | null>(null);

  const handleSave = (type: PlayResultType['type']) => {
    if (type === 'made2' || type === 'made3') {
      setSelectedType(type);
      setMadeBasketPoints(type === 'made2' ? 2 : 3);
      setShowFoulModal(true);
    } else if (type === 'foulShot') {
      setSelectedType(type);
      setShowFreeThrowModal(true);
    } else {
      onSave({
        type,
        playerId,
        schemeId,
        timestamp: Date.now(),
        notes: notes.trim() || undefined,
      });
    }
  };

  const handleFoulModalResponse = (hasFoul: boolean) => {
    if (!selectedType || !madeBasketPoints) return;

    if (!hasFoul) {
      onSave({
        type: selectedType,
        playerId,
        schemeId,
        timestamp: Date.now(),
        notes: notes.trim() || undefined,
      });
      setShowFoulModal(false);
      setSelectedType(null);
      setMadeBasketPoints(null);
    } else {
      setShowFoulModal(false);
      setShowFreeThrowModal(true);
    }
  };

  const handleFreeThrowSave = (points: number) => {
    if (madeBasketPoints) {
      onSave({
        type: 'foulShot',
        playerId,
        schemeId,
        timestamp: Date.now(),
        notes: notes.trim() || undefined,
        and1Points: madeBasketPoints,
        freeThrowPoints: points,
      });
    } else {
      onSave({
        type: 'foulShot',
        playerId,
        schemeId,
        timestamp: Date.now(),
        notes: notes.trim() || undefined,
        freeThrowPoints: points,
      });
    }
    setShowFreeThrowModal(false);
    setSelectedType(null);
    setMadeBasketPoints(null);
  };

  const handleFoulModalBack = () => {
    setShowFoulModal(false);
    setSelectedType(null);
    setMadeBasketPoints(null);
  };

  const handleFreeThrowModalBack = () => {
    setShowFreeThrowModal(false);
    if (madeBasketPoints) {
      setShowFoulModal(true);
    } else {
      setSelectedType(null);
      setMadeBasketPoints(null);
    }
  };

  const containerClass = tabletMode
    ? "bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 h-[calc(100vh-16rem)] flex flex-col"
    : "bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-[calc(100vh-16rem)] flex flex-col";

  const buttonClass = tabletMode
    ? "h-16 text-sm"
    : "h-20 text-lg";

  return (
    <>
      <div className={containerClass}>
        {/* Result Groups */}
        <div className="grid grid-cols-3 gap-3 flex-1">
          {/* Left Column - Shots */}
          <div className="col-span-2 space-y-4">
            {resultGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <h4 className={`${tabletMode ? 'text-sm' : 'text-base'} font-medium text-gray-700 dark:text-gray-300`}>
                  {group.title}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {group.items.map(({ type, label, icon: Icon, color }) => (
                    <button
                      key={`${type}-${label}`}
                      onClick={() => handleSave(type)}
                      className={`flex items-center justify-center gap-3 rounded-xl text-white font-medium transition-all hover:opacity-90 ${color} ${buttonClass}`}
                    >
                      <Icon className={`${tabletMode ? 'w-5 h-5' : 'w-6 h-6'}`} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Notes */}
          <div className="flex flex-col">
            <h3 className={`${tabletMode ? 'text-sm' : 'text-base'} font-medium text-gray-900 dark:text-white mb-2`}>
              Note
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Aggiungi note opzionali..."
              className={`flex-1 w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900 p-3 resize-none ${
                tabletMode ? 'text-sm' : 'text-base'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showFoulModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Fallo Subito?
              </h3>
              <button
                onClick={handleFoulModalBack}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Indietro</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleFoulModalResponse(true)}
                className="flex items-center justify-center h-24 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-2xl font-bold transition-colors"
              >
                Sì
              </button>
              <button
                onClick={() => handleFoulModalResponse(false)}
                className="flex items-center justify-center h-24 bg-gray-500 hover:bg-gray-600 text-white rounded-xl text-2xl font-bold transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showFreeThrowModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {madeBasketPoints ? 'Tiro Libero Aggiuntivo' : 'Tiri Liberi Realizzati'}
              </h3>
              <button
                onClick={handleFreeThrowModalBack}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Indietro</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {madeBasketPoints ? (
                <>
                  <button
                    onClick={() => handleFreeThrowSave(1)}
                    className="flex items-center justify-center h-24 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-2xl font-bold transition-colors"
                  >
                    REALIZZATO
                  </button>
                  <button
                    onClick={() => handleFreeThrowSave(0)}
                    className="flex items-center justify-center h-24 bg-red-500 hover:bg-red-600 text-white rounded-xl text-2xl font-bold transition-colors"
                  >
                    SBAGLIATO
                  </button>
                </>
              ) : (
                [0, 1, 2, 3].map((points) => (
                  <button
                    key={points}
                    onClick={() => handleFreeThrowSave(points)}
                    className={`flex items-center justify-center h-24 ${
                      points === 0
                        ? 'bg-gray-500 hover:bg-gray-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white rounded-xl text-2xl font-bold transition-colors`}
                  >
                    {points === 0 ? 'Nessuno' : points}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}