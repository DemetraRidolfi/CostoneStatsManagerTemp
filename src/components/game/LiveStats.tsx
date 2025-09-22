import React, { useState } from 'react';
import type { PlayResult } from '../../types';
import { BarChart2, ChevronUp, ChevronDown, Share2 } from 'lucide-react';
import { calculateEfficiency, calculateProductivity } from '../../utils/pdf/statistics';
import { calculatePoints } from '../../utils/calculatePoints';
import { createStatsImage } from '../../utils/createStatsImage';
import { useTeamData } from '../../hooks/useTeamData';

type Props = {
  plays: PlayResult[];
};

export default function LiveStats({ plays }: Props) {
  const { schemes } = useTeamData();
  const [isExpanded, setIsExpanded] = useState(true);

  // Group schemes by category
  const schemeStats = schemes
    .map(scheme => {
      const schemePlays = plays.filter(p => p.schemeId === scheme.id);
      const efficiency = calculateEfficiency(schemePlays);
      const productivity = calculateProductivity(schemePlays);
      const points = calculatePoints(schemePlays).total;
      
      // Calculate rebound statistics
      const rebounds = schemePlays.filter(p => 
        (p.type === 'missed2' || p.type === 'missed3') && p.offensiveRebound === true
      ).length;
      const reboundPoints = schemePlays.reduce((acc, p) => 
        acc + (p.reboundPoints || 0), 0
      );
      
      return {
        name: scheme.name,
        category: scheme.category,
        uses: schemePlays.length,
        points,
        efficiency,
        productivity,
        rebounds,
        reboundPoints,
      };
    })
    .filter(stat => stat.uses > 0)
    .sort((a, b) => b.points - a.points);

  const uomoStats = schemeStats.filter(stat => stat.category === 'Uomo' && !stat.name.includes('ZONA'));
  const zonaStats = schemeStats.filter(stat => stat.name.includes('ZONA'));
  const rimesseStats = schemeStats.filter(stat => stat.category === 'Rimesse');

  const handleShare = async () => {
    try {
      const blob = await createStatsImage(schemeStats);
      const file = new File([blob], 'statistiche.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Statistiche Live',
        });
      } else {
        // Fallback for browsers that don't support native sharing
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'statistiche.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error sharing stats:', error);
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 60) return 'text-emerald-600 dark:text-emerald-400';
    if (efficiency >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProductivityColor = (productivity: number) => {
    if (productivity >= 2) return 'text-emerald-600 dark:text-emerald-400';
    if (productivity >= 0) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const SchemeCard = ({ stat }: { stat: typeof schemeStats[0] }) => (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <h4 className={`text-sm font-medium ${
          stat.name.includes('ZONA') ? 'text-red-600 dark:text-red-400' :
          stat.name === 'TRANSIZIONE' ? 'text-emerald-600 dark:text-emerald-400' :
          stat.name.includes('NO CALL') ? 'text-sky-600 dark:text-sky-400' :
          'text-gray-900 dark:text-white'
        }`}>
          {stat.name}
        </h4>
        <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
          {stat.points}
        </span>
      </div>
      <div className="flex justify-between items-baseline text-xs">
        <span className="text-gray-500 dark:text-gray-400">
          {stat.uses} {stat.uses === 1 ? 'uso' : 'usi'}
        </span>
        <div className="flex gap-2">
          <span className={getEfficiencyColor(stat.efficiency)}>
            {stat.efficiency}%
          </span>
          <span className={getProductivityColor(stat.productivity)}>
            {stat.productivity.toFixed(1)}p
          </span>
        </div>
      </div>
    </div>
  );

  if (schemeStats.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
          <BarChart2 className="w-4 h-4" />
          <h3>Statistiche Live</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Condividi statistiche"
          >
            <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label={isExpanded ? 'Nascondi statistiche' : 'Mostra statistiche'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="space-y-4">
          {uomoStats.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Uomo
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {uomoStats.map((stat) => (
                  <SchemeCard key={stat.name} stat={stat} />
                ))}
              </div>
            </div>
          )}
          {zonaStats.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Zona
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {zonaStats.map((stat) => (
                  <SchemeCard key={stat.name} stat={stat} />
                ))}
              </div>
            </div>
          )}
          {rimesseStats.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Rimesse
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {rimesseStats.map((stat) => (
                  <SchemeCard key={stat.name} stat={stat} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}