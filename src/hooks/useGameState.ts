import { useState, useEffect } from 'react';
import type { Game, PlayResult } from '../types';
import { 
  saveActiveGame, 
  getActiveGame, 
  clearActiveGame, 
  saveDraftGame, 
  saveGame, 
  deleteDraftGame,
  getDraftGame,
  cleanupOldDrafts
} from '../services/gameService';

export function useGameState(draftId?: string) {
  const [gameData, setGameData] = useState<Partial<Game>>({
    date: new Date().toISOString().split('T')[0],
    opponent: '',
    location: '',
    matchType: 'AMICHEVOLE',
    plays: [],
  });

  const [currentStep, setCurrentStep] = useState<'initial' | 'scheme' | 'player' | 'result'>('initial');
  const [selectedScheme, setSelectedScheme] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [showStats, setShowStats] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Load initial state and clean up old drafts
  useEffect(() => {
    const loadInitialState = () => {
      try {
        // Clean up old drafts first
        cleanupOldDrafts();

        if (draftId) {
          const draft = getDraftGame(draftId);
          if (draft) {
            setGameData(draft);
            setCurrentStep('scheme');
            saveActiveGame(draft);
            return;
          }
        }

        const activeGame = getActiveGame();
        if (activeGame?.date && activeGame?.opponent && activeGame?.location) {
          setGameData(activeGame);
          setCurrentStep('scheme');
        }
      } catch (error) {
        console.error('Error loading game state:', error);
      }
    };

    loadInitialState();
  }, [draftId]);

  // Save active game whenever gameData changes
  useEffect(() => {
    if (gameData.opponent && currentStep !== 'initial') {
      saveActiveGame(gameData);
    }
  }, [gameData, currentStep]);

  const updateGameData = (updates: Partial<Game>) => {
    setGameData(prev => {
      const updated = { ...prev, ...updates };
      saveActiveGame(updated);
      return updated;
    });
  };

  const addPlay = (play: PlayResult) => {
    setGameData(prev => {
      const updated = {
        ...prev,
        plays: [...(prev.plays || []), play],
      };
      saveActiveGame(updated);
      return updated;
    });
  };

  const deletePlay = (timestamp: number) => {
    setGameData(prev => {
      const updated = {
        ...prev,
        plays: prev.plays?.filter(play => play.timestamp !== timestamp) || [],
      };
      saveActiveGame(updated);
      return updated;
    });
  };

  const saveDraft = () => {
    if (gameData.date && gameData.opponent && gameData.location) {
      try {
        const newDraftId = saveDraftGame(gameData);
        setSaveMessage('Partita salvata');
        setTimeout(() => setSaveMessage(''), 2000);
        return newDraftId;
      } catch (error) {
        console.error('Error saving draft:', error);
        setSaveMessage('Errore durante il salvataggio');
        setTimeout(() => setSaveMessage(''), 2000);
        return null;
      }
    }
    return null;
  };

  const endGame = () => {
    if (gameData.date && gameData.opponent && gameData.location) {
      try {
        if (draftId) {
          deleteDraftGame(draftId);
        }
        saveGame(gameData as Game);
        clearActiveGame();
        return true;
      } catch (error) {
        console.error('Error ending game:', error);
        return false;
      }
    }
    return false;
  };

  const resetGame = () => {
    clearActiveGame();
    setGameData({
      date: new Date().toISOString().split('T')[0],
      opponent: '',
      location: '',
      matchType: 'AMICHEVOLE',
      plays: [],
    });
    setCurrentStep('initial');
    setSelectedScheme(null);
    setSelectedPlayer(null);
  };

  return {
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
  };
}