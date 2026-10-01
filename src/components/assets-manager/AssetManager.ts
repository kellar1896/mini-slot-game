import { Assets, Texture } from "pixi.js";
import type { SymbolId } from "../../types/game";

export class AssetManager {
  async load(): Promise<void> {
    await Assets.load([
      {
        alias: 'slot-background',
        src: 'src/assets/slot/background.jpg',
      },
      {
        alias: 'reel-base',
        src: 'src/assets/slot/reels_base.png',
      },
      {
        alias: 'M1',
        src: 'src/assets/symbols/high1.png',
      },
      {
        alias: 'M2',
        src: 'src/assets/symbols/high2.png',
      },
      {
        alias: 'M3',
        src: 'src/assets/symbols/high3.png',
      },
      {
        alias: 'F1',
        src: 'src/assets/symbols/low1.png',
      },
      {
        alias: 'F2',
        src: 'src/assets/symbols/low2.png',
      },
      {
        alias: 'F3',
        src: 'src/assets/symbols/low3.png',
      },
      {
        alias: 'F4',
        src: 'src/assets/symbols/low4.png',
      },
    ]);
  }

  getSymbolTexture(
    symbol: SymbolId,
  ): Texture {
    return this.getTexture(symbol);
  }

  getTexture(alias: string): Texture {
    const texture = Assets.get(
      alias,
    );

    if (!texture) {
      throw new Error(
        `Texture not found for alias: ${alias}`,
      );
    }
    return texture;
  }
}