export type SymbolId =
  | 'M1'
  | 'M2'
  | 'M3'
  | 'F1'
  | 'F2'
  | 'F3'
  | 'F4';

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
  reelPositions: number[];
  wins: Wins[];
}

export interface Wins {
  pattern: {
    column: number;
    row: number;
  }[];
  winAmount: number;
  symbol: SymbolId;
}

export type ReelViewConfig = {
  initialSymbols: SymbolId[];
  reelStrip: SymbolId[];
  rows: number;
  symbolSize: number;
  gap: number;
};