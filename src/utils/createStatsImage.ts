import { PlayResult } from '../types';

type StatItem = {
  name: string;
  category: string;
  uses: number;
  points: number;
  efficiency: number;
  productivity: number;
};

export function createStatsImage(stats: StatItem[]): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Group stats by category
    const uomoSchemes = stats
      .filter(stat => stat.category === 'Uomo' && !stat.name.includes('ZONA'))
      .sort((a, b) => b.points - a.points);
    const zonaSchemes = stats
      .filter(stat => stat.name.includes('ZONA'))
      .sort((a, b) => b.points - a.points);
    const rimesseSchemes = stats
      .filter(stat => stat.category === 'Rimesse')
      .sort((a, b) => b.points - a.points);

    // Calculate dimensions
    const padding = 20;
    const headerHeight = 60;
    const rowHeight = 40;
    const colWidth = 100;
    const nameWidth = 220;
    const totalWidth = nameWidth + (colWidth * 4) + (padding * 2);
    
    const sectionHeaderHeight = 40;
    const sectionSpacing = 30;

    // Calculate total height including all sections and their content
    let totalHeight = headerHeight + padding;

    // Add height for each section that has content
    if (uomoSchemes.length > 0) {
      totalHeight += sectionHeaderHeight + (uomoSchemes.length * rowHeight) + sectionSpacing;
    }
    if (zonaSchemes.length > 0) {
      totalHeight += sectionHeaderHeight + (zonaSchemes.length * rowHeight) + sectionSpacing;
    }
    if (rimesseSchemes.length > 0) {
      totalHeight += sectionHeaderHeight + (rimesseSchemes.length * rowHeight) + sectionSpacing;
    }

    // Add final padding
    totalHeight += padding;

    // Set canvas size with the calculated dimensions
    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Draw header
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(0, 0, totalWidth, headerHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('STATISTICHE LIVE', padding, headerHeight - 20);

    // Helper function to draw section
    let currentY = headerHeight;
    const drawSection = (title: string, items: StatItem[]) => {
      if (items.length === 0) return;

      // Draw section header
      currentY += padding;
      ctx.fillStyle = '#16a34a';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(title, padding, currentY);
      currentY += sectionHeaderHeight - 15;

      // Draw column headers
      ctx.fillStyle = '#666666';
      ctx.font = '14px Arial';
      const headers = ['Schema', 'UTILIZZI', 'PT', 'EFF.', 'PROD.'];
      const widths = [nameWidth, colWidth, colWidth, colWidth, colWidth];
      let x = padding;
      headers.forEach((header, i) => {
        ctx.fillText(header, x, currentY);
        x += widths[i];
      });
      currentY += 25;

      // Draw rows with alternating background
      items.forEach((stat, index) => {
        // Draw row background
        if (index % 2 === 0) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(padding - 5, currentY - 20, totalWidth - (padding * 2) + 10, rowHeight);
        }

        x = padding;
        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        
        // Schema name
        ctx.fillText(stat.name, x, currentY);
        x += nameWidth;
        
        // Uses
        ctx.fillText(stat.uses.toString(), x, currentY);
        x += colWidth;
        
        // Points
        ctx.fillText(stat.points.toString(), x, currentY);
        x += colWidth;
        
        // Efficiency
        ctx.fillText(`${stat.efficiency}%`, x, currentY);
        x += colWidth;
        
        // Productivity
        ctx.fillText(stat.productivity.toFixed(1), x, currentY);
        
        currentY += rowHeight;
      });

      // Add spacing after section
      currentY += sectionSpacing;
    };

    // Draw sections
    if (uomoSchemes.length > 0) {
      drawSection('SCHEMI UOMO', uomoSchemes);
    }
    if (zonaSchemes.length > 0) {
      drawSection('SCHEMI ZONA', zonaSchemes);
    }
    if (rimesseSchemes.length > 0) {
      drawSection('SCHEMI RIMESSE', rimesseSchemes);
    }

    // Convert canvas to blob
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob);
      }
    }, 'image/png');
  });
}