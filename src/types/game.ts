export type SymbolId =
  | 'A'
  | 'K'
  | 'Q'
  | 'J'
  | '10';

export interface SymbolConfig {
  id: SymbolId;
  value: number;
}

export interface ReelConfig {
  symbols: SymbolId[];
}

export interface SlotConfig {
  rows: number;
  reels: number;
  symbols: SymbolConfig[];
  reelStrips: ReelConfig[];
  defaultReels: SymbolId[][];
}

export interface SpinResult {
  reels: SymbolId[][];
  win: number;
}