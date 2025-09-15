import { jsPDF } from 'jspdf';
import { PRIMARY_COLOR } from './constants';

export async function addDocumentHeader(doc: jsPDF): Promise<void> {
  try {
    // Add logo
    const logoWidth = 20;
    const logoHeight = 20;
    const logoUrl = 'https://i.ibb.co/Pxsjh0j/costone.png';
    
    try {
      const response = await fetch(logoUrl);
      if (!response.ok) {
        throw new Error('Failed to load logo');
      }
      
      const blob = await response.blob();
      const base64Logo = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      
      doc.addImage(base64Logo, 'PNG', 14, 10, logoWidth, logoHeight);
    } catch (logoError) {
      console.warn('Unable to load logo, continuing without it:', logoError);
      // Continue without the logo - don't throw, just skip logo addition
    }

    // Add team name and subtitle
    doc.setFontSize(16);
    doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.text('COSTONE BASKET SIENA', 45, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Statistiche & Analisi Schemi', 45, 27);

    // Add separator line
    doc.setDrawColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.setLineWidth(0.5);
    doc.line(14, 35, doc.internal.pageSize.width - 14, 35);

    // Reset text color
    doc.setTextColor(0, 0, 0);
  } catch (error) {
    console.warn('Error in document header, continuing with basic header:', error);
    // Fallback to basic header without logo
    doc.setFontSize(16);
    doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.text('COSTONE BASKET SIENA', 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Statistiche & Analisi Schemi', 14, 27);
    
    doc.setDrawColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.setLineWidth(0.5);
    doc.line(14, 35, doc.internal.pageSize.width - 14, 35);
    
    doc.setTextColor(0, 0, 0);
  }
}

export function addPageTitle(doc: jsPDF, title: string): void {
  try {
    doc.setFontSize(14);
    doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.text(title, 14, 45);
    doc.setTextColor(0, 0, 0);
  } catch (error) {
    console.warn('Error adding page title:', error);
    // Continue without the title rather than failing the export
  }
}