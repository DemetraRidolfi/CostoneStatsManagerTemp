// Shared points calculation function to ensure consistency across the app
export function calculatePoints(plays: PlayResult[]): { fieldGoals: number; freeThrows: number; total: number } {
  return plays.reduce((acc, play) => {
    switch (play.type) {
      case 'made2':
        acc.fieldGoals += 2;
        acc.total += 2;
        break;
      case 'made3':
        acc.fieldGoals += 3;
        acc.total += 3;
        break;
      case 'foulShot':
        if (play.and1Points) {
          // For AND-1 situations, count both the basket and free throw points
          acc.fieldGoals += play.and1Points;
          acc.total += play.and1Points;
          if (play.freeThrowPoints) {
            acc.freeThrows += play.freeThrowPoints;
            acc.total += play.freeThrowPoints;
          }
        } else if (play.freeThrowPoints) {
          // For regular free throws
          acc.freeThrows += play.freeThrowPoints;
          acc.total += play.freeThrowPoints;
        }
        break;
    }
    return acc;
  }, { fieldGoals: 0, freeThrows: 0, total: 0 });
}