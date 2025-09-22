import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getGameById, getAllGames } from '../services/gameService';
import StatFilters from './stats/StatFilters';
import PlayerStats from './stats/PlayerStats';
import SchemeStats from './stats/SchemeStats';
import { ArrowLeft, FileDown, Users, BookOpen, History } from 'lucide-react';
import { exportStatsToPDF } from '../utils/pdfExport';
import { exportMatchHistoryToPDF } from '../utils/exportMatchHistory';
import { useTheme } from '../contexts/ThemeContext';
import { useTeamData } from '../hooks/useTeamData';
import { calculateEfficiency, calculateProductivity } from '../utils/pdf/statistics';
import { calculatePoints } from '../utils/calculatePoints';
import { calculateFieldGoals } from '../utils/calculateFieldGoals';
import PlayHistory from './game/PlayHistory';
import PageContainer from './layout/PageContainer';

export default function Statistics() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const game = gameId ? getGameById(gameId) : null;
  const allGames = getAllGames();
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const { theme } = useTheme();
  const { getEnabledPlayers, getEnabledSchemes } = useTeamData();
  const PLAYERS = getEnabledPlayers();
  const schemes = getEnabledSchemes();

  // Get all plays based on whether we're viewing a single game or all games
  const allPlays = useMemo(() => {
    if (game) {
      return JSON.parse(JSON.stringify(game.plays));
    }
    return JSON.parse(JSON.stringify(allGames.flatMap(g => g.plays)));
  }, [game, allGames]);

  // Filter plays based on selected player
  const filteredPlays = useMemo(() => {
    return selectedPlayerId 
      ? allPlays.filter(p => p.playerId === selectedPlayerId)
      : allPlays;
  }, [allPlays, selectedPlayerId]);

  const stats = useMemo(() => {
    const plays = filteredPlays;
    
    return schemes.map(scheme => {
      const schemePlays = plays.filter(p => p.schemeId === scheme.id);
      const fieldGoals = calculateFieldGoals(schemePlays);
      const foulInbound = schemePlays.filter(p => p.type === 'foulInbound').length;
      const foulShot = schemePlays.filter(p => p.type === 'foulShot').length;
      const turnover = schemePlays.filter(p => p.type === 'turnover').length;
      
      const efficiency = calculateEfficiency(schemePlays);
      const productivity = calculateProductivity(schemePlays);
      const points = calculatePoints(schemePlays).total;
      
      return {
        name: scheme.name,
        total: schemePlays.length,
        ...fieldGoals,
        foulInbound,
        foulShot,
        turnover,
        efficiency,
        productivity,
        points,
        plays: schemePlays,
      };
    }).filter(s => s.total > 0);
  }, [filteredPlays]);

  const exportData = {
    stats,
    game,
    selectedPlayerId,
    players: PLAYERS,
    schemes,
    plays: allPlays,
  };

  const handleExportPDF = (type: 'all' | 'schemes' | 'players') => {
    const options = {
      includeOverview: type === 'all',
      includeSchemeDetails: type === 'all' || type === 'schemes',
      includePlayerStats: type === 'all' || type === 'players',
    };
    exportStatsToPDF(exportData, options);
  };

  const handleExportHistory = () => {
    if (game) {
      exportMatchHistoryToPDF(game, PLAYERS, schemes);
    }
  };

  const pageTitle = game ? `STATISTICHE VS ${game.opponent}` : 'STATISTICHE GENERALI';
  const backButton = game && (
    <button 
      onClick={() => navigate('/games')}
      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
    >
      <ArrowLeft className="w-6 h-6" />
    </button>
  );

  const exportButtons = (
    <div className="flex items-center gap-2">
      {game && (
        <button
          onClick={handleExportHistory}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          title="Esporta cronologia completa"
        >
          <History className="w-5 h-5" />
          <span className="hidden sm:inline">Cronologia</span>
        </button>
      )}
      <button
        onClick={() => handleExportPDF('schemes')}
        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        title="Esporta solo statistiche schemi"
      >
        <BookOpen className="w-5 h-5" />
        <span className="hidden sm:inline">Schemi</span>
      </button>
      <button
        onClick={() => handleExportPDF('players')}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        title="Esporta solo statistiche giocatori"
      >
        <Users className="w-5 h-5" />
        <span className="hidden sm:inline">Giocatori</span>
      </button>
      <button
        onClick={() => handleExportPDF('all')}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        title="Esporta tutte le statistiche"
      >
        <FileDown className="w-5 h-5" />
        <span className="hidden sm:inline">Tutto</span>
      </button>
    </div>
  );

  if (game && !game.plays.length) {
    return (
      <PageContainer
        title={pageTitle}
        actions={backButton}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Nessuna statistica disponibile per questa partita
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={pageTitle}
      actions={
        <div className="flex items-center gap-4">
          {backButton}
          {exportButtons}
        </div>
      }
    >
      <StatFilters
        selectedPlayerId={selectedPlayerId}
        onPlayerSelect={setSelectedPlayerId}
        plays={allPlays}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SchemeStats stats={stats} />
        <PlayerStats 
          games={game ? [game] : allGames}
          selectedPlayerId={selectedPlayerId}
        />
      </div>

      {stats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Efficacia e Produttività per Schema
          </h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                />
                <XAxis 
                  dataKey="name" 
                  stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  labelStyle={{
                    color: theme === 'dark' ? '#e5e7eb' : '#111827',
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    color: theme === 'dark' ? '#e5e7eb' : '#111827',
                  }}
                />
                <Bar 
                  dataKey="efficiency" 
                  name="Efficacia %" 
                  fill="#16a34a" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="productivity" 
                  name="Produttività" 
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {game && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Cronologia Completa
          </h2>
          <PlayHistory
            plays={filteredPlays}
            players={PLAYERS}
            schemes={schemes}
            onDelete={null}
            hideDelete
          />
        </div>
      )}
    </PageContainer>
  );
}