import { Container, Graphics } from 'pixi.js';
import type { ReelViewConfig, SymbolId } from '../../types/game';
import { SymbolView } from '../symbol/SymbolView';
import type { SymbolFactory } from '../symbol/SymbolFactory';

export class ReelView extends Container {
  private readonly _symbols: SymbolView[] = [];
  private readonly _symbolContainer: Container;
  private readonly _maskGraphics: Graphics;

  private readonly _symbolSize: number;
  private readonly _gap: number;
  private readonly _step: number;

  private readonly _visibleRows: number;

  constructor(
    config: ReelViewConfig,
    symbolFactory: SymbolFactory
  ) {
    super();
    const {
      initialSymbols,
      rows,
      symbolSize,
      gap,
    } = config;

    if (initialSymbols.length !== rows) {
      throw new Error(
        `Initial symbols length (${initialSymbols.length}) 
        does not match the number of rows (${rows}).`,
      );
    }

    this._symbolSize = symbolSize;
    this._gap = gap;
    this._step = symbolSize + gap;
    this._visibleRows = initialSymbols.length;

    this._symbolContainer = new Container();
    this.addChild(this._symbolContainer);

    this.createSymbols(
      initialSymbols,
      symbolFactory,
    );

    // for (let index = 0; index < rows; index++) {
    //   const initialSymbol = initialSymbols[index];

    //   if (initialSymbol === undefined) {
    //     throw new Error(`Missing initial symbol for row ${index}.`);
    //   }

    //   const symbol = symbolFactory.create(initialSymbol);

    //   symbol.y = index * (symbolSize + gap);

    //   this._symbols.push(symbol);
    //   this._symbolContainer.addChild(
    //     symbol,
    //   );
    // }
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

  private createSymbols(
    symbols: SymbolId[],
    symbolFactory: SymbolFactory,
  ): void {
    symbols.forEach(
      (
        symbol,
        index,
      ) => {
        const symbolView =
          symbolFactory.create(
            symbol,
          );

        symbolView.y =
          index *
          this._step;

        this._symbols.push(
          symbolView,
        );

        this._symbolContainer.addChild(
          symbolView,
        );
      },
    );
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

  startSpin(): void {
    // TODO: implement spin reel animation
  }

  stop(
    result: SymbolId[],
  ): void {
    this.update(
      result,
    );

    this._symbolContainer.y = 0;
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