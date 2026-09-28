import type { SymbolId } from '../../types/game';
import { SymbolView } from './SymbolView';

export interface SymbolFactoryConfig {
  symbolSize: number;
}

export class SymbolFactory {
private readonly _config: SymbolFactoryConfig;
  constructor(
    config: SymbolFactoryConfig
  ) {
    this._config = config;
  }

  create(symbol: SymbolId): SymbolView {
    return new SymbolView(
      symbol,
      this._config.symbolSize,
    );
  }
}