import { Assets, Texture } from "pixi.js";
import type { SymbolId } from "../../types/game";

export class AssetManager {
  async load(): Promise<void> {
    // TODO: Implement asset loading logic here
  }

  getSymbolTexture(
    symbol: SymbolId,
  ): Texture {
    const texture = Assets.get(
      `symbol-${symbol}`,
    );

    if (!texture) {
      throw new Error(
        `Texture not found for symbol: ${symbol}`,
      );
    }

    return texture;
  }
}