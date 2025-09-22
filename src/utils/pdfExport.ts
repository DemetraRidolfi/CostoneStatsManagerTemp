import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ExportData } from './pdf/types';
import { TABLE_DEFAULTS } from './pdf/constants';
import { addDocumentHeader, addPageTitle } from './pdf/header';
import { addPlayerStats } from './pdf/statistics';
import { addSchemeDetails } from './pdf/schemeDetails';

type ExportOptions = {
  includeOverview?: boolean;
  includeSchemeDetails?: boolean;
  includePlayerStats?: boolean;
};

export async function exportStatsToPDF(
  data: ExportData, 
  options: ExportOptions = {
    includeOverview: true,
    includeSchemeDetails: true,
    includePlayerStats: true,
  }
) {
  try {
    const doc = new jsPDF();
    let isFirstPage = true;
    
    const title = data.game 
      ? `Statistiche vs ${data.game.opponent} - ${new Date(data.game.date).toLocaleDateString()}`
      : data.selectedPlayerId
        ? `Statistiche Giocatore ${data.players.find(p => p.id === data.selectedPlayerId)?.name}`
        : 'Statistiche Generali';

    if (options.includeOverview) {
      // Add header and title to first page
      await addDocumentHeader(doc);
      addPageTitle(doc, title);
      isFirstPage = false;

      // Separate schemes by category
      const uomoSchemes = data.stats
        .filter(stat => {
          const scheme = data.schemes.find(s => s.name === stat.name);
          return scheme?.category === 'Uomo' && !stat.name.includes('ZONA');
        })
        .sort((a, b) => b.total - a.total);

      const zonaSchemes = data.stats
        .filter(stat => {
          const scheme = data.schemes.find(s => s.name === stat.name);
          return stat.name.includes('ZONA');
        })
        .sort((a, b) => b.total - a.total);

      const rimesseSchemes = data.stats
        .filter(stat => {
          const scheme = data.schemes.find(s => s.name === stat.name);
          return scheme?.category === 'Rimesse';
        })
        .sort((a, b) => b.total - a.total);

      const schemeHeaders = [
        'SCHEMA', 'TOT', '2P', '3P', 'FS', 'PP', 'RO', 'PT.RO', 'AS', 'PUNTI', 'EFF.', 'PROD.'
      ];

      const formatTableRow = (stat: typeof data.stats[0]) => [
        { content: stat.name },
        { content: stat.total.toString() },
        { content: `${stat.made2}/${stat.made2 + stat.missed2}` },
        { content: `${stat.made3}/${stat.made3 + stat.missed3}` },
        { content: (stat.foulInbound + stat.foulShot).toString() },
        { content: stat.turnover.toString() },
        { content: (stat.rebounds || 0).toString() },
        { content: (stat.reboundPoints || 0).toString() },
        { content: (stat.assists || 0).toString() },
        { content: stat.points.toString() },
        { content: `${stat.efficiency}%`, styles: { fontStyle: 'bold' } },
        { content: stat.productivity.toFixed(1), styles: { fontStyle: 'bold' } },
      ];

      let currentY = 65;

      // Add uomo schemes table if there are any
      if (uomoSchemes.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(22, 163, 74);
        doc.text('Schemi Uomo', 14, currentY - 5);

        autoTable(doc, {
          ...TABLE_DEFAULTS,
          head: [schemeHeaders],
          body: uomoSchemes.map(formatTableRow),
          startY: currentY,
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // Add zona schemes table if there are any
      if (zonaSchemes.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(22, 163, 74);
        doc.text('Schemi Zona', 14, currentY - 5);

        autoTable(doc, {
          ...TABLE_DEFAULTS,
          head: [schemeHeaders],
          body: zonaSchemes.map(formatTableRow),
          startY: currentY,
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // Add rimesse schemes table if there are any
      if (rimesseSchemes.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(22, 163, 74);
        doc.text('Schemi Rimesse', 14, currentY - 5);

        autoTable(doc, {
          ...TABLE_DEFAULTS,
          head: [schemeHeaders],
          body: rimesseSchemes.map(formatTableRow),
          startY: currentY,
        });
      }
    }

    // Add detailed scheme statistics pages
    if (options.includeSchemeDetails) {
      if (!isFirstPage) {
        doc.addPage();
      }
      await addSchemeDetails(doc, data.plays, data.players, data.schemes);
      isFirstPage = false;
    }

    // Add statistics for all active players
    if (options.includePlayerStats) {
      // Get active players
      const activePlayers = [...new Set(data.plays.map(p => p.playerId))]
        .map(id => data.players.find(p => p.id === id))
        .filter((p): p is NonNullable<typeof p> => p !== undefined)
        .sort((a, b) => Number(a.number) - Number(b.number));

      if (data.selectedPlayerId) {
        const player = data.players.find(p => p.id === data.selectedPlayerId);
        if (player) {
          if (!isFirstPage) {
            doc.addPage();
          }
          await addPlayerStats(doc, player, data.plays, data.schemes);
        }
      } else {
        // Add statistics for all active players
        for (let i = 0; i < activePlayers.length; i++) {
          const player = activePlayers[i];
          if (!isFirstPage || i > 0) {
            doc.addPage();
          }
          await addPlayerStats(doc, player, data.plays, data.schemes);
          isFirstPage = false;
        }
      }
    }

    const fileName = data.game 
      ? `statistiche_${data.game.opponent.toLowerCase().replace(/\s+/g, '_')}.pdf`
      : data.selectedPlayerId
        ? `statistiche_${data.players.find(p => p.id === data.selectedPlayerId)?.name.toLowerCase()}.pdf`
        : 'statistiche_generali.pdf';
    
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Si è verificato un errore durante la generazione del PDF. Riprova più tardi.');
  }
}