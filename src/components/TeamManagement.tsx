import React, { useState } from 'react';
import { Users, BookOpen, Plus, Edit2, Trash2, Save, X, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useTeamData } from '../hooks/useTeamData';
import PageContainer from './layout/PageContainer';

type PlayerFormData = {
  id?: number;
  firstName: string;
  lastName: string;
  nickname: string;
  birthDate: string;
  email: string;
  phone: string;
  number: string;
  enabled: boolean;
};

type SchemeFormData = {
  id?: string;
  name: string;
  category: 'Uomo' | 'Zona' | 'Rimesse';
  textColor: string;
  enabled: boolean;
};

const TEXT_COLORS = [
  { name: 'Nero', value: 'text-gray-900 dark:text-white' },
  { name: 'Rosso', value: 'text-red-600 dark:text-red-400' },
  { name: 'Verde', value: 'text-emerald-600 dark:text-emerald-400' },
  { name: 'Blu', value: 'text-blue-600 dark:text-blue-400' },
  { name: 'Giallo', value: 'text-yellow-600 dark:text-yellow-400' },
  { name: 'Viola', value: 'text-purple-600 dark:text-purple-400' },
  { name: 'Rosa', value: 'text-pink-600 dark:text-pink-400' },
  { name: 'Arancione', value: 'text-orange-600 dark:text-orange-400' },
  { name: 'Azzurro', value: 'text-sky-600 dark:text-sky-400' },
  { name: 'Grigio', value: 'text-gray-600 dark:text-gray-400' },
];

