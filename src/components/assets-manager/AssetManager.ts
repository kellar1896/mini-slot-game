import { Assets, Texture } from "pixi.js";
import type { SymbolId } from "../../types/game";

const assetUrls = import.meta.glob<string>(
  "../../assets/**/*.{jpg,png}",
  { eager: true, query: "?url", import: "default" },
);

function getAssetUrl(path: string): string {
  const url = assetUrls[`../../assets/${path}`];

  if (!url) {
    throw new Error(`Asset not found: ${path}`);
  }

  return url;
}

export class AssetManager {
  async load(): Promise<void> {
    await Assets.load([
      {
        alias: 'slot-background',
        src: getAssetUrl('slot/background.jpg'),
      },
      {
        alias: 'reel-base',
        src: getAssetUrl('slot/reels_base.png'),
      },
      {
        alias: 'reel-frame',
        src: getAssetUrl('slot/reel-frame.png'),
      },
      {
        alias: 'M1',
        src: getAssetUrl('symbols/high1.png'),
      },
      {
        alias: 'M2',
        src: getAssetUrl('symbols/high2.png'),
      },
      {
        alias: 'M3',
        src: getAssetUrl('symbols/high3.png'),
      },
      {
        alias: 'F1',
        src: getAssetUrl('symbols/low1.png'),
      },
      {
        alias: 'F2',
        src: getAssetUrl('symbols/low2.png'),
      },
      {
        alias: 'F3',
        src: getAssetUrl('symbols/low3.png'),
      },
      {
        alias: 'F4',
        src: getAssetUrl('symbols/low4.png'),
      },
      {
        alias: 'spin-button-normal',
        src: getAssetUrl('slot/spin_btn_normal.png'),
      },
      {
        alias: 'spin-button-hover',
        src: getAssetUrl('slot/spin_btn_hover.png'),
      },
      {
        alias: 'spin-button-over',
        src: getAssetUrl('slot/spin_btn_over.png'),
      },
      {
        alias: 'spin-button-down',
        src: getAssetUrl('slot/spin_btn_down.png'),
      },
      {
        alias: 'spin-button-disabled',
        src: getAssetUrl('slot/spin_btn_disabled.png'),
      }
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