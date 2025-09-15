import type { PlayResult } from '../types';

// Utility function to calculate field goal statistics including and-1 plays
export function calculateFieldGoals(plays: PlayResult[] = []) {
  // Regular field goals
  const made2 = plays.filter(p => p.type === 'made2').length;
  const made3 = plays.filter(p => p.type === 'made3').length;
  const missed2 = plays.filter(p => p.type === 'missed2').length;
  const missed3 = plays.filter(p => p.type === 'missed3').length;

  // And-1 field goals
  const and1Made2 = plays.filter(p => p.type === 'foulShot' && p.and1Points === 2).length;
  const and1Made3 = plays.filter(p => p.type === 'foulShot' && p.and1Points === 3).length;

  return {
    made2: made2 + and1Made2,
    made3: made3 + and1Made3,
    missed2,
    missed3,
    total2: made2 + and1Made2 + missed2,
    total3: made3 + and1Made3 + missed3,
    totalMade: made2 + made3 + and1Made2 + and1Made3,
    totalAttempts: made2 + made3 + and1Made2 + and1Made3 + missed2 + missed3
  };
}