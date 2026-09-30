import type { AssetManager } from '../../components';
import type { SymbolId } from '../../types/game';
import { SymbolView } from './SymbolView';

export interface SymbolFactoryConfig {
  symbolSize: number;
}

export class SymbolFactory {
  private readonly _config: SymbolFactoryConfig;
  private readonly _assetManager: AssetManager;
  constructor(
    config: SymbolFactoryConfig,
    assetManager: AssetManager
  ) {
    this._config = config;
    this._assetManager = assetManager;
  }

  create(symbol: SymbolId): SymbolView {
    return new SymbolView(
      symbol,
      this._config.symbolSize,
      this._assetManager
    );
  }
}