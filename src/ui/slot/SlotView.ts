import { Container } from 'pixi.js';
import type { SymbolId } from '../../types/game';
import { ReelView } from '../reel/ReelView';

export class SlotView extends Container {
  label = 'SlotView';
  private readonly _reels: ReelView[] = [];

  private readonly _symbolSize: number;
  private readonly _gap: number;

  constructor(
    columns: number,
    rows: number,
    symbolSize: number,
    gap: number,
  ) {
    super();
    this._symbolSize = symbolSize;
    this._gap = gap;

    for (
      let index = 0;
      index < columns;
      index++
    ) {
      const reel = new ReelView(
        rows,
        symbolSize,
        gap,
      );

      reel.x = index * (
        symbolSize + gap
      );

      this._reels.push(reel);
      this.addChild(reel);
    }
  }

  setResult(result: SymbolId[][]): void {
    result.forEach((reelSymbols, reelIndex) => {
      const reel = this._reels[reelIndex];

      if (!reel) {
        return;
      }

      reel.update(reelSymbols);
    });
  }

  // get width(): number {
  //   return (
  //     this._reels.length * 2 * this._symbolSize +
  //     (this._reels.length - 1) * 2 * this._gap
  //   );
  // }

  // get height(): number {
  //   return this._reels[0]?.height ?? 0;
  // }

  // set width(value: number) {
  //   const scale = value / this.width;

  //   this.scale.set(scale, scale);
  // }

  // set height(value: number) {
  //   const scale = value / this.height;

  //   this.scale.set(scale, scale);
  // }
}