export default function TeamManagement() {
  const { players, schemes, addPlayer, updatePlayer, deletePlayer, movePlayer, addScheme, updateScheme, deleteScheme, moveScheme } = useTeamData();
  
  const [activeTab, setActiveTab] = useState<'players' | 'schemes'>('players');
  const [movingScheme, setMovingScheme] = useState<string | null>(null);
  const [moveDirection, setMoveDirection] = useState<'up' | 'down' | null>(null);

  // Helper function to convert text color classes to background color classes
  const getColorBackground = (textColorClass: string) => {
    const colorMap: Record<string, string> = {
      'text-gray-900 dark:text-white': 'bg-gray-900 dark:bg-white',
      'text-red-600 dark:text-red-400': 'bg-red-600 dark:bg-red-400',
      'text-emerald-600 dark:text-emerald-400': 'bg-emerald-600 dark:bg-emerald-400',
      'text-blue-600 dark:text-blue-400': 'bg-blue-600 dark:bg-blue-400',
      'text-yellow-600 dark:text-yellow-400': 'bg-yellow-600 dark:bg-yellow-400',
      'text-purple-600 dark:text-purple-400': 'bg-purple-600 dark:bg-purple-400',
      'text-pink-600 dark:text-pink-400': 'bg-pink-600 dark:bg-pink-400',
      'text-orange-600 dark:text-orange-400': 'bg-orange-600 dark:bg-orange-400',
      'text-sky-600 dark:text-sky-400': 'bg-sky-600 dark:bg-sky-400',
      'text-gray-600 dark:text-gray-400': 'bg-gray-600 dark:bg-gray-400',
    };
    return colorMap[textColorClass] || 'bg-gray-900 dark:bg-white';
  };

  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [showSchemeForm, setShowSchemeForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerFormData | null>(null);
  const [editingScheme, setEditingScheme] = useState<SchemeFormData | null>(null);
  const [playerForm, setPlayerForm] = useState<PlayerFormData>({
    firstName: '',
    lastName: '',
    nickname: '',
    birthDate: '',
    email: '',
    phone: '',
    number: '',
    enabled: true,
  });
  const [schemeForm, setSchemeForm] = useState<SchemeFormData>({
    name: '',
    category: 'Uomo',
    textColor: 'text-gray-900 dark:text-white',
    enabled: true,
  });

  const handleAddPlayer = () => {
    setPlayerForm({
      firstName: '',
      lastName: '',
      nickname: '',
      birthDate: '',
      email: '',
      phone: '',
      number: '',
      enabled: true,
    });
    setEditingPlayer(null);
    setShowPlayerForm(true);
  };

  const handleEditPlayer = (player: any) => {
    const nameParts = player.name.split(' ');
    const firstName = nameParts.length > 1 ? nameParts[0] : '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0];
    
    setPlayerForm({
      id: player.id,
      firstName: firstName,
      lastName: lastName,
      nickname: player.nickname || '',
      birthDate: player.birthDate || '',
      email: player.email || '',
      phone: player.phone || '',
      number: player.number,
      enabled: player.enabled !== false,
    });
    setEditingPlayer(player);
    setShowPlayerForm(true);
  };

  const handleSavePlayer = () => {
    if (!playerForm.lastName || !playerForm.number) {
      alert('Cognome e Numero di maglia sono obbligatori');
      return;
    }

    const playerData = {
      id: editingPlayer?.id || Date.now(),
      name: playerForm.firstName ? `${playerForm.firstName} ${playerForm.lastName}` : playerForm.lastName,
      nickname: playerForm.nickname,
      birthDate: playerForm.birthDate,
      email: playerForm.email,
      phone: playerForm.phone,
      number: playerForm.number,
      imageUrl: 'https://i.ibb.co/Pxsjh0j/costone.png',
      enabled: playerForm.enabled,
      order: editingPlayer?.order || 0,
    };

    if (editingPlayer) {
      updatePlayer(playerData);
    } else {
      addPlayer(playerData);
    }

    setShowPlayerForm(false);
    setEditingPlayer(null);
  };

  const handleDeletePlayer = (playerId: number) => {
    if (window.confirm('Sei sicuro di voler eliminare questo giocatore?')) {
      deletePlayer(playerId);
    }
  };

  const handleAddScheme = () => {
    setSchemeForm({
      name: '',
      category: 'Uomo',
      textColor: 'text-gray-900 dark:text-white',
      enabled: true,
    });
    setEditingScheme(null);
    setShowSchemeForm(true);
  };

  const handleEditScheme = (scheme: any) => {
    setSchemeForm({
      id: scheme.id,
      name: scheme.name,
      category: scheme.category,
      textColor: scheme.textColor || 'text-gray-900 dark:text-white',
      enabled: scheme.enabled !== false,
    });
    setEditingScheme(scheme);
    setShowSchemeForm(true);
  };

  const handleSaveScheme = () => {
    if (!schemeForm.name) {
      alert('Il nome dello schema è obbligatorio');
      return;
    }

    const schemeData = {
      id: editingScheme?.id || schemeForm.name.toLowerCase().replace(/\s+/g, '-'),
      name: schemeForm.name,
      category: schemeForm.category,
      textColor: schemeForm.textColor,
      enabled: schemeForm.enabled,
    };

    if (editingScheme) {
      updateScheme(schemeData);
    } else {
      addScheme(schemeData);
    }

    setShowSchemeForm(false);
    setEditingScheme(null);
  };

  const handleDeleteScheme = (schemeId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo schema?')) {
      deleteScheme(schemeId);
    }
  };

  const handleMoveScheme = (schemeId: string, direction: 'up' | 'down') => {
    // Set visual animation state
    setMovingScheme(schemeId);
    setMoveDirection(direction);
    
    // Perform the actual move
    moveScheme(schemeId, direction);
    
    // Clear animation state after animation completes
    setTimeout(() => {
      setMovingScheme(null);
      setMoveDirection(null);
    }, 300);
  };
  const groupedSchemes = {
    Uomo: schemes.filter(s => s.category === 'Uomo').sort((a, b) => (a.order || 0) - (b.order || 0)),
    Zona: schemes.filter(s => s.category === 'Zona').sort((a, b) => (a.order || 0) - (b.order || 0)),
    Rimesse: schemes.filter(s => s.category === 'Rimesse').sort((a, b) => (a.order || 0) - (b.order || 0)),
  };

  // Sort players by order for display
  const sortedPlayers = [...players].sort((a, b) => {
    const orderA = a.order || 0;
    const orderB = b.order || 0;
    return orderA - orderB;
  });

  return (
    <PageContainer title="GESTIONE SQUADRA">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('players')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'players'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Users className="w-5 h-5" />
            Giocatori
          </button>
          <button
            onClick={() => setActiveTab('schemes')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'schemes'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Schemi
          </button>
        </div>
      </div>

      {/* Players Tab */}
      {activeTab === 'players' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Gestione Giocatori
            </h2>
            <button
              onClick={handleAddPlayer}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Aggiungi Giocatore
            </button>
          </div>

          <div className="grid gap-4">
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${
                    player.enabled !== false ? 'bg-primary-600' : 'bg-gray-400'
                  }`}>
                    #{player.number}
                  </div>
                  <div>
                    <h3 className={`font-medium ${
                      player.enabled !== false ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {player.name}
                      {player.enabled === false && (
                        <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                          DISABILITATO
                        </span>
                      )}
                      <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                        {player.birthDate && (
                          <p>Nato il: {new Date(player.birthDate).toLocaleDateString()}</p>
                        )}
                        {player.email && (
                          <p>Email: {player.email}</p>
                        )}
                        {player.phone && (
                          <p>Tel: {player.phone}</p>
                        )}
                      </div>
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Move Up/Down buttons */}
                  <div className="flex flex-col">
                    <button
                      onClick={() => movePlayer(player.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Sposta su"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => movePlayer(player.id, 'down')}
                      disabled={index === sortedPlayers.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Sposta giù"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Enable/Disable toggle */}
                  <button
                    onClick={() => updatePlayer({ ...player, enabled: !player.enabled })}
                    className={`p-2 rounded-lg transition-colors ${
                      player.enabled !== false
                        ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                        : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    title={player.enabled !== false ? 'Disabilita giocatore' : 'Abilita giocatore'}
                  >
                    {player.enabled !== false ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEditPlayer(player)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeletePlayer(player.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {sortedPlayers.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nessun giocatore presente
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schemes Tab */}
      {activeTab === 'schemes' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Gestione Schemi
            </h2>
            <button
              onClick={handleAddScheme}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Aggiungi Schema
            </button>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedSchemes).map(([category, categorySchemes]) => (
              <div key={category}>
                <h3 className="text-lg font-medium text-primary-600 dark:text-primary-400 mb-4">
                  {category}
                </h3>
                <div className="grid gap-3">
                  {categorySchemes.map((scheme, index) => {
                    const categoryIndex = categorySchemes.findIndex(s => s.id === scheme.id);
                    const isMoving = movingScheme === scheme.id;
                    const animationClass = isMoving 
                      ? moveDirection === 'up' 
                        ? 'animate-bounce-up' 
                        : 'animate-bounce-down'
                      : '';
                    return (
                      <div 
                        key={scheme.id} 
                        className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg transition-all duration-300 ${animationClass} ${
                          isMoving ? 'shadow-lg scale-105 bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-300 dark:border-primary-600' : ''
                        }`}
                      >
                        <div>
                          <h4 className={`font-medium ${
                            scheme.enabled !== false 
                              ? scheme.textColor || 'text-gray-900 dark:text-white'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {scheme.name}
                            {scheme.enabled === false && (
                              <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                DISABILITATO
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Categoria: {scheme.category}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {/* Move Up/Down buttons */}
                          <div className="flex flex-col">
                            <button
                              onClick={() => handleMoveScheme(scheme.id, 'up')}
                              disabled={categoryIndex === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Sposta su"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMoveScheme(scheme.id, 'down')}
                              disabled={categoryIndex === categorySchemes.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Sposta giù"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                          {/* Enable/Disable toggle */}
                          <button
                            onClick={() => updateScheme({ ...scheme, enabled: !scheme.enabled })}
                            className={`p-2 rounded-lg transition-colors ${
                              scheme.enabled !== false
                                ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                                : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                            title={scheme.enabled !== false ? 'Disabilita schema' : 'Abilita schema'}
                          >
                            {scheme.enabled !== false ? (
                              <Eye className="w-5 h-5" />
                            ) : (
                              <EyeOff className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditScheme(scheme)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteScheme(scheme.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {categorySchemes.length === 0 && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      Nessuno schema presente in questa categoria
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player Form Modal */}
      {showPlayerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingPlayer ? 'Modifica Giocatore' : 'Aggiungi Giocatore'}
              </h3>
              <button
                onClick={() => setShowPlayerForm(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={playerForm.firstName}
                  onChange={(e) => setPlayerForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cognome *
                </label>
                <input
                  type="text"
                  value={playerForm.lastName}
                  onChange={(e) => setPlayerForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Soprannome
                </label>
                <input
                  type="text"
                  value={playerForm.nickname}
                  onChange={(e) => setPlayerForm(prev => ({ ...prev, nickname: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data di Nascita
                </label>
                <input
                  type="date"
                  value={playerForm.birthDate}
                  onChange={(e) => setPlayerForm(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={playerForm.email}
                  onChange={(e) => setPlayerForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Numero di Telefono
                </label>
                <input
                  type="tel"
                  value={playerForm.phone}
                  onChange={(e) => setPlayerForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Numero di Maglia *
                </label>
                <input
                  type="text"
                  value={playerForm.number}
                  onChange={(e) => setPlayerForm(prev => ({ ...prev, number: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Abilitato</span>
                  <input 
                    type="checkbox" 
                    checked={playerForm.enabled}
                    onChange={(e) => setPlayerForm(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded text-primary-600 focus:ring-primary-500" 
                  />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPlayerForm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleSavePlayer}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Salva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scheme Form Modal */}
      {showSchemeForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingScheme ? 'Modifica Schema' : 'Aggiungi Schema'}
              </h3>
              <button
                onClick={() => setShowSchemeForm(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={schemeForm.name}
                  onChange={(e) => setSchemeForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipologia *
                </label>
                <select
                  value={schemeForm.category}
                  onChange={(e) => setSchemeForm(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="Uomo">UOMO</option>
                  <option value="Zona">ZONA</option>
                  <option value="Rimesse">RIMESSE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Colore Testo
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSchemeForm(prev => ({ ...prev, textColor: color.value }))}
                      className={`p-4 rounded-lg border-2 transition-colors flex items-center justify-center ${
                        schemeForm.textColor === color.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      title={color.name}
                    >
                      <div className={`w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 ${getColorBackground(color.value)}`} />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Anteprima: <span className={schemeForm.textColor}>Testo Schema</span>
                </p>
              </div>
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Abilitato</span>
                  <input 
                    type="checkbox" 
                    checked={schemeForm.enabled}
                    onChange={(e) => setSchemeForm(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded text-primary-600 focus:ring-primary-500" 
                  />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSchemeForm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveScheme}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Salva
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}