export type PlayResult = {
  type: 'made2' | 'missed2' | 'made3' | 'missed3' | 'foulInbound' | 'foulShot' | 'turnover' | 'assist' | 'noImpact';
  playerId: number;
  schemeId: string;
  timestamp: number;
  notes?: string;
  freeThrowPoints?: number;
  and1Points?: number; // Points from the field goal in an and-1 play
};

export type MatchType = 'AMICHEVOLE' | 'CAMPIONATO - 1° FASE';

export type Game = {
  id: string;
  date: string;
  opponent: string;
  location: string;
  matchType: MatchType;
  plays: PlayResult[];
  status?: 'draft' | 'completed';
  lastUpdated?: string;
};

export type Player = {
  id: number;
  name: string;
  number: string;
  imageUrl: string;
};

export type Scheme = {
  id: string;
  name: string;
  category: string;
};