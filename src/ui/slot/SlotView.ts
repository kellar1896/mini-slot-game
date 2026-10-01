import { Container, Sprite } from 'pixi.js';
import type { ReelViewConfig, SlotConfig, SymbolId } from '../../types/game';
import { ReelView } from '../reel/ReelView';
import { SymbolFactory } from '../symbol/SymbolFactory';
import type { AssetManager } from '../../components';

export class SlotView extends Container {
  label = 'SlotView';
  private readonly _reels: ReelView[] = [];
  private readonly _reelsContainer: Container;
  private readonly _reelsBase: Sprite;
  private readonly _reelStopDelay = 150;

  constructor(
    slotConfig: SlotConfig,
    symbolSize: number,
    gap: number,
    assetManager: AssetManager
  ) {
    super();

    this._reelsContainer = new Container();
    this._reelsBase =
      new Sprite(
        assetManager.getTexture(
          'reel-base',
        ),
      );
    this._reelsBase.label = 'reels-decorators'; 

    this.addChild(this._reelsBase);
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
  this._reelsBase.width =
      this._reelsContainer.width;
  this._reelsBase.height =
      this._reelsContainer.height;
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
}