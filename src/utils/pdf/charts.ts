import { jsPDF } from 'jspdf';
import { PRIMARY_COLOR } from './constants';
import { addDocumentHeader, addPageTitle } from './header';

type ChartData = {
  name: string;
  total: number;
  made2: number;
  made3: number;
  missed2: number;
  missed3: number;
  foulInbound: number;
  foulShot: number;
  turnover: number;
  efficiency: number;
};

function drawBarChart(
  doc: jsPDF,
  data: { label: string; value: number }[],
  startY: number,
  title: string,
  maxValue?: number
) {
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const chartWidth = pageWidth - 2 * margin;
  const barHeight = 20;
  const spacing = 5;
  const labelWidth = 60;
  const maxBarWidth = chartWidth - labelWidth;

  // Draw title
  doc.setFontSize(12);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text(title, margin, startY - 5);

  // Calculate max value if not provided
  const chartMaxValue = maxValue || Math.max(...data.map(d => d.value));

  // Draw bars
  doc.setFontSize(8);
  data.forEach((item, index) => {
    const y = startY + index * (barHeight + spacing);
    
    // Draw label
    doc.setTextColor(60, 60, 60);
    doc.text(item.label, margin, y + barHeight / 2);

    // Draw bar background
    doc.setFillColor(240, 240, 240);
    doc.rect(margin + labelWidth, y, maxBarWidth, barHeight, 'F');

    // Draw actual bar
    const barWidth = (item.value / chartMaxValue) * maxBarWidth;
    doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.rect(margin + labelWidth, y, barWidth, barHeight, 'F');

    // Draw value
    doc.setTextColor(255, 255, 255);
    if (barWidth > 20) { // Only draw text inside bar if there's enough space
      doc.text(
        item.value.toString(),
        margin + labelWidth + 5,
        y + barHeight / 2
      );
    } else {
      doc.setTextColor(60, 60, 60);
      doc.text(
        item.value.toString(),
        margin + labelWidth + barWidth + 5,
        y + barHeight / 2
      );
    }
  });

  return startY + data.length * (barHeight + spacing) + 10;
}

function drawPieChart(
  doc: jsPDF,
  data: { label: string; value: number }[],
  startY: number,
  title: string,
  colors: [number, number, number][]
) {
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const chartSize = 100;
  const centerX = margin + chartSize / 2;
  const centerY = startY + chartSize / 2;
  const radius = chartSize / 2;

  // Draw title
  doc.setFontSize(12);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text(title, margin, startY - 5);

  // Calculate total
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return startY + chartSize + 20;

  // Draw pie segments
  let startAngle = 0;
  data.forEach((item, index) => {
    const angle = (item.value / total) * 2 * Math.PI;
    
    // Draw segment using arcs instead of lines
    doc.setFillColor(colors[index][0], colors[index][1], colors[index][2]);
    const endAngle = startAngle + angle;
    
    // Draw arc path
    doc.setLineWidth(0.1);
    doc.setDrawColor(255, 255, 255);
    
    // Move to center
    doc.lines([[radius * Math.cos(startAngle), radius * Math.sin(startAngle)]], centerX, centerY);
    
    // Draw arc
    const steps = Math.ceil(angle * 20); // More steps for smoother arc
    const stepAngle = angle / steps;
    
    for (let i = 0; i < steps; i++) {
      const currentAngle = startAngle + i * stepAngle;
      const nextAngle = currentAngle + stepAngle;
      
      doc.lines([
        [
          radius * (Math.cos(nextAngle) - Math.cos(currentAngle)),
          radius * (Math.sin(nextAngle) - Math.sin(currentAngle))
        ]
      ], 
      centerX + radius * Math.cos(currentAngle),
      centerY + radius * Math.sin(currentAngle));
    }
    
    // Close the path
    doc.lines([[
      -radius * Math.cos(endAngle),
      -radius * Math.sin(endAngle)
    ]], centerX + radius * Math.cos(endAngle), centerY + radius * Math.sin(endAngle));
    
    doc.setFillColor(colors[index][0], colors[index][1], colors[index][2]);
    doc.triangle(
      centerX,
      centerY,
      centerX + radius * Math.cos(startAngle),
      centerY + radius * Math.sin(startAngle),
      centerX + radius * Math.cos(endAngle),
      centerY + radius * Math.sin(endAngle),
      'F'
    );
    
    startAngle = endAngle;
  });

  // Draw legend
  const legendX = margin + chartSize + 20;
  const legendY = startY + 20;
  
  doc.setFontSize(8);
  data.forEach((item, index) => {
    const y = legendY + index * 15;
    
    // Draw color box
    doc.setFillColor(colors[index][0], colors[index][1], colors[index][2]);
    doc.rect(legendX, y, 10, 10, 'F');
    
    // Draw label
    doc.setTextColor(60, 60, 60);
    doc.text(
      `${item.label} (${Math.round((item.value / total) * 100)}%)`,
      legendX + 15,
      y + 7
    );
  });

  return startY + chartSize + 20;
}

export async function addCharts(doc: jsPDF, stats: ChartData[]) {
  try {
    // Add new page for charts
    doc.addPage();
    await addDocumentHeader(doc);
    addPageTitle(doc, 'Grafici Statistiche');

    let currentY = 55;

    // Efficiency chart
    const efficiencyData = stats
      .filter(s => s.efficiency > 0)
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 5)
      .map(s => ({
        label: s.name,
        value: s.efficiency
      }));

    if (efficiencyData.length > 0) {
      currentY = drawBarChart(doc, efficiencyData, currentY, 'Top 5 Schemi per Efficacia', 100);
    }

    // Usage chart
    const usageData = stats
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(s => ({
        label: s.name,
        value: s.total
      }));

    if (usageData.length > 0) {
      currentY = drawBarChart(doc, usageData, currentY + 20, 'Top 5 Schemi più Utilizzati');
    }

    // Outcome distribution pie chart
    const totalMade = stats.reduce((sum, s) => sum + s.made2 + s.made3, 0);
    const totalMissed = stats.reduce((sum, s) => sum + s.missed2 + s.missed3, 0);
    const totalFouls = stats.reduce((sum, s) => sum + s.foulInbound + s.foulShot, 0);
    const totalTurnovers = stats.reduce((sum, s) => sum + s.turnover, 0);

    const outcomeData = [
      { label: 'Canestri', value: totalMade },
      { label: 'Tiri Sbagliati', value: totalMissed },
      { label: 'Falli Subiti', value: totalFouls },
      { label: 'Palle Perse', value: totalTurnovers }
    ].filter(d => d.value > 0);

    const outcomeColors: [number, number, number][] = [
      [39, 174, 96],  // green
      [231, 76, 60],  // red
      [241, 196, 15], // yellow
      [149, 165, 166] // gray
    ];

    if (outcomeData.length > 0) {
      currentY = drawPieChart(doc, outcomeData, currentY + 20, 'Distribuzione Esiti', outcomeColors);
    }

    return doc;
  } catch (error) {
    console.error('Error adding charts:', error);
    // Continue without charts rather than failing the entire export
    return doc;
  }
}