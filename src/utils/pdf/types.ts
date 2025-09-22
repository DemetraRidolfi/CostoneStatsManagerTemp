import type { Game, PlayResult } from '../../types';

export type ExportData = {
  stats: Array<{
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
  }>;
  game: Game | null;
  selectedPlayerId: number | null;
  players: Array<{ id: number; name: string; number: string }>;
  schemes: Array<{ id: string; name: string; category: string }>;
  plays: PlayResult[];
};