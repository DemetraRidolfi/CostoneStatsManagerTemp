import type { Game } from '../types';

const GAMES_STORAGE_KEY = 'costone_games';
const DRAFT_GAMES_KEY = 'costone_draft_games';
const ACTIVE_GAME_KEY = 'costone_active_game';

// Helper function to safely parse JSON with error handling
function safeJSONParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
}

// Helper function to safely stringify and save JSON
function safeJSONSave(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data to ${key}:`, error);
    throw error;
  }
}

export function saveGame(game: Game): void {
  try {
    const games = getAllGames();
    const newGame = {
      ...game,
      id: game.id || crypto.randomUUID(),
      status: 'completed',
      lastUpdated: new Date().toISOString(),
      matchType: game.matchType || 'AMICHEVOLE', // Default fallback
    };
    
    // Create a deep copy of the game data to prevent modifications
    const gameCopy = JSON.parse(JSON.stringify(newGame));
    
    const existingIndex = games.findIndex(g => g.id === gameCopy.id);
    if (existingIndex >= 0) {
      games[existingIndex] = gameCopy;
    } else {
      games.push(gameCopy);
    }
    
    safeJSONSave(GAMES_STORAGE_KEY, games);
    clearActiveGame();

    // If this was a draft game, remove it from drafts
    if (game.id) {
      deleteDraftGame(game.id);
    }
  } catch (error) {
    console.error('Error saving game:', error);
    throw error;
  }
}

export function saveDraftGame(game: Partial<Game>): string {
  try {
    const drafts = getAllDraftGames();
    const draftId = game.id || crypto.randomUUID();
    
    // Create a deep copy of the game data
    const gameCopy = JSON.parse(JSON.stringify({
      ...game,
      id: draftId,
      status: 'draft',
      lastUpdated: new Date().toISOString(),
      matchType: game.matchType || 'AMICHEVOLE', // Default fallback
    }));
    
    const existingIndex = drafts.findIndex(d => d.id === draftId);
    
    if (existingIndex >= 0) {
      drafts[existingIndex] = gameCopy;
    } else {
      drafts.push(gameCopy);
    }
    
    safeJSONSave(DRAFT_GAMES_KEY, drafts);
    return draftId;
  } catch (error) {
    console.error('Error saving draft game:', error);
    throw error;
  }
}

export function getAllGames(): Game[] {
  return safeJSONParse(localStorage.getItem(GAMES_STORAGE_KEY), []);
}

export function getAllDraftGames(): Game[] {
  return safeJSONParse(localStorage.getItem(DRAFT_GAMES_KEY), []);
}

export function getDraftGame(id: string): Game | undefined {
  const drafts = getAllDraftGames();
  const draft = drafts.find(game => game.id === id);
  // Return a deep copy to prevent modifications
  return draft ? JSON.parse(JSON.stringify(draft)) : undefined;
}

export function getGameById(id: string): Game | undefined {
  const games = getAllGames();
  const game = games.find(game => game.id === id);
  // Return a deep copy to prevent modifications
  return game ? JSON.parse(JSON.stringify(game)) : undefined;
}

export function deleteGame(id: string): void {
  try {
    const games = getAllGames();
    const filteredGames = games.filter(game => game.id !== id);
    safeJSONSave(GAMES_STORAGE_KEY, filteredGames);
  } catch (error) {
    console.error('Error deleting game:', error);
    throw error;
  }
}

export function deleteDraftGame(id: string): void {
  try {
    const drafts = getAllDraftGames();
    const filteredDrafts = drafts.filter(game => game.id !== id);
    safeJSONSave(DRAFT_GAMES_KEY, filteredDrafts);
  } catch (error) {
    console.error('Error deleting draft game:', error);
    throw error;
  }
}

export function saveActiveGame(game: Partial<Game>): void {
  try {
    // Create a deep copy of the game data
    const gameCopy = JSON.parse(JSON.stringify({
      ...game,
      lastUpdated: new Date().toISOString(),
    }));
    safeJSONSave(ACTIVE_GAME_KEY, gameCopy);
  } catch (error) {
    console.error('Error saving active game:', error);
    throw error;
  }
}

export function getActiveGame(): Partial<Game> | null {
  const game = safeJSONParse(localStorage.getItem(ACTIVE_GAME_KEY), null);
  // Return a deep copy to prevent modifications
  return game ? JSON.parse(JSON.stringify(game)) : null;
}

export function clearActiveGame(): void {
  try {
    localStorage.removeItem(ACTIVE_GAME_KEY);
  } catch (error) {
    console.error('Error clearing active game:', error);
    throw error;
  }
}

export function cleanupOldDrafts(maxAgeDays: number = 7): void {
  try {
    const drafts = getAllDraftGames();
    const now = new Date();
    const maxAge = maxAgeDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    
    const filteredDrafts = drafts.filter(draft => {
      const lastUpdated = new Date(draft.lastUpdated || 0);
      return now.getTime() - lastUpdated.getTime() < maxAge;
    });
    
    if (filteredDrafts.length !== drafts.length) {
      safeJSONSave(DRAFT_GAMES_KEY, filteredDrafts);
    }
  } catch (error) {
    console.error('Error cleaning up old drafts:', error);
    throw error;
  }
}