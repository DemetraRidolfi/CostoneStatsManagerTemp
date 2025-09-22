import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Game, PlayResult } from '../types';
import { addDocumentHeader, addPageTitle } from './pdf/header';
import { TABLE_DEFAULTS } from './pdf/constants';

export async function exportMatchHistoryToPDF(
  game: Game, 
  players: Array<{ id: number; name: string; number: string }>, 
  schemes: Array<{ id: string; name: string; category: string }>
) {
  try {
    const doc = new jsPDF();
    await addDocumentHeader(doc);
    addPageTitle(doc, `Cronologia vs ${game.opponent}`);

    // Add match info
    const matchInfo = [
      ['Data:', new Date(game.date).toLocaleDateString()],
      ['Avversario:', game.opponent],
      ['Luogo:', game.location],
      ['Azioni registrate:', game.plays.length.toString()]
    ];

    autoTable(doc, {
      ...TABLE_DEFAULTS,
      startY: 55,
      head: [],
      body: matchInfo,
      theme: 'plain',
      styles: {
        ...TABLE_DEFAULTS.styles,
        cellPadding: 2,
      },
    });

    // Calculate schema usage statistics
    const schemeUsage = schemes.map(scheme => {
      const count = game.plays.filter(p => p.schemeId === scheme.id).length;
      return {
        name: scheme.name,
        count,
        category: scheme.category
      };
    }).filter(s => s.count > 0);

    // Group schemes by category
    const uomoSchemes = schemeUsage
      .filter(s => s.category === 'Uomo' && !s.name.includes('ZONA'))
      .sort((a, b) => b.count - a.count);
    const zonaSchemes = schemeUsage
      .filter(s => s.name.includes('ZONA'))
      .sort((a, b) => b.count - a.count);
    const rimesseSchemes = schemeUsage
      .filter(s => s.category === 'Rimesse')
      .sort((a, b) => b.count - a.count);

    // Add schema usage statistics
    let currentY = (doc as any).lastAutoTable.finalY + 20;

    if (uomoSchemes.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(22, 163, 74);
      doc.text('Utilizzo Schemi Uomo', 14, currentY);
      
      autoTable(doc, {
        ...TABLE_DEFAULTS,
        startY: currentY + 5,
        head: [['Schema', 'Utilizzi']],
        body: uomoSchemes.map(s => [s.name, s.count.toString()]),
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    if (zonaSchemes.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(22, 163, 74);
      doc.text('Utilizzo Schemi Zona', 14, currentY);
      
      autoTable(doc, {
        ...TABLE_DEFAULTS,
        startY: currentY + 5,
        head: [['Schema', 'Utilizzi']],
        body: zonaSchemes.map(s => [s.name, s.count.toString()]),
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    if (rimesseSchemes.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(22, 163, 74);
      doc.text('Utilizzo Schemi Rimesse', 14, currentY);
      
      autoTable(doc, {
        ...TABLE_DEFAULTS,
        startY: currentY + 5,
        head: [['Schema', 'Utilizzi']],
        body: rimesseSchemes.map(s => [s.name, s.count.toString()]),
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Add play history
    doc.addPage();
    await addDocumentHeader(doc);
    addPageTitle(doc, 'Cronologia Azioni');

    const getPlayDescription = (play: PlayResult) => {
      const player = players.find(p => p.id === play.playerId);
      const scheme = schemes.find(s => s.id === play.schemeId);

      const resultMap: Record<string, { text: string; style?: any }> = {
        made2: {
          text: 'Canestro da 2',
          style: { textColor: [22, 163, 74] }
        },
        missed2: {
          text: 'Tiro da 2 Sbagliato',
          style: { textColor: [220, 38, 38] }
        },
        made3: {
          text: 'Canestro da 3',
          style: { textColor: [22, 163, 74] }
        },
        missed3: {
          text: 'Tiro da 3 Sbagliato',
          style: { textColor: [220, 38, 38] }
        },
        foulInbound: {
          text: 'Fallo (Rimessa)',
          style: { textColor: [217, 119, 6] }
        },
        foulShot: {
          text: play.and1Points
            ? `And-1 (${play.and1Points}+${play.freeThrowPoints} pt)`
            : play.freeThrowPoints === 0
            ? 'Fallo (Nessun TL)'
            : `Fallo (${play.freeThrowPoints} pt)`,
          style: { textColor: play.and1Points ? [147, 51, 234] : [217, 119, 6] }
        },
        turnover: {
          text: 'Palla Persa',
          style: { textColor: [220, 38, 38] }
        },
        noImpact: {
          text: 'Nessun Impatto',
          style: { textColor: [107, 114, 128] }
        },
      };

      return {
        scheme: scheme?.name || 'Unknown',
        player: player ? `#${player.number} ${player.name}` : 'No Player',
        result: resultMap[play.type]?.text || play.type,
        style: resultMap[play.type]?.style || {}
      };
    };

    const plays = [...game.plays].reverse();
    const historyData = plays.map(play => {
      const { scheme, player, result, style } = getPlayDescription(play);
      return [
        { content: scheme },
        { content: player },
        { content: result, styles: style }
      ];
    });

    autoTable(doc, {
      ...TABLE_DEFAULTS,
      startY: 55,
      head: [['Schema', 'Giocatore', 'Risultato']],
      body: historyData,
      styles: {
        ...TABLE_DEFAULTS.styles,
        fontSize: 9,
      },
    });

    doc.save(`cronologia_${game.opponent.toLowerCase().replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error('Error exporting match history:', error);
    alert('Si è verificato un errore durante l\'esportazione della cronologia');
  }
}