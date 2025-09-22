import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PlayResult } from '../../types';
import { TABLE_DEFAULTS } from './constants';
import { addDocumentHeader, addPageTitle } from './header';
import { calculateEfficiency, calculateProductivity } from './statistics';
import { calculateFieldGoals } from '../calculateFieldGoals';
import { calculatePoints } from '../calculatePoints';

type Player = {
  id: number;
  name: string;
  number: string;
};

async function addSchemeStatisticsPage(
  doc: jsPDF,
  scheme: { id: string; name: string; category: string },
  plays: PlayResult[],
  players: Player[],
  isFirstPage: boolean
): Promise<boolean> {
  const schemePlays = plays.filter(p => p.schemeId === scheme.id);
  if (schemePlays.length === 0) return false;

  if (!isFirstPage) {
    doc.addPage();
  }

  await addDocumentHeader(doc);
  
  doc.setFontSize(16);
  doc.setTextColor(22, 163, 74);
  doc.text(scheme.name, 14, 45);

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(
    scheme.category === 'Uomo' ? 'Schema Uomo' : 
    scheme.category === 'Zona' ? 'Schema Zona' : 
    'Schema Rimessa', 
    14, 55
  );

  const totalPlays = schemePlays.length;
  const fieldGoals = calculateFieldGoals(schemePlays);
  const fouls = schemePlays.filter(p => ['foulInbound', 'foulShot'].includes(p.type)).length;
  const turnovers = schemePlays.filter(p => p.type === 'turnover').length;
  const noImpact = schemePlays.filter(p => p.type === 'noImpact').length;
  
  // Calculate rebound statistics for this scheme
  const rebounds = schemePlays.filter(p => 
    (p.type === 'missed2' || p.type === 'missed3') && p.offensiveRebound === true
  ).length;
  const reboundPoints = schemePlays.reduce((acc, p) => 
    acc + (p.reboundPoints || 0), 0
  );
  const assists = schemePlays.filter(p => p.hasAssist === true).length;
  
  const efficiency = calculateEfficiency(schemePlays);
  const productivity = calculateProductivity(schemePlays);
  const points = calculatePoints(schemePlays);

  const overallStats = [
    ['Utilizzi Totali', totalPlays.toString()],
    ['Tiri da 2', `${fieldGoals.made2}/${fieldGoals.total2} (${Math.round((fieldGoals.made2 / (fieldGoals.total2 || 1)) * 100)}%)`],
    ['Tiri da 3', `${fieldGoals.made3}/${fieldGoals.total3} (${Math.round((fieldGoals.made3 / (fieldGoals.total3 || 1)) * 100)}%)`],
    ['Falli Subiti', fouls.toString()],
    ['Palle Perse', turnovers.toString()],
    ['Nessun Impatto', noImpact.toString()],
    ['Rimbalzi Offensivi', rebounds.toString()],
    ['Punti su Rimbalzo', reboundPoints.toString()],
    ['Assist', assists.toString()],
    ['Punti Totali', points.total.toString()],
    ['Efficacia', { content: `${efficiency}%`, styles: { fontStyle: 'bold' } }],
    ['Produttività', { content: productivity.toFixed(1), styles: { fontStyle: 'bold' } }],
  ];

  autoTable(doc, {
    ...TABLE_DEFAULTS,
    startY: 70,
    head: [['Statistica', 'Valore']],
    body: overallStats,
    styles: {
      ...TABLE_DEFAULTS.styles,
      fontSize: 10,
    },
    margin: { left: 14, right: 14 },
  });

  // Calculate player statistics
  const playerStats = players
    .map(player => {
      const playerPlays = schemePlays.filter(p => p.playerId === player.id);
      if (playerPlays.length === 0) return null;

      const playerFieldGoals = calculateFieldGoals(playerPlays);
      const playerPoints = calculatePoints(playerPlays);
      const playerEfficiency = calculateEfficiency(playerPlays);
      const playerProductivity = calculateProductivity(playerPlays);
      const playerFouls = playerPlays.filter(p => ['foulInbound', 'foulShot'].includes(p.type)).length;
      const playerTurnovers = playerPlays.filter(p => p.type === 'turnover').length;
      
      // Calculate player rebound points (points scored by this player on rebounds)
      const playerReboundPoints = plays.reduce((acc, p) => {
        if (p.reboundPlayerId === player.id && p.reboundPoints) {
          return acc + p.reboundPoints;
        }
        return acc;
      }, 0);

      return {
        playerNumber: player.number,
        playerName: player.name,
        uses: playerPlays.length,
        ...playerFieldGoals,
        foulInbound: playerPlays.filter(p => p.type === 'foulInbound').length,
        foulShot: playerPlays.filter(p => p.type === 'foulShot').length,
        turnover: playerTurnovers,
        efficiency: playerEfficiency,
        productivity: playerProductivity,
        points: playerPoints,
        reboundPoints: playerReboundPoints,
      };
    })
    .filter((stats): stats is NonNullable<typeof stats> => stats !== null)
    .sort((a, b) => b.uses - a.uses);

  if (playerStats.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74);
    doc.text('Statistiche per Giocatore', 14, (doc as any).lastAutoTable.finalY + 20);

    const headers = [
      'GIOCATORE',
      'TOT',
      '2P',
      '3P',
      'FS',
      'PP',
      'PT',
      'PT.RO',
      'EFF.',
      'PROD.',
    ];

    const data = playerStats.map(stat => [
      `#${stat.playerNumber} ${stat.playerName}`,
      stat.uses.toString(),
      `${stat.made2}/${stat.total2}`,
      `${stat.made3}/${stat.total3}`,
      (stat.foulInbound + stat.foulShot).toString(),
      stat.turnover.toString(),
      stat.points.total.toString(),
      stat.reboundPoints.toString(),
      { content: `${stat.efficiency}%`, styles: { fontStyle: 'bold' } },
      { content: stat.productivity.toFixed(1), styles: { fontStyle: 'bold' } },
    ]);

    autoTable(doc, {
      ...TABLE_DEFAULTS,
      head: [headers],
      body: data,
      startY: (doc as any).lastAutoTable.finalY + 25,
      styles: {
        ...TABLE_DEFAULTS.styles,
        fontSize: 9,
      },
      margin: { left: 14, right: 14 },
    });
  }

  return true;
}

