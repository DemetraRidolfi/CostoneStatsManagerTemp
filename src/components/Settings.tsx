import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Trash2, Database, Cog, Eye, Save, RotateCcw } from 'lucide-react';
import { getAllDraftGames, deleteDraftGame, getAllGames } from '../services/gameService';
import PageContainer from './layout/PageContainer';

const APP_VERSION = 'Release-Beta5.1-2.0';

export default function Settings() {
  const { 
    theme, 
    toggleTheme, 
    tabletMode,
    toggleTabletMode,
    highContrast, 
    toggleHighContrast,
    fontSize,
    setFontSize,
    animations,
    toggleAnimations,
    dataSaver,
    toggleDataSaver
  } = useTheme();
  const draftGames = getAllDraftGames();

  const handleDeleteDraft = (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa partita in corso?')) {
      deleteDraftGame(id);
      window.location.reload();
    }
  };

  const handleExportData = () => {
    try {
      const games = getAllGames();
      const drafts = getAllDraftGames();
      const settings = localStorage.getItem('theme_settings');
      
      const exportData = {
        games,
        drafts,
        settings: settings ? JSON.parse(settings) : null,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `costone-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Errore durante l\'esportazione dei dati');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (!data.games || !Array.isArray(data.games)) {
          throw new Error('Invalid backup file format');
        }

        localStorage.setItem('costone_games', JSON.stringify(data.games));
        if (data.drafts) {
          localStorage.setItem('costone_draft_games', JSON.stringify(data.drafts));
        }
        if (data.settings) {
          localStorage.setItem('theme_settings', JSON.stringify(data.settings));
        }

        alert('Backup ripristinato con successo');
        window.location.reload();
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Errore durante l\'importazione del backup');
      }
    };
    reader.readAsText(file);
  };

  return (
    <PageContainer 
      title="IMPOSTAZIONI"
      actions={
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <span>Versione</span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md font-mono">
            {APP_VERSION}
          </span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Tema</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {theme === 'light' ? 'Modalità chiara' : 'Modalità scura'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={theme === 'light' ? 'Attiva modalità scura' : 'Attiva modalità chiara'}
            >
              {theme === 'light' ? (
                <Moon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Gestione Dati</h2>
          </div>
          <div className="space-y-4">
            <button 
              onClick={handleExportData}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Save className="w-4 h-4" />
              Esporta tutti i dati
            </button>
            <div>
              <label className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:underline cursor-pointer">
                <RotateCcw className="w-4 h-4" />
                <span>Ripristina backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* System Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cog className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Performance</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Animazioni</span>
              <input 
                type="checkbox" 
                checked={animations}
                onChange={toggleAnimations}
                className="rounded text-primary-600 focus:ring-primary-500" 
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Modalità risparmio dati</span>
              <input 
                type="checkbox"
                checked={dataSaver}
                onChange={toggleDataSaver}
                className="rounded text-primary-600 focus:ring-primary-500" 
              />
            </label>
          </div>
        </div>

        {/* Accessibility */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Accessibilità</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Modalità Tablet</span>
              <input 
                type="checkbox"
                checked={tabletMode}
                onChange={toggleTabletMode}
                className="rounded text-primary-600 focus:ring-primary-500" 
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Contrasto elevato</span>
              <input 
                type="checkbox"
                checked={highContrast}
                onChange={toggleHighContrast}
                className="rounded text-primary-600 focus:ring-primary-500" 
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Dimensione testo</span>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value as 'normal' | 'large' | 'x-large')}
                className="rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="normal">Normale</option>
                <option value="large">Grande</option>
                <option value="x-large">Molto grande</option>
              </select>
            </label>
          </div>
        </div>

        {/* Draft Games Management */}
        {draftGames.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Partite in Corso
            </h2>
            <div className="space-y-3">
              {draftGames.map(draft => (
                <div 
                  key={draft.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      vs {draft.opponent}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(draft.lastUpdated!).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteDraft(draft.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Elimina partita"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
