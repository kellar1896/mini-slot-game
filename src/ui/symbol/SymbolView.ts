import { Container, Graphics, Sprite } from 'pixi.js';
import type { SymbolId } from '../../types/game';
import type { AssetManager } from '../../components';

export class SymbolView extends Container {
  private readonly _background: Graphics;
  private readonly _sprite: Sprite;
  private readonly _assetManager: AssetManager;
  private _symbol: SymbolId;

  constructor(
    symbol: SymbolId,
    size: number,
    assetManager: AssetManager,
  ) {
    super();
    this._symbol = symbol;
    this._assetManager = assetManager;
    this._background = new Graphics();

    this._background
      .rect(0, 0, size, size)
      .fill(0x222222);
    this._background.alpha = 0.5;

    this._sprite =
      new Sprite(
        assetManager.getSymbolTexture(
          symbol,
        ),
      );

    this._sprite.anchor.set(0.5);
    this._sprite.position.set(
      size / 2,
      size / 2,
    );
    this._sprite.width = size;
    this._sprite.height = size;



    // this.addChild(this._background);
    this.addChild(this._sprite);
  }

  setSymbol(symbol: SymbolId): void {
    this._symbol = symbol;
    this._sprite.texture =
      this._assetManager.getSymbolTexture(
        symbol,
      );
  }

  get id(): SymbolId {
    return this._symbol;
  }
}