export async function addSchemeDetails(doc: jsPDF, plays: PlayResult[], players: Player[], schemes: Array<{ id: string; name: string; category: string }>): Promise<void> {
  try {
    if (plays.length === 0) return;

    // Process all schemes
    let isFirstScheme = true;

    // Group schemes by category
    const uomoSchemes = schemes.filter(s => s.category === 'Uomo' && !s.name.includes('ZONA'));
    const zonaSchemes = schemes.filter(s => s.name.includes('ZONA'));
    const rimesseSchemes = schemes.filter(s => s.category === 'Rimesse');

    // Process Uomo schemes
    for (const scheme of uomoSchemes) {
      const hasContent = await addSchemeStatisticsPage(doc, scheme, plays, players, isFirstScheme);
      if (hasContent) {
        isFirstScheme = false;
      }
    }

    // Process Zona schemes
    for (const scheme of zonaSchemes) {
      const hasContent = await addSchemeStatisticsPage(doc, scheme, plays, players, isFirstScheme);
      if (hasContent) {
        isFirstScheme = false;
      }
    }

    // Process Rimesse schemes
    for (const scheme of rimesseSchemes) {
      const hasContent = await addSchemeStatisticsPage(doc, scheme, plays, players, isFirstScheme);
      if (hasContent) {
        isFirstScheme = false;
      }
    }
  } catch (error) {
    console.error('Error adding scheme details:', error);
  }
}