import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SchemeSelector from './SchemeSelector';
import PlayerSelector from './PlayerSelector';
import PlayResult from './PlayResult';
import GameHeader from './GameHeader';
import PlayHistory from './PlayHistory';
import LiveStats from './LiveStats';
import { schemes } from '../../data/schemes';
import { useGameState } from '../../hooks/useGameState';
import { ArrowLeft, Save, BarChart2, CheckCircle, AlertTriangle, CloudOff } from 'lucide-react';

const PLAYERS = [
  { id: 1, name: 'BROCCO', number: '1', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png' },
  { id: 2, name: 'MASSARI', number: '4', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png' },
  { id: 3, name: 'RADCHENKO', number: '5', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png' },
  { id: 4, name: 'NASELLO', number: '7', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png' },
  { id: 5, name: 'F. PAOLI', number: '8', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png' },
  { id: 6, name: 'M. PAOLI', number: '9', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png' },
  { id: 7, name: 'BANCHI', number: '11', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png' },
  { id: 8, name: 'ZENELI', number: '13', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png' },
  { id: 9, name: 'BRUTTINI', number: '18', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png' },
  { id: 10, name: 'BASTONE', number: '23', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png' },
  { id: 11, name: 'TORRIGIANI', number: '77', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png' },
];

export default function NewGame() {
  const navigate = useNavigate();
  const { draftId } = useParams();
  const {
    gameData,
    currentStep,
    selectedScheme,
    selectedPlayer,
    saveMessage,
    showStats,
    showEndConfirm,
    autoSaveStatus,
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
        resetGame();
        navigate('/');
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
    <div className="max-w-7xl mx-auto px-4">
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
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-md mb-6 p-4 rounded-xl">
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Indietro
          </button>
          <div className="flex items-center gap-3">
            {autoSaveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">
                <CloudOff className="w-4 h-4" />
                <span className="text-sm font-medium">Errore salvataggio</span>
              </div>
            )}
            {autoSaveStatus === 'saving' && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg">
                <span className="text-sm font-medium">Salvataggio...</span>
              </div>
            )}
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
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 h-[calc(100vh-16rem)]">
        {/* Left Side - Play History */}
        <div className="lg:col-span-1 h-full overflow-hidden">
          <div className="h-full"> {/* Fixed height container */}
            <PlayHistory 
              plays={gameData.plays || []} 
              players={PLAYERS}
              schemes={schemes}
              onDelete={deletePlay}
            />
          </div>
        </div>

        {/* Right Side - Main Content */}
        <div className="lg:col-span-5 h-full overflow-hidden">
          <div className="h-full"> {/* Fixed height container */}
            {currentStep === 'scheme' && (
              <SchemeSelector schemes={schemes} onSelect={handleSchemeSelect} />
            )}

            {currentStep === 'player' && (
              <PlayerSelector players={PLAYERS} onSelect={handlePlayerSelect} />
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
    </div>
  );
}