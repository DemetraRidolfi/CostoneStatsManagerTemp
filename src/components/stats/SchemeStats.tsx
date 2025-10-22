import React from 'react';
import { calculatePoints } from '../../utils/calculatePoints';
import { calculateFieldGoals } from '../../utils/calculateFieldGoals';
import type { PlayResult } from '../../types';
import { useTeamData } from '../../hooks/useTeamData';

type SchemeStats = {
  name: string;
  total: number;
  made2: number;
  made3: number;
  missed2: number;
  missed3: number;
  foulInbound: number;
  foulShot: number;
  turnover: number;
  efficiency: number;
  productivity: number;
  points: number;
  plays: PlayResult[];
  rebounds?: number;
  reboundPoints?: number;
};

type Props = {
  stats: SchemeStats[];
};

export default function SchemeStats({ stats }: Props) {
  const { schemes: allSchemes } = useTeamData();
  const schemes = allSchemes;

  const uomoSchemes = stats
    .filter(stat => {
      const scheme = schemes.find(s => s.name === stat.name);
      return scheme?.category === 'Uomo';
    })
    .sort((a, b) => b.points - a.points);

  const zonaSchemes = stats
    .filter(stat => {
      const scheme = schemes.find(s => s.name === stat.name);
      return scheme?.category === 'Zona';
    })
    .sort((a, b) => b.points - a.points);

  const rimesseSchemes = stats
    .filter(stat => {
      const scheme = schemes.find(s => s.name === stat.name);
      return scheme?.category === 'Rimesse';
    })
    .sort((a, b) => b.points - a.points);

  const SchemeSection = ({ title, schemes }: { title: string; schemes: SchemeStats[] }) => (
    <div>
      <h3 className="text-lg font-medium text-primary-600 dark:text-primary-400 mb-4">{title}</h3>
      <div className="space-y-4">
        {schemes.map((scheme) => {
          const fieldGoals = calculateFieldGoals(scheme.plays);
          
          // Calculate rebound statistics
          const rebounds = scheme.plays.filter(p => 
            (p.type === 'missed2' || p.type === 'missed3') && p.offensiveRebound === true
          ).length;
          const reboundPoints = scheme.plays.reduce((acc, p) => 
            acc + (p.reboundPoints || 0), 0
          );
          
          // Calculate assists for this scheme
          const assists = scheme.plays.filter(p => p.hasAssist === true).length;
          
          return (
            <div key={scheme.name} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-base font-medium text-gray-900 dark:text-white">{scheme.name}</h4>
                <div className="flex items-center gap-4">
                  {/* Efficiency Badge */}
                  <div className="flex flex-col items-center">
                    <div className={`text-lg font-bold rounded-lg px-3 py-1 ${
                      scheme.efficiency >= 60 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                      scheme.efficiency >= 40 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {scheme.efficiency}%
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Efficacia</span>
                  </div>
                  {/* Productivity Badge */}
                  <div className="flex flex-col items-center">
                    <div className={`text-lg font-bold rounded-lg px-3 py-1 ${
                      scheme.productivity >= 2 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                      scheme.productivity >= 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {scheme.productivity.toFixed(1)}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Produttività</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Azioni totali</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{scheme.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Punti totali</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {scheme.points}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rimbalzi</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {rebounds} ({reboundPoints}pt)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Assist</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {assists}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Canestri da 2</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {fieldGoals.made2}/{fieldGoals.total2}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Canestri da 3</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {fieldGoals.made3}/{fieldGoals.total3}
                  </p>
                </div>
                <div className="col-span-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Falli subiti</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {scheme.foulInbound + scheme.foulShot}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Palle perse</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {scheme.turnover}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Dettaglio Schemi</h2>
      <div className="space-y-8">
        {uomoSchemes.length > 0 && (
          <SchemeSection title="Schemi Uomo" schemes={uomoSchemes} />
        )}
        {zonaSchemes.length > 0 && (
          <SchemeSection title="Schemi Zona" schemes={zonaSchemes} />
        )}
        {rimesseSchemes.length > 0 && (
          <SchemeSection title="Schemi Rimesse" schemes={rimesseSchemes} />
        )}
      </div>
    </div>
  );
}