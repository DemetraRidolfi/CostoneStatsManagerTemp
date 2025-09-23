import { useState, useEffect } from 'react';

type Player = {
  id: number;
  name: string;
  nickname?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
  number: string;
  imageUrl: string;
  enabled?: boolean;
  order?: number;
};

type Scheme = {
  id: string;
  name: string;
  category: 'Uomo' | 'Zona' | 'Rimesse';
  textColor?: string;
  enabled?: boolean;
  order?: number;
};

const PLAYERS_STORAGE_KEY = 'costone_players';
const SCHEMES_STORAGE_KEY = 'costone_schemes';

// Default players (existing ones)
const DEFAULT_PLAYERS: Player[] = [
  { id: 1, name: 'BROCCO', number: '1', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png', enabled: true, order: 1 },
  { id: 2, name: 'MASSARI', number: '4', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png', enabled: true, order: 2 },
  { id: 3, name: 'SEBASTIANELLI', number: '22', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png', enabled: true, order: 3 },
  { id: 4, name: 'NASELLO', number: '7', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png', enabled: true, order: 4 },
  { id: 5, name: 'F. PAOLI', number: '8', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png', enabled: true, order: 5 },
  { id: 6, name: 'M. PAOLI', number: '9', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png', enabled: true, order: 6 },
  { id: 7, name: 'BANCHI', number: '11', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png', enabled: true, order: 7 },
  { id: 8, name: 'ZENELI', number: '13', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png', enabled: true, order: 8 },
  { id: 9, name: 'BRUTTINI', number: '18', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png', enabled: true, order: 9 },
  { id: 10, name: 'BASTONE', number: '23', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png', enabled: true, order: 10 },
  { id: 11, name: 'TORRIGIANI', number: '77', imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png', enabled: true, order: 11 },
];

// Default schemes (existing ones)
const DEFAULT_SCHEMES: Scheme[] = [
  { id: 'no-call', name: 'NO CALL', category: 'Uomo', textColor: 'text-sky-600 dark:text-sky-400', enabled: true, order: 1 },
  { id: 'transizione', name: 'TRANSIZIONE', category: 'Uomo', textColor: 'text-emerald-600 dark:text-emerald-400', enabled: true, order: 2 },
  { id: 'drag', name: 'DRAG', category: 'Uomo', enabled: true, order: 3 },
  { id: 'shake', name: 'SHAKE', category: 'Uomo', enabled: true, order: 4 },
  { id: 'shake-lato', name: 'SHAKE LATO', category: 'Uomo', enabled: true, order: 5 },
  { id: 'pollice-basso', name: 'POLLICE BASSO', category: 'Uomo', enabled: true, order: 6 },
  { id: 'pollice-lato', name: 'POLLICE LATO', category: 'Uomo', enabled: true, order: 7 },
  { id: 'pollice-flash', name: 'POLLICE FLASH', category: 'Uomo', enabled: true, order: 8 },
  { id: 'due', name: 'DUE', category: 'Uomo', enabled: true, order: 9 },
  { id: 'corna', name: 'CORNA', category: 'Uomo', enabled: true, order: 10 },
  { id: 'corna-lato', name: 'CORNA LATO', category: 'Uomo', enabled: true, order: 11 },
  { id: 'giro', name: 'GIRO', category: 'Uomo', enabled: true, order: 12 },
  { id: 'pugno-basso', name: 'PUGNO BASSO', category: 'Uomo', enabled: true, order: 13 },
  { id: 'testa', name: 'TESTA', category: 'Uomo', enabled: true, order: 14 },
  { id: 'cinque', name: '52', category: 'Uomo', enabled: true, order: 15 },
  { id: 'tre', name: 'TRE', category: 'Uomo', enabled: true, order: 16 },
  { id: 'tre-lato', name: 'TRE LATO', category: 'Uomo', enabled: true, order: 17 },
  { id: 'tre-basso', name: 'TRE BASSO', category: 'Uomo', enabled: true, order: 18 },
  { id: 'quattro', name: 'QUATTRO', category: 'Uomo', enabled: true, order: 19 },
  { id: 'due-basso', name: 'DUE BASSO', category: 'Uomo', enabled: true, order: 20 },
  { id: 'fissi', name: 'FISSI ZONA 2-3', category: 'Zona', textColor: 'text-red-600 dark:text-red-400', enabled: true, order: 1 },
  { id: 'due_zona', name: 'DUE ZONA 2-3', category: 'Zona', textColor: 'text-red-600 dark:text-red-400', enabled: true, order: 2 },
  { id: 'corna_zona', name: 'CORNA ZONA 2-3', category: 'Zona', textColor: 'text-red-600 dark:text-red-400', enabled: true, order: 3 },
  { id: 'x', name: 'X 2-3', category: 'Zona', textColor: 'text-red-600 dark:text-red-400', enabled: true, order: 4 },
  { id: 'no-call_zona', name: 'NO CALL ZONA 2-3', category: 'Zona', textColor: 'text-red-600 dark:text-red-400', enabled: true, order: 5 },
  { id: 'corna_131', name: 'CORNA ZONA 1-3-1', category: 'Zona', textColor: 'text-emerald-600 dark:text-emerald-400', enabled: true, order: 6 },
  { id: 'drag_131', name: 'DRAG ZONA 1-3-1', category: 'Zona', textColor: 'text-emerald-600 dark:text-emerald-400', enabled: true, order: 7 },
  { id: 'fissi_131', name: 'FISSI ZONA 1-3-1', category: 'Zona', textColor: 'text-emerald-600 dark:text-emerald-400', enabled: true, order: 8 },
  { id: 'due_131', name: 'DUE ZONA 1-3-1', category: 'Zona', textColor: 'text-emerald-600 dark:text-emerald-400', enabled: true, order: 9 },
  { id: 'no_call_131', name: 'NO CALL ZONA 1-3-1', category: 'Zona', textColor: 'text-emerald-600 dark:text-emerald-400', enabled: true, order: 10 },
  { id: 'corna-basso', name: 'LATERALE CORNA LATO', category: 'Rimesse', enabled: true, order: 1 },
  { id: 'laterale_flash', name: 'LATERALE FLASH', category: 'Rimesse', enabled: true, order: 2 },
  { id: 'laterale_pollice_basso', name: 'LATERALE POLLICE BASSO', category: 'Rimesse', enabled: true, order: 3 },
  { id: 'laterale_pugno_basso', name: 'LATERALE PUGNO BASSO', category: 'Rimesse', enabled: true, order: 4 },
  { id: 'laterale_zona', name: 'LATERALE ZONA', category: 'Rimesse', textColor: 'text-red-600 dark:text-red-400', enabled: true, order: 5 },
  { id: 'fondo_flash', name: 'FONDO FLASH', category: 'Rimesse', enabled: true, order: 6 },
  { id: 'fondo_pollice_basso', name: 'FONDO POLLICE BASSO', category: 'Rimesse', enabled: true, order: 7 },
  { id: 'fondo_zona', name: 'FONDO ZONA', category: 'Rimesse', textColor: 'text-red-600 dark:text-red-400', enabled: true, order: 8 },
];

function safeJSONParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
}

function safeJSONSave(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data to ${key}:`, error);
    throw error;
  }
}

export function useTeamData() {
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = safeJSONParse(localStorage.getItem(PLAYERS_STORAGE_KEY), null);
    return saved || DEFAULT_PLAYERS;
  });

  const [schemes, setSchemes] = useState<Scheme[]>(() => {
    const saved = safeJSONParse(localStorage.getItem(SCHEMES_STORAGE_KEY), null);
    return saved || DEFAULT_SCHEMES;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    safeJSONSave(PLAYERS_STORAGE_KEY, players);
  }, [players]);

  useEffect(() => {
    safeJSONSave(SCHEMES_STORAGE_KEY, schemes);
  }, [schemes]);

  const addPlayer = (player: Player) => {
    const maxOrder = Math.max(...players.map(p => p.order || 0), 0);
    const playerWithOrder = { 
      ...player, 
      order: maxOrder + 1, 
      enabled: player.enabled !== false 
    };
    setPlayers(prev => [...prev, playerWithOrder]);
  };

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  };

  const deletePlayer = (playerId: number) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const movePlayer = (playerId: number, direction: 'up' | 'down') => {
    setPlayers(prev => {
      // Create a copy and sort by order
      const sortedPlayers = [...prev].sort((a, b) => (a.order || 0) - (b.order || 0));
      const currentIndex = sortedPlayers.findIndex(p => p.id === playerId);
      
      if (currentIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= sortedPlayers.length) return prev;
      
      // Get the two players to swap
      const currentPlayer = sortedPlayers[currentIndex];
      const targetPlayer = sortedPlayers[newIndex];
      
      // Swap their order values
      const currentOrder = currentPlayer.order || 0;
      const targetOrder = targetPlayer.order || 0;
      
      // Update the players array with swapped orders
      return prev.map(p => {
        if (p.id === currentPlayer.id) {
          return { ...p, order: targetOrder };
        }
        if (p.id === targetPlayer.id) {
          return { ...p, order: currentOrder };
        }
        return p;
      });
    });
  };
  const addScheme = (scheme: Scheme) => {
    // Get the max order for the same category
    const categorySchemes = schemes.filter(s => s.category === scheme.category);
    const maxOrder = Math.max(...categorySchemes.map(s => s.order || 0), 0);
    const schemeWithEnabled = { 
      ...scheme, 
      enabled: scheme.enabled ?? true,
      order: maxOrder + 1
    };
    setSchemes(prev => [...prev, schemeWithEnabled]);
  };

  const updateScheme = (updatedScheme: Scheme) => {
    setSchemes(prev => prev.map(s => s.id === updatedScheme.id ? updatedScheme : s));
  };

  const deleteScheme = (schemeId: string) => {
    setSchemes(prev => prev.filter(s => s.id !== schemeId));
  };

  const moveScheme = (schemeId: string, direction: 'up' | 'down') => {
    setSchemes(prev => {
      const scheme = prev.find(s => s.id === schemeId);
      if (!scheme) return prev;

      // Create a copy and sort by order within the same category
      const allSchemes = [...prev];
      const categorySchemes = allSchemes
        .filter(s => s.category === scheme.category)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      const currentIndex = categorySchemes.findIndex(s => s.id === schemeId);
      if (currentIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= categorySchemes.length) return prev;
      
      // Get the two schemes to swap
      const currentScheme = categorySchemes[currentIndex];
      const targetScheme = categorySchemes[newIndex];
      
      // Swap their order values
      const currentOrder = currentScheme.order || 0;
      const targetOrder = targetScheme.order || 0;
      
      // Update the schemes array with swapped orders
      return allSchemes.map(s => {
        if (s.id === currentScheme.id) {
          return { ...s, order: targetOrder };
        }
        if (s.id === targetScheme.id) {
          return { ...s, order: currentOrder };
        }
        return s;
      });
    });
  };

  // Get enabled players sorted by order
  const getEnabledPlayers = () => {
    return players
      .filter(p => p.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  // Get enabled schemes sorted by order within category
  const getEnabledSchemes = () => {
    return schemes
      .filter(s => s.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };
  return {
    players,
    schemes,
    addPlayer,
    updatePlayer,
    deletePlayer,
    movePlayer,
    addScheme,
    updateScheme,
    deleteScheme,
    moveScheme,
    getEnabledPlayers,
    getEnabledSchemes,
  };
}