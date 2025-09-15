import React, { createContext, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getActiveGame, saveDraftGame, clearActiveGame } from '../services/gameService';

type NavigationContextType = {
  showNavigationGuard: boolean;
  handleNavigation: (to: string) => void;
  navigationTarget: string | null;
  closeNavigationGuard: () => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [showNavigationGuard, setShowNavigationGuard] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (to: string) => {
    // Don't show guard if navigating to the same route
    if (location.pathname === to) {
      return;
    }

    // Check if there's an active game
    const activeGame = getActiveGame();
    if (activeGame?.opponent && location.pathname.includes('/new-game')) {
      setNavigationTarget(to);
      setShowNavigationGuard(true);
    } else {
      navigate(to);
    }
  };

  const closeNavigationGuard = () => {
    setShowNavigationGuard(false);
    setNavigationTarget(null);
  };

  const handleSaveAndExit = () => {
    const activeGame = getActiveGame();
    if (activeGame) {
      try {
        saveDraftGame(activeGame);
        navigate(navigationTarget!);
        closeNavigationGuard();
      } catch (error) {
        console.error('Error saving game:', error);
        // Show error message to user
        alert('Errore durante il salvataggio della partita');
      }
    }
  };

  const handleExitWithoutSaving = () => {
    clearActiveGame();
    navigate(navigationTarget!);
    closeNavigationGuard();
  };

  return (
    <NavigationContext.Provider
      value={{
        showNavigationGuard,
        handleNavigation,
        navigationTarget,
        closeNavigationGuard,
      }}
    >
      {children}
      {/* Navigation Guard Modal */}
      {showNavigationGuard && navigationTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Uscire dalla partita?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Hai una partita in corso. Vuoi salvare i progressi prima di uscire?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSaveAndExit}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Salva ed esci
              </button>
              <button
                onClick={handleExitWithoutSaving}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Esci senza salvare
              </button>
              <button
                onClick={closeNavigationGuard}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}