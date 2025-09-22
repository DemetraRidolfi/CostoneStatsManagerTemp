import React, { useState } from 'react';
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

  const schemes = getEnabledSchemes();

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

  if (tabletMode) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 h-[calc(100vh-16rem)] flex flex-col">
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
        <div className="flex-1 overflow-y-auto p-1">
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-[calc(100vh-16rem)] overflow-y-auto">
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
  );
}