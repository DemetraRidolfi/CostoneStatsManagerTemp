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
import { useNavigation } from '../contexts/NavigationContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTeamData } from '../hooks/useTeamData';

export default function NewGame() {
  const navigate = useNavigate();
  const { draftId } = useParams();
  const { handleNavigation } = useNavigation();
  const { menuVisible } = useTheme();
  const { getEnabledPlayers, getEnabledSchemes } = useTeamData();
  const {
    gameData,
    currentStep,
    selectedScheme,
    selectedPlayer,
    saveMessage,
    showStats,
    showEndConfirm,
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

  return (
    <div className="flex flex-col h-screen">
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
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-md p-4 rounded-xl">
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Indietro
          </button>
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
      <div className="flex-1 flex gap-6 p-4 min-h-0">
        {/* Left Side - Play History */}
        <div className="w-80 flex-shrink-0 flex flex-col min-h-0">
          <PlayHistory 
            plays={gameData.plays || []} 
            players={PLAYERS}
            schemes={schemes}
            onDelete={deletePlay}
          />
        </div>

        {/* Right Side - Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
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