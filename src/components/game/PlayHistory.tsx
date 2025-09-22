import React, { useState } from 'react';
import type { PlayResult, Player, Scheme } from '../../types';
import {
  Ban,
  History,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Maximize2,
} from 'lucide-react';
import FullHistoryModal from './FullHistoryModal';
import { useTheme } from '../../contexts/ThemeContext';

type Props = {
  plays: PlayResult[];
  players: Player[];
  schemes: Scheme[];
  onDelete: ((timestamp: number) => void) | null;
  hideDelete?: boolean;
  fillHeight?: boolean;
};

export default function PlayHistory({
  plays,
  players,
  schemes,
  onDelete,
  hideDelete,
  fillHeight = false,
}: Props) {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const { tabletMode } = useTheme();

  const getPlayIcon = (type: string) => {
    if (['made2', 'made3'].includes(type)) {
      return <CheckCircle className={`${tabletMode ? 'w-4 h-4' : 'w-4 h-4'} text-emerald-500`} />;
    }
    if (['missed2', 'missed3', 'turnover'].includes(type)) {
      return <XCircle className={`${tabletMode ? 'w-4 h-4' : 'w-4 h-4'} text-red-500`} />;
    }
    return <AlertCircle className={`${tabletMode ? 'w-4 h-4' : 'w-4 h-4'} text-amber-500`} />;
  };

  const getPlayDescription = (play: PlayResult) => {
    const player = players.find((p) => p.id === play.playerId);
    const scheme = schemes.find((s) => s.id === play.schemeId);

    const resultMap: Record<string, { text: string; color: string }> = {
      made2: {
        text: 'Canestro da 2',
        color: 'text-emerald-600 dark:text-emerald-400',
      },
      missed2: {
        text: 'Tiro da 2 Sbagliato',
        color: 'text-red-600 dark:text-red-400',
      },
      made3: {
        text: 'Canestro da 3',
        color: 'text-emerald-600 dark:text-emerald-400',
      },
      missed3: {
        text: 'Tiro da 3 Sbagliato',
        color: 'text-red-600 dark:text-red-400',
      },
      foulInbound: {
        text: 'Fallo (Rimessa)',
        color: 'text-amber-600 dark:text-amber-400',
      },
      foulShot: {
        text: play.and1Points
          ? `And-1 (${play.and1Points}+${play.freeThrowPoints} pt)`
          : play.freeThrowPoints === 0
          ? 'Fallo (Nessun TL)'
          : `Fallo (${play.freeThrowPoints} pt)`,
        color: play.and1Points
          ? 'text-purple-600 dark:text-purple-400'
          : 'text-amber-600 dark:text-amber-400',
      },
      turnover: {
        text: 'Palla Persa',
        color: 'text-red-600 dark:text-red-400',
      },
      noImpact: {
        text: 'Nessun Impatto',
        color: 'text-gray-600 dark:text-gray-400',
      },
    };

    // Handle rebound information
    if ((play.type === 'missed2' || play.type === 'missed3') && play.offensiveRebound !== undefined) {
      const baseResult = resultMap[play.type];
      if (play.offensiveRebound) {
        if (play.reboundPoints && play.reboundPoints > 0) {
          const reboundPlayer = players.find(p => p.id === play.reboundPlayerId);
          const reboundPlayerName = reboundPlayer ? `#${reboundPlayer.number} ${reboundPlayer.name}` : 'Unknown';
          baseResult.text += ` + Rimbalzo (${play.reboundPoints}pt da ${reboundPlayerName})`;
          baseResult.color = 'text-amber-600 dark:text-amber-400';
        } else {
          baseResult.text += ' + Rimbalzo (0pt)';
          baseResult.color = 'text-amber-600 dark:text-amber-400';
        }
      } else {
        baseResult.text += ' (No Rimbalzo)';
      }
    }

    // Add assist information to successful plays
    if (play.hasAssist && (play.type === 'made2' || play.type === 'made3' || 
        (play.type === 'foulShot' && ((play.freeThrowPoints || 0) > 0 || play.and1Points)))) {
      const baseResult = resultMap[play.type];
      baseResult.text += ' (Assist)';
    }

    // Match the icon color with the result color
    const schemeColor = resultMap[play.type]?.color || 'text-gray-900 dark:text-white';

    return {
      player: player ? `#${player.number} ${player.name}` : 'No Player',
      scheme: scheme?.name || 'Unknown',
      schemeColor,
      result: resultMap[play.type]?.text || play.type,
      color: resultMap[play.type]?.color || 'text-gray-600 dark:text-gray-400',
      type: play.type,
      timestamp: play.timestamp,
    };
  };

  const handleDeleteClick = (timestamp: number) => {
    if (!onDelete) return;

    if (deleteConfirm === timestamp) {
      onDelete(timestamp);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(timestamp);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const PlayItem = ({ play }: { play: PlayResult }) => {
    const { player, scheme, schemeColor, result, color, type } = getPlayDescription(play);
    const isConfirming = deleteConfirm === play.timestamp;

    return (
      <div
        className={`relative flex items-start gap-2 p-2 rounded-lg transition-colors ${
          isConfirming
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-500'
            : 'bg-gray-50 dark:bg-gray-900'
        }`}
      >
        <div className="mt-0.5 flex-shrink-0">{getPlayIcon(type)}</div>
        <div className="min-w-0 flex-1">
          <div className={`text-xs font-medium ${schemeColor} truncate`}>
            {scheme}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {player}
          </div>
          <div className={`text-xs font-medium ${color} truncate`}>
            {result}
          </div>
        </div>
        {!hideDelete && onDelete && (
          <button
            onClick={() => handleDeleteClick(play.timestamp)}
            className={`absolute right-1 top-1 p-1 rounded-full transition-all ${
              isConfirming
                ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                : 'hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400'
            }`}
            title={isConfirming ? 'Conferma eliminazione' : 'Elimina azione'}
          >
            {isConfirming ? (
              <X className="w-3 h-3" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
    );
  };

  // Show last 4 plays in desktop mode, last 2 in tablet mode
  const recentPlays = [...plays].reverse().slice(0, 5);
  const totalPlays = plays.length;

  const containerClass = hideDelete
    ? ''
    : 'bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 h-[calc(100vh-9rem)]';
  
  return (
    <>
      <div className={`${containerClass} flex flex-col overflow-hidden`}>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Ultime Azioni
            </h3>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {totalPlays} totali
          </span>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto space-y-2 mb-2 px-0.5">
            {totalPlays === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Nessuna azione registrata
                </p>
              </div>
            ) : (
              recentPlays.map((play) => (
                <PlayItem key={play.timestamp} play={play} />
              ))
            )}
          </div>

          <button
            onClick={() => setShowFullHistory(true)}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs px-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors mt-auto"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Cronologia Completa</span>
          </button>
        </div>
      </div>

      <FullHistoryModal
        isOpen={showFullHistory}
        onClose={() => setShowFullHistory(false)}
        plays={plays}
        getPlayDescription={getPlayDescription}
        getPlayIcon={getPlayIcon}
        onDelete={onDelete}
        deleteConfirm={deleteConfirm}
        onDeleteConfirm={handleDeleteClick}
      />
    </>
  );
}