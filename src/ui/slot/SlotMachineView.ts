import { Container } from 'pixi.js';
import type { ReelViewConfig, SlotConfig, SymbolId } from '../../types/game';
import { ReelView } from '../reel/ReelView';
import { SymbolFactory } from '../symbol/SymbolFactory';
import type { AssetManager } from '../../components';
import type { SlotMachine } from './SlotMachine';

export class SlotMachineView extends Container implements SlotMachine {
  label = 'slot-machine-view';
  private readonly _reels: ReelView[] = [];
  private readonly _reelsContainer: Container;
  private readonly _reelStopDelay = 150;

  constructor(
    slotConfig: SlotConfig,
    symbolSize: number,
    gap: number,
    assetManager: AssetManager
  ) {
    super();

    this._reelsContainer = new Container();
    this.addChild(this._reelsContainer);

    const symbolFactory = new SymbolFactory({
      symbolSize,
    },
      assetManager);

    for (
      let index = 0;
      index < slotConfig.reels;
      index++
    ) {
      const reelConfig: ReelViewConfig = {
        initialSymbols: slotConfig.defaultReels[index] || [],
        reelStrip: slotConfig.reelStrips[index]?.symbols || [],
        rows: slotConfig.rows,
        symbolSize,
        gap,
      };

      const reel = new ReelView(
        reelConfig,
        symbolFactory
      );
      reel.x = index * (
        symbolSize + gap
      );

      this._reels.push(reel);
      this._reelsContainer
        .addChild(reel);
    }
  }

  startSpin(): void {
    this._reels.forEach(
      (reel) => {
        reel.startSpin();
      },
    );
  }

  stop(
    result: SymbolId[][],
    reelPositions: number[]
  ): Promise<void> {
    const stopPromises = result.map(
      (
        reelResult,
        reelIndex,
      ) => {
        const reel =
          this._reels[
          reelIndex
          ];

        if (!reel) {
          return Promise.resolve();
        }

        const reelPosition =
          reelPositions[reelIndex];

        return new Promise<void>((resolve) => {
          setTimeout(() => {
            reel.stop(
              reelResult,
              reelPosition
            ).then(resolve);
          }, reelIndex * this._reelStopDelay);
        });
      },
    );

    return Promise.all(stopPromises).then(() => undefined);
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

  get slotMachineWidth(): number {
    return this._reelsContainer.width;
  }

  get slotMachineHeight(): number {
    return this._reelsContainer.height;
  }
}