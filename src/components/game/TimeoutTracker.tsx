import React from 'react';
import { Clock, Plus, Minus } from 'lucide-react';

type TimeoutState = {
  firstQuarter: number;
  secondQuarter: number;
  thirdQuarter: number;
  fourthQuarter: number;
  overtime: number;
  currentQuarter: 1 | 2 | 3 | 4 | 5;
};

type Props = {
  timeouts: TimeoutState;
  onAddTimeout: () => void;
  onRemoveTimeout: () => void;
  onChangeQuarter: (quarter: 1 | 2 | 3 | 4 | 5) => void;
};

export default function TimeoutTracker({ timeouts, onAddTimeout, onRemoveTimeout, onChangeQuarter }: Props) {
  const getMaxTimeouts = (quarter: number) => {
    if (quarter <= 2) return 2; // 1° e 2° quarto: max 2
    if (quarter <= 4) return 3; // 3° e 4° quarto: max 3
    return 1; // Supplementare: max 1
  };

  const getCurrentTimeouts = () => {
    switch (timeouts.currentQuarter) {
      case 1: return timeouts.firstQuarter;
      case 2: return timeouts.secondQuarter;
      case 3: return timeouts.thirdQuarter;
      case 4: return timeouts.fourthQuarter;
      case 5: return timeouts.overtime;
      default: return 0;
    }
  };

  const getQuarterName = (quarter: number) => {
    if (quarter <= 4) return `${quarter}° Q`;
    return 'SUP';
  };

  const currentUsed = getCurrentTimeouts();
  const maxAllowed = getMaxTimeouts(timeouts.currentQuarter);
  const remaining = maxAllowed - currentUsed;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Timeout
          </h3>
        </div>
        
        {/* Quarter Selector */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((quarter) => (
            <button
              key={quarter}
              onClick={() => onChangeQuarter(quarter as 1 | 2 | 3 | 4 | 5)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeouts.currentQuarter === quarter
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {getQuarterName(quarter)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 items-center">
        {/* Current Quarter Info */}
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {getQuarterName(timeouts.currentQuarter)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Periodo Attuale
          </div>
        </div>

        {/* Timeout Counter */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <button
              onClick={onRemoveTimeout}
              disabled={currentUsed === 0}
              className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <div className="px-4">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentUsed}/{maxAllowed}
              </div>
            </div>
            
            <button
              onClick={onAddTimeout}
              disabled={currentUsed >= maxAllowed}
              className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Timeout Utilizzati
          </div>
        </div>

        {/* Remaining */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${
            remaining === 0 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {remaining}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Rimanenti
          </div>
        </div>
      </div>

      {/* Visual Indicators */}
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: maxAllowed }, (_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 ${
              i < currentUsed
                ? 'bg-red-500 border-red-500'
                : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
            }`}
          />
        ))}
      </div>

      {/* All Quarters Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-5 gap-2 text-center">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">1° Q</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {timeouts.firstQuarter}/2
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">2° Q</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {timeouts.secondQuarter}/2
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">3° Q</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {timeouts.thirdQuarter}/3
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">4° Q</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {timeouts.fourthQuarter}/3
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">SUP</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {timeouts.overtime}/1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}