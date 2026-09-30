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
  private readonly _stopDuration = 1000;

  private _stopElapsed = 0;
  private _stopStartY = 0;
  private _stopTravelled = 0;
  private _stopDistance = 0;
  private _stopTargetPosition = 0;

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
    targetPosition: number
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

    this._stopTravelled = 0;
    this._stopTargetPosition= targetPosition;
    const reelLength = this._reelStrip.length;

    const distanceToTarget = (this._stripIndex - targetPosition + reelLength) % reelLength;
    const extraRotations = 1; // Number of extra rotations before stopping wip
    const symbolsToTravel = distanceToTarget + extraRotations * reelLength;

    this._stopDistance =
      symbolsToTravel *
      this._step - (this._stopStartY + this._step);

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

      this.recycleLastSymbol();
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

    const targetTravel = this._stopDistance * easedProgress;

    const deltaTravel = targetTravel - this._stopTravelled;

    this._stopTravelled = targetTravel;

    this._symbolContainer.y +=
      deltaTravel;

    while (
      this._symbolContainer.y >=
      this._step
    ) {
      this._symbolContainer.y -=
        this._step;

      this.recycleLastSymbol();
    }

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
    }

    this._stripIndex = this._stopTargetPosition;

    this.positionSymbols();

    this._stopResult = null;

    this._stopResolve?.();
    this._stopResolve = null;
  }

  private recycleLastSymbol(): void {
  const lastSymbol =
    this._symbols.pop();

  if (!lastSymbol) {
    return;
  }

  this._stripIndex =
    (
      this._stripIndex -
      1 +
      this._reelStrip.length
    ) %
    this._reelStrip.length;

  const previousSymbol =
    this._reelStrip[
      this._stripIndex
    ];

  if (!previousSymbol) {
    return;
  }

  lastSymbol.setSymbol(
    previousSymbol,
  );

  lastSymbol.y = 0;

  this._symbols.unshift(
    lastSymbol,
  );

  this._symbolContainer.removeChild(
    lastSymbol,
  );

  this._symbolContainer.addChildAt(
    lastSymbol,
    0,
  );
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