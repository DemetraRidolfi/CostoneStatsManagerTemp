import React, { useState } from 'react';
import { Plus, Minus, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTeamData } from '../../hooks/useTeamData';

type Props = {
  onSelect: (schemeId: string) => void;
};

type Category = 'Uomo' | 'Rimesse' | 'Zona';

export default function SchemeSelector({ onSelect }: Props) {
  const { tabletMode } = useTheme();
  const { getEnabledSchemes } = useTeamData();
  const [selectedCategory, setSelectedCategory] = useState<Category>('Uomo');
  const [playerFouls, setPlayerFouls] = useState<Record<number, number>>({});
  const [showFoulModal, setShowFoulModal] = useState<number | null>(null);

  const schemes = getEnabledSchemes();
  const { getEnabledPlayers } = useTeamData();
  const players = getEnabledPlayers();

  // Calculate dynamic height based on number of players
  const getGridRows = () => Math.ceil(players.length / 6);
  const getContainerHeight = () => {
    const rows = getGridRows();
    if (tabletMode) {
      // Tablet: base height + additional height per row
      const baseHeight = 12; // 3rem
      const additionalHeight = rows > 1 ? (rows - 1) * 8 : 0; // 2rem per additional row
      return `h-[${baseHeight + additionalHeight}rem]`;
    } else {
      // Desktop: base height + additional height per row
      const baseHeight = 16; // 4rem
      const additionalHeight = rows > 1 ? (rows - 1) * 10 : 0; // 2.5rem per additional row
      return `h-[${baseHeight + additionalHeight}rem]`;
    }
  };

  // Get minimum height for single row
  const getMinHeight = () => {
    return tabletMode ? 'min-h-[3rem]' : 'min-h-[4rem]';
  };

  // Organize schemes by category
  const uomoSchemes = schemes.filter(s => s.category === 'Uomo' && !s.name.includes('ZONA'));
  const zonaSchemes = schemes.filter(s => s.name.includes('ZONA') || s.category === 'Zona');
  
  // Split rimesse schemes into laterale and fondo
  const rimesseLaterale = schemes.filter(s => s.category === 'Rimesse' && s.name.includes('LATERALE'));
  const rimesseFondo = schemes.filter(s => s.category === 'Rimesse' && s.name.includes('FONDO'));
  const rimesseSchemes = [...rimesseLaterale, ...rimesseFondo];

  const categoryMap: Record<Category, Scheme[]> = {
    'Uomo': uomoSchemes,
    'Zona': zonaSchemes,
    'Rimesse': rimesseSchemes,
  };

  const getTextColor = (schemeName: string, category?: string) => {
    // Special case for RIMESSE category zone schemes
    if (category === 'Rimesse' && (schemeName === 'LATERALE ZONA' || schemeName === 'FONDO ZONA')) {
      return 'text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 font-semibold';
    }
    
    // Return the scheme's custom text color or default
    return 'text-gray-800 dark:text-gray-100 group-hover:text-primary-700 dark:group-hover:text-primary-400';
  };

  const getSchemeTextColor = (scheme: any, category?: string) => {
    // Special case for RIMESSE category zone schemes
    if (category === 'Rimesse' && (scheme.name === 'LATERALE ZONA' || scheme.name === 'FONDO ZONA')) {
      return 'text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 font-semibold';
    }
    
    // Use custom text color if available, otherwise use default
    return scheme.textColor || 'text-gray-800 dark:text-gray-100 group-hover:text-primary-700 dark:group-hover:text-primary-400';
  };

  const getFoulColor = (fouls: number) => {
    if (fouls >= 5) return 'text-red-500';
    if (fouls >= 4) return 'text-orange-500';
    if (fouls >= 3) return 'text-yellow-500';
    return 'text-gray-900 dark:text-white';
  };

  const updatePlayerFouls = (playerId: number, change: number) => {
    setPlayerFouls(prev => {
      const currentFouls = prev[playerId] || 0;
      const newFouls = Math.max(0, Math.min(5, currentFouls + change));
      return { ...prev, [playerId]: newFouls };
    });
  };

  if (tabletMode) {
    return (
      <div className="flex flex-col h-[calc(100vh-12rem)] scheme-selector-portrait">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 flex-1 flex flex-col">
        {/* Category Selector */}
        <div className="flex gap-2 mb-3">
          {Object.keys(categoryMap).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as Category)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Schemes Grid */}
        <div className="flex-1 overflow-y-auto p-1 scheme-selector-container">
          {selectedCategory === 'Rimesse' ? (
            <div className="space-y-3">
              {/* Laterale schemes section */}
              <div>
                <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Laterale</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {rimesseLaterale.map(scheme => (
                    <button
                      key={scheme.id}
                      onClick={() => onSelect(scheme.id)}
                      className="group flex items-center justify-center min-h-[2.75rem] px-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-400 dark:hover:border-primary-600 transition-all text-center transform-gpu"
                    >
                      <span className={`text-center font-medium text-[0.7rem] leading-tight ${getSchemeTextColor(scheme, 'Rimesse')} transition-colors px-0.5`}>
                        {scheme.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Fondo schemes section */}
              <div>
                <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Fondo</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {rimesseFondo.map(scheme => (
                    <button
                      key={scheme.id}
                      onClick={() => onSelect(scheme.id)}
                      className="group flex items-center justify-center min-h-[2.75rem] px-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-400 dark:hover:border-primary-600 transition-all text-center transform-gpu"
                    >
                      <span className={`text-center font-medium text-[0.7rem] leading-tight ${getSchemeTextColor(scheme, 'Rimesse')} transition-colors px-0.5`}>
                        {scheme.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {categoryMap[selectedCategory].map(scheme => (
                <button
                  key={scheme.id}
                  onClick={() => onSelect(scheme.id)}
                  className="group flex items-center justify-center min-h-[2.75rem] px-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-400 dark:hover:border-primary-600 transition-all text-center transform-gpu"
                >
                  <span className={`text-center font-medium text-[0.7rem] leading-tight ${getSchemeTextColor(scheme)} transition-colors px-0.5`}>
                    {scheme.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

        {/* Foul Tracking Bar - Tablet */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 mt-3 foul-tracking-portrait ${getContainerHeight()}`}>
          <div className={`grid grid-cols-6 gap-2 h-full ${getMinHeight()}`}>
            {players.map(player => {
              const fouls = playerFouls[player.id] || 0;
              return (
                <button
                  key={player.id}
                  onClick={() => setShowFoulModal(player.id)}
                  className="flex flex-col items-center justify-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[2.5rem]"
                >
                  <div className={`w-6 h-6 ${getFoulColor(fouls) === 'text-gray-900 dark:text-white' ? 'bg-primary-600' : 'bg-current'} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                    {player.number}
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white text-center">
                    {player.name.split(' ').slice(-1)[0]}
                  </span>
                  <span className={`text-xs font-bold ${getFoulColor(fouls)}`}>
                    {fouls}F
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  const SchemeSection = ({ title, schemes }: { title: string; schemes: Scheme[] }) => (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 p-2">
        {schemes.map(scheme => (
          <button
            key={scheme.id}
            onClick={() => onSelect(scheme.id)}
            className={`group h-16 px-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-400 dark:hover:border-primary-600 transition-all hover:scale-105 shadow-sm hover:shadow flex items-center justify-center transform-gpu`}
          >
            <span className={`text-center font-medium text-sm tracking-wide ${title === 'Rimesse' ? getSchemeTextColor(scheme, 'Rimesse') : getSchemeTextColor(scheme)} transition-colors`}>
              {scheme.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex-1 overflow-y-auto">
      <div className="space-y-6">
        {uomoSchemes.length > 0 && (
          <SchemeSection title="Uomo" schemes={uomoSchemes} />
        )}
        {zonaSchemes.length > 0 && (
          <SchemeSection title="Zona" schemes={zonaSchemes} />
        )}
        {rimesseSchemes.length > 0 && (
          <SchemeSection title="Rimesse" schemes={rimesseSchemes} />
        )}
      </div>
      </div>

      {/* Foul Tracking Bar - Desktop */}
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mt-4 ${getContainerHeight()}`}>
        <div className={`grid grid-cols-6 gap-3 h-full ${getMinHeight()}`}>
          {players.map(player => {
            const fouls = playerFouls[player.id] || 0;
            return (
              <button
                key={player.id}
                onClick={() => setShowFoulModal(player.id)}
                className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[3.5rem]"
              >
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {player.number}
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white text-center mt-1">
                    {player.name.split(' ').slice(-1)[0]}
                  </span>
                </div>
                <div className={`text-3xl font-bold ${getFoulColor(fouls)}`}>
                    {fouls}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Foul Modal */}
      {showFoulModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            {(() => {
              const player = players.find(p => p.id === showFoulModal);
              const fouls = playerFouls[showFoulModal] || 0;
              return (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      #{player?.number} {player?.name}
                    </h3>
                    <button
                      onClick={() => setShowFoulModal(null)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className={`w-24 h-24 ${getFoulColor(fouls) === 'text-gray-900 dark:text-white' ? 'bg-primary-600' : 'bg-current'} rounded-xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4`}>
                      {fouls}
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {fouls === 1 ? '1 Fallo' : `${fouls} Falli`}
                    </p>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => updatePlayerFouls(showFoulModal, -1)}
                      disabled={fouls === 0}
                      className="flex items-center justify-center w-20 h-20 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-2xl font-bold transition-colors"
                    >
                      <Minus className="w-8 h-8" />
                    </button>
                    <button
                      onClick={() => updatePlayerFouls(showFoulModal, 1)}
                      disabled={fouls === 5}
                      className="flex items-center justify-center w-20 h-20 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-2xl font-bold transition-colors"
                    >
                      <Plus className="w-8 h-8" />
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}