export const PRIMARY_COLOR = [22, 163, 74]; // RGB values for Tailwind green-600

// Helper function to abbreviate scheme names in tables
export function abbreviateScheme(name: string): string {
  const abbreviations: Record<string, string> = {
    'POLLICE FLASH': 'POL.FLASH',
    'POLLICE LATO': 'POL.LATO',
    'CORNA BASSO': 'COR.BASSO',
    'CORNA LATO': 'COR.LATO',
    'PUGNO BASSO': 'PUG.BASSO',
    'TRE LATO': 'TRE L.',
    'SHAKE LATO': 'SHAKE L.',
    'LATERALE FLASH': 'LAT.FLASH',
    'LATERALE POLLICE BASSO': 'LAT.POL.BASSO',
    'FONDO FLASH': 'FON.FLASH',
    'FONDO POLLICE BASSO': 'FON.POL.BASSO',
    'CORNA 1-3-1': 'CORNA 1-3-1',
    'DRAG 1-3-1': 'DRAG 1-3-1',
    'FISSI 1-3-1': 'FISSI 1-3-1',
    'DUE 1-3-1': 'DUE 1-3-1',
    'NO CALL 1-3-1': 'NO CALL 1-3-1',
  };
  
  return abbreviations[name] || name;
}

export const TABLE_DEFAULTS = {
  styles: {
    fontSize: 10,
    cellPadding: 3,
    lineWidth: 0.1,
  },
  headStyles: {
    fillColor: PRIMARY_COLOR,
    textColor: [255, 255, 255],
    fontStyle: 'bold',
  },
  alternateRowStyles: {
    fillColor: [248, 250, 252],
  },
  margin: { top: 50 },
};