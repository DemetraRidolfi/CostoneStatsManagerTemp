import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SchemeSelector from './game/SchemeSelector';
import PlayerSelector from './game/PlayerSelector';
import PlayResult from './game/PlayResult';
import GameHeader from './game/GameHeader';
import PlayHistory from './game/PlayHistory';
import LiveStats from './game/LiveStats';
import { schemes } from '../data/schemes';
import { useGameState } from '../hooks/useGameState';
import { ArrowLeft, Save, BarChart2, CheckCircle, AlertTriangle } from 'lucide-react';
import TimeoutTracker from './game/TimeoutTracker';
import { useNavigation } from '../contexts/NavigationContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTeamData } from '../hooks/useTeamData';

// Custom hook to detect portrait orientation
const useIsPortrait = () => {
  const [isPortrait, setIsPortrait] = React.useState(
    typeof window !== 'undefined' ? window.matchMedia('(orientation: portrait)').matches : false
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(orientation: portrait)');
    const handleChange = (e: MediaQueryListEvent) => setIsPortrait(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isPortrait;
};

export default function NewGame() {
  const navigate = useNavigate();
  const { draftId } = useParams();
  const { handleNavigation } = useNavigation();
  const { menuVisible, tabletMode } = useTheme();
  const { getEnabledPlayers, getEnabledSchemes } = useTeamData();
  const isPortrait = useIsPortrait();
  const {
    gameData,
    currentStep,
    selectedScheme,
    selectedPlayer,
    saveMessage,
    showStats,
    showEndConfirm,
    timeouts,
    addTimeout,
    removeTimeout,
    changeQuarter,
    setCurrentStep,
    setSelectedScheme,
    setSelectedPlayer,
    setShowStats,
    setShowEndConfirm,
    updateGameData,
    addPlay,
    deletePlay,
    saveDraft,
    endGame,
    resetGame,
  } = useGameState(draftId);

  const PLAYERS = getEnabledPlayers();
  const schemes = getEnabledSchemes();
  const handleGameStart = (data: Partial<Game>) => {
    updateGameData(data);
    setCurrentStep('scheme');
  };

  const handleSchemeSelect = (schemeId: string) => {
    setSelectedScheme(schemeId);
    setCurrentStep('player');
  };

  const handlePlayerSelect = (playerId: number | null) => {
    if (playerId === null) {
      addPlay({
        type: 'noImpact',
        playerId: -1,
        schemeId: selectedScheme!,
        timestamp: Date.now(),
      });
      setCurrentStep('scheme');
      setSelectedScheme(null);
      setSelectedPlayer(null);
    } else {
      setSelectedPlayer(playerId);
      setCurrentStep('result');
    }
  };

  const handlePlayResult = (result: PlayResultType) => {
    addPlay(result);
    setCurrentStep('scheme');
    setSelectedScheme(null);
    setSelectedPlayer(null);
  };

  const handleEndGame = () => {
    if (endGame()) {
      navigate('/games');
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'scheme':
        handleNavigation('/');
        break;
      case 'player':
        setCurrentStep('scheme');
        setSelectedScheme(null);
        break;
      case 'result':
        setCurrentStep('player');
        setSelectedPlayer(null);
        break;
    }
  };

  if (currentStep === 'initial') {
    return <GameHeader onStart={handleGameStart} initialData={gameData} />;
  }

  // Calculate dynamic top spacing based on menu visibility and orientation
  const getTopSpacing = () => {
    if (isPortrait) {
      return menuVisible ? 'pt-20' : 'pt-10'; // Further reduced space in portrait for better layout
    }
    return menuVisible ? 'pt-20' : 'pt-8'; // Desktop spacing
  };

  return (
    <div className={`flex flex-col h-screen transition-all duration-300 ${getTopSpacing()}`}>
      {/* Confirmation Dialog */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Concludi Partita</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Sei sicuro di voler concludere la partita? Questa azione non può essere annullata.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Annulla
              </button>
              <button
                onClick={handleEndGame}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Concludi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className={`fixed left-0 right-0 z-30 bg-white dark:bg-gray-800 shadow-md p-4 mx-4 rounded-xl transition-all duration-300 ${
        menuVisible 
          ? isPortrait ? 'top-14' : 'top-16' 
          : isPortrait ? 'top-1' : 'top-2'
      }`}>
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Indietro
          </button>
          
          {/* Compact Timeout Tracker */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">TIMEOUT:</span>
            
            {/* 1-2 Quarter Group */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2].map((quarter) => (
                  <button
                    key={quarter}
                    onClick={() => changeQuarter(quarter as 1 | 2 | 3 | 4 | 5)}
                    className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                      timeouts.currentQuarter === quarter
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {quarter}Q
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={removeTimeout}
                  disabled={(() => {
                    switch (timeouts.currentQuarter) {
                      case 1: return timeouts.firstQuarter === 0;
                      case 2: return timeouts.secondQuarter === 0;
                      default: return true;
                    }
                  })()}
                  className="w-7 h-7 rounded bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center text-sm font-bold"
                >
                  -
                </button>
                <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[3rem] text-center">
                  {(() => {
                    if (timeouts.currentQuarter <= 2) {
                      const current = timeouts.currentQuarter === 1 ? timeouts.firstQuarter : timeouts.secondQuarter;
                      return `${current}/2`;
                    }
                    return '0/2';
                  })()}
                </span>
                <button
                  onClick={addTimeout}
                  disabled={(() => {
                    switch (timeouts.currentQuarter) {
                      case 1: return timeouts.firstQuarter >= 2;
                      case 2: return timeouts.secondQuarter >= 2;
                      default: return true;
                    }
                  })()}
                  className="w-7 h-7 rounded bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* 3-4 Quarter Group */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[3, 4].map((quarter) => (
                  <button
                    key={quarter}
                    onClick={() => changeQuarter(quarter as 1 | 2 | 3 | 4 | 5)}
                    className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                      timeouts.currentQuarter === quarter
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {quarter}Q
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={removeTimeout}
                  disabled={(() => {
                    switch (timeouts.currentQuarter) {
                      case 3: return timeouts.thirdQuarter === 0;
                      case 4: return timeouts.fourthQuarter === 0;
                      default: return true;
                    }
                  })()}
                  className="w-7 h-7 rounded bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center text-sm font-bold"
                >
                  -
                </button>
                <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[3rem] text-center">
                  {(() => {
                    if (timeouts.currentQuarter >= 3 && timeouts.currentQuarter <= 4) {
                      const current = timeouts.currentQuarter === 3 ? timeouts.thirdQuarter : timeouts.fourthQuarter;
                      return `${current}/3`;
                    }
                    return '0/3';
                  })()}
                </span>
                <button
                  onClick={addTimeout}
                  disabled={(() => {
                    switch (timeouts.currentQuarter) {
                      case 3: return timeouts.thirdQuarter >= 3;
                      case 4: return timeouts.fourthQuarter >= 3;
                      default: return true;
                    }
                  })()}
                  className="w-7 h-7 rounded bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Supplementare Group */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeQuarter(5)}
                className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                  timeouts.currentQuarter === 5
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                SUP
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={removeTimeout}
                  disabled={timeouts.currentQuarter !== 5 || timeouts.overtime === 0}
                  className="w-7 h-7 rounded bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center text-sm font-bold"
                >
                  -
                </button>
                <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[3rem] text-center">
                  {timeouts.currentQuarter === 5 ? `${timeouts.overtime}/1` : '0/1'}
                </span>
                <button
                  onClick={addTimeout}
                  disabled={timeouts.currentQuarter !== 5 || timeouts.overtime >= 1}
                  className="w-7 h-7 rounded bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saveMessage && (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{saveMessage}</span>
              </div>
            )}
            <button
              onClick={() => setShowStats(!showStats)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showStats 
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Statistiche
            </button>
            <button
              onClick={saveDraft}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Salva Partita
            </button>
            <button
              onClick={() => setShowEndConfirm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Concludi Partita
            </button>
          </div>
        </div>
        {showStats && (
          <div className="mt-4">
            <LiveStats plays={gameData.plays || []} />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 grid grid-cols-1 lg:grid-cols-6 gap-6 p-4 min-h-0 transition-all duration-300 ${
        isPortrait ? 'mt-16' : 'mt-16'
      }`}>
        {/* Left Side - Play History */}
        <div className="lg:col-span-1 flex flex-col min-h-0">
          <PlayHistory 
            plays={gameData.plays || []} 
            players={PLAYERS}
            schemes={schemes}
            onDelete={deletePlay}
            fillHeight={false}
          />
        </div>

        {/* Right Side - Main Content */}
        <div className="lg:col-span-5 flex flex-col min-h-0">
          {currentStep === 'scheme' && (
            <SchemeSelector onSelect={handleSchemeSelect} />
          )}

          {currentStep === 'player' && (
            <PlayerSelector onSelect={handlePlayerSelect} />
          )}

          {currentStep === 'result' && selectedScheme && selectedPlayer && (
            <PlayResult
              schemeId={selectedScheme}
              playerId={selectedPlayer}
              onSave={handlePlayResult}
              onCancel={() => setCurrentStep('scheme')}
            />
          )}
        </div>
      </div>
    </div>
  );
}