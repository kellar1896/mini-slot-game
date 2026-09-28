import { Container, Graphics } from 'pixi.js';
import type { SymbolId } from '../../types/game';
import { SymbolView } from '../symbol/SymbolView';
import type { SymbolFactory } from '../symbol/SymbolFactory';

export class ReelView extends Container {
  private readonly _symbols: SymbolView[] = [];
  private readonly _maskGraphics: Graphics;

  private readonly _symbolSize: number;
  private readonly _gap: number;

  constructor(
    rows: number,
    symbolSize: number,
    gap: number,
    symbolFactory: SymbolFactory,
  ) {
    super();

    this._symbolSize = symbolSize;
    this._gap = gap;

    for (let index = 0; index < rows; index++) {
      const symbol = symbolFactory.create('A');

      symbol.y = index * (symbolSize + gap);

      this._symbols.push(symbol);
      this.addChild(symbol);
    }
    this._maskGraphics = new Graphics();

    this._maskGraphics
      .rect(
        0,
        0,
        symbolSize,
        this.getHeight(rows),
      )
      .fill(0xffffff);

    this.addChild(this._maskGraphics);
    this.mask = this._maskGraphics;
  }

  update(symbols: SymbolId[]): void {
    symbols.forEach((symbol, index) => {
      const symbolView = this._symbols[index];

      if (!symbolView) {
        return;
      }

      symbolView.setSymbol(symbol);
    });
  }

  private getHeight(rows: number): number {
    return (
      rows * this._symbolSize +
      (rows - 1) * this._gap
    );
  }

  get width(): number {
    return this._symbolSize;
  }

  get height(): number {
    return (
      this._symbols.length * this._symbolSize +
      (this._symbols.length - 1) * this._gap
    );
  }
}