import { Container, Graphics, Text } from 'pixi.js';
import type { SymbolId } from '../../types/game';

export class SymbolView extends Container {
  private readonly _background: Graphics;
  private readonly _label: Text;
  private _symbol: SymbolId;

  constructor(
    symbol: SymbolId,
    size: number,
  ) {
    super();
    this._symbol = symbol;
    this._background = new Graphics();

    this._background
      .roundRect(0, 0, size, size, 8)
      .fill(0x222222);

    this._label = new Text({
      text: symbol,
      style: {
        fill: 0xffffff,
        fontSize: size * 0.4,
        fontWeight: 'bold',
      },
    });

    this._label.anchor.set(0.5);
    this._label.position.set(size / 2, size / 2);

    this.addChild(this._background);
    this.addChild(this._label);
  }

  setSymbol(symbol: SymbolId): void {
    this._symbol = symbol;
    this._label.text = symbol;
  }

  get id(): SymbolId {
    return this._symbol;
  }
}