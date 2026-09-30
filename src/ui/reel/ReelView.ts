import {
  Container,
  Graphics,
  Ticker,
} from 'pixi.js';

import type {
  ReelViewConfig,
  SymbolId,
} from '../../types/game';

import { SymbolView } from '../symbol/SymbolView';
import type { SymbolFactory } from '../symbol/SymbolFactory';

export class ReelView extends Container {
  private readonly _symbols: SymbolView[] = [];
  private readonly _symbolContainer: Container;
  private readonly _maskGraphics: Graphics;

  private readonly _symbolSize: number;
  private readonly _gap: number;
  private readonly _step: number;
  private readonly _reelStrip: SymbolId[];
  private readonly _visibleRows: number;

  private _stripIndex = 0;
  private _spinning = false;
  private _stopping = false;

  private readonly _spinSpeed = 35;
  private readonly _stopDuration = 300;

  private _stopElapsed = 0;
  private _stopStartY = 0;

  private _stopResult: SymbolId[] | null = null;
  private _stopResolve: (() => void) | null = null;

  constructor(
    config: ReelViewConfig,
    symbolFactory: SymbolFactory,
  ) {
    super();

    const {
      initialSymbols,
      rows,
      symbolSize,
      gap,
      reelStrip,
    } = config;

    if (
      initialSymbols.length !== rows
    ) {
      throw new Error(
        `Initial symbols length (${initialSymbols.length}) ` +
        `does not match the number of rows (${rows}).`,
      );
    }

    this._reelStrip = reelStrip;

    this._visibleRows = rows;

    this._symbolSize = symbolSize;

    this._gap = gap;

    this._step = symbolSize + gap;

    this._symbolContainer = new Container();

    this.addChild(
      this._symbolContainer,
    );

    this._stripIndex =
      this.findInitialStripIndex(
        initialSymbols,
      );

    this.createSymbols(
      initialSymbols,
      symbolFactory,
    );

    this._maskGraphics =
      new Graphics();

    this._maskGraphics
      .rect(
        0,
        0,
        symbolSize,
        this.getHeight(
          this._visibleRows,
        ),
      )
      .fill(0xffffff);

    this.addChild(
      this._maskGraphics,
    );

    this.mask =
      this._maskGraphics;

    this.positionSymbols();
  }

  destroy(
    options?: Parameters<
      Container['destroy']
    >[0],
  ): void {
    Ticker.shared.remove(
      this.updateSpin,
      this,
    );

    super.destroy(
      options,
    );
  }

  private createSymbols(
    symbols: SymbolId[],
    symbolFactory: SymbolFactory,
  ): void {
    const symbolsWithBuffer =
      this.createBufferSymbols(
        symbols,
      );

    symbolsWithBuffer.forEach(
      (
        symbol,
      ) => {
        const symbolView =
          symbolFactory.create(
            symbol,
          );

        this._symbols.push(
          symbolView,
        );

        this._symbolContainer.addChild(
          symbolView,
        );
      },
    );
  }

  update(
    symbols: SymbolId[],
  ): void {
    symbols.forEach(
      (
        symbol,
        index,
      ) => {
        const symbolView =
          this._symbols[
          index + 1
          ];

        if (!symbolView) {
          return;
        }

        symbolView.setSymbol(
          symbol,
        );
      },
    );
  }

  startSpin(): void {
    if (
      this._spinning ||
      this._stopping
    ) {
      return;
    }

    this._spinning = true;

    Ticker.shared.add(
      this.updateSpin,
      this,
    );
  }

  stop(
    result: SymbolId[],
  ): Promise<void> {
    if (
      !this._spinning ||
      this._stopping
    ) {
      this.update(
        result,
      );

      return Promise.resolve();
    }

    this._stopping = true;

    this._stopElapsed = 0;

    this._stopStartY =
      this._symbolContainer.y;

    this._stopResult =
      result;

    return new Promise<void>((resolve) => {
      this._stopResolve = resolve;
    });
  }

  private updateSpin(
    ticker: Ticker,
  ): void {
    if (
      !this._spinning
    ) {
      return;
    }

    if (
      this._stopping
    ) {
      this.updateStop(
        ticker,
      );

      return;
    }

    this._symbolContainer.y +=
      this._spinSpeed *
      ticker.deltaTime;

    while (
      this._symbolContainer.y >=
      this._step
    ) {
      this._symbolContainer.y -=
        this._step;

      this.recycleFirstSymbol();
    }
  }

  private updateStop(
    ticker: Ticker,
  ): void {
    this._stopElapsed +=
      ticker.deltaMS;

    const progress =
      Math.min(
        this._stopElapsed /
        this._stopDuration,
        1,
      );

    const easedProgress =
      1 -
      Math.pow(
        1 - progress,
        3,
      );

    this._symbolContainer.y =
      this._stopStartY *
      (1 - easedProgress);

    if (
      progress >= 1
    ) {
      this.finishStop();
    }
  }

  private finishStop(): void {
    this._spinning = false;
    this._stopping = false;

    Ticker.shared.remove(
      this.updateSpin,
      this,
    );

    if (
      this._stopResult
    ) {
      this.update(
        this._stopResult,
      );

      this._stripIndex =
        this.findInitialStripIndex(
          this._stopResult,
        );
    }

    this.positionSymbols();

    this._stopResult = null;

    this._stopResolve?.();
    this._stopResolve = null;
  }

  private recycleFirstSymbol(): void {
    const firstSymbol =
      this._symbols.shift();

    if (!firstSymbol) {
      return;
    }

    this._stripIndex =
      (
        this._stripIndex + 1
      ) %
      this._reelStrip.length;

    const nextSymbol =
      this._reelStrip[
      this._stripIndex
      ];

    if (!nextSymbol) {
      return;
    }

    firstSymbol.setSymbol(
      nextSymbol,
    );

    firstSymbol.y =
      this._symbols.length *
      this._step;

    this._symbols.push(
      firstSymbol,
    );

    this._symbolContainer.removeChild(
      firstSymbol,
    );

    this._symbolContainer.addChild(
      firstSymbol,
    );
  }

  private createBufferSymbols(
    visibleSymbols: SymbolId[],
  ): SymbolId[] {
    const previousSymbol =
      visibleSymbols[
      visibleSymbols.length - 1
      ];

    const nextSymbol =
      visibleSymbols[0];

    return [
      previousSymbol ??
      this._reelStrip[0],

      ...visibleSymbols,

      nextSymbol ??
      this._reelStrip[0],
    ].filter(
      (
        symbol,
      ): symbol is SymbolId =>
        symbol !== undefined,
    );
  }

  private positionSymbols(): void {
    this._symbols.forEach(
      (
        symbol,
        index,
      ) => {
        symbol.y =
          index *
          this._step;
      },
    );

    this._symbolContainer.y =
      -this._step;
  }

  private findInitialStripIndex(
    symbols: SymbolId[],
  ): number {
    const firstSymbol =
      symbols[0];

    if (!firstSymbol) {
      return 0;
    }

    const index =
      this._reelStrip.indexOf(
        firstSymbol,
      );

    return index >= 0
      ? index
      : 0;
  }

  private getHeight(
    rows: number,
  ): number {
    return (
      rows *
      this._symbolSize +
      (rows - 1) *
      this._gap
    );
  }

  get width(): number {
    return this._symbolSize;
  }

  get height(): number {
    return this.getHeight(
      this._visibleRows,
    );
  }

  get reelStrip(): readonly SymbolId[] {
    return this._reelStrip;
  }

  get isSpinning(): boolean {
    return this._spinning;
  }
}